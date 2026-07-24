#!/usr/bin/env python3
"""
STRUCTURE CORPUS: harvest real song FORMS from the Jazz Harmony Treebank by
detecting which sections repeat (AABA, ABAC, AAB-blues...). A tune's form is read
off its chord structure exactly as a musician reads it off a lead sheet: split into
equal sections, label them A/B/C by chord-sequence similarity. Stored relatively
(section letters + roles), no melodies -- progressions aren't copyrightable.

    python3 corpus/build_structure.py --dry     # report the real-form distribution
    python3 corpus/build_structure.py           # inject IMPROV_FORMS into the HTML
"""
import json, io, os, sys, tempfile, urllib.request
from collections import Counter
HERE=os.path.dirname(os.path.abspath(__file__)); ROOT=os.path.dirname(HERE)
HTML=[f for f in os.listdir(ROOT) if f.endswith(".html")][0]; HTMLP=os.path.join(ROOT,HTML)
CACHE=os.path.join(tempfile.gettempdir(),"jazz_treebank.json")
URL="https://raw.githubusercontent.com/DCMLab/JazzHarmonyTreebank/master/treebank.json"
PC={"C":0,"D":2,"E":4,"F":5,"G":7,"A":9,"B":11}; MAJ=[0,2,4,5,7,9,11]; MIN=[0,2,3,5,7,8,10]

def root(sym):
    if not sym or sym[0] not in PC: return None
    pc=PC[sym[0]]; i=1
    while i<len(sym) and sym[i] in "#b": pc+=(1 if sym[i]=="#" else -1); i+=1
    return pc%12
def parse_key(k):
    mode="minor" if (k[-1:]=="m" or (k[:1].islower())) else "major"
    kk=k.rstrip("m"); return (root(kk[0].upper()+kk[1:]) or 0), mode
def deg(pc,tonic,mode):
    rel=(pc-tonic)%12; sc=MAJ if mode=="major" else MIN; bi,bd=0,99
    for i,s in enumerate(sc):
        d=abs(rel-s)
        if d<bd: bd,bi=d,i
    return bi

def sim(a,b):
    if not a or not b: return 0
    n=min(len(a),len(b)); m=sum(1 for i in range(n) if a[i]==b[i])
    return m/max(len(a),len(b))

def form_of(tune):
    tonic,mode=parse_key(tune.get("key","C"))
    meas=tune.get("measures",[]); chords=tune.get("chords",[])
    if not meas or not chords or len(meas)!=len(chords): return None
    nbars=max(meas)
    if nbars<8 or nbars>64: return None
    # per-bar signature = tuple of chord-degrees in that bar
    bars={}
    for m,ch in zip(meas,chords):
        pc=root(str(ch))
        if pc is None: continue
        bars.setdefault(m,[]).append(deg(pc,tonic,mode))
    seq=[tuple(bars.get(b,[])) for b in range(1,nbars+1)]
    # try section lengths that divide the tune into 2..5 sections
    best=None
    for nsec in (4,2,3,5):
        if nbars%nsec: continue
        L=nbars//nsec; secs=[tuple(seq[i*L:(i+1)*L]) for i in range(nsec)]
        # label by similarity to earlier sections
        labels=[]; reps=[]
        for s in secs:
            found=None
            for li,rep in enumerate(reps):
                # flatten for comparison
                if sim([x for t in s for x in t],[x for t in rep for x in t])>=0.75: found=chr(65+li); break
            if found: labels.append(found)
            else: labels.append(chr(65+len(reps))); reps.append(s)
        fs="".join(labels)
        # prefer forms with real repetition (not all-distinct), 2-5 sections
        if len(set(fs))<len(fs):
            best=(fs, nsec, L); break
        if best is None: best=(fs,nsec,L)
    return best

def main():
    dry="--dry" in sys.argv
    tb=json.load(open(CACHE)) if os.path.exists(CACHE) else json.load(urllib.request.urlopen(URL))
    forms=Counter()
    for t in tb:
        f=form_of(t)
        if f: forms[(f[0],f[1])]+=1
    print("tunes:",len(tb))
    print("top real forms (form, #sections): count")
    for (fs,ns),c in forms.most_common(16): print("  %-8s (%d sec): %d"%(fs,ns,c))
    # map to engine section objects (A=body, last-unique-letter/B in AABA=bridge)
    ROLE={"A":"body","B":"hook","C":"bridge","D":"lift","E":"body"}
    def to_form(fs):
        # the contrasting section (the one appearing once, latest) is the bridge
        cnt=Counter(fs); bridge=None
        for ch in fs:
            if cnt[ch]==1: bridge=ch
        out=[]
        for ch in fs:
            role = "bridge" if ch==bridge else ROLE.get(ch,"body")
            out.append({"name":ch,"role":role,"bars":8,**({"contrast":True} if ch==bridge else {})})
        return out
    # keep forms seen in >=3 tunes, 2-5 sections, with repetition
    keep=[(fs,ns,c) for (fs,ns),c in forms.most_common() if c>=3 and 2<=ns<=5 and len(set(fs))<ns]
    corpus=[{"form":fs,"sections":to_form(fs),"n":c} for fs,ns,c in keep]
    print("\nstructure corpus: %d distinct real forms (seen >=3 tunes, with repetition)"%len(corpus))
    if dry: print("[dry run]"); return
    html=io.open(HTMLP,encoding="utf-8").read().split("\n")
    # inject as a new global right after IMPROV_DIMENSIONS
    di=next(i for i,l in enumerate(html) if l.startswith("globalThis.IMPROV_DIMENSIONS ="))
    line="globalThis.IMPROV_FORMS = "+json.dumps({"note":"real song forms harvested from Jazz Harmony Treebank by section-repetition detection","forms":corpus},separators=(",",":"))+";"
    if any(l.startswith("globalThis.IMPROV_FORMS =") for l in html):
        idx=next(i for i,l in enumerate(html) if l.startswith("globalThis.IMPROV_FORMS ="))
        html[idx]=line
    else:
        html.insert(di+1, line)
    io.open(HTMLP,"w",encoding="utf-8").write("\n".join(html))
    print("injected IMPROV_FORMS (%d forms); file %.2f MB"%(len(corpus),os.path.getsize(HTMLP)/1e6))

if __name__=="__main__": main()
