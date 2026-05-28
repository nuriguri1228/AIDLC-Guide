# AIDLC Guide

AWS Labs [aidlc-workflows](https://github.com/awslabs/aidlc-workflows) (AI Development Life Cycle) 의 3-phase / 14-step 구조를 시각화한 single-page 웹 가이드입니다.

## 🌐 Live

GitHub Pages: **https://nuriguri1228.github.io/AIDLC-Guide/**

## ✨ 기능

- **Phase → Step → Activity 3단 시각화** — Inception 7 step / Construction 6 step / Operations 1 step (placeholder)
- **단계 배지** — 각 step 박스에 `항상/조건부/비활성` + `Greenfield/Brownfield/공통` 마크
- **상세 단계 마크** — 활동 박스에 📄 (산출물 생성) / 👤 (Human-in-the-loop) 표시
- **산출물 viewer** — 모달 안의 `.md` 파일명 클릭 시 AWS Labs golden samples 또는 AIDLC 컨벤션에 맞춘 sample 파일이 markdown viewer 에 렌더링
- **AIDLC 컨벤션 정확 반영** — `awslabs/aidlc-workflows` 의 `aidlc-rules/aws-aidlc-rule-details/` 룰 파일에서 step / activity / inputs / outputs / ruleFile 을 직접 추출

## 📂 구조

```
.
├── index.html                # Main SPA (자가-내장 CSS/JS)
├── samples/                  # 95 개 산출물 sample md 파일
│   ├── aidlc-state.md
│   ├── audit.md
│   ├── inception/
│   │   ├── requirements/     # requirements + verification/clarification questions
│   │   ├── plans/            # execution / story / design / unit-of-work / code-gen plans
│   │   ├── user-stories/     # stories.md, personas.md
│   │   ├── application-design/  # components / methods / services / dependency / unit-of-work
│   │   └── reverse-engineering/ # business-overview / architecture / api / code-structure 등
│   ├── construction/
│   │   ├── plans/            # per-unit plan 파일들
│   │   ├── user-management/  # 예시 unit (functional / nfr / infra design 산출물)
│   │   ├── build-and-test/   # build / unit / integration / performance / contract / security / e2e test
│   │   └── shared-infrastructure.md
│   └── operations/operations.md
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
