import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SiteService } from "@/services/site.service";
import { GoogleSettingsForm } from "@/components/sites/google-settings-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function SiteSettingsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await params;
  const site = await SiteService.getById(session.user.id, id);

  if (!site) redirect("/dashboard");

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon-sm" render={<Link href={`/sites/${id}`} />}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-lg font-semibold tracking-tight">
          Google 연결 설정
        </h1>
      </div>
      <p className="text-sm text-muted-foreground">
        {site.name}에 연결할 Google 서비스를 설정합니다.
      </p>

      <GoogleSettingsForm
        siteId={site.id}
        gscProperty={site.gscProperty}
        ga4PropertyId={site.ga4PropertyId}
        adsenseAccountId={site.adsenseAccountId}
      />
    </div>
  );
}
