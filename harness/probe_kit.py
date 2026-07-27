import wave, sys, os, numpy as np
def load(p):
    w=wave.open(p); n=w.getnframes(); ch=w.getnchannels()
    d=np.frombuffer(w.readframes(n), dtype=np.int16).astype(np.float64)/32768.0
    if ch==2: d=d.reshape(-1,2).mean(axis=1)
    return d, w.getframerate()
BANDS=[(20,80,"sub"),(80,250,"low"),(250,800,"lomid"),(800,2500,"mid"),
       (2500,6000,"himid"),(6000,12000,"pres"),(12000,20000,"air")]
def spec(seg,sr,N):
    if len(seg)<N: seg=np.pad(seg,(0,N-len(seg)))
    w=np.ones(N); w[N//2:]=np.hanning(N)[N//2:]
    S=np.abs(np.fft.rfft(seg[:N]*w))**2
    f=np.fft.rfftfreq(N,1/sr); tot=max(S.sum(),1e-30)
    return "".join(f"{100*S[(f>=a)&(f<b)].sum()/tot:7.1f}" for a,b,_ in BANDS)
print("Two windows per voice: ATTACK = the first 12 ms, BODY = 370 ms from the onset.")
print("A struck drum needs energy in both; a kit with no attack is a kit you cannot hear.\n")
print(f"{'lane':<9}{'':>8}{'peak':>7}{'dec':>6}   " + "".join(f"{n:>7}" for _,_,n in BANDS))
for p in sorted(sys.argv[1:]):
    x,sr=load(p); peak=np.abs(x).max()
    if peak<1e-5:
        print(f"{os.path.basename(p)[:-4]:<9}{'SILENT':>15}"); continue
    env=np.abs(x); i0=int(np.argmax(env))
    tail=np.where(env[i0:]<peak*0.05)[0]; dec=(tail[0]/sr) if len(tail) else len(x)/sr
    nm=os.path.basename(p)[:-4]
    print(f"{nm:<9}{'attack':>8}{peak:7.3f}{dec:6.3f}   " + spec(x[i0:], sr, int(sr*0.012)))
    print(f"{'':<9}{'body':>8}{'':>7}{'':>6}   " + spec(x[i0:], sr, 1<<14))
