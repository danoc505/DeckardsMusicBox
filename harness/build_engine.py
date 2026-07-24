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
const _elp = new Proxy(function(){}, {
  get(t,k){ if(k==='style')return {}; if(k==='classList')return {add:_noop,remove:_noop,toggle:_noop,contains:()=>false};
    if(k==='length')return 0; return _elp; },
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
module.exports = {
  makeRng, T, pick, wpick, HARD, SOFT,
  conduct, composeSong, improvise,
  ghostPass: (typeof ghostPass!=='undefined'? ghostPass : undefined),
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
    m = re.search(r"<script>(.*)</script>", html, re.S)
    if not m: raise SystemExit("no <script> block found in "+src)
    os.makedirs(RUN, exist_ok=True)
    io.open(os.path.join(RUN, "engine_bundle.js"), "w", encoding="utf-8").write(HEADER + m.group(1) + EPILOGUE)
    for name, body in SHIMS.items():
        io.open(os.path.join(RUN, name), "w", encoding="utf-8").write(body)
    # bring the project's own tools next to the shims (copied verbatim, not modified)
    for tool, dest in [("tests.js","tests.js"), ("print roll.js","print_roll.js")]:
        p = os.path.join(ROOT, tool)
        if os.path.exists(p): shutil.copyfile(p, os.path.join(RUN, dest))
    # the shipped HTML IS the built player; expose it under the name the suite greps for
    shutil.copyfile(src, os.path.join(RUN, "player.html"))
    # the measurement probe for the one unenforced HARD law (see CODE_REVIEW.md)
    probe = os.path.join(HERE, "probe_nct.js")
    if os.path.exists(probe): shutil.copyfile(probe, os.path.join(RUN, "probe_nct.js"))
    print("built", os.path.relpath(RUN, ROOT), "from", os.path.basename(src))
    print("run:  cd harness/run && node tests.js")
    print("      cd harness/run && node print_roll.js 11 8")

if __name__ == "__main__":
    main()
