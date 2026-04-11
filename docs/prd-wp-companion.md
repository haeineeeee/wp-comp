# PRD: WP Companion

## 1. 개요

- **한 줄 요약**: 다수의 워드프레스 블로그의 트래픽, 검색 성과, 수익, 게시글을 하나의 대시보드에서 통합 관리하는 SaaS
- **작성일**: 2026-04-11
- **작성자**: haein
- **상태**: Approved (MVP 구현 완료)

---

## 2. 문제 정의

### 타겟 유저
워드프레스 블로그를 **2개 이상** 운영하며 AdSense 수익을 창출하는 개인/소규모 퍼블리셔.
현재 4개 블로그 운영 중이며 앞으로 더 늘어날 예정.

### 현재 상황 (Status Quo)
| 데이터 | 현재 확인 방법 | 문제점 |
|--------|---------------|--------|
| 트래픽 | Google Analytics 각 사이트 개별 접속 | 사이트 수만큼 탭을 열어야 함 |
| 검색 성과 | Search Console 각 사이트 개별 접속 | 크로스 사이트 비교 불가 |
| 수익 | AdSense 대시보드 | 사이트별 수익 비교 어려움 |
| 글 관리 | 각 WP 관리자 페이지 | 전체 글 현황 파악 불가 |
| 색인 상태 | Search Console에서 하나씩 확인 | 색인 누락 글 발견이 느림 |

### 핵심 문제
**"흩어진 데이터를 각각 확인하는 비효율"** — 4개 사이트 × 4개 도구 = 16번의 컨텍스트 스위칭. 사이트가 늘어날수록 기하급수적으로 악화.

### 기회
- 워드프레스 블로그 운영자 수: 전 세계 4억+ 사이트, 한국 내 블로그 수익화 시장 급성장
- 기존 도구의 부재: 다수 WP 사이트를 통합 관리하는 SaaS가 거의 없음
- Google API 접근성: GSC, GA4, AdSense API가 무료로 제공되어 데이터 수집 비용 제로

---

## 3. 목표 및 성공 지표

| 지표 | 현재 (출시 전) | MVP 목표 | 측정 방법 |
|------|---------------|----------|-----------|
| 일일 데이터 확인 시간 | ~30분 (4사이트 × 4도구) | 5분 이내 | 사용자 인터뷰 |
| 색인 누락 발견 속도 | 수일~수주 | 동기화 직후 | 액션 추천 컬럼 표시율 |
| 수익 트렌드 파악 | 월말 AdSense 확인 | 실시간 (6시간 갱신) | 대시보드 차트 |
| 크로스사이트 비교 | 불가능 | 1 클릭 | 수익/SEO 페이지 |
| 클로즈드 베타 사용자 | 0 | 10명 | 초대 코드 사용 수 |

---

## 4. 범위 (Scope)

### In Scope (MVP — 구현 완료)
- 초대 코드 기반 클로즈드 베타 인증
- WordPress REST API 연동 (글 동기화, Application Password)
- Google Search Console 연동 (검색 성과, 페이지별 메트릭)
- Google Analytics 4 연동 (트래픽, 오가닉 세션)
- Google AdSense 연동 (수익, RPM, CPC, CTR)
- 종합 대시보드 (메트릭 카드, 트래픽/수익 트렌드 차트, TOP 5 글)
- 글 관리 (TanStack Table, 필터/정렬/페이지네이션, 액션 추천)
- 수익 분석 (일별 시계열, 사이트별 비교, RPM 추적)
- SEO 모니터링 (클릭/노출 차트, 색인 현황)
- 자동 동기화 (6시간 크론) + 수동 동기화 (Sync Now)
- Docker 배포 (앱 + DB + 크론 사이드카)

### Out of Scope (향후 고려)
- 글 편집/발행 (WP 관리자로 리다이렉트)
- 코멘트 관리
- 멀티 유저 팀 기능 (역할/권한)
- 실시간 알림 (이메일, Slack)
- 커스텀 도메인별 SSL 자동 발급
- 모바일 앱 (반응형 웹으로 대체)
- A/B 테스트 기능
- 유료 플랜 / 결제 시스템

---

## 5. 기능 요구사항

