# AIDLC Guide

AWS Labs [aidlc-workflows](https://github.com/awslabs/aidlc-workflows) (AI-Driven Development Life Cycle) 를 **v1(1.0)** 과 **v2(2.0)** 로 나누어 시각화·정리하고, 국내외 도입 사례를 모은 한국어 웹 가이드입니다.

- **v2** — upstream `main` (2.x GA) 기준, 현재 **v2.10.0** (2026-09-24) 반영: 5 Phase · 33 Stage · 14 Agent · 11 워크플로우 프로필 · 7 Harness
- **v1** — upstream `v1` 브랜치(유지보수, 최종 v1.0.1) 기준: 3 Phase · 14 Stage

## 🌐 Live

GitHub Pages: **https://nuriguri1228.github.io/AIDLC-Guide/**

## 📄 페이지

| 구분 | 파일 | 내용 |
|---|---|---|
| 홈 | `index.html` | 버전 선택 · v1/v2 비교 · 사례 미리보기 · 최근 업데이트 |
| v1 | `v1-workflow.html` | Phase → Step → Activity 다이어그램 + 산출물 sample viewer (편집·Export/Import) |
| v1 | `v1-user-flow.html` | 처음부터 끝까지 14 stage 사용자 흐름 |
| v1 | `v1-reverse-engineering.html` | Brownfield Reverse Engineering 상세 |
| v1 | `v1-effects.html` · `v1-scenarios.html` | 효과 · 적용 시나리오 |
| v2 | `v2-overview.html` | 2.0 스펙(9원칙 · 3-구획 모델) · 구현체 · 릴리스 · 1.0 비교 |
| v2 | `v2-workflow.html` | 33 stage × 11 프로필 워크플로우 다이어그램 |
| v2 | `v2-flow.html` | 설치(`aidlc` CLI)부터 Operation 까지 사용자 흐름 |
| 공통 | `cases.html` | 국내외 도입 사례 17건 (필터 · 발표 자료 viewer) |

공통 상단 내비게이션과 셸 스타일은 `assets/site.js` · `assets/site.css` 한 곳에서 관리합니다 (각 페이지는 `<body data-page="...">` 로 식별).
예전 파일명(`aidlc-2*.html`, `effects.html` 등)은 새 경로로 리다이렉트됩니다.

## 📂 구조

```
.
├── index.html · v1-*.html · v2-*.html · cases.html
├── assets/                   # 공통 내비게이션(site.js) · 셸 스타일(site.css)
├── decks/                    # 사례 발표 자료 (pptx)
├── samples/                  # v1 산출물 sample md 파일 (95개)
└── docs/                     # 페이지 설계 spec (개발 메모)
```

`samples/` 의 약 25개는 AWS Labs `scripts/aidlc-evaluator/test_cases/sci-calc` / `all-stages` 의 **실제 golden samples** 이고, 나머지는 AIDLC `question-format-guide.md` 및 각 rule 파일의 convention 에 맞춰 작성된 sample 입니다.

## 🚀 로컬에서 보기

```bash
git clone https://github.com/nuriguri1228/AIDLC-Guide.git
cd AIDLC-Guide
python3 -m http.server 8000
# http://localhost:8000 접속
```

> ⚠ `file://` 로 직접 열면 CORS 정책 때문에 samples 파일 fetch 가 실패합니다. 반드시 로컬 HTTP 서버를 사용하세요.

## 📦 데이터 출처

- AWS Labs [aidlc-workflows](https://github.com/awslabs/aidlc-workflows) — Apache-2.0 License
  - `aidlc-rules/aws-aidlc-rule-details/` — step/activity/output 정의
  - `scripts/aidlc-evaluator/test_cases/` — golden samples
