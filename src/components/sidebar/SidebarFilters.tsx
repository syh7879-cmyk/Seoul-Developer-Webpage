interface SidebarFiltersProps {
  selectionMode: boolean;
  onClearSelection: () => void;
  onToggleSelectionMode: () => void;
}

export default function SidebarFilters({ selectionMode, onClearSelection, onToggleSelectionMode }: SidebarFiltersProps) {
  return (
    <aside className="rounded-2xl bg-white p-4 shadow">
      <h2 className="mb-3 text-lg font-semibold">필터</h2>
      <input className="mb-3 w-full rounded border px-3 py-2" placeholder="정비구역 검색" />
      <label className="mb-2 block text-sm font-medium">자치구</label>
      <select className="mb-3 w-full rounded border px-3 py-2">
        <option>성북구</option>
      </select>
      <label className="mb-2 block text-sm font-medium">사업유형</label>
      <select className="mb-3 w-full rounded border px-3 py-2">
        <option>전체</option>
        <option>재개발</option>
        <option>재건축</option>
        <option>가로주택정비</option>
        <option>소규모재건축</option>
        <option>리모델링</option>
      </select>
      <label className="mb-2 block text-sm font-medium">진행단계</label>
      <select className="mb-3 w-full rounded border px-3 py-2">
        <option>전체</option>
        <option>정비계획</option>
        <option>정비구역지정</option>
        <option>조합설립인가</option>
        <option>사업시행인가</option>
        <option>관리처분인가</option>
        <option>착공</option>
        <option>준공</option>
      </select>
      <button className="w-full rounded bg-slate-800 px-3 py-2 text-white" onClick={onClearSelection}>
        선택 초기화
      </button>
      <div className="mt-4 rounded border border-slate-200 p-3">
        <label className="flex items-center gap-2 text-sm font-medium">
          <input type="checkbox" checked={selectionMode} onChange={onToggleSelectionMode} />
          필지 선택 모드
        </label>
        <p className="mt-2 text-xs text-slate-500">필지 선택 모드를 켜면 지도에서 필지를 클릭해 가상 합필 바구니에 담을 수 있습니다.</p>
      </div>
    </aside>
  );
}
