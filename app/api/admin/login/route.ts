import { env } from "cloudflare:workers";
import { createAdminSession } from "@/app/admin-auth";

export async function POST(request: Request) {
  const { password } = (await request.json()) as { password?: string };
  const adminPassword = (env as unknown as { ADMIN_PASSWORD?: string }).ADMIN_PASSWORD;
  if (!adminPassword || password !== adminPassword) return Response.json({ error: "管理员密码错误。" }, { status: 401 });
  await createAdminSession();
  return Response.json({ ok: true });
}