### 5.1 인증 및 사용자 관리

| ID | 요구사항 | 우선순위 | 상태 |
|----|----------|----------|------|
| AUTH-01 | 초대 코드 입력으로 로그인 | P0 | ✅ 완료 |
| AUTH-02 | Google OAuth 로그인 (도메인 필요) | P1 | ✅ 구현됨 (도메인 준비 시 활성화) |
| AUTH-03 | 초대 코드 생성/관리 API | P0 | ✅ 완료 |
| AUTH-04 | 세션 기반 인증 게이트 (대시보드 보호) | P0 | ✅ 완료 |

### 5.2 사이트 관리

| ID | 요구사항 | 우선순위 | 상태 |
|----|----------|----------|------|
| SITE-01 | WP 사이트 추가 (URL + Application Password) | P0 | ✅ 완료 |
| SITE-02 | 연결 테스트 (추가 전 인증 검증) | P0 | ✅ 완료 |
| SITE-03 | 사이트 수정/삭제 | P0 | ✅ 완료 |
| SITE-04 | 사이트 상세 페이지 (기본 정보 + Google 연결 상태) | P1 | ✅ 완료 |
| SITE-05 | Google 속성 설정 UI (GSC/GA4/AdSense picker) | P1 | ✅ 완료 |
| SITE-06 | 사이드바에 사이트 목록 실시간 표시 | P1 | ✅ 완료 |

### 5.3 데이터 동기화

| ID | 요구사항 | 우선순위 | 상태 |
|----|----------|----------|------|
| SYNC-01 | WP 글 전체 동기화 (upsert + 삭제 감지) | P0 | ✅ 완료 |
| SYNC-02 | GSC 검색 성과 동기화 (30일 롤링) | P0 | ✅ 완료 |
| SYNC-03 | GA4 트래픽 동기화 (30일 롤링) | P0 | ✅ 완료 |
| SYNC-04 | AdSense 수익 동기화 (30일 롤링) | P0 | ✅ 완료 |
| SYNC-05 | 수동 동기화 (Sync Now 버튼) | P0 | ✅ 완료 |
| SYNC-06 | 자동 동기화 (6시간 크론) | P1 | ✅ 완료 |
| SYNC-07 | 동기화 로그 기록 (SyncLog) | P1 | ✅ 완료 |
| SYNC-08 | 부분 실패 처리 (GSC 실패해도 GA4/AdSense 계속) | P1 | ✅ 완료 |

### 5.4 대시보드

| ID | 요구사항 | 우선순위 | 상태 |
|----|----------|----------|------|
| DASH-01 | 종합 메트릭 카드 (PV, 수익, 색인율, 사이트 수) | P0 | ✅ 완료 |
| DASH-02 | 7일 변화량 표시 (↑↓ 퍼센트) | P1 | ✅ 완료 |
| DASH-03 | 트래픽 트렌드 차트 (30일, AreaChart) | P0 | ✅ 완료 |
| DASH-04 | 수익 트렌드 차트 (30일, BarChart) | P0 | ✅ 완료 |
| DASH-05 | 인기 글 TOP 5 | P1 | ✅ 완료 |
| DASH-06 | 사이트 없을 때 Empty State + CTA | P1 | ✅ 완료 |

### 5.5 글 관리

| ID | 요구사항 | 우선순위 | 상태 |
|----|----------|----------|------|
| POST-01 | 글 목록 테이블 (제목, 사이트, 상태, 게시일, PV, 클릭) | P0 | ✅ 완료 |
| POST-02 | 서버사이드 페이지네이션 (20건/페이지) | P0 | ✅ 완료 |
| POST-03 | 사이트별 필터 | P1 | ✅ 완료 |
| POST-04 | 상태별 필터 (발행/임시글/비공개) | P1 | ✅ 완료 |
| POST-05 | 제목 검색 | P1 | ✅ 완료 |
| POST-06 | 컬럼 정렬 (제목, 게시일, PV, 클릭) | P1 | ✅ 완료 |
| POST-07 | 규칙 기반 액션 추천 (색인 요청/제목 개선/홍보 필요) | P2 | ✅ 완료 |

### 5.6 수익 분석

