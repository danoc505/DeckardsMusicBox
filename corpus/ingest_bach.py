#!/usr/bin/env python3
"""
Ingest J.S. Bach chorales (public domain, d.1750) into the corpora embedded in
the shipped HTML. Everything is stored RELATIVE (scale degrees + durations),
never absolute pitch, so it transposes into any song and cannot land out of key.

Source: czhuang/JSB-Chorales-dataset  (Jsb16thSeparated.json), 382 chorales,
each a list of 16th-note steps, each step [S,A,T,B] MIDI pitches.

Adds to BACH_CORPUS.voiceLines / .sopranoShapes and to IMPROV_DIMENSIONS
.rhythms / .contours (the "across" recombination pool), role-tagged S/A/T/B.
Idempotent: dedupes against what is already embedded.

    python3 corpus/ingest_bach.py            # ingest + inject into the HTML
    python3 corpus/ingest_bach.py --dry      # measure only, do not write
"""
import json, io, os, re, sys, tempfile, urllib.request

HERE=os.path.dirname(os.path.abspath(__file__)); ROOT=os.path.dirname(HERE)
HTML=[f for f in os.listdir(ROOT) if f.endswith(".html")][0]
HTMLP=os.path.join(ROOT,HTML)
CACHE=os.path.join(tempfile.gettempdir(),"jsb_chorales.json")
URL="https://raw.githubusercontent.com/czhuang/JSB-Chorales-dataset/master/Jsb16thSeparated.json"

# Krumhansl-Kessler key profiles
KS_MAJ=[6.35,2.23,3.48,2.33,4.38,4.09,2.52,5.19,2.39,3.66,2.29,2.88]
KS_MIN=[6.33,2.68,3.52,5.38,2.60,3.53,2.54,4.75,3.98,2.69,3.34,3.17]
MAJ=[0,2,4,5,7,9,11]; MIN=[0,2,3,5,7,8,10]
ROLES=["soprano","alto","tenor","bass"]

def corr(a,b):
    n=len(a); ma=sum(a)/n; mb=sum(b)/n
    num=sum((a[i]-ma)*(b[i]-mb) for i in range(n))
    da=sum((a[i]-ma)**2 for i in range(n))**.5; db=sum((b[i]-mb)**2 for i in range(n))**.5
    return num/(da*db) if da and db else 0

def detect_key(hist):
    best=(-9,0,"major")
    for tonic in range(12):
        rot=[hist[(tonic+i)%12] for i in range(12)]
        cM=corr(rot,KS_MAJ); cm=corr(rot,KS_MIN)
        if cM>best[0]: best=(cM,tonic,"major")
        if cm>best[0]: best=(cm,tonic,"minor")
    return best[1],best[2]

def degree_of(midi,tonic,mode):
    scale=MAJ if mode=="major" else MIN
    rel=(midi-tonic)%12; octv=(midi-tonic)//12
    # nearest scale index (snap chromatic passing tones to a degree)
    bi,bd=0,99
    for i,s in enumerate(scale):
        d=abs(rel-s)
        if d<bd: bd,bi=d,i
    return bi+7*octv

def voice_notes(seq):
    """collapse a 16th-step MIDI sequence into (midi,dur16) notes, holds merged."""
    out=[]
    for p in seq:
        p=int(p)
        if out and out[-1][0]==p and out[-1][1]<8: out[-1][1]+=1
        else: out.append([p,1])
    return out

def characterize_r(r):
    notes=len(r); s=sum(r) or 1
    return {"n":notes,"d":round(notes/s,3),"ev":1 if len(set(r))==1 else 0,"sp":1}
def characterize_v(v):
    n=len(v); cum=[0]; 
    for x in v: cum.append(cum[-1]+x)
    rg=max(cum)-min(cum); dirn=(1 if sum(v)>0 else -1 if sum(v)<0 else 0)
    lp=round(sum(1 for x in v if abs(x)>=2)/n,3) if n else 0
    bal=round((sum(1 for x in v if x>0)-sum(1 for x in v if x<0))/n,3) if n else 0
    return {"n":n,"rg":rg,"dir":dirn,"lp":lp,"bal":bal}

