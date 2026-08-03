#!/usr/bin/env python3
"""
Ingest real RECORDED jazz harmony from the Weimar Jazz Database (456 transcribed
solos, Armstrong -> modern). We take ONLY the chord CHANGES (the beats.chord
column) -- chord progressions are not copyrightable ("common stock of musical raw
material"), so this is clean to ship. We do NOT take the solo melodies (those are
transcriptions of copyrighted performances). Stored as our own relative encoding.

WJazzD notation: key 'Bb-maj'/'C-min'/'D-dor'; chords use j=maj7, -=min, o=dim.

    python3 corpus/ingest_wjazz.py --dry
    python3 corpus/ingest_wjazz.py
"""
import json, io, os, re, sys, tempfile, sqlite3, urllib.request
from collections import Counter
HERE=os.path.dirname(os.path.abspath(__file__)); ROOT=os.path.dirname(HERE)
HTML=[f for f in os.listdir(ROOT) if f.endswith(".html")][0]; HTMLP=os.path.join(ROOT,HTML)
DB=os.path.join(tempfile.gettempdir(),"wjazzd.db")
URL="https://jazzomat.hfm-weimar.de/download/downloads/wjazzd.db"
PC={"C":0,"D":2,"E":4,"F":5,"G":7,"A":9,"B":11}; MAJ=[0,2,4,5,7,9,11]; MIN=[0,2,3,5,7,8,10]

def parse_root(sym):
    if not sym or sym[0] not in PC: return None,sym
    pc=PC[sym[0]]; i=1
    while i<len(sym) and sym[i] in "#b": pc+=(1 if sym[i]=="#" else -1); i+=1
    return pc%12, sym[i:]

def quality(rest):
    r=rest
    if "m7b5" in r or "ø" in r or "%" in r: return "dim"
    if r.startswith("o") or "dim" in r: return "dim"
    if "sus" in r: return "sus4"
    if "j" in r: return "maj7"
    if r.startswith("-") or r.startswith("m"):
        return "min7" if "7" in r else "min"
    if "7" in r or "9" in r or "+" in r or "alt" in r or "13" in r or "11" in r: return "dom7"
    return "maj"   # '' or '6'

def parse_key(k):
    parts=k.split("-"); root=parts[0]; mode="major" if (len(parts)>1 and parts[1]=="maj") else "minor"
    pc,_=parse_root(root); return (pc or 0), mode

def degree(rootpc,tonic,mode):
    rel=(rootpc-tonic)%12; scale=MAJ if mode=="major" else MIN; bi,bd=0,99
    for i,s in enumerate(scale):
        d=abs(rel-s)
        if d<bd: bd,bi=d,i
    return bi

def characterize(ch):
    roots=[c["_pc"] for c in ch]; ivs=[(roots[i+1]-roots[i])%12 for i in range(len(roots)-1)]
    sev=sum(1 for c in ch if c["q"] in("dom7","maj7","min7","dim"))/len(ch)
    fif=sum(1 for v in ivs if v in(5,7))/len(ivs) if ivs else 0
    stp=sum(1 for v in ivs if v in(1,2,10,11))/len(ivs) if ivs else 0
    return {"sev":round(sev,2),"fif":round(fif,2),"stp":round(stp,2),
            "res":1 if ch[-1]["d"]==0 else 0,"loop":1 if ch[0]["d"]==ch[-1]["d"] else 0,
            "mv":len({(c["d"],c["q"]) for c in ch})}
def pkey(seq): return json.dumps([[c["d"],c["q"]] for c in seq])

def main():
    dry="--dry" in sys.argv
    if not os.path.exists(DB):
        print("fetching",URL); urllib.request.urlretrieve(URL,DB)
    cur=sqlite3.connect(DB).cursor()
    keys={r[0]:r[1] for r in cur.execute("SELECT melid,key FROM solo_info WHERE key!=''")}
    WIN=4; prog_count=Counter(); prog_entry={}
    for melid,keystr in keys.items():
        tonic,mode=parse_key(keystr)
        chs=[]
        for (ch,) in cur.execute("SELECT chord FROM beats WHERE melid=? AND chord!='' ORDER BY bar,beat",(melid,)):
            pc,rest=parse_root(ch)
            if pc is None: continue
            chs.append({"_pc":pc,"d":degree(pc,tonic,mode),"q":quality(rest)})
        seq=[]
        for c in chs:
            if seq and seq[-1]["d"]==c["d"] and seq[-1]["q"]==c["q"]: continue
            seq.append(c)
        for i in range(0,len(seq)-WIN+1):
            w=seq[i:i+WIN]; k=pkey(w); prog_count[k]+=1
            if k not in prog_entry: prog_entry[k]={"m":mode,"c":[{"d":c["d"],"q":c["q"]} for c in w],"ch":characterize(w)}
    ranked=sorted(prog_entry.items(),key=lambda kv:-prog_count[kv[0]])
    new=[dict(e,n=prog_count[k]) for k,e in ranked[:600]]

    html=io.open(HTMLP,encoding="utf-8").read().split("\n")
    ji=next(i for i,l in enumerate(html) if l.startswith("globalThis.JAZZ_CORPUS ="))
    jazz=json.loads(html[ji][html[ji].index("=")+1:].strip().rstrip(";"))
    seen={pkey(p["c"]) for p in jazz["progressions"]}
    add=[e for e in new if pkey(e["c"]) not in seen and not seen.add(pkey(e["c"]))]
    sev=sum(e["ch"]["sev"] for e in new)/len(new) if new else 0
    print("solos with changes:",len(keys))
    print("JAZZ_CORPUS.progressions: %d -> %d (+%d recorded-jazz changes)"%(len(jazz['progressions']),len(jazz['progressions'])+len(add),len(add)))
    print("mean seventh-chord share: %.0f%%"%(100*sev))
    print("top recorded changes:",[(json.loads(k),prog_count[k]) for k,_ in ranked[:3]])
    if dry: print("[dry run]"); return
    jazz["progressions"].extend(add)
    jazz["ingested_wjazz"]="Weimar Jazz Database 456 solos (recorded changes; progressions non-copyrightable; melodies NOT taken)"
    html[ji]="globalThis.JAZZ_CORPUS = "+json.dumps(jazz,separators=(",",":"))+";"
    io.open(HTMLP,"w",encoding="utf-8").write("\n".join(html))
    print("injected; file %.2f MB"%(os.path.getsize(HTMLP)/1e6))
if __name__=="__main__": main()
