"use client";

import { useState, useEffect } from "react";
import type { InventoryItem, NewItem, OcrResult } from "@/types";

interface ItemFormProps {
  ocrResult: OcrResult | null;
  editingItem: InventoryItem | null;
  onSubmit: (data: NewItem) => Promise<void>;
  onCancelEdit: () => void;
}

export function ItemForm({
  ocrResult,
  editingItem,
  onSubmit,
  onCancelEdit,
}: ItemFormProps) {
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (ocrResult) {
      setName(ocrResult.name);
      setSku(ocrResult.sku);
    }
  }, [ocrResult]);

  useEffect(() => {
    if (editingItem) {
      setName(editingItem.name);
      setSku(editingItem.sku);
      setQuantity(editingItem.quantity);
    }
  }, [editingItem]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !sku.trim() || quantity < 1) return;

    setSubmitting(true);
    try {
      await onSubmit({ name: name.trim(), sku: sku.trim(), quantity });
      if (!editingItem) {
        setName("");
        setSku("");
        setQuantity(1);
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Product Name
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Widget Pro 3000"
          required
          className="w-full h-12 px-3 rounded-lg border border-gray-300 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      <div>
        <label
          htmlFor="sku"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          SKU
        </label>
        <input
          id="sku"
          type="text"
          value={sku}
          onChange={(e) => setSku(e.target.value)}
          placeholder="e.g. WP-3000"
          required
          className="w-full h-12 px-3 rounded-lg border border-gray-300 text-base font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      <div>
        <label
          htmlFor="quantity"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Quantity to Order
        </label>
        <input
          id="quantity"
          type="number"
          min={1}
          value={quantity}
          onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
          required
          className="w-full h-12 px-3 rounded-lg border border-gray-300 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={submitting || !name.trim() || !sku.trim()}
          className="flex-1 h-12 bg-blue-600 text-white rounded-lg font-medium text-base hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {submitting
            ? "Saving..."
            : editingItem
              ? "Update Item"
              : "Add Item"}
        </button>
        {editingItem && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="h-12 px-6 bg-gray-200 text-gray-700 rounded-lg font-medium text-base hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
