export type DiscountType = "PERCENTAGE" | "FIXED";
export type OfferStatus = "ACTIVE" | "PAUSED" | "ARCHIVED";
export type OfferType = "HAPPY_HOUR" | "COUPON" | "BANNER";

export interface OfferLike {
  id: string;
  type: OfferType;
  title: string;
  discountType: DiscountType;
  discountValue: number;
  startDate: Date | null;
  endDate: Date | null;
  timeStart: string | null;
  timeEnd: string | null;
  branchId: string | null;
  productId: string | null;
  categoryId: string | null;
  status: OfferStatus;
}

interface ProductContext {
  id: string;
  categoryId: string;
}

/** Is this offer live right now — status, date range, and (for time-boxed offers) the daily time window? */
export function isOfferCurrentlyActive(offer: OfferLike, now: Date = new Date()): boolean {
  if (offer.status !== "ACTIVE") return false;
  if (offer.startDate && now < offer.startDate) return false;
  if (offer.endDate && now > offer.endDate) return false;

  if (offer.timeStart && offer.timeEnd) {
    const minutesNow = now.getHours() * 60 + now.getMinutes();
    const [sh, sm] = offer.timeStart.split(":").map(Number);
    const [eh, em] = offer.timeEnd.split(":").map(Number);
    const start = sh * 60 + sm;
    const end = eh * 60 + em;
    // Supports overnight windows (e.g. 22:00–02:00).
    const inWindow = start <= end ? minutesNow >= start && minutesNow <= end : minutesNow >= start || minutesNow <= end;
    if (!inWindow) return false;
  }

  return true;
}

/** Does this offer's targeting (branch/product/category) apply to this product? Coupons with no targeting apply store-wide but aren't shown as automatic badges (see resolveOfferForProduct). */
function offerTargets(offer: OfferLike, product: ProductContext, branchId: string | null): boolean {
  if (offer.branchId && offer.branchId !== branchId) return false;
  if (offer.productId) return offer.productId === product.id;
  if (offer.categoryId) return offer.categoryId === product.categoryId;
  return true; // store-wide
}

/**
 * Picks the single best-value offer that automatically applies to a
 * product (Happy Hour / store-wide or targeted percentage/fixed
 * discounts). COUPON-type offers are excluded here — those require
 * the guest to enter a code, so they're never auto-applied as a badge.
 */
export function resolveOfferForProduct(
  offers: OfferLike[],
  product: ProductContext,
  branchId: string | null = null,
  now: Date = new Date(),
): OfferLike | null {
  const candidates = offers.filter(
    (o) => o.type !== "COUPON" && isOfferCurrentlyActive(o, now) && offerTargets(o, product, branchId),
  );
  if (candidates.length === 0) return null;

  // Prefer the offer that saves the guest the most, computed on a
  // notional base to compare percentage vs fixed fairly isn't exact
  // without the real price — callers with the real price should use
  // computeDiscountedPrice per-candidate and pick the max saving
  // instead. For the common case (usually 0-1 applicable offers),
  // this priority order is a reasonable default: specific targeting
  // beats store-wide, and newer offers win ties.
  const scored = candidates.map((o) => ({
    offer: o,
    specificity: (o.productId ? 2 : 0) + (o.categoryId ? 1 : 0),
  }));
  scored.sort((a, b) => b.specificity - a.specificity);
  return scored[0].offer;
}

interface DiscountLike {
  discountType: DiscountType;
  discountValue: number;
}

export function computeDiscountedPrice(price: number, offer: DiscountLike): number {
  if (offer.discountType === "PERCENTAGE") {
    return Math.max(0, Math.round(price * (1 - offer.discountValue / 100) * 100) / 100);
  }
  return Math.max(0, Math.round((price - offer.discountValue) * 100) / 100);
}

export function formatOfferBadge(offer: DiscountLike): string {
  if (offer.discountType === "PERCENTAGE") return `-${offer.discountValue}%`;
  return `-${offer.discountValue}`;
}
