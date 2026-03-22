"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "Segoe UI, sans-serif", padding: 24 }}>
        <h2>Something went wrong</h2>
        <p style={{ marginTop: 8, marginBottom: 16, color: "#6b7280" }}>
          {error.message || "Unexpected runtime error."}
        </p>
        <button
          onClick={() => reset()}
          style={{
            border: "none",
            borderRadius: 8,
            padding: "10px 14px",
            background: "#2563eb",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
