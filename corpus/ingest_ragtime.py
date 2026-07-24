#!/usr/bin/env python3
"""
Ingest pre-1930 PUBLIC-DOMAIN ragtime / early-jazz as abstract dimensions.
Ragtime (Joplin d.1917, Lamb, Scott...) is unambiguously public domain, and it
is the syncopated root of jazz -- exactly the "forgotten era" material. We take
the melody line only and store it de-identified: each phrase split into a rhythm
and a contour placed in SEPARATE pools (s="ragtime", role="lead"), per
../docs/LICENSING.md.

Self-contained MIDI parser (stdlib only -- no music21/mido here). Reads a FOLDER
of .mid/.midi files:

    python3 corpus/ingest_ragtime.py --selftest        # prove the parser works
    python3 corpus/ingest_ragtime.py path/to/midis --dry
    python3 corpus/ingest_ragtime.py path/to/midis

NOTE: this sandbox cannot reach a bulk PD ragtime source (github API is gated,
codeload is proxy-blocked, kern.humdrum.org is unreachable, ragtime archives are
HTML-only). Point this at a local folder of PD ragtime MIDIs and it ingests them.
"""
import json, io, os, sys, struct
HERE=os.path.dirname(os.path.abspath(__file__)); ROOT=os.path.dirname(HERE)
MAJ=[0,2,4,5,7,9,11]; MIN=[0,2,3,5,7,8,10]
KS_MAJ=[6.35,2.23,3.48,2.33,4.38,4.09,2.52,5.19,2.39,3.66,2.29,2.88]
KS_MIN=[6.33,2.68,3.52,5.38,2.60,3.53,2.54,4.75,3.98,2.69,3.34,3.17]

# ---- minimal MIDI parser (format 0/1) ----
def _vlq(d,i):
    v=0
    while True:
        b=d[i]; i+=1; v=(v<<7)|(b&0x7f)
        if not b&0x80: break
    return v,i
def parse_midi(d):
    if d[:4]!=b'MThd': raise ValueError("not a MIDI file")
    fmt,ntrk,div=struct.unpack('>HHH',d[8:14]); i=14
    notes=[]  # (pitch, start_tick, dur_tick)
    for _ in range(ntrk):
        if d[i:i+4]!=b'MTrk': break
        tlen=struct.unpack('>I',d[i+4:i+8])[0]; i+=8; end=i+tlen
        t=0; status=0; on={}
        while i<end:
            dt,i=_vlq(d,i); t+=dt
            b=d[i]
            if b&0x80: status=b; i+=1
            ev=status&0xf0
            if status==0xff:
                mt=d[i]; i+=1; ln,i=_vlq(d,i); i+=ln
            elif status in (0xf0,0xf7):
                ln,i=_vlq(d,i); i+=ln
            elif ev in (0x80,0x90):
                p=d[i]; v=d[i+1]; i+=2
                if ev==0x90 and v>0: on.setdefault(p,[]).append(t)
                else:
                    if on.get(p): st=on[p].pop(0); notes.append((p,st,max(1,t-st)))
            elif ev in (0xa0,0xb0,0xe0): i+=2
            elif ev in (0xc0,0xd0): i+=1
            else: i+=1
        i=end
    return div,notes

def topline(notes):
    """monophonic melody = highest pitch among notes sharing a start tick."""
    by={}
    for p,st,du in notes: by.setdefault(st,[]).append((p,du))
    line=[]
    for st in sorted(by):
        p,du=max(by[st])                 # highest pitch wins
        line.append((p,st,du))
    return line

def detect_key(line):
    h=[0.0]*12
    for p,_,du in line: h[p%12]+=du
    def corr(a,b):
        n=len(a); ma=sum(a)/n; mb=sum(b)/n
        num=sum((a[k]-ma)*(b[k]-mb) for k in range(n))
        da=sum((a[k]-ma)**2 for k in range(n))**.5; db=sum((b[k]-mb)**2 for k in range(n))**.5
        return num/(da*db) if da and db else 0
    best=(-9,0,"major")
    for tn in range(12):
        rot=[h[(tn+k)%12] for k in range(12)]
        for mode,prof in (("major",KS_MAJ),("minor",KS_MIN)):
            c=corr(rot,prof)
            if c>best[0]: best=(c,tn,mode)
    return best[1],best[2]
def degree(p,tn,mode):
    rel=(p-tn)%12; octv=(p-tn)//12; sc=MAJ if mode=="major" else MIN
    bi,bd=0,99
    for k,s in enumerate(sc):
        d=abs(rel-s)
        if d<bd: bd,bi=d,k
    return bi+7*octv
def cr(r):
    s=sum(r) or 1; return {"n":len(r),"d":round(len(r)/s,3),"ev":1 if len(set(r))==1 else 0,"sp":1}
