# 파노라마북스 Backend

도서 커뮤니티 서비스 **파노라마북스**의 백엔드 API 서버.

| 구분 | 내용 |
|---|---|
| **런타임** | Java 21 · Spring Boot 3.5 · Gradle |
| **보안** | Spring Security · JWT(jjwt) · OAuth2 Client (Google · Naver · Kakao) |
| **영속성** | JPA(Hibernate) · MyBatis · MySQL 8 · Flyway |
| **문서화** | springdoc-openapi (Swagger UI) |
| **연동 프런트엔드** | React (`http://localhost:5173`) |

> 전체 프로젝트 개요는 [루트 README](../README.md)를 참고하세요.

## 사전 요구사항

- JDK 21
- MySQL 8 — 로컬에 `panorama` 데이터베이스를 미리 생성해야 합니다.

```sql
CREATE DATABASE panorama DEFAULT CHARACTER SET utf8mb4;
```

## 환경 설정

### `src/main/resources/application-local.yml`

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/panorama?serverTimezone=Asia/Seoul
    username: <DB 계정>
    password: <DB 비밀번호>
  jpa:
    show-sql: true
  security:
    oauth2:
      client:
        registration:
          google:
            client-id: <Google client-id>
            client-secret: <Google client-secret>
            scope:
              - email
              - profile
          naver:
            client-id: <Naver client-id>
            client-secret: <Naver client-secret>
            client-name: Naver
            authorization-grant-type: authorization_code
            redirect-uri: "{baseUrl}/login/oauth2/code/{registrationId}"
            scope:
              - name
              - email
          kakao:
            client-id: <Kakao client-id>
            client-secret: <Kakao client-secret>
            client-authentication-method: client_secret_post
            client-name: Kakao
            authorization-grant-type: authorization_code
            redirect-uri: "{baseUrl}/login/oauth2/code/{registrationId}"
            scope:
              - profile_nickname

        provider:                     # registration과 같은 레벨
          naver:
            authorization-uri: https://nid.naver.com/oauth2.0/authorize
            token-uri: https://nid.naver.com/oauth2.0/token
            user-info-uri: https://openapi.naver.com/v1/nid/me
            user-name-attribute: response
          kakao:
            authorization-uri: https://kauth.kakao.com/oauth/authorize
            token-uri: https://kauth.kakao.com/oauth/token
            user-info-uri: https://kapi.kakao.com/v2/user/me
            user-name-attribute: id

  mail:
    host: sandbox.smtp.mailtrap.io
    port: 2525
    username: <Mailtrap username>
    password: <Mailtrap password>
    properties:
      mail:
        smtp:
          auth: true
          starttls:
            enable: true

# openssl rand -base64 32
jwt:
  secret-key: <토큰 검증을 위한 키값>
  access-token-expiration: 900000        # 15분
  refresh-token-expiration: 1209600000   # 14일

app:
  oauth2:
    redirect-uri: http://localhost:5173/oauth/callback   # React 콜백 (구글 리다이렉트와 다름!)

  mail:
    from: no-reply@panorama.local          # Sandbox는 도메인 인증 불필요라 자유
  frontend:
    verify-url: http://localhost:5173/verify-email
    reset-url: http://localhost:5173/reset-password

data4library:
  base-url: http://data4library.kr
  auth-key: ${DATA4LIBRARY_AUTH_KEY:}
naver:
  client-id: <네이버 도서 검색 client-id>
library-bigdata:
  auth-key: <도서관 빅데이터 인증키>

vision:
  api:
    key: ${VISION_API_KEY:}
