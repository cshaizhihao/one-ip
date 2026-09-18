import assert from "node:assert/strict";
import { test } from "node:test";
import { lookupGeo } from "../public/worker/geo.js";

test("geo lookup uses the secondary provider when the primary fails", async () => {
  const original = globalThis.fetch;
  globalThis.fetch = async (url, options) => {
    assert.equal(options.cf.cacheTtl, 600);
    if (String(url).startsWith("https://ipwho.is/"))
      return Response.json({ success: false });
    assert.equal(url, "https://api.ip.sb/geoip/1.1.1.1");
    return Response.json({
      ip: "1.1.1.1",
      country: "Australia",
      city: "South Brisbane",
      isp: "Cloudflare, Inc.",
      asn: 13335,
    });
  };
  try {
    const result = await lookupGeo("1.1.1.1");
    assert.equal(result.geo.source, "ip.sb");
    assert.equal(result.geo.isp, "Cloudflare, Inc.");
    assert.equal(result.sources.length, 1);
  } finally {
    globalThis.fetch = original;
  }
});

test("geo lookup rejects only after both providers fail", async () => {
  const original = globalThis.fetch;
  globalThis.fetch = async () => new Response("blocked", { status: 403 });
  try {
    await assert.rejects(lookupGeo("1.1.1.1"), /归属信息数据源暂不可用/);
  } finally {
    globalThis.fetch = original;
  }
});
