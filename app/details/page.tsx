"use client";

import { useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function DetailsPage() {
  const params = useSearchParams();
  const router = useRouter();

  const bundle = Number(params.get("bundle") || "0");
  const bundleLabel = useMemo(() => {
    if (bundle === 1) return "1 ticket for $2";
    if (bundle === 3) return "3 tickets for $5";
    if (bundle === 8) return "8 tickets for $10";
    return "";
  }, [bundle]);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [ticketNumbers, setTicketNumbers] = useState<number[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (![1, 3, 8].includes(bundle)) {
    return (
      <main style={{ padding: 24, maxWidth: 520, margin: "0 auto" }}>
        <h1>Invalid bundle</h1>
        <button onClick={() => router.push("/")} style={btn}>
          Back
        </button>
      </main>
    );
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bundle_qty: bundle,
          full_name: fullName,
          phone,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json?.error || "Something went wrong");
        setLoading(false);
        return;
      }

      setTicketNumbers(json.ticketNumbers);
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  if (ticketNumbers) {
    return (
      <main style={{ padding: 24, maxWidth: 520, margin: "0 auto" }}>
        <h1>All set</h1>
        <p><strong>Selected:</strong> {bundleLabel}</p>
        <p><strong>Your ticket numbers:</strong></p>
        <div style={box}>{ticketNumbers.join(", ")}</div>

        <button onClick={() => router.push("/")} style={{ ...btn, marginTop: 16 }}>
          Add another entry
        </button>
      </main>
    );
  }

  return (
    <main style={{ padding: 24, maxWidth: 520, margin: "0 auto" }}>
      <h1>Your details</h1>
      <p><strong>Selected:</strong> {bundleLabel}</p>

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12, marginTop: 16 }}>
        <input
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Full name"
          style={input}
          required
        />
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Mobile number"
          style={input}
          required
        />

        {error && <p style={{ color: "crimson" }}>{error}</p>}

        <button disabled={loading} type="submit" style={btn}>
          {loading ? "Saving…" : "Confirm"}
        </button>
      </form>
    </main>
  );
}

const input: React.CSSProperties = {
  padding: "14px 12px",
  fontSize: 16,
  borderRadius: 10,
  border: "1px solid #ccc",
};

const btn: React.CSSProperties = {
  padding: "16px 14px",
  fontSize: 18,
  borderRadius: 12,
  border: "1px solid #ccc",
  cursor: "pointer",
  textAlign: "left",
  background: "white",
};

const box: React.CSSProperties = {
  padding: 12,
  borderRadius: 10,
  border: "1px solid #ccc",
  background: "#fafafa",
  marginTop: 8,
  fontSize: 16,
};
