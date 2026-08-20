import { createAdminSession } from "@/app/admin-auth";

export async function POST(request: Request) {
  const { password } = (await request.json()) as { password?: string };
  
  // 从标准环境变量读取密码
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";
  const VIEWER_PASSWORD = process.env.VIEWER_PASSWORD || "viewer123";
  
  const role = password && password === ADMIN_PASSWORD
    ? "manager"
    : password && password === VIEWER_PASSWORD
      ? "viewer"
      : null;
      
  if (!role) return Response.json({ error: "后台密码错误。" }, { status: 401 });
  await createAdminSession(role);
  return Response.json({ ok: true, role });
}