"use client";

import type { InventoryItem } from "@/types";

interface InventoryListProps {
  items: InventoryItem[];
  onEdit: (item: InventoryItem) => void;
  onDelete: (id: number) => void;
}

export function InventoryList({ items, onEdit, onDelete }: InventoryListProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p className="text-lg">No items yet</p>
        <p className="text-sm mt-1">
          Take a photo of a label or add items manually
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div
          key={item.id}
          className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 shadow-sm"
        >
          <div className="flex-1 min-w-0 mr-3">
            <p className="font-medium text-gray-900 truncate">{item.name}</p>
            <p className="text-sm text-gray-500 font-mono">{item.sku}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="inline-flex items-center justify-center min-w-[2.5rem] h-8 px-2 bg-blue-100 text-blue-800 text-sm font-semibold rounded-full">
              {item.quantity}
            </span>
            <button
              onClick={() => onEdit(item)}
              className="h-8 px-3 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
              title="Edit"
            >
              Edit
            </button>
            <button
              onClick={() => {
                if (confirm(`Delete "${item.name}"?`)) {
                  onDelete(item.id);
                }
              }}
              className="h-8 px-3 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
              title="Delete"
            >
              Del
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
