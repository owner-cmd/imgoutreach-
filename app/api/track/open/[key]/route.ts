import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// 1x1 transparent GIF
const PIXEL = Buffer.from(
  "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
  "base64"
);

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  const { key } = await params;

  // key format: <stripe_session_id>__<doctor_npi>
  const sep = key.lastIndexOf("__");
  if (sep > 0) {
    const sessionId = key.substring(0, sep);
    const npi = key.substring(sep + 2);

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Fire and forget — never block or fail the pixel response
    supabase
      .from("email_drafts")
      .select("open_count")
      .eq("stripe_session_id", sessionId)
      .eq("doctor_npi", npi)
      .single()
      .then(({ data }) => {
        return supabase
          .from("email_drafts")
          .update({
            opened_at: data?.open_count ? undefined : new Date().toISOString(),
            last_opened_at: new Date().toISOString(),
            open_count: (data?.open_count || 0) + 1,
            status: "opened",
          })
          .eq("stripe_session_id", sessionId)
          .eq("doctor_npi", npi);
      })
      .then(
        () => {},
        () => {}
      );
  }

  return new NextResponse(PIXEL as unknown as BodyInit, {
    status: 200,
    headers: {
      "Content-Type": "image/gif",
      "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      Pragma: "no-cache",
    },
  });
}
