import { useState } from "react";
import { Search, ChevronDown, ChevronLeft, ChevronRight, MapPin, Library } from "lucide-react";

import type { LibraryItem } from "../data";
import { ALL_LIBRARIES, SEOUL_DISTRICTS } from "../data";

export function LibraryFinder() {
  const [district, setDistrict] = useState("전체");
  const [searched, setSearched] = useState(false);
  const [results, setResults] = useState<LibraryItem[]>([]);
  const [page, setPage] = useState(1);
  const PER_PAGE = 10;

  const handleSearch = () => {
    const filtered = district === "전체" ? ALL_LIBRARIES : ALL_LIBRARIES.filter(l => l.district === district);
    setResults(filtered);
    setSearched(true);
    setPage(1);
  };

  const totalPages = Math.ceil(results.length / PER_PAGE);
  const paged = results.slice((page - 1) * PER_PAGE, page * PER_PAGE);

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
              {SEOUL_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#aaa] pointer-events-none" />
          </div>
          <button
            onClick={handleSearch}
            className="flex items-center gap-1.5 bg-[#1E4A38] hover:bg-[#2E7D6B] text-white px-5 py-2.5 rounded-xl text-[13px] font-semibold transition-colors"
          >
            <Search size={13} />
            찾기
          </button>
        </div>

        {!searched && (
          <p className="text-[13px] text-[#aaa] py-6 text-center">지역을 선택하고 찾기를 눌러주세요.</p>
        )}

        {searched && results.length === 0 && (
          <p className="text-[13px] text-[#aaa] py-6 text-center">해당 지역에 소장된 도서관이 없습니다.</p>
        )}

        {searched && results.length > 0 && (
          <>
            <p className="text-[12px] text-[#aaa] mb-3">
              총 <span className="text-[#2E7D6B] font-bold">{results.length}개</span> 도서관에 소장
            </p>
            <div className="flex flex-col divide-y divide-[#F5F5F5]">
              {paged.map((lib) => (
                <div key={lib.id} className="flex items-center gap-4 py-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <button
                    onClick={() => window.open(`https://map.naver.com/v5/search/${encodeURIComponent(lib.name)}`, "_blank")}
                    className="text-[13px] font-semibold text-[#1A1A1A] truncate hover:text-[#2E7D6B] hover:underline underline-offset-2 transition-colors cursor-pointer text-left"
                  >
                    {lib.name}
                  </button>
                      <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-md flex-shrink-0 ${lib.available ? "bg-[#EFF6F2] text-[#2E7D6B]" : "bg-[#FFF0F0] text-rose-400"}`}>
                        {lib.available ? "대출가능" : "대출중"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-[#aaa]">
                      <MapPin size={10} />
                      <span>{lib.district} {lib.address}</span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-[12px] text-[#555]">소장 <span className="font-bold text-[#1A1A1A]">{lib.total}</span>권</p>
                    <p className="text-[11px] text-[#aaa]">대출중 {lib.loan}권</p>
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-5 pt-4 border-t border-[#F5F5F5]">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#EAEAEA] disabled:opacity-30 hover:bg-[#F9F9F9] transition-colors"
                >
                  <ChevronLeft size={14} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                  <button
                    key={n}
                    onClick={() => setPage(n)}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg text-[13px] font-medium transition-colors ${
                      n === page ? "bg-[#1E4A38] text-white" : "border border-[#EAEAEA] text-[#555] hover:bg-[#F9F9F9]"
                    }`}
                  >
                    {n}
                  </button>
                ))}
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
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
