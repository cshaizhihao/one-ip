import { Link } from "react-router-dom";
import { CountryFlag } from "@/components/country-flag";
import { IpText, Pending, ToolCard } from "@/components/toolkit";
import { Button } from "@/components/ui/button";
import { t } from "@/i18n";
import { lookupIp } from "@/views/ip/api";
import { ipProfile } from "@/views/ip/profile";
import { useQuery } from "@tanstack/react-query";
import { Check, CircleAlert, HelpCircle, ShieldCheck } from "lucide-react";

function RiskFlag({
  label,
  value,
}: {
  label: string;
  value: boolean | undefined;
}) {
  const state =
    value === true ? "detected" : value === false ? "clear" : "unknown";
  const Icon =
    state === "detected" ? CircleAlert : state === "clear" ? Check : HelpCircle;
  return (
    <div className="claude-risk-flag" data-state={state}>
      <span>{label}</span>
      <span>
        <Icon aria-hidden="true" />
        {state === "detected"
          ? t("已标记")
          : state === "clear"
            ? t("未检出")
            : t("未知")}
      </span>
    </div>
  );
}

export function ClaudeIpAssessment({ ip }: { ip?: string }) {
  const query = useQuery({
    queryKey: ["lookup-ip-coffee", ip],
    enabled: Boolean(ip),
    queryFn: ({ signal }) =>
      lookupIp(ip!, AbortSignal.any([signal, AbortSignal.timeout(5000)])),
    staleTime: 3_600_000,
    retry: false,
    refetchOnWindowFocus: false,
  });
  if (!ip) return null;
  if (query.isPending)
    return (
      <ToolCard title={t("Claude 出口 IP 画像")} className="claude-assessment">
        <Pending>{t("正在查询出口属性与风险标记…")}</Pending>
      </ToolCard>
    );
  if (query.isError || !query.data)
    return (
      <ToolCard title={t("Claude 出口 IP 画像")} className="claude-assessment">
        <p className="small muted">
          {t("出口 IP 已获取，但 Net.Coffee 风险数据暂时不可用。")}
        </p>
      </ToolCard>
    );

  const data = query.data.coffee;
  const profile = ipProfile(data);
  const ipType = profile.checks.find(
    (check) => check.label === t("IP 类型"),
  )?.value;
  const location = [data.country, data.region, data.city]
    .filter(Boolean)
    .filter((value, index, all) => all.indexOf(value) === index)
    .join(" · ");
  const flags = [
    ["VPN", data.is_vpn],
    [t("代理"), data.is_proxy],
    ["Tor", data.is_tor],
    [t("爬虫标记"), data.is_crawler],
    [t("滥用记录"), data.is_abuser],
  ] as const;

  return (
    <ToolCard title={t("Claude 出口 IP 画像")} className="claude-assessment">
      <div className="claude-assessment-grid">
        <section className="claude-trust" aria-label={t("Claude AI 信任评分")}>
          <span className="claude-assessment-label">
            <ShieldCheck aria-hidden="true" />
            {t("Claude AI 信任评分")}
          </span>
          <div className="claude-score-row">
            <strong>{profile.score ?? "—"}</strong>
            <span>/ 100</span>
            <em data-tone={profile.tone}>{profile.grade}</em>
          </div>
          <div className="claude-score-track" aria-hidden="true">
            <span style={{ width: `${profile.score ?? 0}%` }} />
          </div>
          <p>{profile.explanation}</p>
        </section>

        <section
          className="claude-attributes"
          aria-label={t("Claude AI 出口 IP 属性")}
        >
          <span className="claude-assessment-label">
            {t("Claude AI 出口 IP 属性")}
          </span>
          <dl>
            <div>
              <dt>{t("出口 IP")}</dt>
              <dd>
                <IpText ip={ip} />
              </dd>
            </div>
            <div>
              <dt>{t("地区")}</dt>
              <dd>
                <CountryFlag code={data.countryCode} /> {location || t("未知")}
              </dd>
            </div>
            <div>
              <dt>{t("IP 属性")}</dt>
              <dd>{ipType ?? t("未知")}</dd>
            </div>
            <div>
              <dt>ASN / {t("运营商")}</dt>
              <dd>
                {[data.asn ? `AS${data.asn}` : undefined, data.isp]
                  .filter(Boolean)
                  .join(" · ") || t("未知")}
              </dd>
            </div>
          </dl>
        </section>

        <section
          className="claude-flags"
          aria-label={t("Claude AI 出口 IP 安全检测")}
        >
          <span className="claude-assessment-label">
            {t("Claude AI 出口 IP 安全检测")}
          </span>
          <div>
            {flags.map(([label, value]) => (
              <RiskFlag key={label} label={label} value={value} />
            ))}
          </div>
        </section>
      </div>
      <div className="claude-assessment-footer">
        <p>
          {t(
            "评分和标记来自 Net.Coffee，不是 Claude 官方的账号风控结论；未知不等于安全。",
          )}
        </p>
        <Button asChild size="sm" variant="outline">
          <Link to={`/network/ip/${encodeURIComponent(ip)}`}>
            {t("查看完整 IP 报告")}
          </Link>
        </Button>
      </div>
    </ToolCard>
  );
}
