import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { AdminLoginCard } from "@/components/admin/admin-login-card";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getAllMessages, getAllTags } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) {
    return <AdminLoginCard />;
  }

  let tags = [] as Awaited<ReturnType<typeof getAllTags>>;
  let messages = [] as Awaited<ReturnType<typeof getAllMessages>>;

  try {
    [tags, messages] = await Promise.all([getAllTags(), getAllMessages()]);
  } catch (error) {
    console.error("[/admin] failed to load admin data:", error);
  }

  return <AdminDashboard initialTags={tags} initialMessages={messages} />;
}
