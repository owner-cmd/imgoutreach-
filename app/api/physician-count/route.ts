import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const specialties = searchParams.get("specialties")?.split(",").filter(Boolean) || [];
    const subspecialties = searchParams.get("subspecialties")?.split(",").filter(Boolean) || [];
    const states = searchParams.get("states")?.split(",").filter(Boolean) || [];
    const excludeStates = searchParams.get("excludeStates") === "true";
    const ethnicity = searchParams.get("ethnicity") || "any";

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let q: any = supabase.from("physicians").select("*", { count: "exact", head: true });

    const allSpecialties = [...specialties, ...subspecialties];
    if (allSpecialties.length > 0) {
      q = q.in("specialty_text", allSpecialties);
    }

    if (states.length > 0) {
      if (excludeStates) {
        q = q.not("practice_state", "in", `(${states.join(",")})`);
      } else {
        q = q.in("practice_state", states);
      }
    }

    // Use real ethnicity column if enrichment has been run; fall back to name patterns
    if (ethnicity !== "any") {
      q = q.eq("ethnicity", ethnicity);
    }

    const { count, error } = await q;
    if (error) throw error;

    return NextResponse.json({ count: count ?? 0 });
  } catch (e) {
    console.error("physician-count error:", e);
    return NextResponse.json({ count: 0 }, { status: 500 });
  }
}
