// Milestone 11: every commentary in the library, dialogue by dialogue (#commentaries).
// For each: who, what printing, how many notes, how many are placed on the Greek words
// themselves, how many places are computed (≈), and where the book came from.
// Open the dialogue to read the notes under each section, or read a commentary straight through.
"use strict";

const COMMLIB = { data: null };

async function showCommentaryLibrary() {
  state.view = "commentaries";
  setView("commentaries-view");
  document.title = "Commentaries · Platonic Workshop";
  if (!COMMLIB.data) {
    $("#main").innerHTML = `<p class="loading">Opening the commentaries…</p>`;
    try { COMMLIB.data = await api("commentaries"); } catch (e) { $("#main").innerHTML = `<p class="error">${esc(e.message)}</p>`; return; }
  }
  const cs = COMMLIB.data.commentaries;
  const byWork = new Map();
  for (const c of cs) {
    if (!byWork.has(c.work_id)) byWork.set(c.work_id, []);
    byWork.get(c.work_id).push(c);
  }
  const notes = cs.reduce((n, c) => n + c.n_notes, 0);
  const authors = new Set(cs.map((c) => c.author));
  let h = `<section class="commlib"><h2>Commentaries</h2>
    <p class="meta">${cs.length} commentaries and introductions by ${authors.size} hands on ${byWork.size} dialogues, ${notes.toLocaleString()} notes in all.
    Each note is under the section it is on, in the dialogue (the Commentary layer); a note that quotes the Greek is also on the words it quotes, which are dotted.
    ≈ counts the notes whose place is computed rather than printed or found word for word. Every figure is counted from the library; how each book was read and checked is in <code>reports/commentaries.md</code>.</p>
    <p><label>Show <select id="commlib-filter"><option value="">everything</option><option value="notes">commentaries on passages</option><option value="introduction">introductions on the whole dialogue</option></select></label></p>`;
  const filt = COMMLIB.filter || "";
  for (const w of state.works) {
    const list = (byWork.get(w.id) || []).filter((c) => !filt || (filt === "introduction" ? c.kind === "introduction" : c.kind !== "introduction"));
    if (!list.length) continue;
    h += `<h3><a href="#${esc(w.slug)}">${esc(w.title)}</a> <span class="meta">${list.length}</span></h3>
      <table class="counts commlib-t"><thead><tr><th>Commentary</th><th class="num">Notes</th><th class="num">Sections</th><th class="num">On the Greek words</th><th class="num">≈</th><th></th></tr></thead><tbody>` +
      list.map((c) => `<tr><td><b>${esc(c.label)}</b> · ${esc(c.title)}<div class="meta">${esc(c.printed)} · ${esc(c.proof_status)}</div></td>
        <td class="num">${c.n_notes}</td><td class="num">${c.kind === "introduction" ? "whole" : c.sections}</td>
        <td class="num">${c.on_words || 0}</td><td class="num">${c.computed || 0}</td>
        <td><button type="button" class="link-btn" data-commlib-read="${esc(c.id)}" data-commlib-work="${esc(c.work_id)}">Read straight through</button></td></tr>`).join("") +
      `</tbody></table>`;
  }
  $("#main").innerHTML = h + `</section>`;
  const sel = $("#commlib-filter");
  if (sel) sel.value = filt;
}

document.addEventListener("click", async (ev) => {
  if (ev.target.closest("#commentaries-btn")) { location.hash = "commentaries"; return; }
  const rd = ev.target.closest("[data-commlib-read]");
  if (rd) {
    const c = COMMLIB.data.commentaries.find((x) => x.id === rd.dataset.commlibRead);
    showCommentary(c.id, `${c.label}: ${c.title}`, c.work_id, c);
  }
});
document.addEventListener("change", (ev) => {
  if (ev.target.id === "commlib-filter") { COMMLIB.filter = ev.target.value; showCommentaryLibrary(); }
});
