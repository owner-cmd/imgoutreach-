/**
 * Assign gender to all physicians using the official NPPES registry data.
 *
 * NPPES (the NPI registry your physicians came from) records each provider's
 * official sex code — so this is an authoritative lookup, NOT name-guessing.
 *
 * Usage:
 *   1. Download the latest "NPPES Data Dissemination" full ZIP (monthly) from:
 *      https://download.cms.gov/nppes/NPI_Files.html
 *   2. Extract it. The main CSV is named like:
 *      npidata_pfile_20050523-20260713.csv   (~10 GB)
 *   3. Run:  node scripts/assign-gender.mjs "C:/path/to/npidata_pfile_....csv"
 *
 * Reads NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY from .env.local.
 * Safe to re-run: only touches rows where gender is still null.
 */
import { createReadStream, readFileSync, existsSync } from "node:fs";
import { createInterface } from "node:readline";
import { fileURLToPath } from "node:url";
import path from "node:path";

// ── Config ──
// The cloud project URL (not secret — also in the client bundle).
const SUPABASE_URL = process.env.SUPABASE_URL || "https://kgykvrrxxolyfhhqehmz.supabase.co";

// The service_role key is read from a plain-text file next to this script:
//     scripts/service-key.local   (one line: the key, nothing else)
// This avoids command-line paste corruption. The file is gitignored.
const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const keyFile = path.join(scriptDir, "service-key.local");
let SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || "";
if (!SERVICE_KEY && existsSync(keyFile)) {
  // strip whitespace/newlines and any stray non-ASCII (e.g. bullet chars from bad pastes)
  SERVICE_KEY = readFileSync(keyFile, "utf8").replace(/[^\x21-\x7E]/g, "").trim();
}
if (!SERVICE_KEY) {
  console.error(
    "Missing service_role key.\n" +
    "Create a file named 'service-key.local' inside the scripts/ folder,\n" +
    "paste ONLY your cloud service_role key into it, save, and re-run.\n" +
    "Get the key from Supabase dashboard → Project Settings → API → service_role."
  );
  process.exit(1);
}
if (!/^[\x21-\x7E]+$/.test(SERVICE_KEY)) {
  console.error("Key contains invalid characters — re-paste it cleanly into scripts/service-key.local");
  process.exit(1);
}
if (SUPABASE_URL.includes("localhost") || SUPABASE_URL.includes("127.0.0.1")) {
  console.error("SUPABASE_URL is pointing at localhost — set it to the cloud URL.");
  process.exit(1);
}

const csvPath = process.argv[2];
if (!csvPath) {
  console.error('Usage: node scripts/assign-gender.mjs "path/to/npidata_pfile_....csv"');
  process.exit(1);
}

const HEADERS = { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}`, "Content-Type": "application/json" };

// ── 1. Load all NPIs still missing gender from Supabase ──
// Supabase/PostgREST caps every response at ~1000 rows, so we use keyset
// pagination on the npi primary key (npi > last seen) rather than limit/offset.
async function loadTargetNpis() {
  const npis = new Set();
  let lastNpi = "0";
  for (;;) {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/physicians?select=npi&gender=is.null&npi=gt.${lastNpi}&order=npi.asc&limit=1000`,
      { headers: HEADERS }
    );
    if (!res.ok) throw new Error(`Failed to page physicians: ${res.status} ${await res.text()}`);
    const rows = await res.json();
    if (rows.length === 0) break;
    for (const r of rows) npis.add(String(r.npi));
    lastNpi = String(rows[rows.length - 1].npi);
    process.stdout.write(`\rLoading NPIs from Supabase: ${npis.size.toLocaleString()}`);
    if (rows.length < 1000) break;
  }
  console.log();
  return npis;
}

// NPPES quotes every field. NPI is col 0; sex column located via header.
function splitCsvLine(line) {
  const out = [];
  let cur = "", inQ = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (inQ) {
      if (c === '"') { if (line[i + 1] === '"') { cur += '"'; i++; } else inQ = false; }
      else cur += c;
    } else if (c === '"') inQ = true;
    else if (c === ",") { out.push(cur); cur = ""; }
    else cur += c;
  }
  out.push(cur);
  return out;
}

async function main() {
  const targets = await loadTargetNpis();
  console.log(`Target physicians without gender: ${targets.size.toLocaleString()}`);
  if (targets.size === 0) return console.log("Nothing to do.");

  const male = [];
  const female = [];
  let sexCol = -1;
  let lineNo = 0;

  const rl = createInterface({ input: createReadStream(csvPath), crlfDelay: Infinity });
  for await (const line of rl) {
    lineNo++;
    if (lineNo === 1) {
      const header = splitCsvLine(line);
      sexCol = header.findIndex(h => /provider (sex|gender) code/i.test(h));
      if (sexCol === -1) throw new Error("Could not find 'Provider Sex Code' column in CSV header");
      console.log(`Found sex code at column ${sexCol}. Streaming ~8M rows…`);
      continue;
    }
    // Fast reject before full parse: NPI is the first quoted field.
    const npi = line.startsWith('"') ? line.slice(1, line.indexOf('"', 1)) : line.split(",", 1)[0];
    if (!targets.has(npi)) continue;
    const fields = splitCsvLine(line);
    const sex = (fields[sexCol] || "").trim().toUpperCase();
    if (sex === "M") male.push(npi);
    else if (sex === "F") female.push(npi);
    const matched = male.length + female.length;
    if (matched && matched % 25000 === 0) {
      process.stdout.write(`\rMatched: ${matched.toLocaleString()} (scanned ${lineNo.toLocaleString()} rows)`);
    }
  }
  console.log(`\nMatched ${male.length.toLocaleString()} male, ${female.length.toLocaleString()} female.`);

  // ── 3. Batch-update Supabase via PATCH ...?npi=in.(...) ──
  async function updateBatches(npis, gender) {
    const BATCH = 400;
    for (let i = 0; i < npis.length; i += BATCH) {
      const chunk = npis.slice(i, i + BATCH);
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/physicians?npi=in.(${chunk.join(",")})`,
        { method: "PATCH", headers: { ...HEADERS, Prefer: "return=minimal" }, body: JSON.stringify({ gender }) }
      );
      if (!res.ok) console.error(`\nBatch failed (${gender}, offset ${i}): ${res.status} ${await res.text()}`);
      process.stdout.write(`\rUpdating ${gender}: ${Math.min(i + BATCH, npis.length).toLocaleString()} / ${npis.length.toLocaleString()}`);
    }
    console.log();
  }

  await updateBatches(male, "M");
  await updateBatches(female, "F");
  console.log("Done. Verify: select gender, count(*) from physicians group by gender;");
}

main().catch(e => { console.error(e); process.exit(1); });
