import { useNavigate, useParams } from "react-router-dom";
import { LookupForm } from "@/components/lookup-form";
import { IpText, ErrorNotice, Pending } from "@/components/toolkit";
import { Button } from "@/components/ui/button";
import { useLookupHistory } from "@/hooks/use-lookup-history";
import { t } from "@/i18n";
import { useQuery } from "@tanstack/react-query";
import { Search, Trash2, X } from "lucide-react";
import { lookupIp } from "./api";
import type { CoffeeLookup } from "./coffee";
import { IpDetails } from "./details";
import "./ip-page.css";

export default function IpPage() {
  const { ip = "" } = useParams();
  const navigate = useNavigate();
  const history = useLookupHistory<CoffeeLookup>("ip-tools:coffee-history:v1");
  const cached = history.find(ip);
  const query = useQuery({
    queryKey: ["lookup-ip-coffee", ip],
    enabled: !!ip,
    initialData: cached?.data,
    initialDataUpdatedAt: cached?.savedAt,
    staleTime: 300_000,
    retry: false,
    queryFn: async ({ signal }) => {
      const result = await lookupIp(ip, signal);
      history.save(ip, result);
      return result;
    },
  });
  const historyValues = history.entries.length
    ? history.entries.map((entry) => entry.query)
    : ["1.1.1.1", "8.8.8.8", "223.5.5.5"];
  const submit = (value: string) =>
    value === ip
      ? void query.refetch()
      : navigate(`/network/ip/${encodeURIComponent(value)}`);
  return (
    <div className="lookup-page ip-detail-page">
      <section className="ip-query-console" aria-labelledby="ip-query-title">
        <div className="ip-query-heading">
          <span className="ip-query-icon" aria-hidden="true">
            <Search />
          </span>
          <div>
            <h1 id="ip-query-title">{t("IP 信息查询")}</h1>
            <p>{t("查询归属地、运营商、ASN、信誉与网络属性")}</p>
          </div>
        </div>
        <LookupForm
          grouped
          value={ip}
          placeholder={t("输入 IPv4 或 IPv6 地址")}
          busy={query.isFetching}
          label={t("查询 IP")}
          onSubmit={submit}
        />
        <div className="ip-history">
          <div className="ip-history-heading">
            <span>
              {history.entries.length ? t("最近查询") : t("推荐查询")}
            </span>
            {!!history.entries.length && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="ip-history-clear"
                onClick={history.clear}
              >
                <Trash2 aria-hidden="true" />
                {t("清空记录")}
              </Button>
            )}
          </div>
          <div className="ip-history-list">
            {historyValues.slice(0, 6).map((value) => (
              <span className="ip-history-chip" key={value}>
                <button type="button" onClick={() => submit(value)}>
                  <IpText ip={value} link={false} />
                </button>
                {!!history.entries.length && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="ip-history-remove"
                    aria-label={t("删除 {0} 的查询记录", [value])}
                    title={t("删除查询记录")}
                    onClick={() => history.remove(value)}
                  >
                    <X aria-hidden="true" />
                  </Button>
                )}
              </span>
            ))}
          </div>
        </div>
      </section>
      <ErrorNotice error={query.error} />
      {query.isFetching && (
        <p className="status-line" role="status">
          <Pending>{t("查询中…")}</Pending>
        </p>
      )}
      {query.data && <IpDetails key={query.data.coffee.ip} data={query.data} />}
    </div>
  );
}
