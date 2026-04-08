"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const [inviteCode, setInviteCode] = useState("");
  const [error, setError] = useState("");
  const [codeValidated, setCodeValidated] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleValidateCode() {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/invites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: inviteCode }),
      });
      const data = await res.json();

      if (data.valid) {
        setCodeValidated(true);
      } else {
        setError(data.error || "유효하지 않은 코드입니다");
      }
    } catch {
      setError("오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    // Store invite code in session storage for post-auth use
    if (inviteCode) {
      sessionStorage.setItem("wp-comp-invite", inviteCode);
    }
    signIn("google", { callbackUrl: "/dashboard" });
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

        {!codeValidated ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="invite-code">초대 코드</Label>
              <Input
                id="invite-code"
                placeholder="초대 코드를 입력하세요"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                maxLength={8}
                className="text-center font-mono tracking-widest"
              />
              {error && <p className="text-xs text-red-500">{error}</p>}
            </div>
            <Button
              onClick={handleValidateCode}
              disabled={!inviteCode || loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700"
            >
              {loading ? "확인 중..." : "코드 확인"}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-md bg-emerald-50 p-3 text-center text-sm text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
              초대 코드가 확인되었습니다
            </div>
            <Button
              onClick={handleGoogleSignIn}
              variant="outline"
              className="w-full"
            >
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Google로 로그인
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
