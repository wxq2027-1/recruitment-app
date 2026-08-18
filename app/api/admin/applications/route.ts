import { desc } from "drizzle-orm";
import { isAdmin } from "@/app/admin-auth";
import { getDb } from "@/db";
import { applications } from "@/db/schema";

export async function GET() {
  if (!await isAdmin()) return Response.json({ error: "未登录" }, { status: 401 });
  const rows = await getDb().select().from(applications).orderBy(desc(applications.createdAt));
  return Response.json({ applications: rows });
}
