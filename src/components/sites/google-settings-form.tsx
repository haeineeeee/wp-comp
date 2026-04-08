"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

interface Props {
  siteId: string;
  gscProperty: string | null;
  ga4PropertyId: string | null;
  adsenseAccountId: string | null;
}

interface SelectOption {
  value: string;
  label: string;
}

function GoogleServiceSection({
  title,
  currentValue,
  siteId,
  field,
  fetchUrl,
  mapOptions,
  placeholder,
}: {
  title: string;
  currentValue: string | null;
  siteId: string;
  field: string;
  fetchUrl: string;
  mapOptions: (data: Record<string, unknown>) => SelectOption[];
  placeholder: string;
}) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [options, setOptions] = useState<SelectOption[] | null>(null);
  const [selected, setSelected] = useState(currentValue ?? "");
  const [manualInput, setManualInput] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  async function loadOptions() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(fetchUrl);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "조회에 실패했습니다");
        setManualInput(true);
        return;
      }
      const opts = mapOptions(data);
      if (opts.length === 0) {
        setError("사용 가능한 속성이 없습니다");
        setManualInput(true);
        return;
      }
      setOptions(opts);
    } catch {
      setError("네트워크 오류");
      setManualInput(true);
    } finally {
      setLoading(false);
    }
  }

  async function save(value: string | null) {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch(`/api/sites/${siteId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value }),
      });
      if (res.ok) {
        setSaved(true);
        setSelected(value ?? "");
        setTimeout(() => setSaved(false), 2000);
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="text-sm">{title}</CardTitle>
        <Badge variant={currentValue || selected ? "default" : "outline"}>
          {currentValue || selected ? "연결됨" : "미연결"}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        {options === null && !manualInput ? (
          <Button
            variant="outline"
            size="sm"
            onClick={loadOptions}
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                조회 중...
              </>
            ) : (
              "속성 불러오기"
            )}
          </Button>
        ) : options ? (
          <div className="space-y-2">
            <Label>속성 선택</Label>
            <select
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
              className="h-9 w-full rounded-md border bg-background px-3 text-sm"
            >
              <option value="">선택해주세요</option>
              {options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <button
              onClick={() => {
                setOptions(null);
                setManualInput(true);
              }}
              className="text-xs text-muted-foreground hover:underline"
            >
              직접 입력하기
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <Label>직접 입력</Label>
            <Input
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
              placeholder={placeholder}
            />
            <button
              onClick={() => {
                setManualInput(false);
                setError("");
              }}
              className="text-xs text-muted-foreground hover:underline"
            >
              목록에서 선택하기
            </button>
          </div>
        )}

        {error && (
          <p className="flex items-center gap-1 text-xs text-red-600">
            <XCircle className="h-3 w-3" />
            {error}
          </p>
        )}

        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={() => save(selected || null)}
            disabled={saving}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            {saving ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : saved ? (
              <>
                <CheckCircle className="mr-1 h-3 w-3" />
                저장됨
              </>
            ) : (
              "저장"
            )}
          </Button>
          {(currentValue || selected) && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => save(null)}
              disabled={saving}
            >
              해제
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function GoogleSettingsForm({
  siteId,
  gscProperty,
  ga4PropertyId,
  adsenseAccountId,
}: Props) {
  return (
    <div className="space-y-4">
      <GoogleServiceSection
        title="Search Console"
        currentValue={gscProperty}
        siteId={siteId}
        field="gscProperty"
        fetchUrl="/api/google/search-console/properties"
        mapOptions={(data) =>
          ((data as { properties: { siteUrl: string }[] }).properties ?? []).map(
            (p) => ({
              value: p.siteUrl,
              label: p.siteUrl,
            })
          )
        }
        placeholder="sc-domain:example.com"
      />

      <GoogleServiceSection
        title="Google Analytics 4"
        currentValue={ga4PropertyId}
        siteId={siteId}
        field="ga4PropertyId"
        fetchUrl="/api/google/analytics/properties"
        mapOptions={(data) =>
          (
            (data as { properties: { propertyId: string; displayName: string; accountName: string }[] })
              .properties ?? []
          ).map((p) => ({
            value: p.propertyId,
            label: `${p.displayName} (${p.accountName})`,
          }))
        }
        placeholder="123456789"
      />

      <GoogleServiceSection
        title="AdSense"
        currentValue={adsenseAccountId}
        siteId={siteId}
        field="adsenseAccountId"
        fetchUrl="/api/google/adsense/accounts"
        mapOptions={(data) =>
          (
            (data as { accounts: { accountId: string; displayName: string }[] })
              .accounts ?? []
          ).map((a) => ({
            value: a.accountId,
            label: a.displayName,
          }))
        }
        placeholder="accounts/pub-1234567890123456"
      />
    </div>
  );
}
