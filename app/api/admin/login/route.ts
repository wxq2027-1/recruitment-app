import { env } from "cloudflare:workers";
import { createAdminSession } from "@/app/admin-auth";

export async function POST(request: Request) {
  const { password } = (await request.json()) as { password?: string };
  const adminEnv = env as unknown as { ADMIN_PASSWORD?: string; VIEWER_PASSWORD?: string };
  const role = password && password === adminEnv.ADMIN_PASSWORD
    ? "manager"
    : password && password === adminEnv.VIEWER_PASSWORD
      ? "viewer"
      : null;
  if (!role) return Response.json({ error: "后台密码错误。" }, { status: 401 });
  await createAdminSession(role);
  return Response.json({ ok: true, role });
}
