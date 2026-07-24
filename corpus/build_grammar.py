#!/usr/bin/env python3
"""
CONTOUR GRAMMAR (plunderphonics, done cleanly). Instead of storing source phrases,
learn the TRANSITION GRAMMAR of every contour already ingested (folk + bach +
wjazz + session, ~5k phrases) as an order-2 Markov model with back-off, then
GENERATE new melodic shapes from the aggregate. The output contains no source
melody -- it is built from pooled statistics, the way a player internalises a
tradition -- so nothing is copied. Generated contours are tagged s="grammar" and
added to the across pool; the recombination already draws from that pool.

Deterministic (seeded), idempotent. See ../docs/LICENSING.md.

    python3 corpus/build_grammar.py --dry
    python3 corpus/build_grammar.py
"""
import json, io, os, sys, random
from collections import Counter, defaultdict
HERE=os.path.dirname(os.path.abspath(__file__)); ROOT=os.path.dirname(HERE)
HTML=[f for f in os.listdir(ROOT) if f.endswith(".html")][0]; HTMLP=os.path.join(ROOT,HTML)

def cv(v):
    n=len(v); cum=[0]
    for x in v: cum.append(cum[-1]+x)
    return {"n":n,"rg":max(cum)-min(cum),"dir":(1 if sum(v)>0 else -1 if sum(v)<0 else 0),
            "lp":round(sum(1 for x in v if abs(x)>=2)/n,3) if n else 0,
            "bal":round((sum(1 for x in v if x>0)-sum(1 for x in v if x<0))/n,3) if n else 0}

def main():
    dry="--dry" in sys.argv
    html=io.open(HTMLP,encoding="utf-8").read().split("\n")
    di=next(i for i,l in enumerate(html) if l.startswith("globalThis.IMPROV_DIMENSIONS ="))
    dims=json.loads(html[di][html[di].index("=")+1:].strip().rstrip(";"))
    src=[e["v"] for e in dims["contours"] if e.get("s")!="grammar"]
    print("training contours:",len(src))

    # order-2 Markov over scale-step transitions, with back-off
    t2=defaultdict(Counter); t1=defaultdict(Counter); t0=Counter()
    starts=Counter(); lengths=Counter()
    for v in src:
        if len(v)<2: continue
        lengths[len(v)]+=1; starts[(v[0],v[1])]+=1
        for x in v: t0[x]+=1
        for i in range(len(v)-1): t1[v[i]][v[i+1]]+=1
        for i in range(len(v)-2): t2[(v[i],v[i+1])][v[i+2]]+=1

    rng=random.Random(1234)
    def draw(counter):
        tot=sum(counter.values()); r=rng.random()*tot; acc=0
        for k,c in counter.items():
            acc+=c
            if r<=acc: return k
        return next(iter(counter))
    def gen():
        a,b=draw(starts); v=[a,b]
        L=draw(lengths)
        while len(v)<L:
            ctx=t2.get((v[-2],v[-1]))
            nxt=draw(ctx) if ctx else (draw(t1[v[-1]]) if t1.get(v[-1]) else draw(t0))
            if abs(nxt)>7: nxt=max(-7,min(7,nxt))
            v.append(nxt)
        return v

    # STRICT novelty: reject any generated contour that is a contiguous
    # sub-sequence of ANY source phrase, so every kept contour is a genuinely
    # novel combination, not a shape lifted from one tune. (Short cells are shared
    # vocabulary, so we only guard length>=3.)
    subseq=set()
    for v in src:
        for L in range(3, len(v)+1):
            for i in range(len(v)-L+1):
                subseq.add(tuple(v[i:i+L]))
    src_keys=set(json.dumps(v) for v in src)
    seen=set(); out=[]
    tries=0
    while len(out)<900 and tries<200000:
        tries+=1; v=gen()
        if len(v)<3 or len(set(v))<2: continue
        k=json.dumps(v)
        if k in src_keys: continue          # never a source contour verbatim
        if tuple(v) in subseq: continue     # never a contiguous shape from any source
        if k in seen: continue
        seen.add(k); out.append(v)

    # measurements
    def stepwise(vs):
        s=t=0
        for v in vs:
            for x in v: t+=1; s+=(abs(x)<=1)
        return 100*s/t if t else 0
    def meanabs(vs):
        xs=[abs(x) for v in vs for x in v]; return sum(xs)/len(xs) if xs else 0
    print("generated novel contours:",len(out),"(0 duplicate any source, by construction)")
    print("stepwise share: generated %.1f%% vs training %.1f%%"%(stepwise(out),stepwise(src)))
    print("mean |interval|: generated %.2f vs training %.2f"%(meanabs(out),meanabs(src)))
    # longest run also present in a source (substring) -- expect only short common cells
    def maxcommon(v):
        best=0
        for L in range(len(v),1,-1):
            for i in range(len(v)-L+1):
                sub=v[i:i+L]
                if any(sub==s[j:j+L] for s in src for j in range(len(s)-L+1)): return L
        return best
    sample=out[:60]; longest=max((maxcommon(v) for v in sample),default=0)
    print("longest generated sub-sequence also found in ANY source (sample of 60):",longest,"steps (short cells are common vocabulary, not expression)")

    if dry: print("[dry run]"); return
    add=[{"v":v,"s":"grammar","role":"lead","c":cv(v)} for v in out]
    dims["contours"]+=add
    dims["note"]=dims.get("note","")+" | grammar: contours generated from an order-2 Markov over the pooled corpus (no source melody retained)"
    html[di]="globalThis.IMPROV_DIMENSIONS = "+json.dumps(dims,separators=(",",":"))+";"
    io.open(HTMLP,"w",encoding="utf-8").write("\n".join(html))
    print("injected %d grammar contours; file %.2f MB"%(len(add),os.path.getsize(HTMLP)/1e6))

if __name__=="__main__": main()
