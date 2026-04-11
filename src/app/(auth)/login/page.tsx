"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [inviteCode, setInviteCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        code: inviteCode,
        redirect: false,
      });

      if (result?.error) {
        setError("유효하지 않은 초대 코드입니다");
      } else {
        router.push("/dashboard");
      }
    } catch {
      setError("오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
      <Card className="w-full max-w-sm p-6">
        <div className="mb-6 text-center">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-600 text-lg font-bold text-white">
            W
          </div>
          <h1 className="mt-3 text-lg font-semibold">WP Companion</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            다수 블로그를 한 곳에서 관리하세요
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="invite-code">초대 코드</Label>
            <Input
              id="invite-code"
              placeholder="초대 코드를 입력하세요"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === "Enter" && inviteCode && handleLogin()}
              maxLength={8}
              className="text-center font-mono tracking-widest"
            />
            {error && <p className="text-xs text-red-500">{error}</p>}
          </div>
          <Button
            onClick={handleLogin}
            disabled={!inviteCode || loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                로그인 중...
              </>
            ) : (
              "로그인"
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
}
