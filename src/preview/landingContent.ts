import packageJson from '../../package.json';

export const previewCurrentVersion = packageJson.version;

export interface LandingFeatureHighlight {
    eyebrow: string;
    title: string;
    description: string;
    benefit: string;
    tags: string[];
}

export interface LandingFixHighlight {
    title: string;
    issue: string;
    fix: string;
    benefit: string;
}

export interface LandingReleaseNote {
    version: string;
    date: string;
    label: string;
    title: string;
    summary: string;
    changes: string[];
    benefit: string;
}

export const previewFeatureHighlights: LandingFeatureHighlight[] = [
    {
        eyebrow: 'Dashboard',
        title: '과목별 할 일을 한 화면에 모읍니다.',
        description:
            '과제, 퀴즈, 강의, 토론, 자료, 공지를 우측 패널에서 바로 확인할 수 있습니다.',
        benefit:
            '여러 과목을 눌러 다니지 않아도 오늘 무엇을 봐야 하는지 바로 정리됩니다.',
        tags: ['과목 그룹', '상태 배지', '마감 중심'],
    },
    {
        eyebrow: 'Filter',
        title: '미완료 항목만 빠르게 남길 수 있습니다.',
        description:
            '유형, 과목, 마감 상태, 지난 항목 숨김을 조합해 필요한 카드만 남길 수 있습니다.',
        benefit:
            '학기 중간처럼 항목이 몰릴 때도 지금 처리할 일만 남겨 집중하기 쉽습니다.',
        tags: ['미완료', '유형 필터', '숨김 복원'],
    },
    {
        eyebrow: 'Accuracy',
        title: '퀴즈와 과제의 상태를 더 정확하게 잡아냅니다.',
        description:
            '제출 상태, 점수, 진행률, 마감 시간을 함께 수집해 카드에 핵심 정보만 정리합니다.',
        benefit:
            '상세 페이지를 열기 전에 우선순위를 판단할 수 있어 확인 시간이 줄어듭니다.',
        tags: ['점수 반영', '제출 상태', '진행률'],
    },
    {
        eyebrow: 'VOD',
        title: '온라인 강의 시청 조작도 더 짧게 끝냅니다.',
        description:
            '배속 메뉴, 1000배속 스킵, 다운로드 버튼을 플레이어 근처에서 바로 사용할 수 있습니다.',
        benefit:
            '반복 시청이나 출석 체크 흐름을 덜 끊고 필요한 조작을 짧게 끝낼 수 있습니다.',
        tags: ['0.75x~4.0x', '1000배속', '다운로드'],
    },
];

export const previewFixHighlights: LandingFixHighlight[] = [
    {
        title: '로그인 페이지 오작동 차단',
        issue: '로그인 화면에서는 확장 UI가 보이면 안 되고, 크롤링도 돌 필요가 없습니다.',
        fix: '로그인 페이지는 content script 주입과 런타임 실행을 모두 막도록 예외 처리를 추가했습니다.',
        benefit:
            '유저는 로그인 단계에서 방해 요소 없이 진입하고, 불필요한 동작으로 인한 혼란을 겪지 않습니다.',
    },
    {
        title: '카드 정보 정확도 보강',
        issue: '과제와 퀴즈는 목록만 보면 제출 여부나 점수, 진짜 마감 판단이 애매했습니다.',
        fix: '상세 정보까지 함께 수집해 제출 상태, 점수, 기간, 진행률을 카드에 반영했습니다.',
        benefit:
            '무엇이 진짜 급한지 즉시 판단할 수 있어서 탭을 더 열어보는 시간이 줄어듭니다.',
    },
    {
        title: '조작 흐름 단순화',
        issue: '항목이 많아지면 필터와 재생 조작이 복잡하게 느껴질 수 있었습니다.',
        fix: '미완료 빠른 필터를 넣고, VOD 패널은 1000배속 버튼을 분리해 핵심 조작만 남겼습니다.',
        benefit:
            '급한 일만 보는 흐름과 강의 넘기기 흐름이 각각 더 직관적으로 정리됩니다.',
    },
];

