import { createPool } from '@vercel/postgres';
import { drizzle } from 'drizzle-orm/vercel-postgres';
import * as schema from "./schema";

// 使用 @vercel/postgres 创建连接池
const pool = createPool({
  connectionString: process.env.DATABASE_URL,
});

// 使用 Drizzle ORM 包装连接
export const db = drizzle(pool, { schema });

// 为了兼容原代码中使用的 getDb() 函数
export function getDb() {
  return db;
}

export { pool };
