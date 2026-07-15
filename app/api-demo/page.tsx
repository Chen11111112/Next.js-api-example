"use client";

import { useCallback, useEffect, useState } from "react";
import type { Item } from "@/lib/types";

type Log = { method: string; path: string; status: number; body: string };

export default function ApiDemoPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [title, setTitle] = useState("");
  const [editId, setEditId] = useState<number | "">("");
  const [editTitle, setEditTitle] = useState("");
  const [editDone, setEditDone] = useState(false);
  const [patchId, setPatchId] = useState<number | "">("");
  const [patchTitle, setPatchTitle] = useState("");
  const [getId, setGetId] = useState<number | "">("");
  const [log, setLog] = useState<Log | null>(null);
  const [loading, setLoading] = useState(false);

  const call = useCallback(
    async (method: string, path: string, body?: unknown) => {
      setLoading(true);
      try {
        const res = await fetch(path, {
          method,
          headers: body ? { "Content-Type": "application/json" } : undefined,
          body: body ? JSON.stringify(body) : undefined,
        });
        const text = await res.text();
        let pretty = text;
        try {
          pretty = JSON.stringify(JSON.parse(text), null, 2);
        } catch {
          /* keep raw */
        }
        setLog({ method, path, status: res.status, body: pretty });
        return res.ok;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const refresh = useCallback(async () => {
    const res = await fetch("/api/items");
    const data = (await res.json()) as Item[];
    setItems(data);
    setLog({
      method: "GET",
      path: "/api/items",
      status: res.status,
      body: JSON.stringify(data, null, 2),
    });
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return (
    <div className="mx-auto max-w-3xl px-5 py-10">
      <a href="/" className="text-sm text-stone-500 hover:text-stone-700">
        ← 回首頁
      </a>
      <h1 className="mt-4 text-2xl font-semibold tracking-tight text-stone-800">
        API Route CRUD
      </h1>
      <p className="mt-1 text-sm text-stone-500">
        fetch 呼叫 <code className="text-stone-600">/api/items</code>
      </p>

      <section className="mt-8">
        <h2 className="text-sm font-medium uppercase tracking-wide text-stone-500">
          目前資料
        </h2>
        <ul className="mt-3 divide-y divide-stone-200 border-y border-stone-200">
          {items.length === 0 && (
            <li className="py-3 text-sm text-stone-400">（空）</li>
          )}
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between gap-3 py-3 text-sm"
            >
              <span className="text-stone-700">
                <span className="mr-2 font-mono text-stone-400">#{item.id}</span>
                {item.title}
                {item.done && (
                  <span className="ml-2 text-stone-400">（已完成）</span>
                )}
              </span>
              <button
                type="button"
                disabled={loading}
                onClick={async () => {
                  await call("DELETE", `/api/items/${item.id}`);
                  await refresh();
                }}
                className="text-stone-500 underline decoration-stone-300 hover:text-stone-800"
              >
                DELETE
              </button>
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <form
          className="space-y-3"
          onSubmit={async (e) => {
            e.preventDefault();
            await call("POST", "/api/items", { title });
            setTitle("");
            await refresh();
          }}
        >
          <h2 className="text-sm font-medium text-stone-600">POST 新增</h2>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="標題"
            className="w-full border border-stone-300 bg-white px-3 py-2 text-sm text-stone-800 outline-none focus:border-stone-500"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-stone-700 px-4 py-2 text-sm text-stone-50 hover:bg-stone-800 disabled:opacity-50"
          >
            POST /api/items
          </button>
        </form>

        <form
          className="space-y-3"
          onSubmit={async (e) => {
            e.preventDefault();
            if (getId === "") return;
            await call("GET", `/api/items/${getId}`);
          }}
        >
          <h2 className="text-sm font-medium text-stone-600">GET 單筆</h2>
          <input
            type="number"
            value={getId}
            onChange={(e) =>
              setGetId(e.target.value === "" ? "" : Number(e.target.value))
            }
            placeholder="id"
            className="w-full border border-stone-300 bg-white px-3 py-2 text-sm text-stone-800 outline-none focus:border-stone-500"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-stone-700 px-4 py-2 text-sm text-stone-50 hover:bg-stone-800 disabled:opacity-50"
          >
            GET /api/items/:id
          </button>
        </form>

        <form
          className="space-y-3"
          onSubmit={async (e) => {
            e.preventDefault();
            if (editId === "") return;
            await call("PUT", `/api/items/${editId}`, {
              title: editTitle,
              done: editDone,
            });
            await refresh();
          }}
        >
          <h2 className="text-sm font-medium text-stone-600">PUT 整筆覆寫</h2>
          <input
            type="number"
            value={editId}
            onChange={(e) =>
              setEditId(e.target.value === "" ? "" : Number(e.target.value))
            }
            placeholder="id"
            className="w-full border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:border-stone-500"
            required
          />
          <input
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            placeholder="新標題"
            className="w-full border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:border-stone-500"
            required
          />
          <label className="flex items-center gap-2 text-sm text-stone-600">
            <input
              type="checkbox"
              checked={editDone}
              onChange={(e) => setEditDone(e.target.checked)}
            />
            done
          </label>
          <button
            type="submit"
            disabled={loading}
            className="bg-stone-700 px-4 py-2 text-sm text-stone-50 hover:bg-stone-800 disabled:opacity-50"
          >
            PUT /api/items/:id
          </button>
        </form>

        <form
          className="space-y-3"
          onSubmit={async (e) => {
            e.preventDefault();
            if (patchId === "") return;
            const body: { title?: string } = {};
            if (patchTitle.trim()) body.title = patchTitle.trim();
            await call("PATCH", `/api/items/${patchId}`, body);
            setPatchTitle("");
            await refresh();
          }}
        >
          <h2 className="text-sm font-medium text-stone-600">
            PATCH 部分更新（僅標題）
          </h2>
          <input
            type="number"
            value={patchId}
            onChange={(e) =>
              setPatchId(e.target.value === "" ? "" : Number(e.target.value))
            }
            placeholder="id"
            className="w-full border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:border-stone-500"
            required
          />
          <input
            value={patchTitle}
            onChange={(e) => setPatchTitle(e.target.value)}
            placeholder="新標題（選填欄位）"
            className="w-full border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:border-stone-500"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-stone-700 px-4 py-2 text-sm text-stone-50 hover:bg-stone-800 disabled:opacity-50"
          >
            PATCH /api/items/:id
          </button>
        </form>
      </div>

      <section className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium uppercase tracking-wide text-stone-500">
            最近回應
          </h2>
          <button
            type="button"
            onClick={() => void refresh()}
            className="text-sm text-stone-500 underline decoration-stone-300 hover:text-stone-800"
          >
            GET 重新整理列表
          </button>
        </div>
        {log ? (
          <pre className="mt-3 overflow-x-auto border border-stone-200 bg-stone-100 p-4 text-xs leading-relaxed text-stone-700">
            {log.method} {log.path} → {log.status}
            {"\n\n"}
            {log.body}
          </pre>
        ) : (
          <p className="mt-3 text-sm text-stone-400">尚無請求</p>
        )}
      </section>
    </div>
  );
}
