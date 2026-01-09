import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import crypto from "crypto";
import { z } from "zod";

// Map Lemon Squeezy product IDs to our tool IDs
const PRODUCT_MAP: Record<string, string> = {
  // Add your Lemon Squeezy product IDs here
  // "123456": "nsk",
  // "123457": "ssk",
  // "123458": "msk",
};

// Schema for validating webhook custom data
const customDataSchema = z.object({
  user_id: z.string().uuid("Invalid user_id format"),
});

// Generate a cryptographically secure license key
function generateLicenseKey(toolId: string, orderNumber: string): string {
  const randomPart = crypto.randomBytes(6).toString("hex").toUpperCase();
  return `${toolId.toUpperCase()}-${orderNumber}-${randomPart}`;
}

// Verify webhook signature from Lemon Squeezy
function verifySignature(payload: string, signature: string, secret: string): boolean {
  const hmac = crypto.createHmac("sha256", secret);
  const digest = hmac.update(payload).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
}

export async function POST(request: Request) {
  const webhookSecret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("LEMONSQUEEZY_WEBHOOK_SECRET not configured");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  // Get signature from headers
  const signature = request.headers.get("x-signature");
  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 401 });
  }

  // Get raw body for signature verification
  const rawBody = await request.text();

  // Verify signature
  if (!verifySignature(rawBody, signature, webhookSecret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  // Parse the webhook payload
  const payload = JSON.parse(rawBody);
  const eventName = payload.meta?.event_name;

  // Only handle order_created events
  if (eventName !== "order_created") {
    return NextResponse.json({ received: true });
  }

  const order = payload.data;
  const attributes = order.attributes;

  // Validate and get user_id from custom data (passed during checkout)
  const customDataResult = customDataSchema.safeParse(payload.meta?.custom_data);

  if (!customDataResult.success) {
    console.error("Invalid custom_data in webhook:", customDataResult.error.flatten());
    return NextResponse.json({ error: "Invalid custom_data" }, { status: 400 });
  }

  const userId = customDataResult.data.user_id;

  // Get product info
  const productId = attributes.first_order_item?.product_id?.toString();
  const toolId = productId ? PRODUCT_MAP[productId] : null;

  if (!toolId) {
    console.error(`Unknown product ID: ${productId}`);
    // Still return 200 to acknowledge receipt
    return NextResponse.json({ received: true, warning: "Unknown product" });
  }

  // Create Supabase admin client (bypasses RLS)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Supabase credentials not configured");
    return NextResponse.json({ error: "Database not configured" }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Create license record with cryptographically secure key
  const licenseKey = generateLicenseKey(toolId, attributes.order_number);

  const { error } = await supabase.from("licenses").insert({
    user_id: userId,
    product_id: toolId,
    license_key: licenseKey,
    lemon_squeezy_order_id: order.id,
    purchased_at: new Date().toISOString(),
    expires_at: null, // Lifetime license
    is_active: true,
  });

  if (error) {
    console.error("Failed to create license:", error);
    return NextResponse.json({ error: "Failed to create license" }, { status: 500 });
  }

  // Don't log the actual license key for security
  console.log(`License created for user ${userId}, product ${toolId}`);

  return NextResponse.json({ success: true, license_key: licenseKey });
}
