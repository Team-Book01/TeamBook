import { useState } from "react";
import {
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Library,
  Phone,
  ExternalLink,
  Clock,
} from "lucide-react";

import type { Library as LibraryType } from "@/types/book";
import { SEOUL_DISTRICTS, useBookLibraries } from "@/api/book";
import { getErrorMessage } from "@/api/client";

const PER_PAGE = 10;

/** 네이버 지도 검색 링크 (주소는 URL 인코딩) */
function naverMapUrl(address: string): string {
  return `https://map.naver.com/v5/search/${encodeURIComponent(address)}`;
}

/** 값이 있는 문자열인지 (백엔드가 null/빈 문자열을 줄 수 있다) */
function filled(value?: string | null): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

/** 소장 여부 배지 문구/색 (null = API 조회 실패 → 확인 불가) */
function holdingBadge(hasBook: boolean | null) {
  if (hasBook === null || hasBook === undefined)
    return { label: "확인 불가", className: "bg-[#F5F5F5] text-[#999]" };
  return hasBook
    ? { label: "소장 중", className: "bg-[#EFF6F2] text-[#2E7D6B]" }
    : { label: "미소장", className: "bg-[#F5F5F5] text-[#999]" };
}

/** 대출 상태 배지 문구/색 (null = 확인 불가) */
function loanBadge(loanAvailable: boolean | null) {
  if (loanAvailable === null || loanAvailable === undefined)
    return { label: "확인 불가", className: "bg-[#F5F5F5] text-[#999]" };
  return loanAvailable
    ? { label: "대출 가능", className: "bg-[#EFF6F2] text-[#2E7D6B]" }
    : { label: "대출 중", className: "bg-[#FFF0F0] text-rose-400" };
}

