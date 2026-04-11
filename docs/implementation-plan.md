# WP Companion — 구현 계획서

## 프로젝트 개요

**목적**: 다수의 워드프레스 블로그 (현재 4개, 확장 예정)의 트래픽, 검색 성과, 수익, 게시글 정보를 하나의 웹 대시보드에서 통합 관리

**사용 형태**: SaaS (외부 공개), 초대 코드 기반 클로즈드 베타로 시작

**MVP 핵심 기능 4가지**:
1. 대시보드 개요 — 전체 블로그 종합 메트릭
2. 글 관리 — 블로그별 게시글 목록, 상태, 성과
3. 수익 분석 — AdSense 수익 트렌드, 블로그별 비교
4. SEO/색인 모니터링 — Google 색인 상태, 검색 성과 추적

---

## Phase 1: 프로젝트 기반 + 인증 + 초대 시스템 ✅

**커밋**: `13d5333` | **상태**: 완료

- [x] Next.js 16 + TypeScript + Tailwind CSS 4 + shadcn/ui 초기화
- [x] Prisma 6 스키마 10개 모델 (PostgreSQL, Docker Compose port 5433)
- [x] Auth.js v5 + Google OAuth (4 scopes, offline access)
- [x] 초대 코드 시스템 (생성/검증/사용, 레이스 컨디션 방어)
- [x] 접이식 사이드바 레이아웃 (Emerald 600 테마)
- [x] 로그인 → 대시보드 진입 플로우

**결과물**: 초대 코드 입력 → 로그인 → 빈 대시보드 진입 가능

---

## Phase 2: WordPress 연동 + 글 관리 ✅

**커밋**: `94b1b73` | **상태**: 완료

- [x] AES-256-GCM 암호화 유틸리티 (`src/lib/encryption.ts`)
- [x] WordPress REST API 클라이언트 (Basic Auth, Application Password)
- [x] 사이트 CRUD 서비스 + API 라우트 (생성/수정/삭제/연결테스트)
- [x] 사이트 추가 페이지 UI (연결 테스트 → 저장)
- [x] 글 동기화 서비스 (SyncService, 페이지네이션, upsert, 삭제 감지)
- [x] TanStack Table 글 목록 (서버사이드 필터/정렬/페이지네이션)
- [x] Prisma Client Extension `prismaForUser()` (userId 자동 격리)
- [x] 사이드바 사이트 목록 DB 연동 (TanStack Query + useSites)

**결과물**: WP 사이트 추가 → 글 동기화 → 테이블에서 관리 가능

---

## Phase 3: Google API 연동 ✅

**커밋**: `e4958e5` | **상태**: 완료

- [x] Google Auth Manager (토큰 갱신 + `Map<userId, Promise>` 뮤텍스)
- [x] Google Base Client (공통 fetch/에러/타임아웃)
- [x] Search Console 클라이언트 → SearchPerformance + PostCache 메트릭
- [x] GA4 클라이언트 → TrafficSnapshot + PostCache.pageviews30d
- [x] AdSense 클라이언트 → RevenueSnapshot
- [x] URL 매칭 유틸리티 (정규화 + slug 폴백)
- [x] `syncFull()` 오케스트레이션 (WP + GSC + GA4 + AdSense, 100-500ms jitter)
- [x] 크론 엔드포인트 (`CRON_SECRET` 인증, 전체 사이트 배치)
- [x] Google 속성 설정 UI (picker + 수동 입력)

**결과물**: 모든 외부 데이터 수집/저장 완료, 6시간 자동 동기화

---

## Phase 4: 대시보드 + 차트 + 분석 화면 ✅

**커밋**: `74ffa4c` | **상태**: 완료

- [x] 대시보드 데이터 서비스 (메트릭 집계, 트렌드, TOP 글)
- [x] 종합 대시보드 UI (MetricCard + Recharts AreaChart/BarChart + TopPosts)
- [x] 수익 분석 페이지 (일별 시계열 + 사이트별 비교 + RPM)
- [x] SEO 모니터링 (클릭/노출 LineChart + 색인 현황 프로그레스바)
- [x] Sync Now 버튼 연결 (SyncButton → 전체 사이트 동기화 + 쿼리 갱신)
- [x] 규칙 기반 액션 추천 컬럼 (색인 요청 / 제목 개선 / 홍보 필요)

**결과물**: MVP 기능 완성, 모든 데이터 시각화

---

## Phase 5: 품질 + Docker + 배포 ✅

**커밋**: `f9cbf5c` ~ `14fdcf9` | **상태**: 완료

- [x] Next.js standalone 빌드 설정
- [x] Multi-stage Dockerfile (deps → builder → runner)
- [x] docker-compose (앱 + DB + 크론 사이드카)
- [x] 에러 바운더리 (`error.tsx`)
- [x] 로딩 스켈레톤 (`loading.tsx`)
- [x] 404 페이지 (`not-found.tsx`)
- [x] `.dockerignore`, `.env.example`
- [x] 프로덕션 시드 스크립트 (`scripts/seed-production.sh`)
- [x] Credentials 로그인 (도메인 없이 초대 코드만으로 진입)
- [x] `AUTH_TRUST_HOST` 설정

**결과물**: `docker compose up`으로 전체 서비스 배포 가능

---

## 외부 API 연동

| API | 용도 | 인증 | 주요 엔드포인트 |
|-----|------|------|----------------|
| WP REST API | 글/카테고리/태그 | Application Password (Basic Auth) | `/wp-json/wp/v2/posts` |
| Google Search Console | 검색 성과, 색인 상태 | OAuth2 (per-user) | `searchAnalytics/query` |
| Google Analytics (GA4) | 트래픽, 사용자 행동 | OAuth2 (per-user) | `properties/:id:runReport` |
| Google AdSense | 수익 데이터 | OAuth2 (per-user) | `reports:generate` |

**데이터 동기화 전략**:
- 크론 동기화 (6시간 주기): 크론 컨테이너 → `POST /api/cron/sync`
- 수동 동기화: "Sync Now" 버튼 → 해당 사이트 즉시 동기화
- 30일 롤링 윈도우 + upsert로 멱등성 보장

---

## 보안 설계

| 항목 | 구현 |
|------|------|
| WP Application Password | AES-256-GCM 암호화 저장 (12바이트 IV, 16바이트 AuthTag) |
| Google OAuth 토큰 | Account 모델에 저장, 5분 전 선제 갱신, 뮤텍스 |
| 멀티테넌트 격리 | `prismaForUser()` 확장 클라이언트 (userId 자동 필터) |
| 크론 인증 | `Authorization: Bearer {CRON_SECRET}` 헤더 검증 |
| API 응답 | `apiKey` 필드 항상 omit (암호화된 자격 증명 노출 방지) |
| 인증 게이트 | 대시보드 레이아웃에서 `auth()` + redirect |
