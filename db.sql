-- 超簡易 items 表（SQLite / MySQL / Postgres 通用）
CREATE TABLE IF NOT EXISTS items (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  title       TEXT        NOT NULL,
  done        INTEGER     NOT NULL DEFAULT 0,  -- 0=未完成, 1=完成
  created_at  TEXT        NOT NULL DEFAULT (datetime('now'))
);

-- 範例資料
INSERT INTO items (title, done) VALUES
  ('買牛奶', 0),
  ('寫文件', 1),
  ('開會', 0);
