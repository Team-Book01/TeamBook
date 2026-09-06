# 파노라마북스 (Panorama)

도서를 검색하고, 리뷰를 남기고, 근처 도서관에서 찾아보고, 독자끼리 이야기 나누는 **도서 커뮤니티 서비스**입니다.
사용자 서비스와 운영자용 관리자 백오피스를 한 저장소에서 함께 개발했습니다.

> 4인 팀 프로젝트 · 기능별 브랜치로 병렬 개발 후 `develop` 통합

---

## 주요 기능

| 영역 | 내용 |
|---|---|
| **회원 · 인증** | 로컬 로그인(JWT) · 소셜 로그인(구글 · 네이버 · 카카오) · 이메일 인증 · 비밀번호 재설정 |
| **도서** | 네이버 도서 검색 API 기반 검색 · 상세(ISBN) · 리뷰 CRUD · 북마크 · 인기 도서 · 정보나루 소장도서관 및 대출 데이터 |
| **도서관 지도** | 정보나루(공공데이터) 연동 도서관 데이터 · 카카오맵 기반 위치 조회 |
| **커뮤니티** | 게시글 · 댓글 · 이미지 첨부(ISBN OCR기능) · 도서 첨부 |
| **공지 · 문의** | 공지 목록/상세 · 1:1 문의 및 답변 |
| **관리자 백오피스** | 대시보드 · 사용자 · 신고 · 커뮤니티 · 공지 · 문의 관리 |

---

## 저장소 구조

```
.
├── panorama-backend/     # Spring Boot 3.5 · Java 21 · Gradle
│   ├── src/main/java/com/teambook/panorama/
│   │   ├── domain/       # admin · auth · book · inquiry · library
│   │   │                 # notice · post · report · stats · user
│   │   └── global/       # config · security · exception · response · storage · mail · util
│   └── src/main/resources/
│       ├── db/migration/ # Flyway 마이그레이션 (V1~V10)
│       └── mapper/       # MyBatis 매퍼 XML
│
├── panorama-frontend/    # React 19 · TypeScript · Vite 8
│   └── src/              # pages · components · api · store · hooks · types
│
└── .github/workflows/    # CI (양쪽 빌드 검증)
```

각 프로젝트의 상세 문서는 아래를 참고하세요.

- [`panorama-frontend/README.md`](panorama-frontend/README.md) — 프런트엔드 폴더 구조 · 스크립트 · 컨벤션
- [`panorama-backend/README.md`](panorama-backend/README.md) — 백엔드 패키지 구조 · API · 마이그레이션

---

## 기술 스택

| 구분 | 기술 |
|---|---|
| **언어 · 런타임** | Java 21 · TypeScript · Node.js 22 |
| **Backend** | Spring Boot 3.5 · Spring Security + JWT(jjwt) · OAuth2 Client · springdoc-openapi(Swagger) |
| **Frontend** | React 19 · Vite 8 · React Router v7 · TanStack Query · Zustand · Axios |
| **UI · 스타일** | Tailwind CSS v4 · Toast UI Editor · Recharts |
| **Database** | MySQL 8 · JPA(Hibernate) · MyBatis · Flyway |
| **External** | 네이버 도서 검색 · 정보나루(data4library) · 카카오맵 · OAuth 2.0(Google · Naver · Kakao) · SMTP(Mailtrap) · Google Vision |

---

## 시작하기

### 사전 준비

- JDK 21
- Node.js 22+
- MySQL 8 (로컬에 `panorama` 데이터베이스 생성)

```sql
CREATE DATABASE panorama DEFAULT CHARACTER SET utf8mb4;
```

### 1. 백엔드

```bash
cd panorama-backend
./gradlew bootRun
```

→ http://localhost:8080 · API 문서: http://localhost:8080/swagger-ui.html

첫 실행 시 Flyway가 `db/migration`의 마이그레이션(V1~V10)을 자동 적용합니다.

### 2. 프런트엔드

```bash
cd panorama-frontend
npm install
npm run dev
```

→ http://localhost:5173

---

## 환경 설정

민감 정보가 담긴 설정 파일은 **git에 포함되지 않습니다**. 클론 후 직접 생성해야 합니다.

### 백엔드 — `panorama-backend/src/main/resources/application-local.yml`

