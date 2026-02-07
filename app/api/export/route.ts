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
      "Date Added": item.created_at.split(" ")[0], // just the date portion
    }));

    const ws = XLSX.utils.json_to_sheet(data);

    // Column widths (in characters)
    ws["!cols"] = [
      { wch: 30 }, // Name
      { wch: 20 }, // SKU
      { wch: 12 }, // Quantity
      { wch: 14 }, // Date Added
    ];

    // Bold header row
    const headerKeys = ["A1", "B1", "C1", "D1"];
    for (const key of headerKeys) {
      if (ws[key]) {
        ws[key].s = {
          font: { bold: true, sz: 12 },
          fill: { fgColor: { rgb: "E2E8F0" } },
          alignment: { horizontal: "center" },
          border: {
            bottom: { style: "thin", color: { rgb: "94A3B8" } },
          },
        };
      }
    }

    // Style data rows
    for (let r = 1; r <= items.length; r++) {
      const row = r + 1;
      // SKU column - left align
      const skuCell = ws[`B${row}`];
      if (skuCell) {
        skuCell.s = { alignment: { horizontal: "left" } };
      }
      // Quantity column - center align
      const qtyCell = ws[`C${row}`];
      if (qtyCell) {
        qtyCell.s = { alignment: { horizontal: "center" } };
        qtyCell.t = "n"; // ensure it's a number type
      }
      // Date column - center align
      const dateCell = ws[`D${row}`];
      if (dateCell) {
        dateCell.s = { alignment: { horizontal: "center" } };
      }
    }

    // Add a totals row
    const totalRow = items.length + 2;
    ws[`B${totalRow}`] = {
      v: "Total:",
      t: "s",
      s: { font: { bold: true }, alignment: { horizontal: "right" } },
    };
    ws[`C${totalRow}`] = {
      v: items.reduce((sum, item) => sum + item.quantity, 0),
      t: "n",
      s: { font: { bold: true }, alignment: { horizontal: "center" } },
    };

    // Update sheet range to include totals row
    ws["!ref"] = `A1:D${totalRow}`;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Inventory Order");

    const buf = XLSX.write(wb, {
      type: "buffer",
      bookType: "xlsx",
      bookSST: false,
    });

    const date = new Date().toISOString().split("T")[0];

    return new NextResponse(buf, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="inventory-order-${date}.xlsx"`,
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
