import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type Body = {
  bundle_qty: 1 | 3 | 8;
  full_name: string;
  phone: string;
};

export async function POST(req: Request) {
  const body = (await req.json()) as Body;

  const full_name = (body.full_name || "").trim();
  const phone = (body.phone || "").trim();
  const bundle_qty = body.bundle_qty;

  if (!full_name || !phone || ![1, 3, 8].includes(bundle_qty)) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { data: round } = await supabaseAdmin
    .from("raffle_rounds")
    .select("id,status")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (!round || round.status !== "open") {
    return NextResponse.json({ error: "Selling closed" }, { status: 409 });
  }

  const { data: purchase, error: purchaseErr } = await supabaseAdmin
    .from("purchases")
    .insert({ raffle_round_id: round.id, bundle_qty, full_name, phone })
    .select("id")
    .single();

  if (purchaseErr) return NextResponse.json({ error: purchaseErr.message }, { status: 500 });

  const { data: maxRow } = await supabaseAdmin
    .from("tickets")
    .select("ticket_number")
    .eq("raffle_round_id", round.id)
    .order("ticket_number", { ascending: false })
    .limit(1)
    .maybeSingle();

  const start = (maxRow?.ticket_number ?? 0) + 1;
  const ticketNumbers = Array.from({ length: bundle_qty }, (_, i) => start + i);

  const { error: ticketErr } = await supabaseAdmin.from("tickets").insert(
    ticketNumbers.map((n) => ({
      raffle_round_id: round.id,
      purchase_id: purchase.id,
      ticket_number: n,
    }))
  );

  if (ticketErr) return NextResponse.json({ error: ticketErr.message }, { status: 500 });

  return NextResponse.json({ ticketNumbers });
}
