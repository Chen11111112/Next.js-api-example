import { promises as fs } from "fs";
import path from "path";
import type { CreateItemInput, Item, UpdateItemInput } from "./types";

const DATA_PATH = path.join(process.cwd(), "data", "items.json");

async function ensureStore(): Promise<Item[]> {
  try {
    const raw = await fs.readFile(DATA_PATH, "utf8");
    return JSON.parse(raw) as Item[];
  } catch {
    const seed: Item[] = [
      {
        id: 1,
        title: "買牛奶",
        done: false,
        created_at: new Date().toISOString(),
      },
      {
        id: 2,
        title: "寫文件",
        done: true,
        created_at: new Date().toISOString(),
      },
      {
        id: 3,
        title: "開會",
        done: false,
        created_at: new Date().toISOString(),
      },
    ];
    await fs.mkdir(path.dirname(DATA_PATH), { recursive: true });
    await fs.writeFile(DATA_PATH, JSON.stringify(seed, null, 2), "utf8");
    return seed;
  }
}

async function save(items: Item[]) {
  await fs.mkdir(path.dirname(DATA_PATH), { recursive: true });
  await fs.writeFile(DATA_PATH, JSON.stringify(items, null, 2), "utf8");
}

export async function getAll(): Promise<Item[]> {
  return ensureStore();
}

export async function getById(id: number): Promise<Item | null> {
  const items = await ensureStore();
  return items.find((i) => i.id === id) ?? null;
}

export async function create(input: CreateItemInput): Promise<Item> {
  const items = await ensureStore();
  const nextId = items.reduce((max, i) => Math.max(max, i.id), 0) + 1;
  const item: Item = {
    id: nextId,
    title: input.title.trim(),
    done: false,
    created_at: new Date().toISOString(),
  };
  items.push(item);
  await save(items);
  return item;
}

export async function replace(
  id: number,
  input: Required<UpdateItemInput>
): Promise<Item | null> {
  const items = await ensureStore();
  const idx = items.findIndex((i) => i.id === id);
  if (idx === -1) return null;
  items[idx] = {
    ...items[idx],
    title: input.title.trim(),
    done: input.done,
  };
  await save(items);
  return items[idx];
}

export async function patch(
  id: number,
  input: UpdateItemInput
): Promise<Item | null> {
  const items = await ensureStore();
  const idx = items.findIndex((i) => i.id === id);
  if (idx === -1) return null;
  items[idx] = {
    ...items[idx],
    ...(input.title !== undefined ? { title: input.title.trim() } : {}),
    ...(input.done !== undefined ? { done: input.done } : {}),
  };
  await save(items);
  return items[idx];
}

export async function remove(id: number): Promise<boolean> {
  const items = await ensureStore();
  const next = items.filter((i) => i.id !== id);
  if (next.length === items.length) return false;
  await save(next);
  return true;
}
