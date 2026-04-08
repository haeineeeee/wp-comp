"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle, Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useInvalidateSites } from "@/hooks/use-sites";

export default function NewSitePage() {
  const router = useRouter();
  const invalidateSites = useInvalidateSites();

  const [url, setUrl] = useState("");
  const [name, setName] = useState("");
  const [wpUsername, setWpUsername] = useState("");
  const [appPassword, setAppPassword] = useState("");

  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    siteName?: string;
    error?: string;
  } | null>(null);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const canTest = url && wpUsername && appPassword;
  const canSave = testResult?.success && name;

  async function handleTestConnection() {
    setTesting(true);
    setTestResult(null);
    setError("");

    try {
      const res = await fetch("/api/sites/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, wpUsername, appPassword }),
      });
      const data = await res.json();
      setTestResult(data);

      // 테스트 성공 시 사이트명 자동 입력 (비어있을 때만)
      if (data.success && data.siteName && !name) {
        setName(data.siteName);
      }
    } catch {
      setTestResult({ success: false, error: "네트워크 오류가 발생했습니다" });
    } finally {
      setTesting(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/sites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, name, wpUsername, appPassword }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "저장에 실패했습니다");
        return;
      }

      invalidateSites();
      router.push("/dashboard");
    } catch {
      setError("네트워크 오류가 발생했습니다");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon-sm" render={<Link href="/dashboard" />}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-lg font-semibold tracking-tight">사이트 추가</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">WordPress 연결 정보</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Site URL */}
          <div className="space-y-2">
            <Label htmlFor="url">사이트 URL</Label>
            <Input
              id="url"
              type="url"
              placeholder="https://your-site.com"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setTestResult(null);
              }}
            />
          </div>

          {/* WP Username */}
          <div className="space-y-2">
            <Label htmlFor="wpUsername">WordPress 사용자명</Label>
            <Input
              id="wpUsername"
              placeholder="admin"
              value={wpUsername}
              onChange={(e) => {
                setWpUsername(e.target.value);
                setTestResult(null);
              }}
            />
          </div>

          {/* Application Password */}
          <div className="space-y-2">
            <Label htmlFor="appPassword">Application Password</Label>
            <Input
              id="appPassword"
              type="password"
              placeholder="xxxx xxxx xxxx xxxx xxxx xxxx"
              value={appPassword}
              onChange={(e) => {
                setAppPassword(e.target.value);
                setTestResult(null);
              }}
            />
            <p className="text-xs text-muted-foreground">
              WordPress 관리자 → 사용자 → 프로필 → Application Passwords에서 생성
            </p>
          </div>

          {/* Test Connection Button */}
          <Button
            onClick={handleTestConnection}
            disabled={!canTest || testing}
            variant="outline"
            className="w-full"
          >
            {testing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                연결 테스트 중...
              </>
            ) : (
              "연결 테스트"
            )}
          </Button>

          {/* Test Result */}
          {testResult && (
            <div
              className={`flex items-center gap-2 rounded-md p-3 text-sm ${
                testResult.success
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                  : "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300"
              }`}
            >
              {testResult.success ? (
                <>
                  <CheckCircle className="h-4 w-4 shrink-0" />
                  <span>연결 성공! 사이트: {testResult.siteName}</span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{testResult.error}</span>
                </>
              )}
            </div>
          )}

          {/* Site Name (shown after test success or always) */}
          <div className="space-y-2">
            <Label htmlFor="name">사이트 이름</Label>
            <Input
              id="name"
              placeholder="내 블로그"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              대시보드에 표시될 이름입니다
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Save Button */}
          <Button
            onClick={handleSave}
            disabled={!canSave || saving}
            className="w-full bg-emerald-600 hover:bg-emerald-700"
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                저장 중...
              </>
            ) : (
              "사이트 저장"
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