function LibraryRow({ lib }: { lib: LibraryType }) {
  const holding = holdingBadge(lib.hasBook);
  const loan = loanBadge(lib.loanAvailable);
  const homepage = filled(lib.homepage) ? lib.homepage.trim() : null;
  const address = filled(lib.address) ? lib.address.trim() : null;

  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <div className="min-w-0 flex-1">
        {/* 도서관 이름 → 홈페이지 새 탭 (homepage 없으면 링크 비활성화) */}
        {homepage ? (
          <a
            href={homepage}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[13px] font-semibold text-[#1A1A1A] hover:text-[#2E7D6B] hover:underline underline-offset-2 transition-colors"
          >
            {lib.libName}
            <ExternalLink size={11} className="flex-shrink-0 text-[#bbb]" />
          </a>
        ) : (
          <span
            className="text-[13px] font-semibold text-[#1A1A1A]"
            title="홈페이지 정보가 없습니다"
          >
            {lib.libName}
          </span>
        )}

        {/* 주소 → 네이버 지도 검색 새 탭, 옆에 전화번호(있을 때만) */}
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-[#aaa]">
          {address && (
            <a
              href={naverMapUrl(address)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 hover:text-[#2E7D6B] hover:underline underline-offset-2 transition-colors"
              title="네이버 지도에서 보기"
            >
              <MapPin size={10} className="flex-shrink-0" />
              {address}
            </a>
          )}
          {filled(lib.tel) && (
            <a
              href={`tel:${lib.tel.replace(/\s/g, "")}`}
              className="inline-flex items-center gap-1 hover:text-[#2E7D6B] transition-colors"
            >
              <Phone size={10} className="flex-shrink-0" />
              {lib.tel}
            </a>
          )}
          {filled(lib.operatingTime) && (
            <span className="inline-flex items-center gap-1">
              <Clock size={10} className="flex-shrink-0" />
              {lib.operatingTime}
            </span>
          )}
        </div>
      </div>

      {/* 소장/대출 상태 — 권수가 아니라 상태만 표시 */}
      <div className="flex flex-shrink-0 items-center gap-1.5">
        <span className={`rounded-md px-1.5 py-0.5 text-[11px] font-bold ${holding.className}`}>
          {holding.label}
        </span>
        <span className={`rounded-md px-1.5 py-0.5 text-[11px] font-bold ${loan.className}`}>
          {loan.label}
        </span>
      </div>
    </div>
  );
}

/**
 * 소장 도서관 찾기.
 * 지역(구)을 고르고 "찾기" 를 눌렀을 때만 GET /api/v1/library/{isbn}?regionCode= 를 호출한다.
 * (도서관정보나루 API 를 2단계로 타는 무거운 조회라 자동 조회하지 않는다)
 */
export function LibraryFinder({ isbn }: { isbn: string }) {
  const [district, setDistrict] = useState<string>(SEOUL_DISTRICTS[0].code);
  // "찾기" 를 눌러 확정된 지역 코드. null 이면 아직 조회 전.
  const [submitted, setSubmitted] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const { data, isFetching, isError, error } = useBookLibraries(
    isbn,
    { regionCode: submitted ?? "" },
    { enabled: submitted !== null },
  );

  const handleSearch = () => {
    // GET /api/v1/library/** 는 permitAll — 비로그인도 조회 가능하다.
    setSubmitted(district);
    setPage(1);
  };

  const libs = data?.libs ?? [];
  const total = data?.total ?? libs.length;
  const totalPages = Math.max(1, Math.ceil(libs.length / PER_PAGE));
  const paged = libs.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <section className="bg-white border border-[#EAEAEA] rounded-2xl overflow-hidden">
      <div className="flex items-center gap-2 px-6 py-4 border-b border-[#EAEAEA]">
        <Library size={16} className="text-[#2E7D6B]" />
        <h2 className="text-[15px] font-bold text-[#1A1A1A]">소장 도서관 찾기</h2>
      </div>
      <div className="p-6">
        <div className="flex gap-3 mb-4">
          <div className="relative flex-1 max-w-[280px]">
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="w-full appearance-none border border-[#EAEAEA] rounded-xl px-4 py-2.5 text-[13px] text-[#1A1A1A] bg-white focus:outline-none focus:border-[#2E7D6B] cursor-pointer"
            >
              {SEOUL_DISTRICTS.map((d) => (
                <option key={d.code} value={d.code}>
                  {d.name}
                </option>
              ))}
            </select>
            <ChevronDown
              size={14}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#aaa] pointer-events-none"
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={isFetching}
            className="flex items-center gap-1.5 bg-[#1E4A38] hover:bg-[#2E7D6B] disabled:opacity-60 text-white px-5 py-2.5 rounded-xl text-[13px] font-semibold transition-colors"
          >
            <Search size={13} />
            찾기
          </button>
        </div>

        {submitted === null && (
          <p className="text-[13px] text-[#aaa] py-6 text-center">
            지역을 선택하고 찾기를 눌러주세요.
          </p>
        )}

        {submitted !== null && isFetching && (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-[#2E7D6B] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {submitted !== null && !isFetching && isError && (
          <p className="text-center text-[13px] text-rose-500 py-6">
            {getErrorMessage(error, "도서관 정보를 불러오지 못했습니다.")}
          </p>
        )}

        {submitted !== null && !isFetching && !isError && libs.length === 0 && (
          <p className="text-[13px] text-[#aaa] py-6 text-center">
            해당 지역에 소장된 도서관이 없습니다.
          </p>
        )}

        {submitted !== null && !isFetching && !isError && libs.length > 0 && (
          <>
            <p className="text-[12px] text-[#aaa] mb-3">
              총 <span className="text-[#2E7D6B] font-bold">{total.toLocaleString()}개</span> 도서관에
              소장
            </p>
            <div className="flex flex-col divide-y divide-[#F5F5F5]">
              {paged.map((lib) => (
                <LibraryRow key={lib.libCode} lib={lib} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-5 pt-4 border-t border-[#F5F5F5]">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#EAEAEA] disabled:opacity-30 hover:bg-[#F9F9F9] transition-colors"
                >
                  <ChevronLeft size={14} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                  <button
                    key={n}
                    onClick={() => setPage(n)}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg text-[13px] font-medium transition-colors ${
                      n === page
                        ? "bg-[#1E4A38] text-white"
                        : "border border-[#EAEAEA] text-[#555] hover:bg-[#F9F9F9]"
                    }`}
                  >
                    {n}
                  </button>
                ))}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#EAEAEA] disabled:opacity-30 hover:bg-[#F9F9F9] transition-colors"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
