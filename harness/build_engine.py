#!/usr/bin/env python3
"""
Reconstruct a RUNNABLE engine from the shipped single-file player, so the
project's own tools (tests.js, "print roll.js") work again even though the
numbered source modules are not checked in.

    python3 harness/build_engine.py
    cd harness/run && node tests.js
    cd harness/run && node print_roll.js 11 8

It extracts the one <script> body from the HTML, prepends headless browser
stubs (the engine is browser-scoped), appends an export epilogue that captures
the symbols the tools need, and writes small shim modules matching the
require() names the tools expect. Nothing in the repo is modified; everything
lands in harness/run/ (git-ignored).
"""
import re, io, os, shutil, glob

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
RUN  = os.path.join(HERE, "run")

def find_player():
    # the shipped, self-contained player (name may carry a version suffix)
    cands = sorted(glob.glob(os.path.join(ROOT, "*.html")))
    for c in cands:
        txt = io.open(c, encoding="utf-8", errors="ignore").read(200000)
        if "composeSong" in txt or "function conduct" in txt or "<script>" in txt:
            return c
    if cands: return cands[0]
    raise SystemExit("no .html player found in repo root")

HEADER = r"""
/* ==== headless harness: browser stubs so the browser-scoped engine loads under node ==== */
'use strict';
const _noop = function(){};
/* ── THE ELEMENT STUB HAS TO ANSWER WITH PRIMITIVES ──────────────────────────
   This returned the proxy itself for EVERY property, which is fine until the
   engine reads one as a number or a string. It grew a real fader -- an
   <input type=range> whose value is read as `(+inp.value).toFixed(2)` -- and
   the whole bundle stopped loading with "Cannot convert object to primitive
   value", taking five probes down with it (non-chord-tone resolution, voice
   leading, hierarchy, bass consonance, the peak arc). They looked like broken
   probes; they were a stub that had not kept up with the UI.

   So: the properties that are genuinely primitives answer as primitives, and
   the proxy declares Symbol.toPrimitive so a stray coercion yields 0 rather
   than throwing. Everything else still chains. */
const _ELSTR = new Set(['value','textContent','innerHTML','innerText','id','className',
                        'min','max','step','type','name','title','tagName','href','src']);
const _elp = new Proxy(function(){}, {
  get(t,k){ if(k==='style')return {}; if(k==='classList')return {add:_noop,remove:_noop,toggle:_noop,contains:()=>false};
    if(k==='length')return 0;
    if(k===Symbol.toPrimitive)return ()=>0;
    if(k==='valueOf')return ()=>0;
    if(k==='toString')return ()=>'';
    if(k==='dataset')return {};
    if(k==='checked'||k==='disabled')return false;
    if(typeof k==='string'&&_ELSTR.has(k))return '';
    return _elp; },
  set(){ return true; }, apply(){ return _elp; }, construct(){ return _elp; } });
const _doc = new Proxy({}, { get(t,k){
  if(k==='createElement'||k==='getElementById'||k==='querySelector')return ()=>_elp;
  if(k==='querySelectorAll')return ()=>[];
  if(k==='addEventListener'||k==='removeEventListener')return _noop;
  if(k==='body'||k==='documentElement'||k==='head')return _elp;
  return _noop; }});
class _AudioContextStub { constructor(){ this.sampleRate=44100; this.destination={}; this.currentTime=0; }
  createGain(){return {gain:{value:0,setValueAtTime:_noop},connect:_noop};}
  createOscillator(){return {frequency:{value:0,setValueAtTime:_noop},connect:_noop,start:_noop,stop:_noop};}
  createBuffer(){return {getChannelData:()=>new Float32Array(0)};}
  createBufferSource(){return {connect:_noop,start:_noop,stop:_noop};}
  decodeAudioData(){return Promise.resolve({getChannelData:()=>new Float32Array(0)});}
  audioWorklet={addModule:()=>Promise.resolve()};
  resume(){return Promise.resolve();} suspend(){return Promise.resolve();} close(){return Promise.resolve();} }
function _def(name,val){ try{ globalThis[name]=val; if(globalThis[name]!==val) throw 0; }
  catch(e){ try{ Object.defineProperty(globalThis,name,{value:val,writable:true,configurable:true}); }catch(_){} } }
_def('window', globalThis); _def('self', globalThis); _def('document', _doc);
_def('navigator', { userAgent:'node', hardwareConcurrency:4 }); _def('location', { href:'', search:'' });
_def('AudioContext', _AudioContextStub); _def('webkitAudioContext', _AudioContextStub); _def('OfflineAudioContext', _AudioContextStub);
_def('requestAnimationFrame', _noop); _def('cancelAnimationFrame', _noop);
_def('addEventListener', _noop); _def('removeEventListener', _noop);
_def('localStorage', { getItem:()=>null, setItem:_noop, removeItem:_noop });
_def('fetch', ()=>Promise.reject(new Error('no network in harness')));
_def('Blob', function(){}); if(!globalThis.URL) _def('URL', { createObjectURL:()=>'blob:x', revokeObjectURL:_noop });
_def('AudioWorkletNode', function(){ return {port:{postMessage:_noop,onmessage:null},connect:_noop}; });
_def('alert', _noop);
/* ==== engine body follows ==== */
"""

