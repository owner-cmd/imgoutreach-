/**
 * Re-classify physician ethnicity using the NamSor name-origin API.
 *
 * WHY: the current name-based ethnicity tags dump ~87% of physicians into
 * "other" and miss most MENA/Arab names entirely. NamSor classifies by name
 * origin far more accurately, which rescues those hidden physicians.
 *
 * SCOPE (cost control): by default this ONLY re-classifies rows where ethnicity
 * is NULL or 'other' — the buckets that are actually wrong. The specific buckets
 * (south_asian, east_asian, hispanic, middle_eastern) are left as-is. Set
 * RECLASSIFY_ALL = true to redo the entire table (much larger NamSor spend).
 *
 * KEYS (each on one line in its own gitignored file next to this script):
 *   scripts/service-key.local   -> Supabase service_role key
 *   scripts/namsor-key.local     -> NamSor API key  (namsor.app -> API key)
 *
 * RUN:  node scripts/assign-ethnicity.mjs
 */
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const RECLASSIFY_ALL = false; // false = only NULL/'other' rows (recommended)
const MIN_SCORE = 0.5;        // skip low-confidence NamSor results

const SUPABASE_URL = process.env.SUPABASE_URL || "https://kgykvrrxxolyfhhqehmz.supabase.co";
const scriptDir = path.dirname(fileURLToPath(import.meta.url));

function readKey(file, label) {
  const p = path.join(scriptDir, file);
  if (!existsSync(p)) {
    console.error(`Missing ${label}. Create scripts/${file} containing only the key.`);
    process.exit(1);
  }
  const k = readFileSync(p, "utf8").replace(/[^\x21-\x7E]/g, "").trim();
  if (!k) { console.error(`scripts/${file} is empty.`); process.exit(1); }
  return k;
}
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || readKey("service-key.local", "Supabase service_role key");
const NAMSOR_KEY = process.env.NAMSOR_KEY || readKey("namsor-key.local", "NamSor API key");

const SB = { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}`, "Content-Type": "application/json" };

// ── Country (ISO-2 origin) -> your filter buckets ──
// MENA / Arab per your definition: North Africa + Levant + Arabian Peninsula +
// wider Middle East (Iran, Turkey). Israel (IL) is deliberately NOT here — it
// falls through to "other".
const MIDDLE_EASTERN = new Set(["EG","MA","DZ","TN","LY","SD","MR","SY","LB","JO","PS","IQ","SA","YE","OM","AE","QA","BH","KW","IR","TR"]);
const SOUTH_ASIAN    = new Set(["IN","PK","BD","LK","NP","BT","MV"]);
const EAST_ASIAN     = new Set(["CN","KR","JP","VN","TW","TH","PH","ID","MY","SG","KH","LA","MM","MN","HK"]);
const HISPANIC       = new Set(["ES","MX","AR","CO","PE","VE","CL","EC","GT","CU","BO","DO","HN","PY","SV","NI","CR","PA","UY","PR"]);

function bucketFor(iso2) {
  if (!iso2) return null;
  const c = iso2.toUpperCase();
  if (MIDDLE_EASTERN.has(c)) return "middle_eastern";
  if (SOUTH_ASIAN.has(c))    return "south_asian";
  if (EAST_ASIAN.has(c))     return "east_asian";
  if (HISPANIC.has(c))       return "hispanic";
  return "other"; // Europe, Anglo, Sub-Saharan Africa, Israel, everything else
}

// ── Load target physicians (keyset paginate on npi) ──
async function loadTargets() {
  const rows = [];
  let last = "0";
  const filter = RECLASSIFY_ALL ? "" : "&or=(ethnicity.is.null,ethnicity.eq.other)";
  for (;;) {
    const url = `${SUPABASE_URL}/rest/v1/physicians?select=npi,first_name,last_name&npi=gt.${last}&order=npi.asc&limit=1000${filter}`;
    const res = await fetch(url, { headers: SB });
    if (!res.ok) throw new Error(`load failed: ${res.status} ${await res.text()}`);
    const page = await res.json();
    if (page.length === 0) break;
    for (const r of page) if (r.first_name && r.last_name) rows.push(r);
    last = String(page[page.length - 1].npi);
    process.stdout.write(`\rLoading targets: ${rows.length.toLocaleString()}`);
    if (page.length < 1000) break;
  }
  console.log();
  return rows;
}

// ── NamSor origin batch (up to 100 names/call) ──
async function namsorOrigin(batch) {
  const res = await fetch("https://v2.namsor.com/NamSorAPIv2/api2/json/originBatch", {
    method: "POST",
    headers: { "X-API-KEY": NAMSOR_KEY, "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ personalNames: batch.map(r => ({ id: String(r.npi), firstName: r.first_name, lastName: r.last_name })) }),
  });
  if (!res.ok) throw new Error(`NamSor failed: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return data.personalNames || [];
}

async function patchBucket(npis, bucket) {
  const BATCH = 300;
  for (let i = 0; i < npis.length; i += BATCH) {
    const chunk = npis.slice(i, i + BATCH);
    const res = await fetch(`${SUPABASE_URL}/rest/v1/physicians?npi=in.(${chunk.join(",")})`, {
      method: "PATCH", headers: { ...SB, Prefer: "return=minimal" }, body: JSON.stringify({ ethnicity: bucket }),
    });
    if (!res.ok) console.error(`\nPATCH ${bucket} failed: ${res.status} ${await res.text()}`);
  }
}

async function main() {
  const targets = await loadTargets();
  console.log(`Targets to classify: ${targets.length.toLocaleString()} (RECLASSIFY_ALL=${RECLASSIFY_ALL})`);
  if (!targets.length) return;

  const buckets = { middle_eastern: [], south_asian: [], east_asian: [], hispanic: [], other: [] };
  let done = 0;

  for (let i = 0; i < targets.length; i += 100) {
    const batch = targets.slice(i, i + 100);
    let results;
    try { results = await namsorOrigin(batch); }
    catch (e) { console.error("\n" + e.message); break; } // stop on API/credit error
    const byId = new Map(results.map(r => [String(r.id), r]));
    for (const row of batch) {
      const r = byId.get(String(row.npi));
      const iso = r && (r.countryOrigin || r.countryOriginAlt);
      const score = r ? (r.score ?? r.probabilityCalibrated ?? 0) : 0;
      if (!iso || score < MIN_SCORE) continue; // leave unchanged when unsure
      const b = bucketFor(iso);
      if (b) buckets[b].push(row.npi);
    }
    done += batch.length;
    process.stdout.write(`\rClassified via NamSor: ${done.toLocaleString()} / ${targets.length.toLocaleString()}`);
  }
  console.log();

  for (const [b, npis] of Object.entries(buckets)) {
    if (npis.length) { console.log(`Writing ${npis.length.toLocaleString()} -> ${b}`); await patchBucket(npis, b); }
  }
  console.log("Done. Verify: SELECT ethnicity, COUNT(*) FROM physicians GROUP BY ethnicity ORDER BY 2 DESC;");
}

main().catch(e => { console.error(e); process.exit(1); });
