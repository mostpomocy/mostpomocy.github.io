import { campaignFromSearch } from "./short-links.mjs";
export type Campaign = {
  code: string;
  source: string;
  medium: string;
  campaign: string;
};
export function startAnalytics(measurementId: string) {
  if (
    !/^G-[A-Z0-9]+$/.test(measurementId) ||
    location.pathname.startsWith("/admin")
  )
    return false;
  const w = window as any;
  if (w.mpAnalyticsId === measurementId) return true;
  w.dataLayer = w.dataLayer || [];
  w.gtag = function () {
    w.dataLayer.push(arguments);
  };
  w.gtag("js", new Date());
  w.gtag("config", measurementId, {
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
  });
  const script = document.createElement("script");
  script.src = "https://www.googletagmanager.com/gtag/js?id=" + measurementId;
  script.async = true;
  script.id = "mp-ga-script";
  document.head.appendChild(script);
  w.mpAnalyticsId = measurementId;
  return true;
}
export function trackCampaign(context: Campaign, done?: () => void) {
  const w = window as any;
  if (!w.gtag) {
    done?.();
    return;
  }
  // Public campaign labels only. Do not send the destination URL or personal data.
  w.gtag("event", "campaign_open", {
    link_code: context.code,
    link_source: context.source,
    link_medium: context.medium,
    link_campaign: context.campaign,
    event_callback: done,
    event_timeout: 1200,
  });
}
export function trackLandingCampaign() {
  const context = campaignFromSearch(location.search);
  const w = window as any;
  if (context && !w.mpCampaignTracked) {
    w.mpCampaignTracked = true;
    trackCampaign(context);
  }
}
