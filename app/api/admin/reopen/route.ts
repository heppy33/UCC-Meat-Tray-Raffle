import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

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
    return NextResponse.json({ error: "Round is not closed" }, { status: 409 });
  }

  await supabaseAdmin
    .from("raffle_rounds")
    .update({ status: "open", closed_at: null })
    .eq("id", round.id);

  return NextResponse.json({ ok: true });
}