export const previewReleaseNotes: LandingReleaseNote[] = [
    {
        version: '1.2.5',
        date: '2026-04-13',
        label: 'UI',
        title: '대시보드 카드 액션 정렬 보정',
        summary:
            '상태 라벨과 카드 액션 버튼이 겹치던 레이아웃을 정리하고, 버튼 배경 톤도 카드 hover 흐름에 맞춰 다시 맞췄습니다.',
        changes: [
            '확인필요 라벨과 다운로드/숨기기 버튼이 겹치지 않도록 카드 액션 영역 구조 조정',
            '카드 액션 버튼이 타입별 카드 hover 톤을 함께 따라가도록 스타일 정리',
            '랜딩페이지와 README의 최신 업데이트 내역을 1.2.5 기준으로 동기화',
        ],
        benefit:
            '자료 카드처럼 우측 메타 요소가 많은 경우에도 화면이 덜 깨지고, 카드 상호작용이 더 일관되게 보입니다.',
    },
    {
        version: '1.2.4',
        date: '2026-04-13',
        label: 'Core',
        title: '랜딩, 크롤링, VOD 흐름 정리',
        summary:
            '설치 전 체험용 랜딩/프리뷰를 새로 구성하고, 과목별 증분 갱신과 자료 예외 처리, CMS VOD 대응까지 전체 흐름을 함께 다듬었습니다.',
        changes: [
            '랜딩과 프리뷰를 새로 구성하고 업데이트 목록을 리스트형 타임라인으로 정리',
            '과목별 마지막 실행 시각을 저장해 증분 갱신과 캐시 재사용 지원',
            '자료/공지 숨김 설정을 수집 단계에 반영하고 pluginfile.php PDF 응답 예외 처리',
            'cms.smu.ac.kr VOD 뷰어 지원, 패널 위치 저장/드래그, 1000배속 스킵 토글 개선',
        ],
        benefit:
            '설치 전 체험은 더 쉬워지고, 실제 사용 중에는 불필요한 재수집과 오류 로그가 줄며 VOD 조작도 더 안정적입니다.',
    },
    {
        version: '1.2.3',
        date: '2026-04-04',
        label: 'Core',
        title: '로그인 페이지 안정화',
        summary:
            '로그인 페이지에 확장 UI가 개입하지 않도록 주입 규칙과 런타임 가드를 함께 정리했습니다.',
        changes: [
            'login.php 페이지는 content script 주입 대상에서 제외',
            '런타임에서도 로그인 페이지는 UI와 크롤링 실행 차단',
        ],
        benefit:
            '로그인 진입이 더 조용하고 안정적이며, 잘못된 화면 개입 가능성이 줄었습니다.',
    },
    {
        version: '1.2.2',
        date: '2026-03-31',
        label: 'Infra',
        title: '배포 흐름 정리',
        summary:
            'Chrome Web Store 배포 워크플로와 secret 참조를 실제 배포 환경과 일치하도록 수정했습니다.',
        changes: [
            'CHROME_* secret 이름 참조 수정',
            '태그 푸시 시 build, release, publish 단계 정합성 정리',
        ],
        benefit:
            '업데이트가 끊기지 않고 안정적으로 배포되어 유저가 최신 기능을 더 꾸준히 받게 됩니다.',
    },
    {
        version: '1.2.1',
        date: '2026-03-31',
        label: 'VOD',
        title: 'VOD 패널 단순화',
        summary:
            '강의 재생 패널에서 자주 쓰는 조작만 남기고 1000배속 스킵을 별도 버튼으로 분리했습니다.',
        changes: [
            '5초 이동 버튼 제거',
            '0.75x ~ 4.0x 배속 메뉴 유지',
            '1000배속 스킵을 독립 버튼으로 분리',
        ],
        benefit:
            '재생 패널이 덜 복잡해지고, 초고속 넘기기 기능을 더 빠르게 찾을 수 있습니다.',
    },
    {
        version: '1.2.0',
        date: '2026-03-18',
        label: 'Quiz',
        title: '퀴즈 카드 추가',
        summary:
            '퀴즈 목록과 상세 정보를 함께 수집해 제목, 마감, 점수를 대시보드에서 바로 확인할 수 있게 했습니다.',
        changes: [
            '퀴즈 전용 유형 필터와 카드 표시 추가',
            '점수가 있는 퀴즈는 지남/마감 처리에서 제외',
            '중복되는 기간 표시는 정리하고 핵심 마감만 노출',
        ],
        benefit:
            '퀴즈 마감과 채점 결과를 한 번에 확인할 수 있어 확인 동선이 짧아집니다.',
    },
    {
        version: '1.1.0',
        date: '2026-03-17',
        label: 'Core',
        title: '대시보드 품질 업그레이드',
        summary:
            '캐시 동기화, 과제 정보 수집, 빠른 필터, UI 상호작용을 전반적으로 손봐 기본 사용성을 끌어올렸습니다.',
        changes: [
            '과제 상세와 목록 정보를 함께 수집해 표시 정확도 강화',
            '미완료 빠른 필터 추가',
            '로딩, 버튼 상태, 카드 강조선 등 상호작용 개선',
            'VOD 배속 범위를 0.75x ~ 4.0x로 확장',
        ],
        benefit:
            '대시보드가 더 믿을 만해지고, 바쁠 때 필요한 항목만 더 빨리 추릴 수 있습니다.',
    },
    {
        version: '1.0.0',
        date: '2026-03-02',
        label: 'Launch',
        title: '첫 공개',
        summary:
            'eCampus 우측 대시보드와 VOD 보조 기능을 처음 제공하며 기본 학습 관리 흐름을 한곳에 모았습니다.',
        changes: [
            '과제, 강의, 토론, 자료, 공지 수집',
            '마감일, 과목, 유형 기준 필터 제공',
            '항목 숨김과 설정 모달 복원 지원',
            '자료/영상 다운로드와 VOD 보조 기능 제공',
        ],
        benefit:
            '여러 메뉴를 오가던 학습 관리 흐름을 확장 하나로 줄일 수 있게 되었습니다.',
    },
];
