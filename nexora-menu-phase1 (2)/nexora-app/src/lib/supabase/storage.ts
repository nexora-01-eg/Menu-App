import type { SupabaseClient } from "@supabase/supabase-js";

export const PRODUCT_IMAGES_BUCKET = "product-images";

/**
 * Storage path convention: {restaurantId}/{productId}-{timestamp}.jpg
 * — namespaced by restaurant so Storage RLS policies can allow a user
 * to write only under their own restaurant's folder (see the bucket
 * policy SQL in README.md), and timestamped so "replace image" never
 * collides with a cached CDN copy of the old file.
 */
export function productImagePath(restaurantId: string, productId: string) {
  return `${restaurantId}/${productId}-${Date.now()}.jpg`;
}

export async function uploadProductImage(
  supabase: SupabaseClient,
  path: string,
  blob: Blob,
): Promise<{ publicUrl: string } | { error: string }> {
  const { error } = await supabase.storage
    .from(PRODUCT_IMAGES_BUCKET)
    .upload(path, blob, { contentType: "image/jpeg", upsert: true });

  if (error) return { error: error.message };

  const { data } = supabase.storage.from(PRODUCT_IMAGES_BUCKET).getPublicUrl(path);
  return { publicUrl: data.publicUrl };
}

export async function deleteProductImageByUrl(supabase: SupabaseClient, imageUrl: string) {
  // Extract the storage path back out of a public URL of the form
  // ".../object/public/product-images/<path>".
  const marker = `/${PRODUCT_IMAGES_BUCKET}/`;
  const idx = imageUrl.indexOf(marker);
  if (idx === -1) return;
  const path = imageUrl.slice(idx + marker.length);
  await supabase.storage.from(PRODUCT_IMAGES_BUCKET).remove([path]);
}

// ── Restaurant assets (logo / cover) — separate bucket from product
// photos, since the two are managed on entirely different pages and
// benefit from independent RLS policies. ────────────────────────────

export const RESTAURANT_ASSETS_BUCKET = "restaurant-assets";

export function restaurantLogoPath(restaurantId: string) {
  return `${restaurantId}/logo-${Date.now()}.jpg`;
}

export function restaurantCoverPath(restaurantId: string) {
  return `${restaurantId}/cover-${Date.now()}.jpg`;
}

export async function uploadRestaurantAsset(
  supabase: SupabaseClient,
  path: string,
  blob: Blob,
): Promise<{ publicUrl: string } | { error: string }> {
  const { error } = await supabase.storage
    .from(RESTAURANT_ASSETS_BUCKET)
    .upload(path, blob, { contentType: "image/jpeg", upsert: true });

  if (error) return { error: error.message };

  const { data } = supabase.storage.from(RESTAURANT_ASSETS_BUCKET).getPublicUrl(path);
  return { publicUrl: data.publicUrl };
}

export async function deleteRestaurantAssetByUrl(supabase: SupabaseClient, imageUrl: string) {
  const marker = `/${RESTAURANT_ASSETS_BUCKET}/`;
  const idx = imageUrl.indexOf(marker);
  if (idx === -1) return;
  const path = imageUrl.slice(idx + marker.length);
  await supabase.storage.from(RESTAURANT_ASSETS_BUCKET).remove([path]);
}
