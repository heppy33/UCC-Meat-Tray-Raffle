"use client";

import { useState } from "react";

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [winner, setWinner] = useState<any>(null);

  async function call(path: string) {
    setMessage(null);
    setWinner(null);

    const res = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    const json = await res.json();
    if (!res.ok) {
      setMessage(json?.error || "Error");
      return;
    }

    if (json.winner) setWinner(json);
    setMessage("Done");
  }

  return (
    <main style={{ padding: 24, maxWidth: 720, margin: "0 auto" }}>
      <h1>Admin</h1>

      <input
        type="password"
        placeholder="Admin password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ padding: 12, width: "100%", maxWidth: 360 }}
      />

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12 }}>
        <button onClick={() => call("/api/admin/close")}>Close selling</button>
        <button onClick={() => call("/api/admin/reopen")}>Reopen selling</button>
        <button onClick={() => call("/api/admin/draw")}>Draw winner</button>
        <button onClick={() => call("/api/admin/new-round")}>Start new raffle</button>
      </div>

      {message && <p style={{ marginTop: 12 }}>{message}</p>}

      {winner && (
        <div style={{ marginTop: 12 }}>
          <h2>Winner</h2>
          <p><strong>Ticket:</strong> {winner.winning_ticket_number}</p>
          <p><strong>Name:</strong> {winner.winner?.full_name}</p>
          <p><strong>Phone:</strong> {winner.winner?.phone}</p>
        </div>
      )}
    </main>
  );
}
