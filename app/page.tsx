"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/status")
      .then((r) => r.json())
      .then((j) => setStatus(j.round?.status ?? "closed"));
  }, []);

  if (!status) return <main style={{ padding: 24 }}>Loading…</main>;

  if (status !== "open") {
    return (
      <main style={{ padding: 24, maxWidth: 520, margin: "0 auto" }}>
        <h1>Selling closed</h1>
        <p>Entries are now closed for this draw.</p>
      </main>
    );
  }

  return (
    <main style={{ padding: 24, maxWidth: 520, margin: "0 auto" }}>
      <h1>How many tickets would you like?</h1>

      <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
        <button onClick={() => router.push("/details?bundle=1")} style={btn}>
          1 ticket for $2
        </button>
        <button onClick={() => router.push("/details?bundle=3")} style={btn}>
          3 tickets for $5
        </button>
        <button onClick={() => router.push("/details?bundle=8")} style={btn}>
          8 tickets for $10
        </button>
      </div>
    </main>
  );
}

const btn: React.CSSProperties = {
  padding: "16px 14px",
  fontSize: 18,
  borderRadius: 12,
  border: "1px solid #ccc",
  cursor: "pointer",
  textAlign: "left",
  background: "white",
};
