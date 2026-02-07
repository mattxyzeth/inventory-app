import { NextRequest, NextResponse } from "next/server";
import { getAllItems, createItem } from "@/lib/db";

export async function GET() {
  try {
    const items = await getAllItems();
    return NextResponse.json(items);
  } catch (error) {
    console.error("Failed to fetch items:", error);
    return NextResponse.json(
      { error: "Failed to fetch items" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.name || !body.sku || typeof body.quantity !== "number") {
      return NextResponse.json(
        { error: "name, sku, and quantity are required" },
        { status: 400 }
      );
    }

    const item = await createItem({
      name: body.name.trim(),
      sku: body.sku.trim(),
      quantity: Math.max(1, Math.floor(body.quantity)),
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error("Failed to create item:", error);
    return NextResponse.json(
      { error: "Failed to create item" },
      { status: 500 }
    );
  }
}
