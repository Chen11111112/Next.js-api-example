# 全端流程

本專案為Next.js全端示範專案，展示透過兩種API串接方式（API Route / Server Action）實現Next.js框架下的全端開發。

使用aiven線上平台作為本專案資料庫。

> Powered By [[name=陳毓]](https://hyc.eshachem.com/)   
> Latest update -  07/17/2026  
> Home Page: https://next-js-api-example-pearl.vercel.app/  

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
                 │ data/items.json  │
                 └──────────────────┘
```

| 層 | 路徑 | 職責 |
|---|---|---|
| UI | `app/api-demo`、`app/actions-demo` | 使用者操作 |
| 入口 | `app/api/items/*`、`app/actions/items.ts` | 驗證、協定轉換 |
| 資料 | `lib/db.ts` | 讀寫 `data/items.json` |
| 型別 | `lib/types.ts` | `Item` / input 型別 |
| Schema 參考 | `db.sql` | 對應 SQL 表結構（目前未接真實 DB） |

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
  → 讀寫 data/items.json
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
[db.create] 讀 JSON → 產生 id → push → 寫回檔案
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
[db.create] 寫入 items.json
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

| 函式 | 行為 |
|---|---|
| `getAll` | 讀取全部 |
| `getById` | 依 id 查一筆 |
| `create` | 自動遞增 id、預設 `done: false` |
| `replace` | 整筆覆寫 title + done |
| `patch` | 只更新有傳入的欄位 |
| `remove` | 刪除；找不到回 `false` |

連線：`lib/mysql.ts` 讀取 `.env.local`（見 `.env.example`）。

### .env.example
```bash
MYSQL_HOST=
MYSQL_PORT=
MYSQL_USER=avnadmin
MYSQL_PASSWORD=
MYSQL_DATABASE=defaultdb
```

---

## 兩條路差在哪

| | API Route | Server Action |
|---|---|---|
| 頁面 | Client Component + `fetch` | Server Component + `<form action>` |
| 傳輸 | 自行組 JSON / 看 HTTP status | FormData，Next 處理呼叫 |
| 回應 | JSON（適合外部客戶端、SPA） | 常搭配 `revalidatePath` 重整 UI |
| 共用 | 兩者都呼叫 `lib/db` | 同左 |
