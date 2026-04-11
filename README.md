# WP Companion

다수의 워드프레스 블로그를 하나의 대시보드에서 통합 관리하는 SaaS 서비스.

트래픽, 검색 성과, 수익, 게시글 정보를 한 곳에서 확인하고 분석합니다.

## 주요 기능

- **종합 대시보드** — 전체 사이트 메트릭, 트래픽/수익 트렌드 차트, TOP 글 목록
- **글 관리** — WP REST API로 글 동기화, 필터/정렬/페이지네이션, 액션 추천
- **수익 분석** — AdSense 일별 수익, 사이트별 비교, RPM 추적
- **SEO 모니터링** — Search Console 검색 성과, 클릭/노출 트렌드, 색인 현황
- **자동 동기화** — 6시간 주기 크론, Sync Now 수동 동기화

## 기술 스택

| 레이어 | 기술 | 버전 |
|--------|------|------|
| Frontend + Backend | Next.js (App Router) + TypeScript | 16.2 |
| UI | shadcn/ui + Tailwind CSS + Recharts | Tailwind 4 |
| Database | PostgreSQL + Prisma ORM | PG 16, Prisma 6 |
| Auth | Auth.js v5 (초대 코드 + Google OAuth) | beta.30 |
| Deploy | Docker Compose (앱 + DB + 크론) | — |

## 빠른 시작

### 로컬 개발

```bash
# 1. 의존성 설치
npm install

# 2. PostgreSQL 실행
docker compose up db -d

# 3. DB 스키마 적용 + 시드
npx prisma db push
npx prisma db seed

# 4. 환경변수 설정
cp .env.example .env
# .env 파일을 편집하여 실제 값 입력

# 5. 개발 서버 실행
npm run dev
```

`http://localhost:3000`에서 접속. 초대 코드: `WELCOME1`

### Docker 배포

```bash
# 1. 환경변수 설정
cp .env.example .env.production
# .env.production 편집

# 2. 전체 서비스 빌드 + 실행
docker compose up -d --build

# 3. DB 스키마 적용 (로컬에서 서버 DB 접근)
DATABASE_URL="postgresql://wpcomp:PASSWORD@SERVER_IP:5433/wpcomp" npx prisma@6 db push

# 4. 시드 데이터
./scripts/seed-production.sh
```

## 프로젝트 구조

```
src/
├── app/                    # Next.js App Router 페이지
│   ├── (auth)/             # 로그인 (사이드바 없음)
│   ├── (dashboard)/        # 대시보드 (사이드바 레이아웃)
│   │   ├── dashboard/      # 종합 대시보드
│   │   ├── posts/          # 글 목록
│   │   ├── revenue/        # 수익 분석
│   │   ├── seo/            # SEO 모니터링
│   │   └── sites/          # 사이트 관리
│   └── api/                # API 라우트
├── components/             # UI 컴포넌트
├── services/               # 비즈니스 로직 (Next.js 무의존)
├── integrations/           # 외부 API 클라이언트
│   ├── wordpress/          # WP REST API
│   └── google/             # GSC, GA4, AdSense
├── lib/                    # auth, prisma, encryption, utils
├── hooks/                  # React Query 커스텀 훅
└── providers/              # Session, Theme, Query
```

## 환경변수

| 변수 | 설명 |
|------|------|
| `DATABASE_URL` | PostgreSQL 연결 문자열 |
| `AUTH_SECRET` | Auth.js 세션 암호화 키 |
| `AUTH_GOOGLE_ID` | Google OAuth 클라이언트 ID (선택) |
| `AUTH_GOOGLE_SECRET` | Google OAuth 시크릿 (선택) |
| `ENCRYPTION_KEY` | AES-256-GCM 암호화 키 (64자 hex) |
| `CRON_SECRET` | 크론 동기화 API 인증 토큰 |
| `AUTH_TRUST_HOST` | 프록시/내부 네트워크에서 `true` 설정 |

## 라이선스

Private
