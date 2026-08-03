#!/usr/bin/env python3
"""
GRAMMARS (plunderphonics, done cleanly) for all three symbolic dimensions.
Instead of storing source phrases, learn the TRANSITION GRAMMAR of everything
already ingested and GENERATE new material from the aggregate. The output retains
no source melody/rhythm/progression -- it is built from pooled statistics, the way
a player internalises a tradition -- so there is no single source to be
substantially similar to (the strongest not-infringing position; see LICENSING.md).

  - contour grammar  -> IMPROV_DIMENSIONS.contours   (over scale-step intervals)
  - rhythm grammar   -> IMPROV_DIMENSIONS.rhythms     (over 16th-note durations)
  - harmony grammar  -> JAZZ_CORPUS.progressions      (over (degree,quality) chords, per mode)

Order-2 Markov with back-off. Every generated sequence is rejected if it is even a
contiguous sub-sequence of any source. Deterministic (seeded) and idempotent
(re-running adds nothing already present).

    python3 corpus/build_grammar.py --dry
    python3 corpus/build_grammar.py
"""
import json, io, os, sys, random
from collections import Counter, defaultdict
HERE=os.path.dirname(os.path.abspath(__file__)); ROOT=os.path.dirname(HERE)
HTML=[f for f in os.listdir(ROOT) if f.endswith(".html")][0]; HTMLP=os.path.join(ROOT,HTML)
MAJ=[0,2,4,5,7,9,11]

# ---- characterizations (match the existing corpus schemas) ----
def cv(v):
    n=len(v); cum=[0]
    for x in v: cum.append(cum[-1]+x)
    return {"n":n,"rg":max(cum)-min(cum),"dir":(1 if sum(v)>0 else -1 if sum(v)<0 else 0),
            "lp":round(sum(1 for x in v if abs(x)>=2)/n,3) if n else 0,
            "bal":round((sum(1 for x in v if x>0)-sum(1 for x in v if x<0))/n,3) if n else 0}
def cr(r):
    s=sum(r) or 1; return {"n":len(r),"d":round(len(r)/s,3),"ev":1 if len(set(r))==1 else 0,"sp":1}
def char_harm(seq):                                  # seq = list of (d,q)
    pcs=[MAJ[d%7] for (d,_) in seq]; ivs=[(pcs[i+1]-pcs[i])%12 for i in range(len(pcs)-1)]
    sev=sum(1 for (_,q) in seq if q in("dom7","maj7","min7","dim"))/len(seq)
    return {"sev":round(sev,2),
            "fif":round(sum(1 for v in ivs if v in(5,7))/len(ivs),2) if ivs else 0,
            "stp":round(sum(1 for v in ivs if v in(1,2,10,11))/len(ivs),2) if ivs else 0,
            "res":1 if seq[-1][0]==0 else 0,"loop":1 if seq[0][0]==seq[-1][0] else 0,
            "mv":len(set(seq))}

# ---- generic order-2 Markov grammar over hashable tokens ----
def grammar(seqs, target, min_len, clamp, seed, exclude):
    t2=defaultdict(Counter); t1=defaultdict(Counter); t0=Counter()
    starts=Counter(); lengths=Counter()
    for v in seqs:
        if len(v)<2: continue
        lengths[len(v)]+=1; starts[(v[0],v[1])]+=1
        for x in v: t0[x]+=1
        for i in range(len(v)-1): t1[v[i]][v[i+1]]+=1
        for i in range(len(v)-2): t2[(v[i],v[i+1])][v[i+2]]+=1
    if not starts: return []
    subseq=set()                                     # every contiguous source shape (len>=3)
    for v in seqs:
        for L in range(3, len(v)+1):
            for i in range(len(v)-L+1): subseq.add(tuple(v[i:i+L]))
    exact=set(tuple(v) for v in seqs)
    rng=random.Random(seed)
    def draw(c):
        tot=sum(c.values()); r=rng.random()*tot; acc=0
        for k,n in c.items():
            acc+=n
            if r<=acc: return k
        return next(iter(c))
    out=[]; seen=set(); tries=0
    while len(out)<target and tries<target*400:
        tries+=1
        a,b=draw(starts); v=[a,b]; L=draw(lengths)
        while len(v)<L:
            ctx=t2.get((v[-2],v[-1]))
            nx=draw(ctx) if ctx else (draw(t1[v[-1]]) if t1.get(v[-1]) else draw(t0))
            v.append(clamp(nx) if clamp else nx)
        if len(v)<min_len or len(set(v))<2: continue
        tv=tuple(v)
        if tv in exact or tv in subseq or tv in seen or tv in exclude: continue
        seen.add(tv); out.append(v)
    return out

