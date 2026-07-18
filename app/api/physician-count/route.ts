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
    // Builds a query with the HARD filters that actually limit the deliverable
    // pool: specialty/subspecialty, state, and gender. Ethnicity is intentionally
    // NOT a hard filter — it's a soft preference (see below), so it must not
    // shrink the headline number the student sees.
    const buildBase = () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let q: any = supabase.from("physicians").select("*", { count: "estimated", head: true });

      // If the student picked a subspecialty, filter on THAT — geriatricians etc.
      // are stored under their own specialty_text, not the parent "Internal Medicine".
      const spec = subspecialties.length > 0 ? subspecialties : specialties;
      if (spec.length > 0) q = q.in("specialty_text", spec);

      if (states.length > 0) {
        q = excludeStates
          ? q.not("practice_state", "in", `(${states.join(",")})`)
          : q.in("practice_state", states);
      }

      // Gender comes from the official NPPES sex code, so it stays a hard filter.
      if (gender === "M" || gender === "F") q = q.eq("gender", gender);
      return q;
    };

    // Deliverable count — what the student will actually receive (ethnicity is soft).
    const { count, error } = await buildBase();
    if (error) {
      console.error("physician-count error:", error.message);
      return NextResponse.json({ count: 0 }, { status: 500 });
    }

    // How many of those also match the ethnicity preference (informational only —
    // the workflow prioritizes these but fills the rest to reach the ordered number).
    let preferredCount: number | null = null;
    if (ethnicity !== "any") {
      const { count: pc } = await buildBase().eq("ethnicity", ethnicity);
      preferredCount = pc ?? 0;
    }

    return NextResponse.json({ count: count ?? 0, preferredCount });
  } catch (e) {
    console.error("physician-count error:", String(e));
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
