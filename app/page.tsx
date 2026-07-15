export default function Home() {
  return (
    <div className="mx-auto flex min-h-full max-w-2xl flex-col justify-center px-5 py-16">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-stone-400">
        next-api-example
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-stone-800">
        CRUD 範例
      </h1>
      <p className="mt-3 max-w-md text-base leading-relaxed text-stone-500">
        Server Action 與 API Route 的 GET / POST / PUT / PATCH / DELETE。
        資料對應 <code className="text-stone-600">db.sql</code> 的 items 表。
      </p>

      <nav className="mt-10 flex flex-col gap-3 sm:flex-row">
        <a
          href="/api-demo"
          className="border border-stone-300 bg-white px-5 py-3 text-center text-sm text-stone-700 transition-colors hover:border-stone-500 hover:bg-stone-50"
        >
          API Route 示範
        </a>
        <a
          href="/actions-demo"
          className="border border-stone-300 bg-white px-5 py-3 text-center text-sm text-stone-700 transition-colors hover:border-stone-500 hover:bg-stone-50"
        >
          Server Action 示範
        </a>
      </nav>

      <dl className="mt-12 space-y-3 border-t border-stone-200 pt-8 text-sm">
        <div className="flex gap-4">
          <dt className="w-28 shrink-0 font-mono text-stone-400">GET</dt>
          <dd className="text-stone-600">/api/items · /api/items/:id</dd>
        </div>
        <div className="flex gap-4">
          <dt className="w-28 shrink-0 font-mono text-stone-400">POST</dt>
          <dd className="text-stone-600">/api/items</dd>
        </div>
        <div className="flex gap-4">
          <dt className="w-28 shrink-0 font-mono text-stone-400">PUT</dt>
          <dd className="text-stone-600">/api/items/:id</dd>
        </div>
        <div className="flex gap-4">
          <dt className="w-28 shrink-0 font-mono text-stone-400">PATCH</dt>
          <dd className="text-stone-600">/api/items/:id</dd>
        </div>
        <div className="flex gap-4">
          <dt className="w-28 shrink-0 font-mono text-stone-400">DELETE</dt>
          <dd className="text-stone-600">/api/items/:id</dd>
        </div>
      </dl>
    </div>
  );
}
