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
