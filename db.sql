-- MySQL：建立資料庫與 items 表
CREATE DATABASE IF NOT EXISTS next_api_example
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE next_api_example;

CREATE TABLE IF NOT EXISTS items (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  title       VARCHAR(255) NOT NULL,
  done        TINYINT(1)   NOT NULL DEFAULT 0,
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO items (title, done) VALUES
  ('買牛奶', 0),
  ('寫文件', 1),
  ('開會', 0);
