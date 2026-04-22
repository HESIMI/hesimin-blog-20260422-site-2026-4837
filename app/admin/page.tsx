import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { AdminLoginCard } from "@/components/admin/admin-login-card";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getAllMessages, getAllTags } from "@/lib/db";

export default async function AdminPage() {
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) {
    return <AdminLoginCard />;
  }

  const [tags, messages] = await Promise.all([getAllTags(), getAllMessages()]);
  return <AdminDashboard initialTags={tags} initialMessages={messages} />;
}
