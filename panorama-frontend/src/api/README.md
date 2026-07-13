# API 레이어 & TanStack Query 가이드

프론트엔드의 **모든 백엔드 통신은 이 `src/api/` 폴더**를 통해 이루어집니다.
서버 상태(도서/리뷰/도서관 등)는 **TanStack Query** 로, 클라이언트 전역 상태(로그인 여부·토큰)는 **Zustand(`store/authStore`)** 로 관리합니다.

> 이 문서 하나만 보고 복붙해서 자기 도메인 API를 붙일 수 있게 만드는 것이 목표입니다.

---

## 1. 폴더 구조 & 담당 도메인

```
src/
├─ api/
│  ├─ client.ts      # 공통 axios 인스턴스 + 에러 헬퍼 (팀 공통 — 수정 시 공유 필수)
│  ├─ book.ts        # 도서 (완전 구현 · 다른 도메인의 참고 예시)   ← 도서 담당
│  ├─ community.ts   # 커뮤니티 (골격 + TODO)                      ← 커뮤니티 담당
│  ├─ auth.ts        # 인증/로그인 (골격 + TODO)                   ← auth 담당
│  ├─ user.ts        # 마이페이지/유저 (골격 + TODO)               ← user 담당
│  ├─ admin.ts       # 관리자 (골격 + TODO)                        ← admin 담당
│  └─ index.ts       # 배럴(re-export)
├─ types/            # 도메인별 타입 (백엔드 DTO 기준 수기 동기화)
│  ├─ common.ts      # ErrorResponse 등 공통 타입
│  ├─ book.ts / community.ts / auth.ts / user.ts / admin.ts
│  └─ index.ts       # 배럴
├─ lib/
│  └─ queryClient.ts # TanStack Query 전역 설정 (팀 공통)
└─ store/
   └─ authStore.ts   # 로그인 사용자 + accessToken (Zustand, 팀 공통)
```

**API 함수와 쿼리 훅은 같은 도메인 파일에 함께 둡니다.** (예: `api/book.ts` 안에 `searchBooks` 함수 + `useBookSearch` 훅)
→ 각자 자기 파일만 건드리면 되므로 Git 충돌이 없습니다.

---

## 2. 팀 규칙 (중요)

| 규칙 | 내용 |
|---|---|
| **자기 파일만 수정** | 각자 `api/{domain}.ts` + `types/{domain}.ts` 만 수정. 남의 도메인 파일 X |
| **공통 파일은 공유 후 수정** | `api/client.ts`, `lib/queryClient.ts`, `main.tsx`, `store/authStore.ts`, `types/common.ts` 는 팀 공유 필수 |
| **타입은 수기 동기화** | `types/*.ts` 는 **백엔드 DTO(Java record) 기준으로 직접 맞춤**. 자동 생성 아님 → 백엔드 바뀌면 타입도 직접 수정 (드리프트 방지) |
| **서버 상태 = TanStack Query / 클라 상태 = Zustand** | 서버에서 받아오는 데이터는 훅으로, 로그인·토큰 등은 authStore 로 |

---

## 3. queryKey 네이밍 규칙

`['<도메인>', '<구분>', ...식별자]` 배열 형태로 통일합니다.

```ts
['books', 'search', { keyword, sort, ... }]   // 검색 (params 객체 포함)
['books', 'detail', isbn]                       // 상세
['books', 'reviews', isbn, { page, size }]      // 리뷰 목록
['books', 'libraries', isbn, { region, page }]  // 소장 도서관
```

- **1번째 = 도메인**(`books`/`community`/`auth`/`user`/`admin`) → 도메인 단위 일괄 무효화에 사용
- **2번째 = 구분**(`search`/`detail`/`reviews` …)
- **3번째~ = 식별자/파라미터** → 값이 바뀌면 자동으로 다른 캐시로 취급되어 재요청됨

직접 문자열을 쓰지 말고 **각 도메인 파일의 `xxxKeys` 팩토리**를 쓰세요. (오타·불일치 방지)

```ts
// api/book.ts
export const bookKeys = {
  all: ['books'] as const,
  search: (params) => [...bookKeys.all, 'search', params] as const,
  detail: (isbn) => [...bookKeys.all, 'detail', isbn] as const,
  // ...
}
```

---

## 4. 사용 패턴

### 4-1. 조회 — `useQuery`

