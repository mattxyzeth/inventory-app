"use client";

interface ExportButtonProps {
  itemCount: number;
}

export function ExportButton({ itemCount }: ExportButtonProps) {
  function handleExport() {
    window.open("/api/export", "_blank");
  }

  return (
    <button
      onClick={handleExport}
      disabled={itemCount === 0}
      className="w-full h-12 bg-green-600 text-white rounded-lg font-medium text-base hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      Export to Excel ({itemCount} {itemCount === 1 ? "item" : "items"})
    </button>
  );
}
