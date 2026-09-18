import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UnderlineHover } from "@/components/underline-hover";
import { t } from "@/i18n";

export function BrowserSummary() {
  return (
    <Card className="home-browser-summary">
      <CardHeader>
        <div className="row-between">
          <CardTitle as="h2">{t("浏览器环境")}</CardTitle>
          <Link className="small muted" to="/browser/environment">
            {t("查看完整检测 ›")}
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <dl className="browser-summary-facts">
          <div>
            <dt>{t("系统")}</dt>
            <dd>{navigator.platform}</dd>
          </div>
          <div>
            <dt>{t("语言")}</dt>
            <dd>{navigator.language}</dd>
          </div>
          <div>
            <dt>{t("时区")}</dt>
            <dd>{Intl.DateTimeFormat().resolvedOptions().timeZone}</dd>
          </div>
        </dl>
        <div className="browser-summary-links">
          {[
            { path: "fingerprint", name: t("指纹检测") },
            { path: "consistency", name: t("环境一致性") },
            { path: "privacy", name: t("权限与隐私") },
          ].map((tool) => (
            <UnderlineHover asChild key={tool.path}>
              <Link to={`/browser/${tool.path}`}>{tool.name} ›</Link>
            </UnderlineHover>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
