"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("DineDesk Global Error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ fontFamily: "sans-serif", margin: 0, padding: "40px", backgroundColor: "#f7f7f4", color: "#252b26" }}>
        <div style={{ maxWidth: "500px", margin: "60px auto", textAlign: "center", background: "#fff", padding: "32px", borderRadius: "12px", border: "1px solid #e3e5df" }}>
          <h2 style={{ color: "#1f3d2b", marginBottom: "12px" }}>Application Encountered an Error</h2>
          <p style={{ color: "#686d67", fontSize: "14px", lineHeight: "1.6" }}>
            {error?.message || "An unexpected error occurred."}
          </p>
          <button
            onClick={() => reset()}
            style={{ marginTop: "20px", padding: "10px 20px", backgroundColor: "#1f3d2b", color: "#f7f7f4", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: 600 }}
          >
            Try Again
          </button>
        </div>
      </body>
    </html>
  );
}