def cv(v):
    n=len(v); cum=[0]
    for x in v: cum.append(cum[-1]+x)
    return {"n":n,"rg":max(cum)-min(cum),"dir":(1 if sum(v)>0 else -1 if sum(v)<0 else 0),
            "lp":round(sum(1 for x in v if abs(x)>=2)/n,3) if n else 0,
            "bal":round((sum(1 for x in v if x>0)-sum(1 for x in v if x<0))/n,3) if n else 0}

def dims_from_line(line, div):
    tn,mode=detect_key(line); six=max(1,div/4)
    idx=[round(st/six) for _,st,_ in line]; degs=[degree(p,tn,mode) for p,_,_ in line]
    out_r=[]; out_v=[]
    for a in range(0,len(line)-5,5):
        r=[]; v=[]; ok=True
        for k in range(a,min(a+5,len(line)-1)):
            d=idx[k+1]-idx[k]
            r.append(min(8,max(1,d)))
            dv=degs[k+1]-degs[k]
            if abs(dv)>7: ok=False; break
            v.append(dv)
        if ok and len(v)>=3 and len(set(degs[a:a+6]))>=2:
            r=r[:len(v)]
            out_r.append({"r":r,"s":"ragtime","role":"lead","c":cr(r)})
            out_v.append({"v":v,"s":"ragtime","role":"lead","c":cv(v)})
    return out_r,out_v

def selftest():
    # build a tiny MIDI: C4 D4 E4 F4 G4, quarter notes, div=480
    div=480; trk=b''
    seq=[60,62,64,65,67,69,71,72,71,69,67,65]
    for p in seq:
        trk+=b'\x00'+bytes([0x90,p,80])       # note on, dt 0
        trk+=bytes([0x83,0x60])+bytes([0x80,p,0])  # note off after 480 ticks (0x8360 vlq=480)
    trk+=b'\x00\xff\x2f\x00'
    hdr=b'MThd'+struct.pack('>IHHH',6,0,1,div)
    mid=hdr+b'MTrk'+struct.pack('>I',len(trk))+trk
    div2,notes=parse_midi(mid)
    line=topline(notes)
    assert div2==480, div2
    assert [p for p,_,_ in line]==seq, line
    assert all(abs(du-480)<=1 for _,_,du in line), line
    r,v=dims_from_line(line,div2)
    assert r and v and len(v[0]["v"])>=3, (r,v)
    print("SELFTEST OK: parsed",len(notes),"notes; pitches",[p for p,_,_ in line])
    print("  key-detect + dims:",len(r),"rhythm +",len(v),"contour; sample contour v=",v[0]["v"],"role=",v[0]["role"],"src=",v[0]["s"])

def main():
    if "--selftest" in sys.argv: return selftest()
    args=[a for a in sys.argv[1:] if not a.startswith("--")]
    if not args: print(__doc__); return
    folder=args[0]; dry="--dry" in sys.argv
    mids=[os.path.join(folder,f) for f in sorted(os.listdir(folder)) if f.lower().endswith((".mid",".midi"))]
    print("MIDI files:",len(mids))
    all_r=[]; all_v=[]
    for f in mids:
        try:
            div,notes=parse_midi(open(f,"rb").read())
            r,v=dims_from_line(topline(notes),div); all_r+=r; all_v+=v
        except Exception as e: print("  skip",os.path.basename(f),":",e)
    def cap(l,n):
        if len(l)<=n: return l
        step=len(l)/n; return [l[int(i*step)] for i in range(n)]
    all_r=cap(all_r,1000); all_v=cap(all_v,1200)
    HTML=[x for x in os.listdir(ROOT) if x.endswith(".html")][0]; HTMLP=os.path.join(ROOT,HTML)
    html=io.open(HTMLP,encoding="utf-8").read().split("\n")
    di=next(i for i,l in enumerate(html) if l.startswith("globalThis.IMPROV_DIMENSIONS ="))
    dims=json.loads(html[di][html[di].index("=")+1:].strip().rstrip(";"))
    seenr={json.dumps([e["r"],e.get("role")]) for e in dims["rhythms"]}
    seenv={json.dumps([e["v"],e.get("role")]) for e in dims["contours"]}
    add_r=[e for e in all_r if json.dumps([e["r"],e["role"]]) not in seenr and not seenr.add(json.dumps([e["r"],e["role"]]))]
    add_v=[e for e in all_v if json.dumps([e["v"],e["role"]]) not in seenv and not seenv.add(json.dumps([e["v"],e["role"]]))]
    print("rhythms +%d, contours +%d"%(len(add_r),len(add_v)))
    if dry: print("[dry run]"); return
    dims["rhythms"]+=add_r; dims["contours"]+=add_v
    html[di]="globalThis.IMPROV_DIMENSIONS = "+json.dumps(dims,separators=(",",":"))+";"
    io.open(HTMLP,"w",encoding="utf-8").write("\n".join(html)); print("injected")
if __name__=="__main__": main()
