# 全端流程

本專案示範同一套 `items` CRUD，透過兩種入口（API Route / Server Action）共用同一資料層。

## 架構總覽

```
┌─────────────────────────────────────────────────────────────┐
│  Browser                                                     │
│  ┌──────────────────┐          ┌──────────────────────────┐ │
│  │ /api-demo        │          │ /actions-demo            │ │
│  │ Client Component │          │ Server Component         │ │
│  │ fetch → HTTP     │          │ <form action={...}>      │ │
│  └────────┬─────────┘          └────────────┬─────────────┘ │
└───────────┼─────────────────────────────────┼───────────────┘
            │                                 │
            ▼                                 ▼
┌───────────────────────┐       ┌─────────────────────────────┐
│ app/api/items/*       │       │ app/actions/items.ts        │
│ Route Handlers        │       │ "use server"                │
│ 驗證 JSON / 回傳 JSON │       │ 解析 FormData / revalidate  │
└───────────┬───────────┘       └─────────────┬───────────────┘
            │                                 │
            └──────────────┬──────────────────┘
                           ▼
                 ┌──────────────────┐
                 │ lib/db.ts        │
                 │ CRUD（資料層）   │
                 └────────┬─────────┘
                          ▼
                 ┌──────────────────┐
                 │ lib/mysql.ts     │
                 │ connection pool  │
                 └────────┬─────────┘
                          ▼
                 ┌──────────────────┐
                 │ MySQL items 表   │
                 └──────────────────┘
```

| 層 | 路徑 | 職責 |
|---|---|---|
| UI | `app/api-demo`、`app/actions-demo` | 使用者操作 |
| 入口 | `app/api/items/*`、`app/actions/items.ts` | 驗證、協定轉換 |
| 資料 | `lib/db.ts` | SQL CRUD |
| 連線 | `lib/mysql.ts` | MySQL connection pool |
| 型別 | `lib/types.ts` | `Item` / input 型別 |
| Schema | `db.sql` | 建立 DB / 表 / seed |

---

## 路徑與頁面

| 路徑 | 類型 | 說明 |
|---|---|---|
| `/` | Server | 首頁導覽 |
| `/api-demo` | Client | 用 `fetch` 打 REST API |
| `/actions-demo` | Server | 表單綁定 Server Action |
| `/api/items` | Route | GET 列表、POST 新增 |
| `/api/items/[id]` | Route | GET / PUT / PATCH / DELETE |

---

## 流程 A：API Route（`/api-demo`）

Client 用 `fetch` 發 HTTP，Route Handler 驗證後呼叫 `lib/db`，回 JSON。

```
使用者操作
  → fetch(method, /api/items[/:id], JSON body?)
  → app/api/items/route.ts 或 [id]/route.ts
  → 驗證 id / title / done
  → lib/db.*（getAll / create / getById / replace / patch / remove）
  → MySQL `items` 表
  → NextResponse.json(...)
  → Client 更新 state + 顯示回應 log
```

### 對照表

| HTTP | Endpoint | db 函式 | 說明 |
|---|---|---|---|
| GET | `/api/items` | `getAll` | 列表 |
| POST | `/api/items` | `create` | 新增 `{ title }` |
| GET | `/api/items/:id` | `getById` | 單筆 |
| PUT | `/api/items/:id` | `replace` | 整筆覆寫 `{ title, done }` |
| PATCH | `/api/items/:id` | `patch` | 部分更新 |
| DELETE | `/api/items/:id` | `remove` | 刪除 |

### 範例：POST 新增

```
[Browser] POST /api/items  { "title": "買牛奶" }
    │
    ▼
[route.ts POST]
    解析 JSON → 驗證 title 非空
    │
    ▼
[db.create] INSERT INTO items → 回傳新列
    │
    ▼
[201] { id, title, done, created_at }
    │
    ▼
[api-demo] setLog + refresh() 再 GET 列表
```

---

## 流程 B：Server Action（`/actions-demo`）

頁面在 Server 直接 `await listItems()` 渲染；表單 `action={fn}` 提交後在 Server 執行，無手動 `fetch`。

```
首次進入 /actions-demo
  → Server Component 呼叫 listItems()
  → db.getAll() → 渲染 HTML

表單提交（新增 / 覆寫 / 部分更新 / 刪除）
  → Next.js 以 POST 呼叫對應 Server Action
  → 解析 FormData、驗證
  → lib/db.*
  → revalidatePath("/actions-demo")
  → 重新渲染頁面（看到最新資料）
```

### 對照表

| Action | 語意 | db 函式 | FormData 欄位 |
|---|---|---|---|
| `listItems` | GET 列表 | `getAll` | —（頁面直接 await） |
| `createItem` | POST | `create` | `title` |
| `replaceItem` | PUT | `replace` | `id`, `title`, `done?` |
| `patchItem` | PATCH | `patch` | `id`, `title?`, `done?` |
| `deleteItem` | DELETE | `remove` | `id` |

### 範例：createItem

```
[Browser] <form action={createItem}> 送出 title
    │
    ▼
[actions/items.ts createItem]
    FormData → title 驗證
    │
    ▼
[db.create] INSERT INTO items
    │
    ▼
revalidatePath("/actions-demo")
    │
    ▼
Server 重跑 listItems() → 回傳更新後 HTML
```

---

## 共用資料層 `lib/db.ts`

兩種入口都只做「協定與驗證」，實際持久化集中在這裡：

| 函式 | SQL 行為 |
|---|---|
| `getAll` | `SELECT ... ORDER BY id` |
| `getById` | `SELECT ... WHERE id = ?` |
| `create` | `INSERT`（AUTO_INCREMENT、`done` 預設 0） |
| `replace` | `UPDATE title, done` |
| `patch` | 動態組 `UPDATE` 欄位 |
| `remove` | `DELETE`；`affectedRows === 0` 回 `false` |

連線：`lib/mysql.ts` 讀取 `.env.local`（見 `.env.example`）。

建表：

```bash
mysql -u root < db.sql
cp .env.example .env.local   # 依環境改密碼
```

---

## 兩條路差在哪

| | API Route | Server Action |
|---|---|---|
| 頁面 | Client Component + `fetch` | Server Component + `<form action>` |
| 傳輸 | 自行組 JSON / 看 HTTP status | FormData，Next 處理呼叫 |
| 回應 | JSON（適合外部客戶端、SPA） | 常搭配 `revalidatePath` 重整 UI |
| 共用 | 兩者都呼叫 `lib/db` | 同左 |

---

## 本機啟動

```bash
# 1. 建表
mysql -u root < db.sql

# 2. 環境變數
cp .env.example .env.local   # 依環境改密碼等

# 3. 啟動
npm install
npm run dev
```

- 首頁：http://localhost:3000  
- API 示範：http://localhost:3000/api-demo  
- Action 示範：http://localhost:3000/actions-demo  
