import {
  createItem,
  deleteItem,
  listItems,
  patchItem,
  replaceItem,
} from "@/app/actions/items";

export default async function ActionsDemoPage() {
  const items = await listItems();

  return (
    <div className="mx-auto max-w-3xl px-5 py-10">
      <a href="/" className="text-sm text-stone-500 hover:text-stone-700">
        ← 回首頁
      </a>
      <h1 className="mt-4 text-2xl font-semibold tracking-tight text-stone-800">
        Server Action CRUD
      </h1>
      <p className="mt-1 text-sm text-stone-500">
        表單直接綁定 <code className="text-stone-600">action=&#123;...&#125;</code>
        ，無 fetch
      </p>

      <section className="mt-8">
        <h2 className="text-sm font-medium uppercase tracking-wide text-stone-500">
          目前資料（Server 讀取）
        </h2>
        <ul className="mt-3 divide-y divide-stone-200 border-y border-stone-200">
          {items.length === 0 && (
            <li className="py-3 text-sm text-stone-400">（空）</li>
          )}
          {items.map((item) => (
            <li
              key={item.id}
              className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm"
            >
              <span className="text-stone-700">
                <span className="mr-2 font-mono text-stone-400">#{item.id}</span>
                {item.title}
                {item.done && (
                  <span className="ml-2 text-stone-400">（已完成）</span>
                )}
              </span>
              <div className="flex flex-wrap gap-2">
                <form action={patchItem}>
                  <input type="hidden" name="id" value={item.id} />
                  <input
                    type="hidden"
                    name="done"
                    value={item.done ? "false" : "true"}
                  />
                  <button
                    type="submit"
                    className="text-stone-500 underline decoration-stone-300 hover:text-stone-800"
                  >
                    PATCH 切換 done
                  </button>
                </form>
                <form action={deleteItem}>
                  <input type="hidden" name="id" value={item.id} />
                  <button
                    type="submit"
                    className="text-stone-500 underline decoration-stone-300 hover:text-stone-800"
                  >
                    DELETE
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <form action={createItem} className="space-y-3">
          <h2 className="text-sm font-medium text-stone-600">
            createItem（POST 語意）
          </h2>
          <input
            name="title"
            placeholder="標題"
            required
            className="w-full border border-stone-300 bg-white px-3 py-2 text-sm text-stone-800 outline-none focus:border-stone-500"
          />
          <button
            type="submit"
            className="bg-stone-700 px-4 py-2 text-sm text-stone-50 hover:bg-stone-800"
          >
            新增
          </button>
        </form>

        <form action={replaceItem} className="space-y-3">
          <h2 className="text-sm font-medium text-stone-600">
            replaceItem（PUT 語意）
          </h2>
          <input
            name="id"
            type="number"
            placeholder="id"
            required
            className="w-full border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:border-stone-500"
          />
          <input
            name="title"
            placeholder="新標題"
            required
            className="w-full border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:border-stone-500"
          />
          <label className="flex items-center gap-2 text-sm text-stone-600">
            <input type="checkbox" name="done" />
            done
          </label>
          <button
            type="submit"
            className="bg-stone-700 px-4 py-2 text-sm text-stone-50 hover:bg-stone-800"
          >
            整筆覆寫
          </button>
        </form>

        <form action={patchItem} className="space-y-3 sm:col-span-2">
          <h2 className="text-sm font-medium text-stone-600">
            patchItem（PATCH 語意）
          </h2>
          <div className="flex flex-wrap gap-3">
            <input
              name="id"
              type="number"
              placeholder="id"
              required
              className="w-28 border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:border-stone-500"
            />
            <input
              name="title"
              placeholder="只改標題（可空則只靠其他欄）"
              className="min-w-[12rem] flex-1 border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:border-stone-500"
            />
            <button
              type="submit"
              className="bg-stone-700 px-4 py-2 text-sm text-stone-50 hover:bg-stone-800"
            >
              部分更新
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
