// components/checkout/EmbeddedStripeCheckout.tsx
"use client";

import React, { useState, Component, ErrorInfo, ReactNode } from "react";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

const STRIPE_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ||
  "pk_test_51TWfo7Ax3SEU946cBZx19LrYHgW5T9mjBYvvx0PnxG6hF4ROWkcAEOariKvBzZmem9jKh6pgU5BPZptKQVC8KQUu00zPeS7Con";

const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);

interface StripeFormProps {
  orderId: string;
  total: number;
  onPaymentSuccess: (orderId: string) => void;
  onCancel?: () => void;
}

// Internal Error Boundary to catch any Stripe rendering issues gracefully
class StripeErrorBoundary extends Component<{ children: ReactNode; onCancel?: () => void }, { hasError: boolean; errorText: string }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, errorText: "" };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, errorText: error?.message || "Payment form initialization error." };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Stripe Elements error caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-5 bg-red-50 border border-red-200 rounded-2xl text-center space-y-3">
          <div className="flex items-center justify-center gap-2 text-xs font-bold text-red-700">
            <span className="material-symbols-outlined text-sm">error</span>
            <span>Unable to load payment form</span>
          </div>
          <p className="text-xs text-red-600 max-w-sm mx-auto">
            {this.state.errorText}
          </p>
          <div className="flex items-center justify-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => this.setState({ hasError: false, errorText: "" })}
              className="px-4 py-2 bg-red-700 text-white font-bold text-xs rounded-xl hover:bg-red-800 transition-all cursor-pointer"
            >
              Retry Payment Form
            </button>
            {this.props.onCancel && (
              <button
                type="button"
                onClick={this.props.onCancel}
                className="px-4 py-2 bg-stone-100 text-stone-700 font-bold text-xs rounded-xl hover:bg-stone-200 transition-all cursor-pointer"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function StripePaymentForm({
  orderId,
  total,
  onPaymentSuccess,
  onCancel,
}: StripeFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const safeTotal = typeof total === "number" && !isNaN(total) && total > 0 ? total : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const returnUrl = `${window.location.origin}/dashboard/customer/orders?order_success=true&order_id=${orderId}`;

      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: returnUrl,
        },
        redirect: "if_required",
      });

      if (error) {
        if (error.type === "card_error" || error.type === "validation_error") {
          setErrorMessage(error.message || "Your payment details could not be verified.");
        } else {
          setErrorMessage(error.message || "An unexpected error occurred during payment.");
        }
        setIsProcessing(false);
        return;
      }

      if (paymentIntent && (paymentIntent.status === "succeeded" || paymentIntent.status === "processing")) {
        onPaymentSuccess(orderId);
      } else {
        window.location.href = returnUrl;
      }
    } catch (err: any) {
      console.error("Payment confirmation error:", err);
      setErrorMessage(err.message || "Payment confirmation failed. Please try again.");
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errorMessage && (
        <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-start gap-2.5 animate-fadeIn">
          <span className="material-symbols-outlined text-red-600 text-base mt-0.5 shrink-0">
            error
          </span>
          <div className="flex-1 font-medium leading-relaxed">{errorMessage}</div>
        </div>
      )}

      <div className="p-3 bg-white rounded-xl border border-stone-200 shadow-2xs">
        <PaymentElement
          id="payment-element"
          options={{
            layout: "tabs",
          }}
        />
      </div>

      <div className="flex items-center justify-between text-xs text-stone-500 pt-1">
        <div className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-emerald-600 text-sm">lock</span>
          <span>Guaranteed 256-Bit SSL Encrypted Payment</span>
        </div>
        <div className="font-semibold text-[#1b3b2b]">Total: ${safeTotal.toFixed(2)}</div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isProcessing}
            className="w-full sm:w-auto px-5 py-3 text-xs font-semibold text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-xl transition-all cursor-pointer disabled:opacity-50"
          >
            Back
          </button>
        )}

        <button
          type="submit"
          disabled={!stripe || !elements || isProcessing}
          className="w-full flex-1 py-3 px-6 rounded-xl bg-[#1b3b2b] hover:bg-[#142e21] text-white font-bold text-xs sm:text-sm transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
        >
          {isProcessing ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Authorizing Payment...</span>
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-base">verified_user</span>
              <span>Pay Now (${safeTotal.toFixed(2)})</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}

export default function EmbeddedStripeCheckout({
  clientSecret,
  orderId,
  total,
  onPaymentSuccess,
  onCancel,
}: {
  clientSecret: string;
  orderId: string;
  total: number;
  onPaymentSuccess: (orderId: string) => void;
  onCancel?: () => void;
}) {
  if (!clientSecret || typeof clientSecret !== "string" || !clientSecret.includes("_secret_")) {
    return (
      <div className="p-8 text-center bg-stone-50 rounded-2xl border border-stone-200">
        <div className="w-8 h-8 border-2 border-[#1b3b2b]/20 border-t-[#1b3b2b] rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs font-semibold text-stone-600">Initializing secure payment gateway...</p>
      </div>
    );
  }

  const safeTotal = typeof total === "number" && !isNaN(total) && total > 0 ? total : 0;

  return (
    <StripeErrorBoundary onCancel={onCancel}>
      <Elements
        stripe={stripePromise}
        options={{
          clientSecret,
          appearance: {
            theme: "stripe",
            variables: {
              colorPrimary: "#1b3b2b",
              colorBackground: "#ffffff",
              colorText: "#1c1917",
              colorDanger: "#dc2626",
              fontFamily: "system-ui, -apple-system, sans-serif",
              spacingUnit: "4px",
              borderRadius: "10px",
            },
            rules: {
              ".Input": {
                borderColor: "#e7e5e4",
                boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
              },
              ".Input:focus": {
                borderColor: "#1b3b2b",
                boxShadow: "0 0 0 1px #1b3b2b",
              },
              ".Tab": {
                borderColor: "#e7e5e4",
              },
              ".Tab--selected": {
                borderColor: "#1b3b2b",
                backgroundColor: "#f7f7f6",
              },
            },
          },
        }}
      >
        <StripePaymentForm
          orderId={orderId}
          total={safeTotal}
          onPaymentSuccess={onPaymentSuccess}
          onCancel={onCancel}
        />
      </Elements>
    </StripeErrorBoundary>
  );
}
