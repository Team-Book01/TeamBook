import { useState } from "react";

import { LIBRARIES } from "./data";
import { LocationModal, Sidebar, MapPanel } from "./components";

// ─── LibraryMapPage ───────────────────────────────────────────────────────────

export default function LibraryMapPage() {
  const [showModal, setShowModal] = useState(true);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [activeFilter, setActiveFilter] = useState("전체");
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const filteredLibraries = LIBRARIES.filter((lib) => {
    if (
      searchQuery &&
      !lib.name.includes(searchQuery) &&
      !lib.address.includes(searchQuery)
    ) {
      return false;
    }
    if (activeFilter === "영업중" && !lib.isOpen) return false;
    if (activeFilter === "국립" && lib.type !== "국립") return false;
    if (activeFilter === "공공" && lib.type !== "공공") return false;
    return true;
  }).sort((a, b) => {
    if (activeFilter === "거리순") {
      return parseFloat(a.distance) - parseFloat(b.distance);
    }
    return 0;
  });

  const handleSelectLibrary = (id: number) => {
    setSelectedId((prev) => (prev === id ? null : id));
  };

  return (
    <div
      className="h-[calc(100vh-68px)] flex flex-col overflow-hidden"
      style={{ fontFamily: "'Noto Sans KR', sans-serif" }}
    >
      {showModal && (
        <LocationModal
          onAllow={() => setShowModal(false)}
          onLater={() => setShowModal(false)}
        />
      )}

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          libraries={filteredLibraries}
          totalCount={filteredLibraries.length}
          selectedId={selectedId}
          hoveredId={hoveredId}
          activeFilter={activeFilter}
          searchQuery={searchQuery}
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(false)}
          onSelectLibrary={handleSelectLibrary}
          onHoverLibrary={setHoveredId}
          onFilterChange={setActiveFilter}
          onSearchChange={setSearchQuery}
        />

        <MapPanel
          libraries={LIBRARIES}
          selectedId={selectedId}
          hoveredId={hoveredId}
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen(true)}
          onSelectLibrary={handleSelectLibrary}
          onHoverLibrary={setHoveredId}
        />
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes ping {
          75%, 100% { transform: scale(2); opacity: 0; }
        }
        .animate-ping { animation: ping 1.5s cubic-bezier(0,0,0.2,1) infinite; }
      `}</style>
    </div>
  );
}
