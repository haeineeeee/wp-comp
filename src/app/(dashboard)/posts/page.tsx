import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SiteService } from "@/services/site.service";
import { PostTable } from "@/components/posts/post-table";

export default async function PostsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const sites = await SiteService.list(session.user.id);

  return (
    <div className="space-y-6">
      <h1 className="text-lg font-semibold tracking-tight">글 관리</h1>
      <PostTable
        sites={sites.map((s) => ({ id: s.id, name: s.name }))}
      />
    </div>
  );
}
