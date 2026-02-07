export interface InventoryItem {
  id: number;
  name: string;
  sku: string;
  quantity: number;
  created_at: string;
}

export type NewItem = Pick<InventoryItem, "name" | "sku" | "quantity">;

export interface OcrResult {
  name: string;
  sku: string;
  confidence: number;
}