```tsx
import { useBook } from '@/api/book'
import { getErrorMessage } from '@/api/client'

function BookDetail({ isbn }: { isbn: string }) {
  const { data: book, isLoading, isError, error } = useBook(isbn)

  if (isLoading) return <Spinner />
  if (isError) return <p>{getErrorMessage(error, '도서를 불러오지 못했어요.')}</p>

  return <h1>{book!.title}</h1>
}
```

### 4-2. 무한 스크롤 — `useInfiniteQuery`

```tsx
import { useBookSearch } from '@/api/book'

function SearchResults({ keyword }: { keyword: string }) {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useBookSearch({ keyword })

  const items = data?.pages.flatMap((page) => page.items) ?? []

  return (
    <>
      {items.map((b) => (
        <BookCard key={b.isbn || b.link} book={b} />
      ))}
      {hasNextPage && (
        <button onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
          더 보기
        </button>
      )}
    </>
  )
}
```

> IntersectionObserver 로 자동 로드하려면 화면 하단 sentinel 이 보일 때 `fetchNextPage()` 를 호출하면 됩니다.

### 4-3. 변경 — `useMutation` + 자동 갱신(invalidate)

```tsx
import { useBookmarkMutation } from '@/api/book'
import { getErrorMessage, getErrorStatus } from '@/api/client'

function BookmarkButton({ book }: { book: BookItem }) {
  const { mutate, isPending } = useBookmarkMutation()

  const onClick = () => {
    mutate(
      { isbn: book.isbn, title: book.title, author: book.author /* ...find-or-create 용 정보 */ },
      {
        onError: (error) => {
          if (getErrorStatus(error) === 401) {
            // 비로그인 → 로그인 유도 (401 은 client 인터셉터가 이미 /login 리다이렉트 처리)
            return
          }
          alert(getErrorMessage(error, '북마크 처리에 실패했어요.'))
        },
      },
    )
  }

  return (
    <button onClick={onClick} disabled={isPending}>
      {book.isBookmarked ? '북마크 해제' : '북마크'}
    </button>
  )
}
```

> `useBookmarkMutation` 은 성공 시 내부에서 검색 결과·상세 쿼리를 **자동으로 invalidate** 합니다.
> 따라서 버튼을 누르면 목록/상세의 북마크 상태·카운트가 알아서 갱신됩니다.

---

## 5. 에러 처리

### 상태코드 규칙 (백엔드 공통)

| 코드 | 의미 |
|---|---|
| 200/201 | 성공 |
| 400 | 잘못된 요청(검증 실패) |
| 401 | 인증 필요 → **client 인터셉터가 자동 로그아웃 + `/login` 리다이렉트** |
| 403 | 권한 없음 |
| 404 | 리소스 없음 |
| 409 | 충돌(예: 1인 1리뷰 중복) |
| 500/502/503 | 서버·외부 API 오류 |

### 에러 응답 형식

```jsonc
{ "code": "INVALID_INPUT", "message": "검색어를 입력해주세요." }
```

### 3단계 에러 처리

1. **전역(axios 인터셉터, `client.ts`)** — 401 이면 자동 로그아웃 + 로그인 페이지 유도. 모든 요청에 공통 적용.
2. **전역(QueryClient, `lib/queryClient.ts`)** — 4xx 는 재시도 안 함, 그 외 1회 재시도. staleTime 60초.
3. **화면(컴포넌트)** — `isError`/`onError` 에서 아래 헬퍼로 사용자 메시지를 만듭니다.

```ts
import { getErrorMessage, getErrorCode, getErrorStatus } from '@/api/client'

getErrorMessage(error, '기본 메시지')  // 백엔드 message → 없으면 fallback
getErrorCode(error)                    // 'INVALID_INPUT' 같은 코드 (분기용)
getErrorStatus(error)                  // 400 / 401 / 409 ... (분기용)
```

예) 리뷰 작성에서 409(중복) 분기:

```ts
onError: (error) => {
  if (getErrorStatus(error) === 409) return alert('이미 이 책에 리뷰를 작성했어요.')
  alert(getErrorMessage(error))
}
```

---

## 6. 새 API + 훅 추가하는 방법 (도서 API 예시)

자기 도메인 파일(`api/{domain}.ts`, `types/{domain}.ts`)에 아래 4단계로 추가합니다.

**① 타입 정의** — `types/book.ts` (백엔드 DTO 기준)

