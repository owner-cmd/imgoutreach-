// Sends the owner an email whenever a new application comes in (paid or free
// trial), with a direct link to the admin page. Best-effort: never throws and
// never blocks order creation — a failed notification must not fail the order.

type NewOrderInfo = {
  studentName?: string | null;
  studentEmail?: string | null;
  specialty?: string | null;
  purpose?: string | null;
  physicianCount?: number | string | null;
  tier?: string | null;
};

export async function notifyAdminNewOrder(info: NewOrderInfo): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return;

  const to = process.env.ADMIN_NOTIFY_EMAIL || "contact@imgoutreach.com";
  const adminUrl = "https://imgoutreach.com/admin";

  const name = (info.studentName || "").trim() || "Unknown applicant";
  const specialty = (info.specialty || "").trim() || "—";
  const count = info.physicianCount ?? "—";
  const isTrial = (info.tier || "").toLowerCase() === "trial";
  const tierLabel = isTrial ? "Free trial" : "Paid";

  const rows: [string, string][] = [
    ["Name", name],
    ["Email", (info.studentEmail || "—").trim() || "—"],
    ["Specialty", specialty],
    ["Purpose", (info.purpose || "—").trim() || "—"],
    ["Drafts requested", String(count)],
    ["Type", tierLabel],
  ];

  const tableRows = rows
    .map(
      ([k, v]) =>
        `<tr><td style="padding:4px 12px 4px 0;color:#6b7280;">${k}</td><td style="padding:4px 0;color:#111827;font-weight:600;">${escapeHtml(
          v,
        )}</td></tr>`,
    )
    .join("");

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "IMG Outreach <noreply@sales.imgoutreach.com>",
      to,
      subject: `🔔 New ${isTrial ? "trial" : "order"}: ${name} — ${count} drafts (${specialty})`,
      html: `<p style="font-size:16px;font-weight:600;color:#111827;">New application received</p>
<table style="border-collapse:collapse;font-size:14px;margin:12px 0;">${tableRows}</table>
<p><a href="${adminUrl}" style="display:inline-block;background:#1e3a8a;color:#fff;text-decoration:none;font-weight:600;padding:10px 18px;border-radius:8px;">Open admin page →</a></p>`,
    }),
  }).catch(() => null);
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