```

### 환경변수

위 템플릿에서 `${...}` 로 참조하는 값과, `application.yml`이 요구하는 값입니다.
로컬에서는 `application-local.yml`에 직접 적어 넣어도 됩니다.

```
DATA4LIBRARY_AUTH_KEY     # 정보나루 API 인증키
VISION_API_KEY            # Google Vision (도서 표지 OCR)
NAVER_CLIENT_SECRET       # 네이버 도서 검색 API
LIBRARY_BIGDATA_AUTH_KEY  # 도서관 빅데이터 API 인증키
```

> 정보나루 인증키는 헤더 인증을 지원하지 않아 URL 쿼리에 실립니다.
> 통신 오류 시 예외 메시지에 URL이 그대로 담기므로, 로그 출력 시 마스킹 처리하고 있습니다.

### 외부 API 연동

| 대상 | 용도 | 클라이언트 | 인증 방식 |
|---|---|---|---|
| 네이버 도서 검색 | 도서 검색·상세 조회 | `domain/book/client/NaverBookClient` | `X-Naver-Client-Id` / `X-Naver-Client-Secret` 헤더 |
| 정보나루(data4library) | 도서관 목록 동기화 | `domain/library/client/Data4LibraryClient` | URL 쿼리파라미터(`authKey`) |
| Google Vision | 도서 표지 OCR | `domain/book` | API 키 |

## 실행 방법

```bash
./gradlew bootRun   # 개발 서버 → http://localhost:8080
./gradlew build     # 빌드
```

첫 실행 시 Flyway가 마이그레이션을 자동 적용합니다.

- API 문서(Swagger UI): http://localhost:8080/swagger-ui.html

## 패키지 구조

```
com.teambook.panorama
├── domain/                    # 도메인별 수직 분할
│   ├── admin/                 # 관리자 백오피스 (대시보드·사용자·신고·커뮤니티·공지·문의)
│   ├── auth/                  # 로그인·토큰·소셜 로그인·이메일 인증
│   ├── book/                  # 도서 검색(네이버 API)·상세·리뷰·북마크
│   ├── inquiry/               # 1:1 문의
│   ├── library/               # 도서관 데이터 동기화·조회
│   ├── notice/                # 공지사항
│   ├── post/                  # 커뮤니티 게시글·댓글
│   ├── report/                # 신고 접수
│   ├── stats/                 # 통계
│   └── user/                  # 회원 정보
│
└── global/                    # 도메인 공통
    ├── config/                # WebConfig · SwaggerApiConfig · SchedulingConfig
    ├── security/              # Spring Security · JWT 필터 · OAuth2
    ├── exception/             # BusinessException · ErrorCode · GlobalExceptionHandler
    ├── response/              # PageResponse · SliceResponse
    ├── storage/               # 파일 업로드
    ├── mail/                  # 이메일 발송
    ├── entity/                # BaseEntity (created_at · updated_at)
    ├── constant/
    └── util/
```

각 도메인은 아래 계층으로 구성됩니다. (도메인에 따라 일부만 존재)

```
domain/{name}/
├── controller/    # REST 엔드포인트
├── service/       # 비즈니스 로직
├── repository/    # JpaRepository · MyBatis Mapper 인터페이스
├── entity/        # JPA 엔티티
├── dto/           # 요청·응답 DTO (record)
├── client/        # 외부 API 클라이언트
├── config/        # 도메인 전용 설정
└── scheduler/     # 스케줄 작업
```

MyBatis 매퍼 XML은 `src/main/resources/mapper/{admin,book,library,stats}/`에 있습니다.

## API

모든 엔드포인트는 `/api/v1` 아래에 있습니다.

| 영역 | 주요 경로 |
|---|---|
| 인증 | `/auth` · `/auth/password` |
| 회원 | `/users` · `/members/me` |
| 도서 | `/books` · `/reviews` · `/bookmark` |
| 도서관 | `/libraries` |
| 커뮤니티 | `/posts` · `/posts/{postId}/like` · `/posts/{postId}/scrap` |
| 공지 · 문의 | `/notices` · `/inquiries` |
| 신고 | `/reports` |
| 통계 | `/stats` |
| 관리자 | `/admin/users` · `/admin/reports` · `/admin/communities` · `/admin/notices` · `/admin/inquiries` · `/admin/libraries` |

전체 명세는 실행 후 [Swagger UI](http://localhost:8080/swagger-ui.html)에서 확인하세요.

## 데이터베이스 마이그레이션

스키마 변경은 **반드시 Flyway 마이그레이션으로** 합니다.
`src/main/resources/db/migration/` 에 `V{다음 번호}__{설명}.sql` 형식으로 파일을 추가하세요.

> 이미 적용된 마이그레이션 파일은 수정하지 않습니다. 체크섬이 달라져 애플리케이션이 뜨지 않습니다.