EPILOGUE = r"""
/* ==== headless harness: export the symbols the tools need ==== */
/* ── EVERY NAME HERE IS OPTIONAL, BECAUSE THE ENGINE CHANGED UNDER IT ────────
   This listed `makeRng, T, pick, wpick, HARD, SOFT, conduct, improvise` as bare
   identifiers. Those are MK1 names. MK2 has `stream` instead of `makeRng` and no
   HARD/SOFT tables at all -- so the bundle threw `ReferenceError: T is not
   defined` at load, and every tool that requires it died with a stack trace that
   looked like a broken probe rather than a stale export list.

   A bare identifier in an export list is a hard dependency on a name. `typeof`
   guards make each one optional, so the bundle loads against whichever engine it
   was built from and the tools that need a missing symbol are the only ones that
   fail -- and they fail saying which symbol. */
const _opt = n => { try { return eval(n); } catch(e){ return undefined; } };
module.exports = {
  /* MK2 */
  composeSong: _opt('composeSong'),
  stream: _opt('stream'),
  MK2: (typeof window!=='undefined' && window.MK2) || undefined,
  /* MK1, if this was built from an MK1 player */
  makeRng: _opt('makeRng'), T: _opt('T'), pick: _opt('pick'), wpick: _opt('wpick'),
  HARD: _opt('HARD'), SOFT: _opt('SOFT'),
  conduct: _opt('conduct'), improvise: _opt('improvise'),
  ghostPass: (typeof ghostPass!=='undefined'? ghostPass : undefined),
  // corpora (for corpus tooling / ingestion measurement)
  IMPROV_CORPUS: (typeof IMPROV_CORPUS!=='undefined'? IMPROV_CORPUS : undefined),
  BACH_CORPUS:   (typeof BACH_CORPUS!=='undefined'?   BACH_CORPUS   : undefined),
  JAZZ_CORPUS:   (typeof JAZZ_CORPUS!=='undefined'?   JAZZ_CORPUS   : undefined),
  FOLK_CORPUS:   (typeof FOLK_CORPUS!=='undefined'?   FOLK_CORPUS   : undefined),
  IMPROV_DIMENSIONS: (typeof IMPROV_DIMENSIONS!=="undefined"? IMPROV_DIMENSIONS : undefined),
  IMPROV_FORMS: (typeof IMPROV_FORMS!=="undefined"? IMPROV_FORMS : undefined),
  scoreSong: (typeof scoreSong!=='undefined'? scoreSong : undefined),
};
"""

SHIMS = {
  "02_engine_base.js": "module.exports = require('./engine_bundle.js');\n",
  "01_listening.js":   "// listening layer is closed over inside the bundle; tools require but never deref it.\nmodule.exports = {};\n",
  "07_conductor.js":   "module.exports = { conduct: require('./engine_bundle.js').conduct };\n",
  "04_pipeline.js":    "const E = require('./engine_bundle.js');\nmodule.exports = { composeSong: E.composeSong, improvise: E.improvise };\n",
  # matches the browser path `typeof require!=='undefined' ? require('./09_theme.js') : null`
  "09_theme.js":       "module.exports = null; // theme fns are inlined as globals in the bundle\n",
}

def main():
    src = find_player()
    html = io.open(src, encoding="utf-8").read()
    # non-greedy: the FIRST <script> is the engine; a later one is the UI/panel FX,
    # which the headless harness does not need (and must not concatenate in).
    m = re.search(r"<script>(.*?)</script>", html, re.S)
    if not m: raise SystemExit("no <script> block found in "+src)
    os.makedirs(RUN, exist_ok=True)
    io.open(os.path.join(RUN, "engine_bundle.js"), "w", encoding="utf-8").write(HEADER + m.group(1) + EPILOGUE)
    for name, body in SHIMS.items():
        io.open(os.path.join(RUN, name), "w", encoding="utf-8").write(body)
    # bring the project's own tools next to the shims (copied verbatim, not modified)
    for tool, dest in [("tests/tests.js","tests.js"), ("tests/print_roll.js","print_roll.js"),
                       ("tests.js","tests.js"), ("print roll.js","print_roll.js")]:
        p = os.path.join(ROOT, tool)
        if os.path.exists(p): shutil.copyfile(p, os.path.join(RUN, dest))
    # the shipped HTML IS the built player; expose it under the name the suite greps for
    shutil.copyfile(src, os.path.join(RUN, "player.html"))
    # measurement probes (see CODE_REVIEW.md)
    for pb in glob.glob(os.path.join(HERE, "probe_*.js")):
        shutil.copyfile(pb, os.path.join(RUN, os.path.basename(pb)))
    print("built", os.path.relpath(RUN, ROOT), "from", os.path.basename(src))
    print("run:  cd harness/run && node tests.js")
    print("      cd harness/run && node print_roll.js 11 8")

if __name__ == "__main__":
    main()