```ts
export interface BookSearchParams {
  keyword: string
  searchType?: 'title' | 'author'
  sort?: 'sim' | 'date'
  start?: number
  display?: number
}
export interface BookSearchResponse {
  total: number
  start: number
  display: number
  items: BookItem[]
}
```

**② API 함수(얇게)** — `api/book.ts`

```ts
import { client } from './client'
import type { BookSearchParams, BookSearchResponse } from '@/types'

export async function searchBooks(params: BookSearchParams): Promise<BookSearchResponse> {
  const { data } = await client.get<BookSearchResponse>('/books/search', { params })
  return data // 비즈니스 로직 없이 호출 + 반환만
}
```

**③ queryKey 등록** — `api/book.ts` 의 `bookKeys` 팩토리에 추가

```ts
export const bookKeys = {
  all: ['books'] as const,
  search: (params: BookSearchParams) => [...bookKeys.all, 'search', params] as const,
}
```

**④ 쿼리/뮤테이션 훅** — `api/book.ts`

```ts
import { useInfiniteQuery } from '@tanstack/react-query'

export function useBookSearch(params: BookSearchParams) {
  return useInfiniteQuery({
    queryKey: bookKeys.search(params),
    queryFn: ({ pageParam }) => searchBooks({ ...params, start: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (last) =>
      last.start + last.display <= last.total ? last.start + last.display : undefined,
    enabled: params.keyword.trim().length > 0,
  })
}
```

변경(mutation)은 성공 시 관련 쿼리를 invalidate 합니다.

```ts
import { useMutation, useQueryClient } from '@tanstack/react-query'

export function useBookmarkMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: BookmarkRequest) => toggleBookmark(body),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [...bookKeys.all, 'search'] })
      queryClient.invalidateQueries({ queryKey: bookKeys.detail(variables.isbn) })
    },
  })
}
```

---

## 7. 네이밍 규칙 (전체 통일)

| 종류 | 규칙 | 예 |
|---|---|---|
| 조회 함수 | `getXxx` / `searchXxx` | `getBook`, `searchBooks`, `getReviews` |
| 변경 함수 | `createXxx` / `updateXxx` / `deleteXxx` / `toggleXxx` | `createReview`, `toggleBookmark` |
| 조회 훅 | `useXxx` | `useBook`, `useBookSearch`, `useBookReviews` |
| 변경 훅 | `useXxxMutation` 또는 `useCreateXxx` | `useBookmarkMutation`, `useCreateReview` |
| queryKey 팩토리 | `xxxKeys` | `bookKeys`, `communityKeys` |

---

## 8. 페이지에서 쓰는 전체 예시 (복붙용)

```tsx
import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useBook, useBookReviews, useCreateReview } from '@/api/book'
import { getErrorMessage, getErrorStatus } from '@/api/client'

export default function BookDetailPage() {
  const { isbn = '' } = useParams()
  const [page] = useState(1)

  const { data: book, isLoading } = useBook(isbn)
  const { data: reviewPage } = useBookReviews(isbn, page, 10)
  const createReview = useCreateReview(isbn)

  if (isLoading) return <p>불러오는 중…</p>
  if (!book) return <p>도서를 찾을 수 없어요.</p>

  const submit = () => {
    createReview.mutate(
      { rating: 4.5, content: '인생 책이에요' },
      {
        onError: (e) => {
          if (getErrorStatus(e) === 409) return alert('이미 리뷰를 작성했어요.')
          alert(getErrorMessage(e))
        },
      },
    )
  }

  return (
    <div>
      <h1>{book.title}</h1>
      <p>{book.description}</p>
      <p>평점 {book.avgRating} · 리뷰 {book.reviewCount}</p>

      <button onClick={submit} disabled={createReview.isPending}>
        리뷰 작성
      </button>

      <ul>
        {reviewPage?.reviews.map((r) => (
          <li key={r.reviewId}>
            {r.nickname} · {r.rating} — {r.content}
          </li>
        ))}
      </ul>
    </div>
  )
}
```

---

## 9. 참고

- 도서 도메인(`api/book.ts` + `types/book.ts`)이 **완전 구현된 레퍼런스**입니다. 새 도메인은 이 구조를 그대로 따라 하세요.
- 개발 중에는 화면 우하단 **React Query Devtools**(꽃 아이콘)로 캐시/쿼리 상태를 확인할 수 있습니다. (개발 환경에서만 노출)
- 백엔드 프록시: 개발 시 `/api/*` 요청은 `vite.config.ts` 프록시로 `http://localhost:8080` 에 전달됩니다.
