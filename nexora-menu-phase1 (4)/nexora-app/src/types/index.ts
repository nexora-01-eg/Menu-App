export type MemberRole = "OWNER" | "MANAGER" | "STAFF";
export type OfferType = "HAPPY_HOUR" | "COUPON" | "BANNER";
export type PlanTier = "FREE" | "STARTER" | "PRO" | "BUSINESS" | "ENTERPRISE";

export interface Restaurant {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  logoUrl: string | null;
  themeAccent: string;
  themeMode: "dark" | "light" | "auto";
  phone: string | null;
  whatsapp: string | null;
  instagram: string | null;
  facebook: string | null;
  googleMapsUrl: string | null;
  isPublished: boolean;
}

export interface Branch {
  id: string;
  restaurantId: string;
  name: string;
  address: string | null;
  isPrimary: boolean;
}

export interface Category {
  id: string;
  restaurantId: string;
  name: string;
  sortOrder: number;
}

export interface Product {
  id: string;
  restaurantId: string;
  categoryId: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  price: number;
  oldPrice: number | null;
  offerPrice: number | null;
  isAvailable: boolean;
  isFeatured: boolean;
  sortOrder: number;
}

export interface Offer {
  id: string;
  restaurantId: string;
  type: OfferType;
  title: string;
  description: string | null;
  code: string | null;
  discountPercent: number | null;
  isActive: boolean;
}

export interface QrCodeStyle {
  fgColor: string;
  cornerStyle: "rounded" | "square" | "dots";
  hasLogo: boolean;
  frameText: string;
}

export interface DashboardKpis {
  totalViews: number;
  todayVisitors: number;
  weeklyVisitors: number;
  qrScans: number;
}
