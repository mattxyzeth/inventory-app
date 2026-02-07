import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { getAllItems } from "@/lib/db";

export async function GET() {
  try {
    const items = await getAllItems();

    const data = items.map((item) => ({
      Name: item.name,
      SKU: item.sku,
      Quantity: item.quantity,
      "Date Added": item.created_at,
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Inventory");

    const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    return new NextResponse(buf, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="inventory-${new Date().toISOString().split("T")[0]}.xlsx"`,
      },
    });
  } catch (error) {
    console.error("Failed to export:", error);
    return NextResponse.json(
      { error: "Failed to export" },
      { status: 500 }
    );
  }
}
