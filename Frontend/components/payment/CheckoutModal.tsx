"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import PayPalCheckout from "./PayPalCheckout";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  planName: string;
  amount: number;
  isAnnual: boolean;
}

export default function CheckoutModal({
  isOpen,
  onClose,
  planName,
  amount,
  isAnnual,
}: CheckoutModalProps) {
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "processing" | "success" | "error">("idle");
  const [paymentDetails, setPaymentDetails] = useState<any>(null);

  const handlePaymentSuccess = (details: any) => {
    setPaymentStatus("success");
    setPaymentDetails(details);
    
    // In a real application, you would call your backend API to record the subscription
    console.log("Payment successful", details);
    
    // Close the modal after 3 seconds
    setTimeout(() => {
      onClose();
      setPaymentStatus("idle");
      setPaymentDetails(null);
    }, 3000);
  };

  const handlePaymentError = (error: any) => {
    setPaymentStatus("error");
    console.error("Payment failed", error);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 20 }}
            className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-xl w-full max-w-md p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Checkout</h2>
              <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-400 hover:text-white">
                <X className="h-5 w-5" />
              </Button>
            </div>

            {paymentStatus === "success" ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Payment Successful!</h3>
                <p className="text-gray-400 mb-4">
                  Thank you for subscribing to SoundScape AI {planName} plan.
                </p>
                <p className="text-sm text-gray-500">
                  Transaction ID: {paymentDetails?.id || "N/A"}
                </p>
              </div>
            ) : paymentStatus === "error" ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Payment Failed</h3>
                <p className="text-gray-400 mb-4">
                  There was an issue processing your payment. Please try again.
                </p>
                <Button onClick={() => setPaymentStatus("idle")}>Try Again</Button>
              </div>
            ) : (
              <>
                <div className="mb-6 p-4 bg-gray-800/50 rounded-lg">
                  <h3 className="font-semibold mb-2">{planName} Plan</h3>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">{isAnnual ? "Annual" : "Monthly"} Subscription</span>
                    <span className="text-xl font-bold">${amount}</span>
                  </div>
                  {isAnnual && (
                    <div className="mt-2 text-sm text-indigo-400">
                      You save 20% with annual billing!
                    </div>
                  )}
                </div>

                <div className="mb-6">
                  <PayPalCheckout
                    amount={amount}
                    onSuccess={handlePaymentSuccess}
                    onError={handlePaymentError}
                  />
                </div>

                <div className="text-center text-sm text-gray-500">
                  By completing this purchase, you agree to our{" "}
                  <a href="/terms" className="text-indigo-400 hover:underline">
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a href="/privacy" className="text-indigo-400 hover:underline">
                    Privacy Policy
                  </a>
                  .
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