| ID | 요구사항 | 우선순위 | 상태 |
|----|----------|----------|------|
| REV-01 | 총 수익 + 평균 RPM 표시 | P0 | ✅ 완료 |
| REV-02 | 일별 수익 시계열 차트 | P0 | ✅ 완료 |
| REV-03 | 사이트별 수익 비교 (프로그레스바 + 퍼센트) | P0 | ✅ 완료 |
| REV-04 | 사이트 필터 드롭다운 | P1 | ✅ 완료 |

### 5.7 SEO 모니터링

| ID | 요구사항 | 우선순위 | 상태 |
|----|----------|----------|------|
| SEO-01 | 검색 성과 요약 (총 클릭, 노출, CTR, 순위) | P0 | ✅ 완료 |
| SEO-02 | 클릭/노출 트렌드 차트 (이중 Y축) | P0 | ✅ 완료 |
| SEO-03 | 색인 현황 (indexed/pending/not_indexed/unknown) | P0 | ✅ 완료 |
| SEO-04 | 색인 프로그레스바 + 비율 표시 | P1 | ✅ 완료 |
| SEO-05 | 사이트 필터 드롭다운 | P1 | ✅ 완료 |

---

## 6. 비기능 요구사항

### 성능
- API 응답: 200ms 이내 (메트릭 집계 쿼리)
- 글 목록 페이지 로딩: 1초 이내 (서버사이드 페이지네이션)
- 동기화: 사이트당 30초 이내 (1000글 기준)
- 차트 렌더링: 100ms 이내 (30일 데이터)

### 보안
- WP 자격 증명: AES-256-GCM 암호화 저장 (12바이트 IV, 16바이트 AuthTag)
- Google OAuth 토큰: 만료 5분 전 선제 갱신, 프로세스 레벨 뮤텍스
- 멀티테넌트 격리: `prismaForUser()` Prisma Client Extension
- API 응답에서 암호화된 자격 증명 절대 노출 안 함 (`omit: { apiKey: true }`)
- 크론 API: `CRON_SECRET` Bearer 토큰 인증

### 확장성
- 예상 초기 규모: 10 사용자 × 10 사이트 = 100 사이트
- DB 추정: 100 사이트 × 1년 = ~11만 row (PostgreSQL 충분)
- Google API 제한: GSC 2,000건/일, GA4 50,000건/속성 → 6시간 주기로 충분

### 접근성
- 한국어 UI
- 라이트/다크 모드 (next-themes)
- 접이식 사이드바 (모바일 대응)
- 반응형 그리드 (2열 모바일, 4열 데스크톱)

---

## 7. 기술 설계 개요

### 아키텍처
```
[Browser] → [Next.js App Router]
                    ↓
            [API Routes] ← auth() 인증 게이트
                    ↓
          [Services 레이어] ← 순수 TypeScript, Next.js 무의존
              ↓           ↓
       [Prisma ORM]  [Integrations]
       (PostgreSQL)   (WP API, Google APIs)
```

### 데이터 모델 (10개 엔티티)
| 모델 | 역할 | 주요 관계 |
|------|------|-----------|
| User | 사용자 | → Account, Session, WordPressSite, InviteCode |
| Account | OAuth 토큰 | → User |
| Session | 세션 | → User |
| InviteCode | 초대 코드 | → User (생성자/사용자) |
| WordPressSite | WP 사이트 | → PostCache, TrafficSnapshot, SearchPerformance, RevenueSnapshot, SyncLog |
| PostCache | 글 캐시 + 메트릭 | → WordPressSite |
| TrafficSnapshot | GA4 일별 트래픽 | → WordPressSite |
| SearchPerformance | GSC 일별 검색 성과 | → WordPressSite |
| RevenueSnapshot | AdSense 일별 수익 | → WordPressSite |
| SyncLog | 동기화 이력 | → WordPressSite |

