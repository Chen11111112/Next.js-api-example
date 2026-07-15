import { NextRequest, NextResponse } from "next/server";
import * as db from "@/lib/db";

type Ctx = { params: Promise<{ id: string }> };

/** GET /api/items/:id — 單筆 */
export async function GET(_req: NextRequest, { params }: Ctx) {
  const id = Number((await params).id);
  if (!id) return NextResponse.json({ error: "id 無效" }, { status: 400 });
  const item = await db.getById(id);
  if (!item) return NextResponse.json({ error: "找不到項目" }, { status: 404 });
  return NextResponse.json(item);
}

/** PUT /api/items/:id — 整筆覆寫 */
export async function PUT(req: NextRequest, { params }: Ctx) {
  const id = Number((await params).id);
  if (!id) return NextResponse.json({ error: "id 無效" }, { status: 400 });
  const body = await req.json().catch(() => null);
  const title = String(body?.title ?? "").trim();
  if (!title) {
    return NextResponse.json({ error: "標題不可為空" }, { status: 400 });
  }
  if (typeof body?.done !== "boolean") {
    return NextResponse.json({ error: "done 必須為 boolean" }, { status: 400 });
  }
  const item = await db.replace(id, { title, done: body.done });
  if (!item) return NextResponse.json({ error: "找不到項目" }, { status: 404 });
  return NextResponse.json(item);
}

/** PATCH /api/items/:id — 部分更新 */
export async function PATCH(req: NextRequest, { params }: Ctx) {
  const id = Number((await params).id);
  if (!id) return NextResponse.json({ error: "id 無效" }, { status: 400 });
  const body = await req.json().catch(() => null);
  const input: { title?: string; done?: boolean } = {};
  if (body?.title !== undefined) {
    const title = String(body.title).trim();
    if (!title) {
      return NextResponse.json({ error: "標題不可為空" }, { status: 400 });
    }
    input.title = title;
  }
  if (body?.done !== undefined) {
    if (typeof body.done !== "boolean") {
      return NextResponse.json({ error: "done 必須為 boolean" }, { status: 400 });
    }
    input.done = body.done;
  }
  const item = await db.patch(id, input);
  if (!item) return NextResponse.json({ error: "找不到項目" }, { status: 404 });
  return NextResponse.json(item);
}

/** DELETE /api/items/:id — 刪除 */
export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const id = Number((await params).id);
  if (!id) return NextResponse.json({ error: "id 無效" }, { status: 400 });
  const ok = await db.remove(id);
  if (!ok) return NextResponse.json({ error: "找不到項目" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
