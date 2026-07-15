import type { ResultSetHeader, RowDataPacket } from "mysql2";
import type { CreateItemInput, Item, UpdateItemInput } from "./types";
import { getPool } from "./mysql";

type ItemRow = RowDataPacket & {
  id: number;
  title: string;
  done: number | boolean;
  created_at: Date | string;
};

function mapRow(row: ItemRow): Item {
  return {
    id: row.id,
    title: row.title,
    done: Boolean(row.done),
    created_at:
      row.created_at instanceof Date
        ? row.created_at.toISOString()
        : String(row.created_at),
  };
}

export async function getAll(): Promise<Item[]> {
  const [rows] = await getPool().query<ItemRow[]>(
    "SELECT id, title, done, created_at FROM items ORDER BY id ASC"
  );
  return rows.map(mapRow);
}

export async function getById(id: number): Promise<Item | null> {
  const [rows] = await getPool().execute<ItemRow[]>(
    "SELECT id, title, done, created_at FROM items WHERE id = ?",
    [id]
  );
  const row = rows[0];
  return row ? mapRow(row) : null;
}

export async function create(input: CreateItemInput): Promise<Item> {
  const title = input.title.trim();
  const [result] = await getPool().execute<ResultSetHeader>(
    "INSERT INTO items (title, done) VALUES (?, 0)",
    [title]
  );
  const item = await getById(result.insertId);
  if (!item) throw new Error("建立後找不到項目");
  return item;
}

export async function replace(
  id: number,
  input: Required<UpdateItemInput>
): Promise<Item | null> {
  const [result] = await getPool().execute<ResultSetHeader>(
    "UPDATE items SET title = ?, done = ? WHERE id = ?",
    [input.title.trim(), input.done ? 1 : 0, id]
  );
  if (result.affectedRows === 0) return null;
  return getById(id);
}

export async function patch(
  id: number,
  input: UpdateItemInput
): Promise<Item | null> {
  const fields: string[] = [];
  const values: (string | number)[] = [];

  if (input.title !== undefined) {
    fields.push("title = ?");
    values.push(input.title.trim());
  }
  if (input.done !== undefined) {
    fields.push("done = ?");
    values.push(input.done ? 1 : 0);
  }
  if (fields.length === 0) return getById(id);

  values.push(id);
  const [result] = await getPool().execute<ResultSetHeader>(
    `UPDATE items SET ${fields.join(", ")} WHERE id = ?`,
    values
  );
  if (result.affectedRows === 0) return null;
  return getById(id);
}

export async function remove(id: number): Promise<boolean> {
  const [result] = await getPool().execute<ResultSetHeader>(
    "DELETE FROM items WHERE id = ?",
    [id]
  );
  return result.affectedRows > 0;
}