def main():
    dry="--dry" in sys.argv
    if os.path.exists(CACHE): data=json.load(open(CACHE))
    else:
        print("fetching",URL); urllib.request.urlretrieve(URL,CACHE); data=json.load(open(CACHE))
    chorales=[c for split in data.values() for c in split]
    print("chorales:",len(chorales))

    new_voicelines=[]; new_soprano=[]; new_r=[]; new_v=[]
    SEG=5   # notes per phrase (matches corpus voiceLine length)
    for ch in chorales:
        steps=[[int(x) for x in st] for st in ch]
        pcs=[0]*12
        for st in steps:
            for p in st: pcs[int(p)%12]+=1
        tonic,mode=detect_key(pcs)
        for vi,role in enumerate(ROLES):
            seq=[st[vi] for st in steps if vi<len(st)]
            notes=voice_notes(seq)
            degs=[degree_of(m,tonic,mode) for m,_ in notes]
            durs=[d for _,d in notes]
            for i in range(0,len(notes)-SEG,SEG):
                r=durs[i:i+SEG]
                dseg=degs[i:i+SEG]
                v=[dseg[k+1]-dseg[k] for k in range(len(dseg)-1)]
                if len(set(dseg))<2: continue           # skip static (all one pitch)
                if any(abs(x)>7 for x in v): continue    # skip wild octave jumps (parse noise)
                entry={"r":r,"v":v,"m":mode,"role":role}
                new_voicelines.append(entry)
                if role=="soprano": new_soprano.append({"r":r,"v":v,"m":mode})
                new_r.append({"r":r,"s":"bach","role":role,"c":characterize_r(r)})
                new_v.append({"v":v,"s":"bach","role":role,"c":characterize_v(v)})

    # load existing corpora from the HTML (each is one globalThis.X = {...}; line)
    html=io.open(HTMLP,encoding="utf-8").read().split("\n")
    def find(idx_name):
        for i,l in enumerate(html):
            if l.startswith("globalThis."+idx_name+" ="): return i
        raise SystemExit("not found: "+idx_name)
    def load(i):
        l=html[i]; j=l[l.index("=")+1:].strip().rstrip(";")
        return json.loads(j)
    bi=find("BACH_CORPUS"); di=find("IMPROV_DIMENSIONS")
    bach=load(bi); dims=load(di)

    def key_vl(e): return json.dumps([e["r"],e["v"],e.get("role","")])
    def key_d(e,f): return json.dumps([e[f],e.get("role","")])
    seen_vl={key_vl(e) for e in bach.get("voiceLines",[])}
    seen_sop={json.dumps([e["r"],e["v"]]) for e in bach.get("sopranoShapes",[])}
    seen_r={key_d(e,"r") for e in dims["rhythms"]}
    seen_v={key_d(e,"v") for e in dims["contours"]}

    add_vl=[e for e in new_voicelines if key_vl(e) not in seen_vl and not seen_vl.add(key_vl(e))]
    add_sop=[e for e in new_soprano if json.dumps([e["r"],e["v"]]) not in seen_sop and not seen_sop.add(json.dumps([e["r"],e["v"]]))]
    add_r=[e for e in new_r if key_d(e,"r") not in seen_r and not seen_r.add(key_d(e,"r"))]
    add_v=[e for e in new_v if key_d(e,"v") not in seen_v and not seen_v.add(key_d(e,"v"))]

    # Cap additions with an even stride so Bach enriches without swamping the
    # other sources or bloating the single-file player. Sampling is deterministic.
    def cap(lst, n):
        if len(lst)<=n: return lst
        step=len(lst)/n; return [lst[int(i*step)] for i in range(n)]
    add_vl=cap(add_vl,1500); add_sop=cap(add_sop,400)
    add_r=cap(add_r,800);    add_v=cap(add_v,1500)

    # stepwise share of the ingested voice lines (Bach's measured 77.3% is the target)
    allv=[x for e in new_voicelines for x in e["v"]]
    step=sum(1 for x in allv if abs(x)<=1)/len(allv) if allv else 0

    print("\n-- would add (deduped) --")
    print("  BACH_CORPUS.voiceLines:  %4d -> %4d" % (len(bach.get('voiceLines',[])), len(bach.get('voiceLines',[]))+len(add_vl)))
    print("  BACH_CORPUS.sopranoShapes:%3d -> %4d" % (len(bach.get('sopranoShapes',[])), len(bach.get('sopranoShapes',[]))+len(add_sop)))
    print("  IMPROV_DIMENSIONS.rhythms:%4d -> %4d (+%d bach)" % (len(dims['rhythms']), len(dims['rhythms'])+len(add_r), len(add_r)))
    print("  IMPROV_DIMENSIONS.contours:%3d -> %4d (+%d bach)" % (len(dims['contours']), len(dims['contours'])+len(add_v), len(add_v)))
    print("  ingested voice-line stepwise share: %.1f%% (Bach measured 77.3%%)" % (100*step))
    if dry: print("\n[dry run — nothing written]"); return

    bach.setdefault("voiceLines",[]).extend(add_vl)
    bach.setdefault("sopranoShapes",[]).extend(add_sop)
    bach["files"]=len(chorales); bach["ingested"]="JSB-Chorales 382 (relative)"
    dims["rhythms"].extend(add_r); dims["contours"].extend(add_v)
    html[bi]="globalThis.BACH_CORPUS = "+json.dumps(bach,separators=(",",":"))+";"
    html[di]="globalThis.IMPROV_DIMENSIONS = "+json.dumps(dims,separators=(",",":"))+";"
    io.open(HTMLP,"w",encoding="utf-8").write("\n".join(html))
    newsize=os.path.getsize(HTMLP)
    print("\ninjected into",HTML,"  file size now %.2f MB"%(newsize/1e6))

if __name__=="__main__": main()
