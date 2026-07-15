import { NextRequest, NextResponse } from "next/server";
import * as db from "@/lib/db";

/** GET /api/items — 列表 */
export async function GET() {
  const items = await db.getAll();
  return NextResponse.json(items);
}

/** POST /api/items — 新增 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const title = String(body?.title ?? "").trim();
  if (!title) {
    return NextResponse.json({ error: "標題不可為空" }, { status: 400 });
  }
  const item = await db.create({ title });
  return NextResponse.json(item, { status: 201 });
}
