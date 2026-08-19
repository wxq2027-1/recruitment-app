import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

// 创建 PostgreSQL 连接池
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// 使用 Drizzle ORM 包装连接
export const db = drizzle(pool, { schema });

// 导出连接池
export { pool };

// 为了兼容原代码中使用的 getDb() 函数
export function getDb() {
  return db;
}
