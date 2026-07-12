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
    const gender = searchParams.get("gender") || "any";

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Use an estimated count — an exact count over 100k+ rows exceeds the DB
    // statement timeout (3s) and 500s, which would show the user 0 physicians.
    // The UI presents this as "~N", so a planner estimate is the right trade-off.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let q: any = supabase.from("physicians").select("*", { count: "estimated", head: true });

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

    // Gender filter — "M" / "F" from NPPES sex code
    if (gender === "M" || gender === "F") {
      q = q.eq("gender", gender);
    }

    const { count, error } = await q;
    if (error) {
      console.error("physician-count error:", error.message);
      return NextResponse.json({ count: 0 }, { status: 500 });
    }

    return NextResponse.json({ count: count ?? 0 });
  } catch (e) {
    console.error("physician-count error:", String(e));
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
