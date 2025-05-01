// PayPal API base URL (sandbox or live)
const PAYPAL_BASE_URL = "https://api-m.sandbox.paypal.com";

// Get PayPal client ID from environment variables
const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "sb";

/**
 * Client-side function to get the PayPal Client ID
 */
export function getPayPalClientId(): string {
  return PAYPAL_CLIENT_ID;
}

/**
 * Client-side function to verify a PayPal transaction
 * This should be called from a server action or API route
 */
export async function verifyPayPalOrder(orderId: string): Promise<boolean> {
  try {
    const response = await fetch('/api/verify-paypal-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ orderId }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Error verifying PayPal order:', data.error);
      return false;
    }

    return data.verified;
  } catch (error) {
    console.error('Failed to verify PayPal order:', error);
    return false;
  }
}
