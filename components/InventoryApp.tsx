"use client";

import { useState, useEffect, useCallback } from "react";
import type { InventoryItem, NewItem, OcrResult } from "@/types";
import { CameraCapture } from "./CameraCapture";
import { OcrProcessor } from "./OcrProcessor";
import { ItemForm } from "./ItemForm";
import { InventoryList } from "./InventoryList";
import { ExportButton } from "./ExportButton";

export function InventoryApp() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [imageData, setImageData] = useState<string | null>(null);
  const [ocrResult, setOcrResult] = useState<OcrResult | null>(null);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  const fetchItems = useCallback(async () => {
    try {
      const res = await fetch("/api/items");
      if (res.ok) {
        const data = await res.json();
        setItems(data);
      }
    } catch (err) {
      console.error("Failed to fetch items:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  async function handleSubmit(data: NewItem) {
    if (editingItem) {
      const res = await fetch(`/api/items/${editingItem.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        setEditingItem(null);
        await fetchItems();
      }
    } else {
      const res = await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        setOcrResult(null);
        setImageData(null);
        await fetchItems();
      }
    }
  }

  async function handleDelete(id: number) {
    const res = await fetch(`/api/items/${id}`, { method: "DELETE" });
    if (res.ok) {
      await fetchItems();
    }
  }

  function handleEdit(item: InventoryItem) {
    setEditingItem(item);
    setOcrResult(null);
    setImageData(null);
  }

  function handleCancelEdit() {
    setEditingItem(null);
  }

  const handleOcrResult = useCallback((result: OcrResult) => {
    setOcrResult(result);
  }, []);

  function handleCapture(data: string) {
    setEditingItem(null);
    setImageData(data);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Camera Section */}
      <section>
        <CameraCapture onCapture={handleCapture} />
        <OcrProcessor imageData={imageData} onResult={handleOcrResult} />
        {ocrResult && (
          <p className="mt-2 text-xs text-gray-500">
            OCR detected: &quot;{ocrResult.name}&quot; / {ocrResult.sku || "no SKU found"}.
            Edit below if needed.
          </p>
        )}
      </section>

      {/* Form Section */}
      <section className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">
          {editingItem ? "Edit Item" : "Add Item"}
        </h2>
        <ItemForm
          ocrResult={ocrResult}
          editingItem={editingItem}
          onSubmit={handleSubmit}
          onCancelEdit={handleCancelEdit}
        />
      </section>

      {/* List Section */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900">
            Order List ({items.length})
          </h2>
        </div>
        <InventoryList
          items={items}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </section>

      {/* Export */}
      <section>
        <ExportButton itemCount={items.length} />
      </section>
    </div>
  );
}
