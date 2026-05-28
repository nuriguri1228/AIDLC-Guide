# AIDLC × SDLC 매핑 웹페이지 설계 문서

작성일: 2026-05-28

## 1. 목적

AWS Labs의 [aidlc-workflows](https://github.com/awslabs/aidlc-workflows) 프로젝트의 3단계 워크플로우(Inception / Construction / Operations)를 전통적인 SDLC 7단계 모델과 매핑하여, 한 페이지에 시각화하는 단일 HTML 웹페이지를 만든다. 각 step의 상세 내용(설명, 활동, 산출물 등)은 모달 팝업으로 제공하며, 사용자가 직접 편집/저장/공유할 수 있다.

레퍼런스 이미지(`ref.png`)의 cascading 박스+화살표 스타일을 유지한다.

## 2. 사용자 시나리오

- **열람**: 페이지를 열면 SDLC 7단계가 가로로 배치되고, 위쪽에 AIDLC 3단계 색상 밴드가 해당 SDLC phase 위에 걸쳐있다. 박스를 클릭하면 모달로 상세 정보를 본다.
- **편집**: 우측 상단 `Edit` 버튼으로 편집 모드 진입 → 박스/팝업 내용을 인라인(contenteditable)으로 수정 → 변경사항은 LocalStorage에 자동 저장.
- **내보내기**: `Export` 버튼 → 현재 데이터를 `aidlc-config.json`으로 다운로드.
- **가져오기**: `Import` 버튼 → JSON 파일 업로드 → 데이터 교체.
- **초기화**: `Reset` 버튼 → 기본 데이터로 복원.

## 3. 기술 스택

- 단일 HTML 파일 (`/home/nuriguri/AIDLC-Guide/index.html`)
- Vanilla HTML/CSS/JavaScript — 빌드 도구 없음, 의존성 없음
- 데이터 저장: 브라우저 LocalStorage
- 파일 입출력: HTML5 Download / File API
- 폰트: 시스템 폰트 (Segoe UI / 한글 시스템 폰트)

## 4. 레이아웃

```
┌──────────────────────────────────────────────────────────────────┐
│  AIDLC × SDLC PHASE MAPPING            [Edit] [Export] [Import] [Reset]│
├──────────────────────────────────────────────────────────────────┤
│  ╔══ INCEPTION (Blue) ══╗  ╔ CONSTRUCTION (Green) ╗  ╔ OPERATIONS (Yellow) ╗│
│  ║Phase1 │Phase2 │Phase3║  ║ Phase4  │  Phase5     ║  ║Phase6 │ Phase7    ║│
│  ║Format.│Reqs  │Design ║  ║Construct│   Test      ║  ║Release│Post-Impl  ║│
│  ╚══════════════════════╝  ╚══════════════════════╝  ╚═══════════════════╝│
│                                                                              │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐                          │
│  │Box │ │Box │ │Box │ │Box │ │Box │ │Box │ │Box │  ← Phase별 첫 박스       │
│  └─┬──┘ └─┬──┘ └─┬──┘ └─┬──┘ └─┬──┘ └─┬──┘ └─┬──┘                         │
│    ↓      ↓      ↓      ↓      ↓      ↓      ↓                              │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐                          │
│  │Box │ │Box │ │Box │ │Box │ │Box │ │Box │ │Box │                         │
│  └────┘ └─┬──┘ └─┬──┘ └─┬──┘ └─┬──┘ └─┬──┘ └────┘                         │
│           ↓      ↓     (cascading 계속...)                                   │
│                                                                              │
│         └── DOCUMENTATION 브래킷 (phase 2-5) ──┘                            │
│                       └── TRAINING 브래킷 (phase 3-6) ──┘                   │
│                                                                              │
│  ┌──────────────────────┐         ┌──────────────────────┐                  │
│  │Change of Scope       │────────→│Change Control Log    │                  │
│  └──────────────────────┘         └──────────────────────┘                  │
└──────────────────────────────────────────────────────────────────┘
```

## 5. 데이터 구조

```javascript
{
  meta: { title: "AIDLC × SDLC PHASE MAPPING", version: 1 },
  aidlcPhases: [
    {
      id: "inception",
      name: "INCEPTION",
      tagline: "WHAT to build and WHY",
      color: "#4A90E2",
      sdlcPhaseIds: ["phase1", "phase2", "phase3"]
    },
    { id: "construction", ... },
    { id: "operations", ... }
  ],
  sdlcPhases: [
    {
      id: "phase1",
      number: 1,
      name: "Formation",
      steps: [
        {
          id: "project-initiation",
          title: "Project Initiation",
          description: "...",       // 한국어 설명
          activities: ["...", "..."],
          deliverables: ["...", "..."],
          aidlcCommands: ["..."]    // 해당 AIDLC workflow 명령
        },
        ...
      ]
    },
    ...
  ],
  brackets: [
    { label: "DOCUMENTATION", spans: ["phase2", "phase3", "phase4", "phase5"] },
    { label: "TRAINING", spans: ["phase3", "phase4", "phase5", "phase6"] }
  ],
  changeControl: {
    scope: { title: "Change of Scope Document", ... },
    log: { title: "Change Control Log", ... }
  }
}
```

## 6. 컴포넌트별 동작

### 박스 (Step)
- 클릭 → 모달 팝업 오픈
- Edit 모드일 때 타이틀 텍스트는 contenteditable
- hover 시 살짝 강조 (그림자)

### 모달 팝업
- 섹션: AIDLC 매핑, 설명, 주요 활동, 산출물, AIDLC Workflow Commands
- Edit 모드: 모든 필드 contenteditable; 리스트 항목 추가/삭제 버튼 표시
- 닫기 시 변경사항 LocalStorage 저장

### 툴바
- `Edit` 토글 — 편집 모드 ON/OFF (UI 색상으로 표시)
- `Export` — JSON 다운로드
- `Import` — `<input type="file">` 트리거, JSON 파싱 후 갱신
- `Reset` — confirm 후 기본 데이터로 복원

## 7. 색상 팔레트 (B 스타일)

- AIDLC Inception: `#4A90E2` (블루)
- AIDLC Construction: `#7ED321` (그린)
- AIDLC Operations: `#F5A623` (옐로/오렌지)
- 박스 보더/텍스트: `#2C7BC4` (원본 SDLC 다이어그램의 파란색 유지)
- 박스 배경: `#FFFFFF`
- 화살표: `#2C7BC4`
- "TRAINING" / "DOCUMENTATION" 강조 텍스트: `#F5A623`

## 8. 언어

- UI 라벨(Phase 이름, 박스 타이틀): 영어 (원본 SDLC 다이어그램 용어 유지)
- 팝업 본문(설명, 활동, 산출물): 한국어 (전문용어는 영어 그대로)
- 툴바 버튼: 영어

## 9. 기본 데이터 (사전 작성)

각 SDLC step별로 AIDLC workflow 컨텍스트에 맞춰 상세 한국어 설명을 작성한다. 예시:

**Phase 2 - Requirements Definition** (Inception 매핑)
- 설명: AIDLC Inception 단계에서 다중 선택형 질문을 통해 사용자 요구사항을 체계적으로 수집한다...
- 활동: 요구사항 수집, 검증, 우선순위 결정, 의존성 분석
- 산출물: Requirements Document, User Stories, Acceptance Criteria
- AIDLC Commands: `/aidlc-inception-requirements`

## 10. 비목표 (Out of Scope)

- 다중 사용자 협업 / 백엔드 / DB
- 실시간 동기화
- 인증
- 모바일 반응형 (데스크탑 우선)
- 다국어 토글