### 주요 API 엔드포인트
| 카테고리 | 엔드포인트 | 메서드 |
|----------|-----------|--------|
| 사이트 | `/api/sites` | GET, POST |
| 사이트 상세 | `/api/sites/[id]` | GET, PUT, DELETE |
| 동기화 | `/api/sites/[id]/sync` | POST |
| 연결 테스트 | `/api/sites/test` | POST |
| 글 목록 | `/api/posts` | GET |
| 대시보드 | `/api/dashboard` | GET |
| 차트 | `/api/dashboard/chart` | GET |
| 수익 | `/api/revenue` | GET |
| SEO | `/api/seo` | GET |
| 크론 | `/api/cron/sync` | POST |
| Google 속성 | `/api/google/*/` | GET |

### 의존성
| 구분 | 기술 |
|------|------|
| 프레임워크 | Next.js 16.2, React 19.2, TypeScript 5 |
| ORM | Prisma 6.19 |
| DB | PostgreSQL 16 |
| UI | shadcn/ui (base-ui), Tailwind CSS 4, Recharts 3.8 |
| 데이터 페칭 | TanStack Query 5, TanStack Table 8 |
| 인증 | Auth.js v5 (NextAuth beta.30) |
| 암호화 | Node.js crypto (AES-256-GCM) |
| 배포 | Docker, Docker Compose |

---

## 8. 구현 계획

| Phase | 내용 | 상태 |
|-------|------|------|
| Phase 1 | 프로젝트 기반 + 인증 + 초대 시스템 | ✅ 완료 |
| Phase 2 | WordPress 연동 + 글 관리 | ✅ 완료 |
| Phase 3 | Google API 연동 (GSC + GA4 + AdSense) | ✅ 완료 |
| Phase 4 | 대시보드 + 차트 + 분석 화면 | ✅ 완료 |
| Phase 5 | 품질 + Docker + 배포 | ✅ 완료 |

총 코드량: ~6,000줄 (78개 소스 파일)

---

## 9. 리스크 및 의존성

| 리스크 | 영향 | 완화 방안 | 상태 |
|--------|------|-----------|------|
| Google OAuth에 공개 도메인 필요 | 높음 | Credentials 로그인으로 우회 (도메인 준비 시 활성화) | ✅ 완화됨 |
| GSC URL Inspection API 일 2,000건 제한 | 중간 | 신규/변경 글만 검사, 6시간 캐시 | 설계 반영 |
| GA4 일일 토큰 50,000건/속성 | 낮음 | 간단한 쿼리 사용, 30일 롤링 | 설계 반영 |
| WP REST API 비활성화된 사이트 | 중간 | 사이트 추가 시 연결 테스트 필수 | ✅ 구현됨 |
| OAuth 토큰 동시 갱신 경쟁 조건 | 높음 | `Map<userId, Promise>` 프로세스 레벨 뮤텍스 | ✅ 구현됨 |
| Prisma 7 breaking change | 높음 | Prisma 6.19 고정, package.json 버전 고정 | ✅ 적용됨 |
| DB 볼륨 증가 | 낮음 | 10사이트 × 1년 ≈ 11만 row (PostgreSQL 충분) | 설계 반영 |

---

## 10. 미해결 질문

- [ ] 공개 도메인 확보 후 Google OAuth 활성화 시점
- [ ] 클로즈드 베타 → 오픈 베타 전환 기준 (사용자 N명? 피드백 M건?)
- [ ] 유료 플랜 도입 시점 및 가격 체계
- [ ] 모바일 전용 UI 최적화 필요 여부 (현재 반응형 웹)
- [ ] 실시간 알림 (색인 실패, 수익 급감) 구현 시점
- [ ] 멀티 유저 팀 기능 (공동 관리) 필요 시점
- [ ] 글 편집 기능 WP 리다이렉트 vs 자체 에디터

---

## 부록: 화면 구성

### 대시보드 레이아웃
```
┌────────┬──────────────────────────────────────┐
│        │ [Sync Now]              [User Avatar] │
│ 📊 Dash├──────────────────────────────────────┤
│ 📝 Post│ [PV: 12.3K] [Rev: $847] [색인: 92%] │
│ 💰 Rev │ [Sites: 4]                           │
│ 🔍 SEO │                                      │
│        │ [트래픽 AreaChart] [수익 BarChart]     │
│ ─Sites─│                                      │
│  Blog A│ [인기 글 TOP 5]                       │
│  Blog B│                                      │
│ +추가  │                                      │
└────────┴──────────────────────────────────────┘
```