def stepwise(vs):
    s=t=0
    for v in vs:
        for x in v: t+=1; s+=(abs(x)<=1)
    return 100*s/t if t else 0

def main():
    dry="--dry" in sys.argv
    html=io.open(HTMLP,encoding="utf-8").read().split("\n")
    di=next(i for i,l in enumerate(html) if l.startswith("globalThis.IMPROV_DIMENSIONS ="))
    ji=next(i for i,l in enumerate(html) if l.startswith("globalThis.JAZZ_CORPUS ="))
    dims=json.loads(html[di][html[di].index("=")+1:].strip().rstrip(";"))
    jazz=json.loads(html[ji][html[ji].index("=")+1:].strip().rstrip(";"))

    # Grammar is regenerated from scratch each run (single source of truth): strip
    # any prior grammar output first so it never accumulates, then re-derive from
    # the REAL sources only. Deterministic -> identical every run (idempotent).
    dims["contours"]=[e for e in dims["contours"] if e.get("s")!="grammar"]
    dims["rhythms"] =[e for e in dims["rhythms"]  if e.get("s")!="grammar"]
    jazz["progressions"]=[p for p in jazz["progressions"] if not p.get("_grammar")]

    # 1) CONTOUR grammar
    src_c=[e["v"] for e in dims["contours"]]
    gen_c=grammar(src_c, 900, 3, lambda x:max(-7,min(7,x)), 1234, set())
    add_c=[{"v":v,"s":"grammar","role":"lead","c":cv(v)} for v in gen_c]

    # 2) RHYTHM grammar
    src_r=[e["r"] for e in dims["rhythms"]]
    gen_r=grammar(src_r, 500, 3, lambda x:max(1,min(8,x)), 5678, set())
    add_r=[{"r":r,"s":"grammar","role":"lead","c":cr(r)} for r in gen_r]

    # 3) HARMONY grammar (per mode; generated progressions carry n so the weighted
    #    draw stays finite — drawJazzProgression weights by sqrt(n)*fit)
    add_h=[]; hstats=[]
    for mode,seed in (("major",4321),("minor",8765)):
        src_h=[[(c["d"],c["q"]) for c in p["c"]] for p in jazz["progressions"]
               if p["m"]==mode and not p.get("_grammar")]
        gen_h=grammar(src_h, 250, 4, None, seed, set())
        for seq in gen_h:
            add_h.append({"m":mode,"c":[{"d":d,"q":q} for (d,q) in seq],"n":5,
                          "ch":char_harm(seq),"_grammar":True})
            hstats.append(char_harm(seq)["sev"])

    print("CONTOUR grammar: +%d (stepwise gen %.1f%% vs src %.1f%%)"%(len(add_c),stepwise(gen_c),stepwise(src_c)))
    print("RHYTHM  grammar: +%d (mean notes/seq gen %.1f vs src %.1f)"%(
          len(add_r), sum(len(r)+1 for r in gen_r)/max(1,len(gen_r)), sum(len(r)+1 for r in src_r)/max(1,len(src_r))))
    src_sev=sum(char_harm([(c["d"],c["q"]) for c in p["c"]])["sev"] for p in jazz["progressions"][:600])/600
    print("HARMONY grammar: +%d progressions (seventh-share gen %.0f%% vs jazz %.0f%%)"%(
          len(add_h), 100*(sum(hstats)/len(hstats) if hstats else 0), 100*src_sev))
    print("novelty: every generated sequence is neither a source nor a contiguous sub-sequence of one")
    if dry: print("[dry run]"); return

    dims["contours"]+=add_c; dims["rhythms"]+=add_r; jazz["progressions"]+=add_h
    html[di]="globalThis.IMPROV_DIMENSIONS = "+json.dumps(dims,separators=(",",":"))+";"
    html[ji]="globalThis.JAZZ_CORPUS = "+json.dumps(jazz,separators=(",",":"))+";"
    io.open(HTMLP,"w",encoding="utf-8").write("\n".join(html))
    print("injected; file %.2f MB"%(os.path.getsize(HTMLP)/1e6))

if __name__=="__main__": main()
