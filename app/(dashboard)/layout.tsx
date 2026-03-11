import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { TopNav } from "@/components/layout/TopNav";
import { Footer } from "@/components/layout/Footer";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const supabase = createAdminClient();

  // 1. Try to find profile by clerk_id (fast path)
  let { data: perfil } = await supabase
    .from("perfiles")
    .select("id, activo")
    .eq("clerk_id", userId)
    .maybeSingle();

  // 2. Fallback: find by email and link the real clerk_id (manual profiles)
  if (!perfil) {
    const clerkUser = await currentUser();
    const email = clerkUser?.emailAddresses[0]?.emailAddress;
    if (email) {
      const { data: byEmail } = await supabase
        .from("perfiles")
        .select("id, activo")
        .eq("email", email)
        .maybeSingle();
      if (byEmail) {
        // Link this profile to the Clerk user so future logins are fast
        await supabase.from("perfiles").update({ clerk_id: userId }).eq("id", byEmail.id);
        perfil = byEmail;
      }
    }
  }

  if (!perfil || !perfil.activo) redirect("/sin-acceso");

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#0f1923]">
      <TopNav />
      <main className="flex flex-1 flex-col overflow-y-auto">{children}</main>
      <Footer />
    </div>
  );
}
