// PayPal API credentials
const PAYPAL_CLIENT_ID = "AXcOdgEGHS4fKTHo8znVCPFPEySB3LViyUad-FdvaOOcdZrWf_W5P5ke5nGka8_OfHeREmLH0iHdyIbF";
const PAYPAL_SECRET = "EFNbmwSzzVT0nabkEFWzVaPOQltynrNQVnYGIl3cl_1KWB6lvhOFXOizrV3CsVaRkNhDTbtNSaLY7C-7";

// PayPal API base URL (sandbox or live)
const PAYPAL_BASE_URL = "https://api-m.sandbox.paypal.com";

/**
 * Get an access token from PayPal API
 */
export async function getPayPalAccessToken(): Promise<string> {
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
 * Verify a PayPal transaction
 */
export async function verifyPayPalTransaction(orderId: string): Promise<any> {
  const accessToken = await getPayPalAccessToken();
  
  const response = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders/${orderId}`, {
    headers: {
      "Authorization": `Bearer ${accessToken}`
    }
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(`Failed to verify PayPal transaction: ${data.message}`);
  }
  
  return data;
}

/**
 * Create a subscription in PayPal
 */
export async function createSubscription(planId: string, customerId: string): Promise<any> {
  const accessToken = await getPayPalAccessToken();
  
  const response = await fetch(`${PAYPAL_BASE_URL}/v1/billing/subscriptions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${accessToken}`
    },
    body: JSON.stringify({
      plan_id: planId,
      subscriber: {
        name: {
          given_name: "SoundScape",
          surname: "User"
        },
        email_address: customerId
      },
      application_context: {
        brand_name: "SoundScape AI",
        locale: "en-US",
        shipping_preference: "NO_SHIPPING",
        user_action: "SUBSCRIBE_NOW",
        payment_method: {
          payer_selected: "PAYPAL",
          payee_preferred: "IMMEDIATE_PAYMENT_REQUIRED"
        },
        return_url: `${window.location.origin}/payment/success`,
        cancel_url: `${window.location.origin}/payment/cancel`
      }
    })
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(`Failed to create subscription: ${data.message}`);
  }
  
  return data;
}
