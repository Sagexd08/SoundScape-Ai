"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";

interface PayPalCheckoutProps {
  amount: number;
  currency?: string;
  onSuccess: (details: any) => void;
  onError?: (error: any) => void;
}

declare global {
  interface Window {
    paypal?: any;
  }
}

export default function PayPalCheckout({
  amount,
  currency = "USD",
  onSuccess,
  onError,
}: PayPalCheckoutProps) {
  const paypalRef = useRef<HTMLDivElement>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [paypalButtonRendered, setPaypalButtonRendered] = useState(false);

  // PayPal client ID
  const clientId = "AXcOdgEGHS4fKTHo8znVCPFPEySB3LViyUad-FdvaOOcdZrWf_W5P5ke5nGka8_OfHeREmLH0iHdyIbF";

  useEffect(() => {
    // Only render PayPal buttons once the script has loaded and the component has mounted
    if (scriptLoaded && paypalRef.current && !paypalButtonRendered) {
      // Clear any existing buttons
      paypalRef.current.innerHTML = "";

      window.paypal
        .Buttons({
          createOrder: (data: any, actions: any) => {
            return actions.order.create({
              purchase_units: [
                {
                  amount: {
                    value: amount.toString(),
                    currency_code: currency,
                  },
                  description: "SoundScape AI Subscription",
                },
              ],
            });
          },
          onApprove: async (data: any, actions: any) => {
            const details = await actions.order.capture();
            onSuccess(details);
          },
          onError: (err: any) => {
            console.error("PayPal Error:", err);
            if (onError) onError(err);
          },
          style: {
            layout: "vertical",
            color: "blue",
            shape: "rect",
            label: "pay",
          },
        })
        .render(paypalRef.current);

      setPaypalButtonRendered(true);
    }
  }, [scriptLoaded, amount, currency, onSuccess, onError, paypalButtonRendered]);

  // Reset the button rendered state if amount changes
  useEffect(() => {
    setPaypalButtonRendered(false);
  }, [amount]);

  return (
    <div className="w-full">
      <Script
        src={`https://www.paypal.com/sdk/js?client-id=${clientId}&currency=${currency}`}
        onLoad={() => setScriptLoaded(true)}
        strategy="lazyOnload"
      />
      <div ref={paypalRef} className="w-full min-h-[150px] flex items-center justify-center">
        {!scriptLoaded && (
          <div className="text-center py-4">
            <div className="animate-pulse bg-gray-700 h-10 w-full rounded-md mb-2"></div>
            <div className="animate-pulse bg-gray-700 h-10 w-full rounded-md"></div>
          </div>
        )}
      </div>
    </div>
  );
}
