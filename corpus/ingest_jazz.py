#!/usr/bin/env python3
"""
Ingest real jazz HARMONY into JAZZ_CORPUS from the Jazz Harmony Treebank
(EPFL DCMLab, 1170 standards' chord changes). Chord PROGRESSIONS are not
copyrightable (they are "common stock of musical raw material"), so this is
legally clean to ship; only distinctive MELODIES are protected and we take none.
We store our own RELATIVE derived encoding (scale-degree + quality per chord),
never the source file, with attribution.

Windows each tune's changes into short progressions, converts to the engine's
{m, c:[{d,q}], n, ch:{sev,fif,stp,res,loop,mv}} schema, frequency-weights by how
often each relative progression recurs across the repertoire, dedupes against
what is embedded, and expands JAZZ_CORPUS in the shipped HTML. Idempotent.

    python3 corpus/ingest_jazz.py --dry
    python3 corpus/ingest_jazz.py
"""
import json, io, os, re, sys, tempfile, urllib.request
from collections import Counter

HERE=os.path.dirname(os.path.abspath(__file__)); ROOT=os.path.dirname(HERE)
HTML=[f for f in os.listdir(ROOT) if f.endswith(".html")][0]; HTMLP=os.path.join(ROOT,HTML)
CACHE=os.path.join(tempfile.gettempdir(),"jazz_treebank.json")
URL="https://raw.githubusercontent.com/DCMLab/JazzHarmonyTreebank/master/treebank.json"
PC={"C":0,"D":2,"E":4,"F":5,"G":7,"A":9,"B":11}
MAJ=[0,2,4,5,7,9,11]; MIN=[0,2,3,5,7,8,10]

def parse_root(sym):
    if not sym or sym[0] not in PC: return None,sym
    pc=PC[sym[0]]; i=1
    while i<len(sym) and sym[i] in "#b":
        pc+=(1 if sym[i]=="#" else -1); i+=1
    return pc%12, sym[i:]

def quality(rest):
    r=rest.lower()
    if "ø" in rest or "h" in r or "m7b5" in r or "min7b5" in r: return "dim"
    if r.startswith("o") or "dim" in r or "°" in rest: return "dim"
    if "sus" in r: return "sus4"
    if "^" in rest or "maj" in r or "ma7" in r or (rest[:1]=="M" and "m" not in r): 
        return "maj7" if ("7" in r or "9" in r or "^" in rest) else "maj"
    if r.startswith("m") or r.startswith("-"):
        return "min7" if ("7" in r or "9" in r or "11" in r or "13" in r) else "min"
    if "7" in r or "9" in r or "13" in r or "11" in r or "alt" in r or "+" in rest or "aug" in r:
        return "dom7"
    return "maj"

def parse_key(k):
    if not k: return 0,"major"
    mode="minor" if (k[-1:]=="m" or k[:1].islower()) else "major"
    kk=k.rstrip("m"); pc,_=parse_root(kk[0].upper()+kk[1:])
    return (pc or 0), mode

def degree(rootpc,tonic,mode):
    rel=(rootpc-tonic)%12; scale=MAJ if mode=="major" else MIN
    bi,bd=0,99
    for i,s in enumerate(scale):
        d=abs(rel-s)
        if d<bd: bd,bi=d,i
    return bi

def characterize(chords, tonic):
    roots=[c["_pc"] for c in chords]
    ivs=[ (roots[i+1]-roots[i])%12 for i in range(len(roots)-1) ]
    sev=sum(1 for c in chords if c["q"] in("dom7","maj7","min7","dim"))/len(chords)
    fif=sum(1 for v in ivs if v in(5,7))/len(ivs) if ivs else 0
    stp=sum(1 for v in ivs if v in(1,2,10,11))/len(ivs) if ivs else 0
    res=1 if chords[-1]["d"]==0 else 0
    loop=1 if chords[0]["d"]==chords[-1]["d"] else 0
    mv=len({(c["d"],c["q"]) for c in chords})
    return {"sev":round(sev,2),"fif":round(fif,2),"stp":round(stp,2),"res":res,"loop":loop,"mv":mv}

def prog_key(seq): return json.dumps([[c["d"],c["q"]] for c in seq])

