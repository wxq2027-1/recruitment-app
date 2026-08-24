import { getAdminRole } from "@/app/admin-auth";
import { deleteApplication, listApplications } from "@/db/applications";

export async function GET() {
  const role = await getAdminRole();
  if (!role) return Response.json({ error: "未登录" }, { status: 401 });
  const rows = await listApplications();
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
  const deleted = await deleteApplication(Number(id));
  if (!deleted) return Response.json({ error: "该报名记录不存在" }, { status: 404 });
  return Response.json({ ok: true });
}
