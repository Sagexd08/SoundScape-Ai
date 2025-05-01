import { NextRequest, NextResponse } from "next/server";

// Get PayPal credentials from environment variables
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_SECRET = process.env.PAYPAL_SECRET;
const PAYPAL_BASE_URL = process.env.PAYPAL_BASE_URL || "https://api-m.sandbox.paypal.com";

/**
 * Server-side function to get a PayPal access token
 */
async function getPayPalAccessToken(): Promise<string> {
  if (!PAYPAL_CLIENT_ID || !PAYPAL_SECRET) {
    throw new Error("PayPal credentials not configured");
  }

  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`).toString("base64");
  
  const response = await fetch(`${PAYPAL_BASE_URL}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Authorization": `Basic ${auth}`
    },
    body: "grant_type=client_credentials"
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(`Failed to get PayPal access token: ${data.error_description}`);
  }
  
  return data.access_token;
}

/**
 * API route to verify a PayPal order
 */
export async function POST(request: NextRequest) {
  try {
    const { orderId } = await request.json();
    
    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 }
      );
    }
    
    // Get PayPal access token
    const accessToken = await getPayPalAccessToken();
    
    // Verify the order with PayPal
    const response = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders/${orderId}`, {
      headers: {
        "Authorization": `Bearer ${accessToken}`
      }
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to verify PayPal order: ${data.message}`, verified: false },
        { status: 400 }
      );
    }
    
    // Check if the order is completed
    const isCompleted = data.status === "COMPLETED";
    
    return NextResponse.json({
      verified: isCompleted,
      status: data.status,
      orderId: data.id
    });
  } catch (error) {
    console.error("Error verifying PayPal order:", error);
    return NextResponse.json(
      { error: "Internal Server Error", verified: false },
      { status: 500 }
    );
  }
}
