import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";

// Get PayPal webhook secret from environment variables
const PAYPAL_WEBHOOK_ID = process.env.PAYPAL_WEBHOOK_ID;

/**
 * Verify the PayPal webhook signature
 */
async function verifyWebhookSignature(
  body: string,
  headers: Headers
): Promise<boolean> {
  if (!PAYPAL_WEBHOOK_ID) {
    console.error("PayPal webhook ID not configured");
    return false;
  }

  try {
    // Get the PayPal signature from the headers
    const transmissionId = headers.get("paypal-transmission-id");
    const timestamp = headers.get("paypal-transmission-time");
    const webhookSignature = headers.get("paypal-transmission-sig");
    const certUrl = headers.get("paypal-cert-url");

    if (!transmissionId || !timestamp || !webhookSignature || !certUrl) {
      console.error("Missing required PayPal webhook headers");
      return false;
    }

    // Construct the validation message
    const validationMessage = `${transmissionId}|${timestamp}|${PAYPAL_WEBHOOK_ID}|${body}`;

    // In a production environment, you would fetch the PayPal certificate from certUrl
    // and use it to verify the signature. For simplicity, we're using a basic HMAC verification.
    const hmac = createHmac("sha256", PAYPAL_WEBHOOK_ID);
    hmac.update(validationMessage);
    const expectedSignature = hmac.digest("base64");

    // Compare signatures using a timing-safe comparison
    const signatureBuffer = Buffer.from(webhookSignature);
    const expectedBuffer = Buffer.from(expectedSignature);

    return signatureBuffer.length === expectedBuffer.length &&
      timingSafeEqual(signatureBuffer, expectedBuffer);
  } catch (error) {
    console.error("Error verifying webhook signature:", error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get the raw request body for signature verification
    const rawBody = await request.text();
    const body = JSON.parse(rawBody);

    // Verify the webhook signature
    const isVerified = await verifyWebhookSignature(rawBody, request.headers);

    if (!isVerified) {
      console.error("Invalid webhook signature");
      return NextResponse.json(
        { error: "Invalid webhook signature" },
        { status: 401 }
      );
    }

    // Log the webhook event
    console.log("PayPal Webhook Event:", body);

    // Handle different event types
    const eventType = body.event_type;

    switch (eventType) {
      case "PAYMENT.CAPTURE.COMPLETED":
        // Payment was captured successfully
        // Update user subscription in your database
        break;

      case "PAYMENT.CAPTURE.DENIED":
        // Payment was denied
        // Handle failed payment
        break;

      case "BILLING.SUBSCRIPTION.CREATED":
        // Subscription was created
        // Provision access to the subscribed plan
        break;

      case "BILLING.SUBSCRIPTION.CANCELLED":
        // Subscription was cancelled
        // Remove access to the subscribed plan
        break;

      default:
        // Handle other event types
        break;
    }

    // Return a 200 response to acknowledge receipt of the event
    return NextResponse.json({ status: "success" });
  } catch (error) {
    console.error("Error processing PayPal webhook:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
