// Lemon Squeezy checkout URL generator
// Pass user_id through checkout to link purchases to accounts

// Map tool IDs to Lemon Squeezy store product/variant IDs
// These will need to be filled in when you set up products in Lemon Squeezy
export const LEMON_SQUEEZY_PRODUCTS: Record<string, { productId: string; variantId: string }> = {
  nsk: { productId: "", variantId: "" }, // NiagaraSidekick
  ssk: { productId: "", variantId: "" }, // SimulatorSidekick
  msk: { productId: "", variantId: "" }, // MetasysSidekick
};

// Your Lemon Squeezy store slug
const STORE_SLUG = "basidekick"; // Update this with your actual store slug

/**
 * Generate a Lemon Squeezy checkout URL with user_id passthrough
 * @param toolId - The tool being purchased (nsk, ssk, msk)
 * @param userId - The authenticated user's ID
 * @returns Checkout URL string
 */
export function generateCheckoutUrl(toolId: string, userId: string): string | null {
  const product = LEMON_SQUEEZY_PRODUCTS[toolId];

  if (!product || !product.variantId) {
    console.warn(`No Lemon Squeezy variant configured for tool: ${toolId}`);
    return null;
  }

  // Build the checkout URL with custom data
  // Lemon Squeezy checkout URL format with custom data
  const baseUrl = `https://${STORE_SLUG}.lemonsqueezy.com/checkout/buy/${product.variantId}`;

  // Add custom data as query params
  // checkout[custom][user_id] passes through to webhook
  const params = new URLSearchParams({
    "checkout[custom][user_id]": userId,
  });

  return `${baseUrl}?${params.toString()}`;
}

/**
 * Check if a tool ID is valid and has checkout configured
 */
export function isCheckoutConfigured(toolId: string): boolean {
  const product = LEMON_SQUEEZY_PRODUCTS[toolId];
  return !!(product && product.variantId);
}
