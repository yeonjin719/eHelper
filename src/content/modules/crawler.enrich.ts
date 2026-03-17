// @ts-nocheck
(() => {
    // 상세 페이지 보강 모듈: 포럼/자료의 상태와 메타를 보강한다.
    const E = window.__ECDASH__;
    // 상세 페이지에서 마감/기간 관련 텍스트를 추출해 공통 메타로 변환한다.
    E.extractDueMetaFromDoc = function extractDueMetaFromDoc(doc) {
        // 점검 필요: 현재 테마/페이지 구조에 맞춰 조정할 상세 페이지 마감/기간 셀렉터
        const texts = [
            ...E.collectTextBySelectors(doc, [
                '[data-region="activity-dates"]',
                '.activity-dates',
                '.availabilityinfo',
                '.box.generalbox',
                '.description',
                '.activity-information',
                '.forumintro',
            ]),
        ];

        if (!texts.length) {
            const bodyText = E.cleanText(doc.body?.textContent || '');
            const hasDueLikeContext =
                /(마감|종료|제출|deadline|due|until|기간|period|부터|까지|[~∼〜～])/i.test(
                    bodyText,
                );
            if (bodyText && hasDueLikeContext) {
                texts.push(bodyText.slice(0, 2000));
            }
        }

        const dueSignal = E.pickDueSignalFromTexts(texts);

        return {
            dueAt: dueSignal?.dueAt,
            dueScore: dueSignal?.dueScore || 0,
            meta: E.pickMetaFromTexts(texts),
        };
    };

    E.collectSummaryRowsFromDoc = function collectSummaryRowsFromDoc(
        doc,
        selectors,
    ) {
        const rows = [];
        const seen = new Set();

        doc.querySelectorAll(selectors.join(', ')).forEach((tr) => {
            const cells = [...tr.querySelectorAll('th, td')];
            if (cells.length < 2) return;

            const label = E.cleanText(cells[0]?.textContent || '');
            const value = E.cleanText(
                cells[cells.length - 1]?.textContent || '',
            );
            if (!label || !value) return;

            const key = `${label}::${value}`;
            if (seen.has(key)) return;
            seen.add(key);
            rows.push({ label, value });
        });

        return rows;
    };

    E.extractAssignmentMetaFromDoc = function extractAssignmentMetaFromDoc(doc) {
        const detail = E.extractDueMetaFromDoc(doc);
        const rows = E.collectSummaryRowsFromDoc(doc, [
            '.submissionstatustable tr',
            '.submissionsummarytable tr',
            '.submissionstatus tr',
            '.assignsubmission_status tr',
            'table.generaltable tr',
        ]);

        let submissionText = E.normalizeAssignmentSubmissionText(
            doc.querySelector(
                'td[class*="submissionstatus"], td[class*="submission-status"]',
            )?.textContent || '',
        );
        let openText = '';
        let dueText = '';

        for (const row of rows) {
            const label = E.cleanText(row.label);
            const value = E.cleanText(row.value);
            if (!label || !value) continue;

            if (!submissionText && /(제출\s*상태|submission\s*status)/i.test(label)) {
                submissionText = E.normalizeAssignmentSubmissionText(value);
                continue;
            }

            if (
                !openText &&
                /(제출\s*시작|시작\s*일|열림|open(?:ed)?|available\s*from|allow\s*submissions\s*from)/i.test(
                    label,
                )
            ) {
                openText = value;
                continue;
            }

            if (
                !dueText &&
                /(마감|마감일|종료|due(?:\s*date)?|cut-?off(?:\s*date)?|until)/i.test(
                    label,
                )
            ) {
                dueText = value;
            }
        }

        const dueSignal = E.pickDueSignalFromTexts(
            [
                openText && `시작 ${openText}`,
                dueText && `마감 ${dueText}`,
                openText && dueText && `기간 ${openText} ~ ${dueText}`,
            ].filter(Boolean),
        );
        const dueInfo = E.pickPreferredDueInfo(
            {
                dueAt: dueSignal?.dueAt,
                dueScore: dueSignal?.dueScore || 0,
            },
            detail,
        );
        const periodMeta =
            openText && dueText ? `기간: ${openText} ~ ${dueText}` : undefined;
        const meta = E.mergeMetaText(
            E.mergeMetaText(submissionText || undefined, periodMeta),
            detail.meta,
        );

        return {
            dueAt: dueInfo.dueAt,
            dueScore: dueInfo.dueScore,
            status: submissionText
                ? E.inferStatusFromText(submissionText)
                : 'UNKNOWN',
            meta,
        };
    };

    // 포럼 본문 문구를 기반으로 참여 상태를 추론한다.
    E.inferForumParticipationStatus = function inferForumParticipationStatus(
        doc,
    ) {
        const text = E.cleanText(doc.body?.textContent || '');
        if (!text) return 'UNKNOWN';

        if (
            /(아직\s*참여하지|작성한\s*글이\s*없|게시물\s*없음|you\s+have\s+not\s+posted)/i.test(
                text,
            )
        ) {
            return 'TODO';
        }

        if (
            /(내\s*글|내가\s*시작한\s*토론|게시물\s*\d+\s*개|you\s+have\s+posted)/i.test(
                text,
            )
        ) {
            return 'DONE';
        }

        return 'UNKNOWN';
    };

    // 포럼 아이템에 참여 상태와 메타를 병합한다.
    E.enrichForumItems = async function enrichForumItems(items, limit = 1) {
        return await E.mapWithConcurrency(items, limit, async (item) => {
            try {
                const html = await E.fetchHtml(item.url);
                const doc = new DOMParser().parseFromString(html, 'text/html');
                const detail = E.extractDueMetaFromDoc(doc);
                const participation = E.inferForumParticipationStatus(doc);
                const dueInfo = E.pickPreferredDueInfo(item, detail);

                return {
                    ...item,
                    dueAt: dueInfo.dueAt,
                    dueScore: dueInfo.dueScore,
                    status:
                        item.status === 'UNKNOWN' && participation !== 'UNKNOWN'
                            ? participation
                            : item.status,
                    meta: item.meta || detail.meta,
                };
            } catch (err) {
                console.warn(
                    '[ECDASH] forum detail crawl failed:',
                    item.url,
                    err,
                );
                return item;
            }
        });
    };

    E.enrichAssignmentItems = async function enrichAssignmentItems(
        items,
        limit = 1,
    ) {
        return await E.mapWithConcurrency(items, limit, async (item) => {
            try {
                const html = await E.fetchHtml(item.url);
                const doc = new DOMParser().parseFromString(html, 'text/html');
                const detail = E.extractAssignmentMetaFromDoc(doc);
                const dueInfo = E.pickPreferredDueInfo(item, detail);

                return {
                    ...item,
                    dueAt: dueInfo.dueAt,
                    dueScore: dueInfo.dueScore,
                    status:
                        detail.status !== 'UNKNOWN' ? detail.status : item.status,
                    meta: E.mergeMetaText(item.meta, detail.meta),
                };
            } catch (err) {
                console.warn(
                    '[ECDASH] assignment detail crawl failed:',
                    item.url,
                    err,
                );
                return item;
            }
        });
    };

    // 자료 아이템에 완료/메타 정보를 병합한다.
    E.enrichResourceItems = async function enrichResourceItems(
        items,
        limit = 1,
    ) {
        return await E.mapWithConcurrency(items, limit, async (item) => {
            try {
                const html = await E.fetchHtml(item.url);
                const doc = new DOMParser().parseFromString(html, 'text/html');
                const detail = E.extractDueMetaFromDoc(doc);
                const dueInfo = E.pickPreferredDueInfo(item, detail);

                const completionTexts = E.collectTextBySelectors(doc, [
                    '.completion-info',
                    '.activity-completion',
                    '[data-region*="completion"]',
                ]);
                const completionStatus = E.inferStatusFromText(
                    completionTexts.join(' | '),
                );

                return {
                    ...item,
                    dueAt: dueInfo.dueAt,
                    dueScore: dueInfo.dueScore,
                    status:
                        item.status === 'UNKNOWN' &&
                        completionStatus !== 'UNKNOWN'
                            ? completionStatus
                            : item.status,
                    meta: item.meta || detail.meta,
                };
            } catch (err) {
                console.warn(
                    '[ECDASH] resource detail crawl failed:',
                    item.url,
                    err,
                );
                return item;
            }
        });
    };
})();
