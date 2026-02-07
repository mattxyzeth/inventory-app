import { turso } from "./turso";
import type { InventoryItem, NewItem } from "@/types";

export async function initDb() {
  await turso.execute(`
    CREATE TABLE IF NOT EXISTS items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      sku TEXT NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);
}

let initialized = false;
export async function ensureDb() {
  if (!initialized) {
    await initDb();
    initialized = true;
  }
}

export async function getAllItems(): Promise<InventoryItem[]> {
  await ensureDb();
  const result = await turso.execute(
    "SELECT * FROM items ORDER BY created_at DESC"
  );
  return result.rows as unknown as InventoryItem[];
}

export async function createItem(item: NewItem): Promise<InventoryItem> {
  await ensureDb();
  const result = await turso.execute({
    sql: "INSERT INTO items (name, sku, quantity) VALUES (?, ?, ?) RETURNING *",
    args: [item.name, item.sku, item.quantity],
  });
  return result.rows[0] as unknown as InventoryItem;
}

export async function updateItem(
  id: number,
  item: Partial<NewItem>
): Promise<InventoryItem> {
  await ensureDb();
  const fields: string[] = [];
  const args: (string | number)[] = [];
  if (item.name !== undefined) {
    fields.push("name = ?");
    args.push(item.name);
  }
  if (item.sku !== undefined) {
    fields.push("sku = ?");
    args.push(item.sku);
  }
  if (item.quantity !== undefined) {
    fields.push("quantity = ?");
    args.push(item.quantity);
  }
  args.push(id);

  const result = await turso.execute({
    sql: `UPDATE items SET ${fields.join(", ")} WHERE id = ? RETURNING *`,
    args,
  });
  return result.rows[0] as unknown as InventoryItem;
}

export async function deleteItem(id: number): Promise<void> {
  await ensureDb();
  await turso.execute({ sql: "DELETE FROM items WHERE id = ?", args: [id] });
}
