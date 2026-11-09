import { NextResponse } from "next/server";
import { createItem } from "../../../lib/api";

export async function POST(request: Request) {
  const payload: unknown = await request.json().catch(() => null);
  const itemName =
    typeof payload === "object" && payload !== null && "name" in payload && typeof payload.name === "string"
      ? payload.name.trim()
      : "";
  if (itemName === "") {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }
  const result = await createItem(itemName);
  return NextResponse.json(result.payload ?? {}, { status: result.status });
}
