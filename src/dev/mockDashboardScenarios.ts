import type { DashboardItem } from '../content/ui/types';

export type MockDashboardScenarioId = 'mixed' | 'dense' | 'empty';

export interface MockDashboardCourse {
    courseName: string;
    isNew?: boolean;
    isSmClass?: boolean;
}

export interface MockDashboardScenario {
    id: MockDashboardScenarioId;
    label: string;
    description: string;
    items: DashboardItem[];
    courses: MockDashboardCourse[];
    hiddenItemIds: string[];
    badge: string;
    sub: string;
}

type MockItemCourse = Pick<
    DashboardItem,
    'courseId' | 'courseName' | 'courseIsNew'
>;

function hoursFromNow(now: number, hours: number) {
    return now + hours * 60 * 60 * 1000;
}

function formatDateTime(timestamp: number) {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hour = String(date.getHours()).padStart(2, '0');
    const minute = String(date.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day} ${hour}:${minute}`;
}

function formatDate(timestamp: number) {
    return formatDateTime(timestamp).slice(0, 10);
}

function buildPeriod(now: number, startHours: number, endHours: number) {
    return `기간: ${formatDateTime(hoursFromNow(now, startHours))} ~ ${formatDateTime(hoursFromNow(now, endHours))}`;
}

function buildMixedScenario(now: number): MockDashboardScenario {
    const careerCourse: MockItemCourse = {
        courseId: 'career-development',
        courseName: '커리어개발과취업전략',
        courseIsNew: true,
    };
    const infoOrgCourse: MockItemCourse = {
        courseId: 'information-organization',
        courseName: '정보조직론',
    };
    const spatialCourse: MockItemCourse = {
        courseId: 'spatial-data-analysis',
        courseName: '공간데이터분석',
    };
    const japanCourse: MockItemCourse = {
        courseId: 'japanese-pop-culture',
        courseName: '일본대중문화의이해',
    };

    const courses: MockDashboardCourse[] = [
        {
            courseName: careerCourse.courseName,
            isNew: true,
        },
        {
            courseName: infoOrgCourse.courseName,
        },
        {
            courseName: spatialCourse.courseName,
            isSmClass: true,
        },
        {
            courseName: japanCourse.courseName,
        },
    ];

    const items: DashboardItem[] = [
        {
            id: 'career-assignment-1',
            type: 'ASSIGNMENT',
            ...careerCourse,
            title: '채용 공고 분석 포트폴리오 초안',
            section: '5주차 과제',
            dueAt: hoursFromNow(now, 11),
            status: 'TODO',
            meta: '미제출 · 파일 업로드 1개',
            url: 'https://example.com/assignment/career-portfolio-draft',
        },
        {
            id: 'career-quiz-1',
            type: 'QUIZ',
            ...careerCourse,
            title: '직무역량 자기진단 퀴즈',
            section: '5주차 퀴즈',
            dueAt: hoursFromNow(now, -18),
            status: 'DONE',
            meta: '성적: 9.5/10 · 응시 완료',
            url: 'https://example.com/quiz/career-skill-check',
        },
        {
            id: 'info-lecture-1',
            type: 'LECTURE',
            ...infoOrgCourse,
            title: 'KDC 분류 원리와 실제 사례',
            section: '6주차 온라인 강의',
            dueAt: hoursFromNow(now, 40),
            status: 'TODO',
            meta: `출석 진행중 62% · ${buildPeriod(now, -8, 40)}`,
            url: 'https://example.com/lecture/kdc-classification',
        },
        {
            id: 'info-notice-1',
            type: 'NOTICE',
            ...infoOrgCourse,
            title: '중간고사 범위 및 시험 방식 안내',
            section: '공지사항',
            status: 'UNKNOWN',
            meta: `작성자 이지은 교수 · 작성일 ${formatDate(hoursFromNow(now, -20))}`,
            url: 'https://example.com/notice/information-organization-midterm',
        },
        {
            id: 'spatial-resource-1',
            type: 'RESOURCE',
            ...spatialCourse,
            section: '3주차 실습 자료',
            title: '서울시 유동인구 샘플 데이터셋',
            status: 'UNKNOWN',
            meta: 'XLSX · 6.4MB',
            url: 'https://example.com/files/seoul-floating-population.xlsx',
        },
        {
            id: 'japan-forum-1',
            type: 'FORUM',
            ...japanCourse,
            section: '4주차 토론',
            title: '넷플릭스 오리지널의 현지화 전략 토론',
            dueAt: hoursFromNow(now, -6),
            status: 'TODO',
            meta: '미참여 · 본문 1개, 댓글 1개 작성',
            url: 'https://example.com/forum/japan-localization',
        },
        {
            id: 'japan-lecture-1',
            type: 'LECTURE',
            ...japanCourse,
            title: '전후 일본 대중문화의 형성과 소비',
            section: '4주차 온라인 강의',
            dueAt: hoursFromNow(now, -2),
            status: 'DONE',
            meta: `출석 완료 100% · ${buildPeriod(now, -48, -2)}`,
            url: 'https://example.com/lecture/japan-pop-culture-week4',
        },
    ];

    return {
        id: 'mixed',
        label: '기본',
        description:
            '학기 중간 시점처럼 과제, 강의, 공지, 토론이 자연스럽게 섞인 대시보드입니다.',
        items,
        courses,
        hiddenItemIds: ['info-notice-1', 'spatial-resource-1'],
        badge: '7',
        sub: '오늘 확인할 항목과 숨김 복원 흐름을 같이 보기 좋은 기본 시나리오예요.',
    };
}

function buildDenseScenario(now: number): MockDashboardScenario {
    const aiCourse: MockItemCourse = {
        courseId: 'ai-introduction',
        courseName: '인공지능개론',
        courseIsNew: true,
    };
    const serviceCourse: MockItemCourse = {
        courseId: 'service-design-studio',
        courseName: '서비스디자인스튜디오',
    };
    const dataVizCourse: MockItemCourse = {
        courseId: 'data-visualization',
        courseName: '데이터시각화',
    };
    const capstoneCourse: MockItemCourse = {
        courseId: 'capstone-project',
        courseName: '캡스톤프로젝트',
    };
    const writingCourse: MockItemCourse = {
        courseId: 'business-writing',
        courseName: '비즈니스글쓰기',
    };

    const courses: MockDashboardCourse[] = [
        { courseName: aiCourse.courseName, isNew: true },
        { courseName: serviceCourse.courseName },
        { courseName: dataVizCourse.courseName },
        { courseName: capstoneCourse.courseName, isSmClass: true },
        { courseName: writingCourse.courseName },
    ];

    const items: DashboardItem[] = [
        {
            id: 'ai-lecture-1',
            type: 'LECTURE',
            ...aiCourse,
            title: '탐색 알고리즘과 휴리스틱 설계',
            section: '5주차 온라인 강의',
            dueAt: hoursFromNow(now, 14),
            status: 'TODO',
            meta: `출석 진행중 35% · ${buildPeriod(now, -16, 14)}`,
            url: 'https://example.com/lecture/ai-search-heuristic',
        },
        {
            id: 'ai-quiz-1',
            type: 'QUIZ',
            ...aiCourse,
            title: 'A* 알고리즘 확인 퀴즈',
            section: '5주차 퀴즈',
            dueAt: hoursFromNow(now, 26),
            status: 'TODO',
            meta: '미응시 · 제한시간 20분',
            url: 'https://example.com/quiz/ai-a-star',
        },
        {
            id: 'ai-assignment-1',
            type: 'ASSIGNMENT',
            ...aiCourse,
            title: '휴리스틱 비교 보고서',
            section: '6주차 과제',
            dueAt: hoursFromNow(now, 62),
            status: 'TODO',
            meta: '미제출 · 파일 업로드 1개',
            url: 'https://example.com/assignment/ai-heuristic-report',
        },
        {
            id: 'ai-resource-1',
            type: 'RESOURCE',
            ...aiCourse,
            title: '실습용 탐색 알고리즘 예제 코드',
            section: '5주차 자료',
            status: 'UNKNOWN',
            meta: 'ZIP · 1.8MB',
            url: 'https://example.com/files/ai-search-samples.zip',
        },
        {
            id: 'service-notice-1',
            type: 'NOTICE',
            ...serviceCourse,
            title: '현장 인터뷰 일정 및 팀별 배정표 안내',
            section: '공지사항',
            status: 'UNKNOWN',
            meta: `작성자 김소연 교수 · 작성일 ${formatDate(hoursFromNow(now, -28))}`,
            url: 'https://example.com/notice/service-interview-schedule',
        },
        {
            id: 'service-forum-1',
            type: 'FORUM',
            ...serviceCourse,
            title: '사용자 인터뷰 인사이트 공유',
            section: '4주차 토론',
            dueAt: hoursFromNow(now, 18),
            status: 'TODO',
            meta: '미참여 · 게시글 1개 이상 작성',
            url: 'https://example.com/forum/service-interview-insight',
        },
        {
            id: 'service-assignment-1',
            type: 'ASSIGNMENT',
            ...serviceCourse,
            title: '페르소나 초안 제출',
            section: '5주차 과제',
            dueAt: hoursFromNow(now, 88),
            status: 'TODO',
            meta: '미제출 · 팀별 PDF 업로드',
            url: 'https://example.com/assignment/service-persona-draft',
        },
        {
            id: 'service-lecture-1',
            type: 'LECTURE',
            ...serviceCourse,
            title: '서비스 블루프린트 작성법',
            section: '4주차 온라인 강의',
            dueAt: hoursFromNow(now, -5),
            status: 'DONE',
            meta: `출석 완료 100% · ${buildPeriod(now, -52, -5)}`,
            url: 'https://example.com/lecture/service-blueprint',
        },
        {
            id: 'dataviz-lecture-1',
            type: 'LECTURE',
            ...dataVizCourse,
            title: 'Tableau 대시보드 구성 실습',
            section: '6주차 온라인 강의',
            dueAt: hoursFromNow(now, 8),
            status: 'TODO',
            meta: `출석 진행중 45% · ${buildPeriod(now, -12, 8)}`,
            url: 'https://example.com/lecture/tableau-dashboard-lab',
        },
        {
            id: 'dataviz-assignment-1',
            type: 'ASSIGNMENT',
            ...dataVizCourse,
            title: '중간 프로젝트 초안 업로드',
            section: '6주차 과제',
            dueAt: hoursFromNow(now, 54),
            status: 'TODO',
            meta: '미제출 · Tableau Public 링크 제출',
            url: 'https://example.com/assignment/dataviz-midterm-draft',
        },
        {
            id: 'dataviz-resource-1',
            type: 'RESOURCE',
            ...dataVizCourse,
            title: '서울 열린데이터 광역상권 샘플',
            section: '6주차 자료',
            status: 'UNKNOWN',
            meta: 'CSV · 9.2MB',
            url: 'https://example.com/files/seoul-open-data-market.csv',
        },
        {
            id: 'dataviz-quiz-1',
            type: 'QUIZ',
            ...dataVizCourse,
            title: '시각화 원칙 체크 퀴즈',
            section: '5주차 퀴즈',
            dueAt: hoursFromNow(now, -22),
            status: 'DONE',
            meta: '성적: 18/20 · 응시 완료',
            url: 'https://example.com/quiz/dataviz-principles',
        },
        {
            id: 'capstone-lecture-1',
            type: 'LECTURE',
            ...capstoneCourse,
            title: '주간 스크럼 운영 가이드',
            section: '7주차 온라인 강의',
            dueAt: hoursFromNow(now, 72),
            status: 'TODO',
            meta: `출석 진행중 10% · ${buildPeriod(now, -6, 72)}`,
            url: 'https://example.com/lecture/capstone-weekly-scrum',
        },
        {
            id: 'capstone-forum-1',
            type: 'FORUM',
            ...capstoneCourse,
            title: '팀별 리스크 공유 게시판',
            section: '7주차 토론',
            dueAt: hoursFromNow(now, 30),
            status: 'TODO',
            meta: '미참여 · 주간 리스크 1건 등록',
            url: 'https://example.com/forum/capstone-risk-board',
        },
        {
            id: 'capstone-assignment-1',
            type: 'ASSIGNMENT',
            ...capstoneCourse,
            title: '프로토타입 1차 제출',
            section: '6주차 과제',
            dueAt: hoursFromNow(now, -30),
            status: 'DONE',
            meta: '제출 완료 · 팀 대표 1인 제출',
            url: 'https://example.com/assignment/capstone-prototype-v1',
        },
        {
            id: 'writing-lecture-1',
            type: 'LECTURE',
            ...writingCourse,
            title: '요약문과 제안서 문장 다듬기',
            section: '5주차 온라인 강의',
            dueAt: hoursFromNow(now, 20),
            status: 'TODO',
            meta: `출석 진행중 80% · ${buildPeriod(now, -10, 20)}`,
            url: 'https://example.com/lecture/business-writing-style',
        },
        {
            id: 'writing-quiz-1',
            type: 'QUIZ',
            ...writingCourse,
            title: '문장 호응 점검 퀴즈',
            section: '5주차 퀴즈',
            dueAt: hoursFromNow(now, 44),
            status: 'TODO',
            meta: '미응시 · 제한시간 15분',
            url: 'https://example.com/quiz/writing-cohesion',
        },
        {
            id: 'writing-notice-1',
            type: 'NOTICE',
            ...writingCourse,
            title: '조별 피드백 일정 변경 안내',
            section: '공지사항',
            status: 'UNKNOWN',
            meta: `작성자 박민정 교수 · 작성일 ${formatDate(hoursFromNow(now, -9))}`,
            url: 'https://example.com/notice/writing-feedback-schedule',
        },
    ];

    return {
        id: 'dense',
        label: '목록 많음',
        description:
            '과제, 퀴즈, 공지, 팀 프로젝트가 한 주에 몰린 상황을 가정한 긴 목록 시나리오입니다.',
        items,
        courses,
        hiddenItemIds: [
            'service-notice-1',
            'dataviz-resource-1',
            'writing-notice-1',
        ],
        badge: '18',
        sub: '긴 스크롤, 과목 그룹 정렬, 숨김 복원까지 한 번에 확인할 수 있어요.',
    };
}

function buildEmptyScenario(now: number): MockDashboardScenario {
    return {
        id: 'empty',
        label: '빈 상태',
        description:
            '개강 직후처럼 아직 공개된 활동이 없는 상태를 확인하는 시나리오입니다.',
        items: [],
        courses: [
            { courseName: '디지털마케팅입문', isNew: true },
            { courseName: '창업과법률' },
        ],
        hiddenItemIds: [],
        badge: '',
        sub: `프리뷰 생성 시각 ${new Date(now).toLocaleTimeString('ko-KR')} 기준으로 아직 수집된 활동이 없어요.`,
    };
}

export function createMockDashboardScenarios(now = Date.now()) {
    const mixed = buildMixedScenario(now);
    const dense = buildDenseScenario(now);
    const empty = buildEmptyScenario(now);

    return {
        mixed,
        dense,
        empty,
    } satisfies Record<MockDashboardScenarioId, MockDashboardScenario>;
}

export const MOCK_DASHBOARD_SCENARIO_ORDER: MockDashboardScenarioId[] = [
    'mixed',
    'dense',
    'empty',
];
