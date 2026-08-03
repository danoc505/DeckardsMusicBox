#!/usr/bin/env python3
"""
Ingest jazz-solo PHRASING as ABSTRACT DIMENSIONS from the Weimar Jazz Database.
We do NOT store the solos. We split each real jazz phrase into two independent
lists -- a rhythm (durations) and a contour (intervals) -- and put each in a
DIFFERENT pool. The across-recombination then pairs a jazz rhythm with some other
source's contour, so no solo is ever reproduced (see ../docs/LICENSING.md: a bare
list of durations / a bare list of intervals is not substantially similar to any
performance). Stored relative, tagged s="wjazz", role="lead".

    python3 corpus/ingest_wjazz_solos.py --dry
    python3 corpus/ingest_wjazz_solos.py
"""
import json, io, os, sys, tempfile, sqlite3, urllib.request
HERE=os.path.dirname(os.path.abspath(__file__)); ROOT=os.path.dirname(HERE)
HTML=[f for f in os.listdir(ROOT) if f.endswith(".html")][0]; HTMLP=os.path.join(ROOT,HTML)
DB=os.path.join(tempfile.gettempdir(),"wjazzd.db")
URL="https://jazzomat.hfm-weimar.de/download/downloads/wjazzd.db"
PC={"C":0,"D":2,"E":4,"F":5,"G":7,"A":9,"B":11}; MAJ=[0,2,4,5,7,9,11]; MIN=[0,2,3,5,7,8,10]

def parse_key(k):
    parts=(k or "C-maj").split("-"); root=parts[0]
    pc=PC.get(root[0],0)
    for ch in root[1:]: pc+=(1 if ch=="#" else -1 if ch=="b" else 0)
    return pc%12,("major" if len(parts)>1 and parts[1]=="maj" else "minor")

def degree(midi,tonic,mode):
    rel=(midi-tonic)%12; octv=(midi-tonic)//12; scale=MAJ if mode=="major" else MIN
    bi,bd=0,99
    for i,s in enumerate(scale):
        d=abs(rel-s)
        if d<bd: bd,bi=d,i
    return bi+7*octv

def cr(r):  # rhythm characterization {n,d,ev,sp}
    s=sum(r) or 1; return {"n":len(r),"d":round(len(r)/s,3),"ev":1 if len(set(r))==1 else 0,"sp":1}
def cv(v):  # contour characterization {n,rg,dir,lp,bal}
    n=len(v); cum=[0]
    for x in v: cum.append(cum[-1]+x)
    lp=round(sum(1 for x in v if abs(x)>=2)/n,3) if n else 0
    bal=round((sum(1 for x in v if x>0)-sum(1 for x in v if x<0))/n,3) if n else 0
    return {"n":n,"rg":max(cum)-min(cum),"dir":(1 if sum(v)>0 else -1 if sum(v)<0 else 0),"lp":lp,"bal":bal}

def step_index(bar,beat,tatum,division):
    div=division or 1
    return bar*16 + (beat-1)*4 + round((tatum-1)/div*4)

def main():
    dry="--dry" in sys.argv
    if not os.path.exists(DB):
        print("fetching",URL); urllib.request.urlretrieve(URL,DB)
    cur=sqlite3.connect(DB).cursor()
    keys={r[0]:r[1] for r in cur.execute("SELECT melid,key FROM solo_info WHERE key!=''")}
    new_r=[]; new_v=[]
    for melid,keystr in keys.items():
        tonic,mode=parse_key(keystr)
        notes=cur.execute("SELECT pitch,bar,beat,tatum,division FROM melody WHERE melid=? ORDER BY eventid",(melid,)).fetchall()
        if len(notes)<6: continue
        phrases=cur.execute("SELECT start,end FROM sections WHERE melid=? AND type='PHRASE' ORDER BY start",(melid,)).fetchall()
        spans=phrases if phrases else [(i,min(i+5,len(notes)-1)) for i in range(0,len(notes)-5,5)]
        for st,en in spans:
            seg=notes[st:en+1]
            if len(seg)<4 or len(seg)>12: continue
            idx=[step_index(int(b),int(bt),int(ta),int(dv)) for (_,b,bt,ta,dv) in seg]
            degs=[degree(int(p),tonic,mode) for (p,_,_,_,_) in seg]
            r=[]; v=[]
            ok=True
            for i in range(len(seg)-1):
                d=idx[i+1]-idx[i]
                if d<=0: d=1
                r.append(min(8,d))
                dv2=degs[i+1]-degs[i]
                if abs(dv2)>7: ok=False; break
                v.append(dv2)
            if not ok or len(v)<3 or len(set(degs))<2: continue
            r=r[:len(v)]                                  # align lengths
            new_r.append({"r":r,"s":"wjazz","role":"lead","c":cr(r)})
            new_v.append({"v":v,"s":"wjazz","role":"lead","c":cv(v)})

    # even-stride caps so jazz phrasing enriches the pool without swamping it
    def cap(l,n):
        if len(l)<=n: return l
        step=len(l)/n; return [l[int(i*step)] for i in range(n)]
    new_r=cap(new_r,1200); new_v=cap(new_v,1500)

    html=io.open(HTMLP,encoding="utf-8").read().split("\n")
    di=next(i for i,l in enumerate(html) if l.startswith("globalThis.IMPROV_DIMENSIONS ="))
    dims=json.loads(html[di][html[di].index("=")+1:].strip().rstrip(";"))
    seenr={json.dumps([e["r"],e.get("role")]) for e in dims["rhythms"]}
    seenv={json.dumps([e["v"],e.get("role")]) for e in dims["contours"]}
    add_r=[e for e in new_r if json.dumps([e["r"],e["role"]]) not in seenr and not seenr.add(json.dumps([e["r"],e["role"]]))]
    add_v=[e for e in new_v if json.dumps([e["v"],e["role"]]) not in seenv and not seenv.add(json.dumps([e["v"],e["role"]]))]
    print("solos:",len(keys))
    print("IMPROV_DIMENSIONS.rhythms:  %d -> %d (+%d wjazz)"%(len(dims['rhythms']),len(dims['rhythms'])+len(add_r),len(add_r)))
    print("IMPROV_DIMENSIONS.contours: %d -> %d (+%d wjazz)"%(len(dims['contours']),len(dims['contours'])+len(add_v),len(add_v)))
    print("NOTE: rhythms and contours stored SEPARATELY (de-identified) — no solo is reproducible")
    if dry: print("[dry run]"); return
    dims["rhythms"].extend(add_r); dims["contours"].extend(add_v)
    dims["note"]=dims.get("note","")+" | wjazz solo phrasing split into rhythm/contour dims (abstract, de-identified)"
    html[di]="globalThis.IMPROV_DIMENSIONS = "+json.dumps(dims,separators=(",",":"))+";"
    io.open(HTMLP,"w",encoding="utf-8").write("\n".join(html))
    print("injected; file %.2f MB"%(os.path.getsize(HTMLP)/1e6))
if __name__=="__main__": main()
