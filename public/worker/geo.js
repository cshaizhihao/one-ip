import { HttpError, publicIp, upstream } from "./http.js";

const cachedLookup = { cf: { cacheEverything: true, cacheTtl: 600 } };

export function cfGeo(request) {
  const cf = request.cf ?? {};
  return {
    ip: request.headers.get("CF-Connecting-IP") ?? "",
    country: cf.country,
    country_code: cf.country,
    region: cf.region,
    city: cf.city,
    isp: cf.asOrganization,
    asn: cf.asn,
    latitude: cf.latitude ? Number(cf.latitude) : undefined,
    longitude: cf.longitude ? Number(cf.longitude) : undefined,
    timezone: cf.timezone,
    source: "Cloudflare request.cf",
  };
}
export async function geoIp(ip) {
  publicIp(ip);
  const data = await upstream(
    `https://ipwho.is/${encodeURIComponent(ip)}`,
    cachedLookup,
  );
  if (!data.success) throw new Error("IP 归属地数据源未返回有效结果");
  return {
    ip: data.ip,
    country: data.country,
    country_code: data.country_code,
    region: data.region,
    city: data.city,
    isp: data.connection?.isp,
    asn: data.connection?.asn,
    latitude: data.latitude,
    longitude: data.longitude,
    timezone: data.timezone?.id,
    source: "ipwho.is",
  };
}
export async function secondaryGeo(ip) {
  publicIp(ip);
  const data = await upstream(
    `https://api.ip.sb/geoip/${encodeURIComponent(ip)}`,
    cachedLookup,
  );
  if (!data.ip) throw new Error("第二归属地数据源未返回结果");
  return {
    ip: data.ip,
    country: data.country,
    country_code: data.country_code,
    city: data.city,
    isp: data.isp,
    asn: data.asn,
    latitude: data.latitude,
    longitude: data.longitude,
    source: "ip.sb",
  };
}

export async function lookupGeo(ip) {
  publicIp(ip);
  const results = await Promise.allSettled([geoIp(ip), secondaryGeo(ip)]);
  const sources = results.flatMap((result) =>
    result.status === "fulfilled" ? [result.value] : [],
  );
  if (!sources.length) {
    const limited = results.some(
      (result) =>
        result.status === "rejected" &&
        result.reason instanceof HttpError &&
        result.reason.status === 429,
    );
    throw new HttpError(
      limited ? 429 : 502,
      limited ? "归属信息数据源限流，请稍后重试" : "归属信息数据源暂不可用",
    );
  }
  return { geo: sources[0], sources };
}
