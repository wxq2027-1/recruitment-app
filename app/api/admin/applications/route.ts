import { desc, eq } from "drizzle-orm";
import { getAdminRole } from "@/app/admin-auth";
import { getDb } from "@/db";
import { applications } from "@/db/schema";

export async function GET() {
  const role = await getAdminRole();
  if (!role) return Response.json({ error: "未登录" }, { status: 401 });
  const rows = await getDb().select().from(applications).orderBy(desc(applications.createdAt));
  return Response.json({ applications: rows, role });
}

export async function DELETE(request: Request) {
  const role = await getAdminRole();
  if (!role) return Response.json({ error: "未登录" }, { status: 401 });
  if (role !== "manager") return Response.json({ error: "当前账号为只读权限，不能删除报名信息。" }, { status: 403 });
  const { id } = (await request.json()) as { id?: number };
  if (!Number.isInteger(id) || Number(id) <= 0) {
    return Response.json({ error: "报名记录编号无效" }, { status: 400 });
  }
  const deleted = await getDb()
    .delete(applications)
    .where(eq(applications.id, Number(id)))
    .returning({ id: applications.id });
  if (!deleted.length) return Response.json({ error: "该报名记录不存在" }, { status: 404 });
  return Response.json({ ok: true });
}
