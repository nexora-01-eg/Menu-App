"use client";

const VISITOR_KEY = "nexora_visitor_id";
const SESSION_SEEN_KEY = "nexora_session_seen";

/** Persistent per-browser id (localStorage) — lets analytics tell unique vs. repeat visitors apart without requiring an account. */
export function getVisitorId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem(VISITOR_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(VISITOR_KEY, id);
  }
  return id;
}

type EventType =
  | "VIEW"
  | "SCAN"
  | "PRODUCT_CLICK"
  | "WHATSAPP_CLICK"
  | "CALL_CLICK"
  | "SHARE"
  | "CATEGORY_VIEW"
  | "SEARCH";

interface TrackOptions {
  productId?: string;
  categoryId?: string;
  query?: string;
  /** Only fire once per browser tab session (sessionStorage) — used for the noisy "menu opened" event. */
  oncePerSession?: boolean;
}

export function track(restaurantSlug: string, type: EventType, options: TrackOptions = {}) {
  if (typeof window === "undefined") return;

  if (options.oncePerSession) {
    const key = `${SESSION_SEEN_KEY}:${restaurantSlug}:${type}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
  }

  const payload = JSON.stringify({
    restaurantSlug,
    type,
    visitorId: getVisitorId(),
    productId: options.productId,
    categoryId: options.categoryId,
    query: options.query,
  });

  // sendBeacon survives page navigation/unload; fetch+keepalive is the fallback.
  if (navigator.sendBeacon) {
    const blob = new Blob([payload], { type: "application/json" });
    navigator.sendBeacon("/api/track", blob);
  } else {
    fetch("/api/track", { method: "POST", body: payload, keepalive: true }).catch(() => {});
  }
}