def main():
    dry="--dry" in sys.argv
    if os.path.exists(CACHE): tb=json.load(open(CACHE))
    else:
        print("fetching",URL); urllib.request.urlretrieve(URL,CACHE); tb=json.load(open(CACHE))
    print("tunes:",len(tb))
    WIN=4
    prog_count=Counter(); prog_entry={}; cad_count=Counter(); cad_entry={}
    for tune in tb:
        tonic,mode=parse_key(tune.get("key",""))
        chs=[]
        for sym in tune.get("chords",[]):
            pc,rest=parse_root(str(sym))
            if pc is None: chs.append(None); continue
            chs.append({"_pc":pc,"d":degree(pc,tonic,mode),"q":quality(rest)})
        # collapse immediate repeats
        seq=[]
        for c in chs:
            if c is None: continue
            if seq and seq[-1]["d"]==c["d"] and seq[-1]["q"]==c["q"]: continue
            seq.append(c)
        for i in range(0,len(seq)-WIN+1):
            w=seq[i:i+WIN]
            k=prog_key(w)
            prog_count[k]+=1
            if k not in prog_entry:
                prog_entry[k]={"m":mode,"c":[{"d":c["d"],"q":c["q"]} for c in w],"ch":characterize(w,tonic)}
        # cadences: 2-chord windows landing on tonic
        for i in range(len(seq)-1):
            w=seq[i:i+2]
            if w[-1]["d"]!=0: continue
            k=prog_key(w); cad_count[k]+=1
            if k not in cad_entry:
                cad_entry[k]={"m":mode,"c":[{"d":c["d"],"q":c["q"]} for c in w],"ch":characterize(w,tonic)}

    # frequency-weight and rank; cap to keep balance with the existing 600
    progs=sorted(prog_entry.items(), key=lambda kv:-prog_count[kv[0]])
    cads =sorted(cad_entry.items(),  key=lambda kv:-cad_count[kv[0]])
    def build(items, cnt, cap):
        out=[]
        for k,e in items[:cap]:
            e=dict(e); e["n"]=cnt[k]; out.append(e)
        return out
    new_prog=build(progs, prog_count, 900)
    new_cad =build(cads,  cad_count, 200)

    # load embedded JAZZ_CORPUS, dedupe, extend
    html=io.open(HTMLP,encoding="utf-8").read().split("\n")
    def find(n):
        for i,l in enumerate(html):
            if l.startswith("globalThis."+n+" ="): return i
        raise SystemExit("not found "+n)
    ji=find("JAZZ_CORPUS"); jazz=json.loads(html[ji][html[ji].index("=")+1:].strip().rstrip(";"))
    seen_p={prog_key(p["c"]) for p in jazz["progressions"]}
    seen_c={prog_key(p["c"]) for p in jazz.get("cadences",[])}
    add_p=[e for e in new_prog if prog_key(e["c"]) not in seen_p and not seen_p.add(prog_key(e["c"]))]
    add_c=[e for e in new_cad  if prog_key(e["c"]) not in seen_c and not seen_c.add(prog_key(e["c"]))]

    sev_share=sum(e["ch"]["sev"] for e in new_prog)/len(new_prog) if new_prog else 0
    print("\n-- would add (deduped, frequency-weighted) --")
    print("  JAZZ_CORPUS.progressions: %4d -> %4d (+%d)"%(len(jazz['progressions']),len(jazz['progressions'])+len(add_p),len(add_p)))
    print("  JAZZ_CORPUS.cadences:     %4d -> %4d (+%d)"%(len(jazz.get('cadences',[])),len(jazz.get('cadences',[]))+len(add_c),len(add_c)))
    print("  mean seventh-chord share of ingested progressions: %.0f%% (jazz should be high)"%(100*sev_share))
    top=sorted(prog_entry.items(),key=lambda kv:-prog_count[kv[0]])[:5]
    print("  most common changes:", [ (json.loads(k), prog_count[k]) for k,_ in top ][:3])
    if dry: print("\n[dry run — nothing written]"); return

    jazz["progressions"].extend(add_p); jazz.setdefault("cadences",[]).extend(add_c)
    jazz["ingested"]="Jazz Harmony Treebank (1170 standards, relative changes; progressions are non-copyrightable)"
    html[ji]="globalThis.JAZZ_CORPUS = "+json.dumps(jazz,separators=(",",":"))+";"
    io.open(HTMLP,"w",encoding="utf-8").write("\n".join(html))
    print("\ninjected; file %.2f MB"%(os.path.getsize(HTMLP)/1e6))

if __name__=="__main__": main()
