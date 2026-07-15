import mysql from "mysql2/promise";

const globalForMysql = globalThis as typeof globalThis & {
  mysqlPool?: mysql.Pool;
};

function createPool() {
  const host = process.env.MYSQL_HOST;
  const user = process.env.MYSQL_USER;
  const database = process.env.MYSQL_DATABASE;

  if (!host || !user || !database) {
    throw new Error(
      "缺少 MySQL 設定：請在 .env.local 設定 MYSQL_HOST、MYSQL_USER、MYSQL_PASSWORD、MYSQL_DATABASE"
    );
  }

  return mysql.createPool({
    host,
    port: Number(process.env.MYSQL_PORT ?? 3306),
    user,
    password: process.env.MYSQL_PASSWORD ?? "",
    database,
    waitForConnections: true,
    connectionLimit: 10,
  });
}

export function getPool() {
  if (!globalForMysql.mysqlPool) {
    globalForMysql.mysqlPool = createPool();
  }
  return globalForMysql.mysqlPool;
}
