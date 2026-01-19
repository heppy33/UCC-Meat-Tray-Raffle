import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import crypto from "crypto";

export async function POST(req: Request) {
  const { password } = await req.json();

  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: round } = await supabaseAdmin
    .from("raffle_rounds")
    .select("id,status")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (!round || round.status !== "closed") {
    return NextResponse.json({ error: "Round must be closed" }, { status: 409 });
  }

  const { data: tickets } = await supabaseAdmin
    .from("tickets")
    .select("ticket_number,purchase_id")
    .eq("raffle_round_id", round.id);

  if (!tickets || tickets.length === 0) {
    return NextResponse.json({ error: "No tickets sold" }, { status: 409 });
  }

  const winnerTicket = tickets[crypto.randomInt(0, tickets.length)];

  const { data: purchase } = await supabaseAdmin
    .from("purchases")
    .select("full_name,phone")
    .eq("id", winnerTicket.purchase_id)
    .single();

  await supabaseAdmin
    .from("raffle_rounds")
    .update({
      status: "drawn",
      drawn_at: new Date().toISOString(),
      winning_ticket_number: winnerTicket.ticket_number,
    })
    .eq("id", round.id);

  return NextResponse.json({
    winning_ticket_number: winnerTicket.ticket_number,
    winner: purchase,
  });
}
