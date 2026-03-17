# eHelper

<img width="5120" height="3200" alt="홍보_safe" src="https://github.com/user-attachments/assets/3224c78d-3b29-42f0-9812-4c5cc5c7e411" />

eCampus 페이지에서 과목별 학습 항목(과제/강의/토론/자료/공지)을 한눈에 관리할 수 있도록 우측 대시보드 패널과 VOD 보조 기능을 제공하는 Chrome Extension입니다.

## 주요 기능

- 과목별 항목 집계 및 그룹 렌더링
- 마감/유형/과목 필터링
- 지난 강의/과제/토론 숨김 설정
- 항목 단위 숨김 및 설정 모달에서 상세 복원
- 자료/영상 다운로드(Chrome `downloads` API 기반)
- VOD 페이지 재생 컨트롤(배속, 시킹, 다운로드)
- 팝업에서 eCampus 원클릭 이동

## 버전별 업데이트

### v1.1.0 (업데이트: 2026-03-17)

- 대시보드 과목 캐시 동기화와 새로고침 흐름을 정리해 비대시보드 페이지에서도 데이터 갱신 안정성을 높였습니다.
- 과제 상세/목록 정보를 함께 수집해 제출 상태, 기간, 마감 정보 표시를 더 정확하게 보강했습니다.
- `미완료` 빠른 필터를 추가하고, 과제/강의/토론 중심으로 보이도록 필터 동작을 다듬었습니다.
- 로딩 오버레이, 스피너, 버튼 포커스/클릭 상태, 카드 강조선 등 대시보드 UI 상호작용을 전반적으로 개선했습니다.
- VOD 재생 속도 옵션을 확장해 `0.75x ~ 4.0x` 범위를 지원합니다.
- 루트/배포용 `manifest`의 아이콘 경로를 정리해 압축해제 확장 로드 오류를 수정했습니다.

### v1.0.0 (초기 배포: 2026-03-02)

- eCampus 우측 대시보드 패널과 팝업 진입 UI를 처음 제공합니다.
- 과목별 과제/강의/토론/자료/공지 항목을 수집해 한 화면에서 확인할 수 있습니다.
- 마감일, 과목, 유형 기준 필터와 지난 항목 숨김 기능을 제공합니다.
- 항목 단위 숨김과 설정 모달 복원 기능을 지원합니다.
- 자료/영상 다운로드와 VOD 재생 보조 기능(배속, 시킹, 다운로드)을 제공합니다.

## 기술 스택

- React 18
- TypeScript
- Tailwind CSS
- Vite
- Chrome Extension Manifest V3

## 권한(Manifest)

- `storage`: UI 상태/설정 저장
- `downloads`: 자료/영상 파일 다운로드
- `host_permissions`: `https://ecampus.smu.ac.kr/*`

## 문서

- 개인정보처리방침: [PRIVACY_POLICY.md](/Users/kim-yeonjin/Documents/project/ecampus-dashboard-smu/PRIVACY_POLICY.md)
  시행일: `2026-03-03`

## 라이선스

MIT License ([LICENSE](/Users/kim-yeonjin/Documents/project/ecampus-dashboard-smu/LICENSE))
