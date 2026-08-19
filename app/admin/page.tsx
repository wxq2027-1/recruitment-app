import { getAdminRole } from "@/app/admin-auth";
import { AdminDashboard } from "./admin-dashboard";
import { AdminLogin } from "./admin-login";

export const dynamic = "force-dynamic";
export default async function AdminPage() {
  const role = await getAdminRole();
  return role ? <AdminDashboard role={role} /> : <AdminLogin />;
}