`.gitignore` 처리된 파일이라 저장소에 없습니다.
전체 작성 예시는 [백엔드 README](panorama-backend/README.md#환경-설정)에 있습니다.

| 설정 | 내용 |
|---|---|
| `spring.datasource` | MySQL 접속 URL · username · password |
| `spring.security.oauth2.client` | Google · Naver · Kakao client-id / client-secret |
| `spring.mail` | SMTP 호스트 · 계정 (개발은 Mailtrap Sandbox 사용) |
| `jwt.secret-key` | JWT 서명 키 (`openssl rand -base64 32`) |
| `app.oauth2.redirect-uri` | 소셜 로그인 후 프런트 콜백 (`http://localhost:5173/oauth/callback`) |
| `app.frontend` | 이메일 인증 · 비밀번호 재설정 링크의 프런트 주소 |
| `data4library` | 정보나루 base URL(`http://data4library.kr`) · 인증키 |
| `naver.client-id` · `library-bigdata.auth-key` | 네이버 도서 검색 · 도서관 빅데이터 API 키 |

추가로 아래 환경변수가 필요합니다.

```
DATA4LIBRARY_AUTH_KEY     # 정보나루 API 인증키
VISION_API_KEY            # Google Vision (도서 표지 OCR)
NAVER_CLIENT_SECRET       # 네이버 도서 검색 API
LIBRARY_BIGDATA_AUTH_KEY  # 도서관 빅데이터 API 인증키
```

### 프런트엔드 — `panorama-frontend/.env`

[`.env.example`](panorama-frontend/.env.example)을 복사해 사용하세요.

```bash
cd panorama-frontend
cp .env.example .env
```

| 변수 | 설명 |
|---|---|
| `VITE_API_BASE_URL` | 백엔드 API base URL — `.env.example` 값은 `http://localhost:8080/api/v1` (미설정 시 코드 기본값 `/api/v1`) |
| `VITE_OAUTH_BASE_URL` | 소셜 로그인 시작용 백엔드 origin (미설정 시 코드 기본값 `http://localhost:8080`) |
| `VITE_KAKAO_MAP_JS_KEY` | 카카오맵 JavaScript 키 (도서관 지도) — 미설정 시 지도 로딩 실패 |

> `VITE_` 접두어가 붙은 값은 빌드 결과물에 그대로 노출됩니다. 시크릿은 절대 넣지 마세요.

---

## 프로젝트 규약

### 영속성 — JPA와 MyBatis 병행

| 기술 | 사용처 |
|---|---|
| **JPA / Hibernate** | 기본 CRUD — 쓰기와 단순 조회 (`post` · `auth` · `user` · `book` 등) |
| **MyBatis** | 조인·집계가 많은 조회 (관리자 목록 · 대시보드 · 통계 · 도서관), 관리자 조치 쓰기 |

- `ddl-auto=validate` — 엔티티가 스키마를 임의로 바꾸지 못하게 잠금

### 스키마 변경은 반드시 Flyway로

스키마 변경 시 `src/main/resources/db/migration/`에 `V{다음번호}__{설명}.sql`을 추가하세요.

### API 응답 규약

- 성공: HTTP 상태 코드 + 본문 (목록은 `PageResponse`)
- 실패: `ErrorResponse` 봉투

### 기타

- `open-in-view=false` — 지연 로딩 경계를 서비스 계층 안으로 제한
- 파일 업로드: 단일 5MB / 요청 전체 10MB, 저장 위치 `./uploads`

---

## CI

[`.github/workflows/ci.yml`](.github/workflows/ci.yml) — `main`·`develop` 대상 push/PR 시 백엔드·프런트엔드 빌드를 각각 검증합니다.

| Job | 동작 |
|---|---|
| `backend` | JDK 21 · Gradle 빌드 |
| `frontend` | Node 22 · `npm ci` · `npm run build` |

배포(CD) 파이프라인은 구성하지 않았습니다.

---

## 브랜치 전략

기능별 브랜치에서 개발 후 `develop`으로 PR을 올려 리뷰·머지합니다.

```
main
└── develop
    ├── feature/user
    ├── feature/bookSrch
    ├── feature/social
    ├── feature/community
    └── feature/admin
```

커밋 메시지는 아래 접두어를 사용합니다.

| 접두어 | 용도 |
|---|---|
| `feat` | 새 기능 추가 |
| `fix` | 버그 수정 |
| `refactor` | 동작 변경 없는 코드 구조 개선 |
| `chore` | 빌드 · 설정 · 의존성 등 부수 작업 |
| `style` | 포맷 · 들여쓰기 등 코드 의미와 무관한 변경 |
