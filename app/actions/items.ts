"use server";

import { revalidatePath } from "next/cache";
import * as db from "@/lib/db";

export async function listItems() {
  return db.getAll();
}

export async function getItem(id: number) {
  return db.getById(id);
}

export async function createItem(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;
  await db.create({ title });
  revalidatePath("/actions-demo");
}

export async function replaceItem(formData: FormData) {
  const id = Number(formData.get("id"));
  const title = String(formData.get("title") ?? "").trim();
  const done = formData.get("done") === "on" || formData.get("done") === "true";
  if (!id || !title) return;
  await db.replace(id, { title, done });
  revalidatePath("/actions-demo");
}

export async function patchItem(formData: FormData) {
  const id = Number(formData.get("id"));
  if (!id) return;
  const titleRaw = formData.get("title");
  const doneRaw = formData.get("done");
  const input: { title?: string; done?: boolean } = {};
  if (titleRaw !== null && String(titleRaw).trim()) {
    input.title = String(titleRaw).trim();
  }
  if (doneRaw !== null) {
    input.done = doneRaw === "on" || doneRaw === "true" || doneRaw === "1";
  }
  await db.patch(id, input);
  revalidatePath("/actions-demo");
}

export async function deleteItem(formData: FormData) {
  const id = Number(formData.get("id"));
  if (!id) return;
  await db.remove(id);
  revalidatePath("/actions-demo");
}
