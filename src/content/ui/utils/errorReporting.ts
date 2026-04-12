import { REPORT_EMAIL } from '../constants';

export function buildErrorReportMailto(sub: string) {
    const subject = '[eHelper] 오류 제보';
    const body = [
        '안녕하세요. 오류를 제보합니다.',
        '',
        `- 발생 시각: ${new Date().toLocaleString()}`,
        `- 페이지 URL: ${location.href}`,
        `- 메시지: ${sub || '없음'}`,
        '',
        '추가 설명:',
    ].join('\n');

    return `mailto:${REPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
