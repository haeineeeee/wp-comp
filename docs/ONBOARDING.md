# WP Companion — 온보딩 가이드

## 아키텍처 개요

```
┌─────────────────────────────────────────────────────────┐
│                    Next.js App Router                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │
│  │ Dashboard │  │  Posts   │  │ Revenue  │  │   SEO   │ │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬────┘ │
│       └──────────────┼────────────┼──────────────┘      │
│                      ▼                                   │
│              ┌──────────────┐                            │
│              │  API Routes  │                            │
│              └──────┬───────┘                            │
│                     ▼                                    │
│  ┌──────────────────────────────────────────┐           │
│  │              Services 레이어              │           │
│  │  Dashboard · Site · Sync · Post          │           │
│  │  Revenue · SEO · GoogleSync · Invite     │           │
│  └──────┬──────────────────────┬────────────┘           │
│         ▼                      ▼                         │
│  ┌─────────────┐    ┌──────────────────┐                │
│  │  Prisma ORM │    │  Integrations    │                │
│  │ (PostgreSQL)│    │  WordPress API   │                │
│  │             │    │  Google GSC/GA4  │                │
│  │             │    │  Google AdSense  │                │
│  └─────────────┘    └──────────────────┘                │
└─────────────────────────────────────────────────────────┘
```

## 의존성 흐름 (필수 규칙)

```
API Route → Service → Repository(Prisma) + Integration(외부 API)
```

- `services/`, `integrations/`는 **Next.js에 의존하지 않는 순수 TypeScript**
- API Route는 얇은 계층: 인증 + 입력 검증만 담당
- 컴포넌트는 API를 직접 호출하지 않고 TanStack Query 훅 사용

## 핵심 파일 맵

### 인증
| 파일 | 역할 |
|------|------|
| `src/lib/auth.ts` | Auth.js 설정 (Credentials + Google OAuth) |
| `src/lib/encryption.ts` | AES-256-GCM 암호화/복호화 |
| `src/app/(auth)/login/page.tsx` | 초대 코드 로그인 페이지 |

### 서비스 (비즈니스 로직)
| 파일 | 역할 |
|------|------|
| `src/services/site.service.ts` | 사이트 CRUD + WP 연결 테스트 |
| `src/services/sync.service.ts` | 동기화 오케스트레이션 (syncFull) |
| `src/services/google-sync.service.ts` | GSC/GA4/AdSense 데이터 수집 |
| `src/services/post.service.ts` | 글 목록 (필터/정렬/페이지네이션) |
| `src/services/dashboard.service.ts` | 대시보드 메트릭 집계 |
| `src/services/revenue.service.ts` | 수익 분석 (사이트별/시계열) |
| `src/services/seo.service.ts` | 검색 성과 + 색인 현황 |
| `src/services/invite.service.ts` | 초대 코드 생성/검증/사용 |

### 외부 API 연동
| 파일 | 역할 |
|------|------|
| `src/integrations/wordpress/client.ts` | WP REST API (Basic Auth) |
| `src/integrations/google/auth.ts` | Google 토큰 관리 (뮤텍스) |
| `src/integrations/google/search-console.ts` | GSC 검색 분석 |
| `src/integrations/google/analytics.ts` | GA4 트래픽 리포트 |
| `src/integrations/google/adsense.ts` | AdSense 수익 리포트 |
| `src/integrations/google/url-matcher.ts` | URL 정규화 + PostCache 매칭 |

### API 라우트
| 엔드포인트 | 메서드 | 설명 |
|-----------|--------|------|
| `/api/sites` | GET, POST | 사이트 목록/생성 |
| `/api/sites/[id]` | GET, PUT, DELETE | 사이트 상세/수정/삭제 |
| `/api/sites/[id]/sync` | POST | 전체 동기화 트리거 |
| `/api/sites/test` | POST | WP 연결 테스트 |
| `/api/posts` | GET | 글 목록 (서버 페이지네이션) |
| `/api/dashboard` | GET | 종합 메트릭 |
| `/api/dashboard/chart` | GET | 차트 시계열 |
| `/api/revenue` | GET | 수익 데이터 |
| `/api/seo` | GET | SEO 데이터 |
| `/api/cron/sync` | POST | 크론 배치 동기화 |
| `/api/google/*/` | GET | Google 속성 목록 |

## 데이터 모델 (10개)

```
User ──┬── Account (OAuth 토큰)
       ├── Session
       ├── InviteCode
       └── WordPressSite ──┬── PostCache (글 캐시 + 메트릭)
                           ├── TrafficSnapshot (GA4 일별)
                           ├── SearchPerformance (GSC 일별)
                           ├── RevenueSnapshot (AdSense 일별)
                           └── SyncLog (동기화 이력)
```

## 코드 컨벤션

- **서비스 패턴**: `static` 클래스 + `static` 메서드 (InviteService 참고)
- **API 응답**: `{ success: true, data }` 또는 `{ error: "메시지" }`
- **인증 체크**: `const session = await auth(); if (!session?.user?.id) return 401`
- **UI 텍스트**: 한국어
- **Next.js 16**: `params`는 async (`const { id } = await params`)
- **shadcn/ui**: `asChild` 아님, `render` prop 방식
- **Prisma**: `omit: { apiKey: true }` — 민감 필드 제외
- **암호화**: WP 자격 증명은 JSON blob → AES-256-GCM → `apiKey` 컬럼
