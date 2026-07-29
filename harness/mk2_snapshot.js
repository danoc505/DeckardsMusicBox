#!/usr/bin/env node
/* SNAPSHOT — a SHA over what the program actually composes.

     node harness/mk2_snapshot.js write <file> [nSeeds]
     node harness/mk2_snapshot.js check <file> [nSeeds]

   This exists for one job: proving a refactor is a refactor. When lofi's scattered
   literals move into a genre table, or a stage gets restructured, the music must
   not move by a single note -- and "I only moved constants around" is exactly the
   kind of claim that turns out to be false. `check` compares a hash of every
   event of every seed against a recorded one and names the first seed that
   differs, so the claim is settled in two seconds instead of argued about. */
const fs = require("fs"), path = require("path"), crypto = require("crypto");

const html = fs.readFileSync(path.resolve(__dirname, "..", "Deckards Orchestrator MK2.html"), "utf8");
const src = html.split("<script>")[1].split("</script>")[0];
global.window = { addEventListener(){}, MK2: null };
global.document = { getElementById: () => ({ addEventListener(){}, textContent: "", value: "1", innerHTML: "" }),
                    createElement: () => ({ click(){} }) };
eval(src);
const M = global.window.MK2;

const mode = process.argv[2], file = process.argv[3];
/* THE DEFAULT READS THE BASELINE. It used to be a bare 200 while the file on
   disk held 300, so running this the obvious way -- no seed count -- compared
   300 recorded lines against 200 fresh ones and reported a confident CHANGED to
   anyone who had changed nothing. A test that cries wolf is worse than no test.
   `check` now defaults to however many seeds the file it is checking contains;
   `write` still defaults to 300 because there is nothing to read. */
/* the file now holds one line per (seed, genre), so the seed count is the number
   of DISTINCT first fields -- not the line count, which would read seven times
   too high and compare 2100 recorded lines against 14700 fresh ones */
const N = parseInt(process.argv[4], 10) ||
  (mode === "check" && file && fs.existsSync(file)
    ? new Set(fs.readFileSync(file, "utf8").trim().split("\n")
        .map(l => l.split(" ")[0])).size : 300);
if(!mode || !file){ console.error("usage: mk2_snapshot.js write|check <file> [nSeeds]"); process.exit(2); }

const sha = s => crypto.createHash("sha256").update(s).digest("hex").slice(0, 16);

/* ── EVERY GENRE, NOT WHICHEVER ONE THE DRAW HAPPENS TO LAND ON ─────────────
   This called composeSong(s, "band") with no genre and hashed the result. That
   looks like it samples the program; MEASURED, all 300 seeds composed LOFI and
   nothing else. Six of the seven genres had never been in this file.

   So every "IDENTICAL -- 300 seeds, not one note moved" this harness has ever
   printed was a true statement about one seventh of the program and was read --
   including by me, out loud, more than once -- as a statement about all of it.
   A change confined to synthwave, acid, jungle, DKC, Vangelis or Plastikman
   could not have moved this number no matter how large it was.

   It is caught here by the build: adding an accretion plan to Plastikman
   rewrote that genre's arrangement, the snapshot said IDENTICAL, and it was
   right -- about lofi. The fix is to name the genre rather than let a draw pick
   it, one line per (seed, genre), so the file cannot silently narrow again.
   ────────────────────────────────────────────────────────────────────────── */
const GENRES = M.genres();
const lines = [];
for(let s = 1; s <= N; s++) for(const g of GENRES){
  const song = M.composeSong(s, "draw", g);
  /* the NOTES, not the audio: everything stage 5 emits, to full precision */
  const ev = song.perf.events.map(e =>
    [e.tSec.toFixed(9), e.durSec.toFixed(9), e.voice, e.role, e.lane || "", e.gain.toFixed(9),
     e.pitch == null ? "" : e.pitch].join("|")).join("\n");
  const form = song.sections.map(x => `${x.fn}:${x.startBar}-${x.endBar}:${x.material}`).join(",");
  /* the ARRANGEMENT too, because a build plan changes who plays without
     necessarily changing how many events exist -- a part that has not arrived
     emits nothing, and a count alone would not always show it */
  const act = song.sections.map(x => x.active.join("+")).join(",");
  lines.push(`${s} ${g} ${sha(ev)} ${sha(form)} ${sha(act)} ${song.perf.events.length} ` +
             `${song.chart.tempo} ${song.chart.root} ${song.chart.mode}`);
}
const body = lines.join("\n") + "\n";

if(mode === "write"){
  fs.writeFileSync(file, body);
  console.log(`wrote ${N} seeds -> ${file}  (overall ${sha(body)})`);
} else {
  const want = fs.readFileSync(file, "utf8").trim().split("\n");
  const got = body.trim().split("\n");
  let bad = 0, first = null;
  for(let i = 0; i < Math.max(want.length, got.length); i++)
    if(want[i] !== got[i]){ bad++; if(!first) first = `seed ${i + 1}\n    was ${want[i]}\n    now ${got[i]}`; }
  if(bad === 0) console.log(`IDENTICAL — ${got.length} seeds, not one note moved  (${sha(body)})`);
  else { console.log(`CHANGED — ${bad}/${got.length} seeds differ\n  first: ${first}`); process.exitCode = 1; }
}
