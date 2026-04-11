@AGENTS.md

## Skill routing

When the user's request matches an available skill, ALWAYS invoke it using the Skill
tool as your FIRST action. Do NOT answer directly, do NOT use other tools first.
The skill has specialized workflows that produce better results than ad-hoc answers.

Key routing rules:
- Product ideas, "is this worth building", brainstorming → invoke office-hours
- Bugs, errors, "why is this broken", 500 errors → invoke investigate
- Ship, deploy, push, create PR → invoke ship
- QA, test the site, find bugs → invoke qa
- Code review, check my diff → invoke review
- Update docs after shipping → invoke document-release
- Weekly retro → invoke retro
- Design system, brand → invoke design-consultation
- Visual audit, design polish → invoke design-review
- Architecture review → invoke plan-eng-review

## 프로젝트 개요

WP Companion — 다수 워드프레스 블로그 통합 관리 SaaS 대시보드.
Phase 1-5 구현 완료. MVP 기능 전체 동작.

## 기술 스택

- Next.js 16.2 (App Router) + TypeScript + Tailwind 4
- PostgreSQL 16 + Prisma 6.19 (NOT Prisma 7)
- Auth.js v5 (Credentials + Google OAuth)
- shadcn/ui (render prop 방식, asChild 아님)
- Recharts 3.8, TanStack Query 5, TanStack Table 8
- Docker Compose (앱 + DB + 크론)

## 핵심 규칙

- Next.js 16: `middleware.ts` → `proxy.ts`, `params`는 async (`await params`)
- 서비스/통합 레이어는 Next.js 무의존 순수 TypeScript
- 의존성 흐름: `API Route → Service → Prisma + Integration`
- WP 자격 증명: JSON blob → AES-256-GCM → `apiKey` 컬럼
- Google API: raw fetch (googleapis 미사용), 30일 롤링 윈도우
- API 응답에서 `apiKey` 항상 omit
- UI 텍스트는 한국어
- Docker DB: port 5433 (5432는 로컬 점유)

## 문서

- `docs/ONBOARDING.md` — 아키텍처, 파일 맵, 코드 컨벤션
- `docs/implementation-plan.md` — Phase 1-5 구현 계획 및 완료 상태
