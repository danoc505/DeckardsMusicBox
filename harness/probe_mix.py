import wave, sys, numpy as np
def load(p):
    w=wave.open(p); n=w.getnframes(); ch=w.getnchannels(); sw=w.getsampwidth()
    d=np.frombuffer(w.readframes(n), dtype=np.int16).astype(np.float64)/32768.0
    if ch==2: d=d.reshape(-1,2).mean(axis=1)
    return d, w.getframerate()
for p in sys.argv[1:]:
    x,sr=load(p)
    peak=np.abs(x).max(); rms=np.sqrt((x**2).mean())
    clip=(np.abs(x)>0.985).sum()
    # crest factor: peak vs rms in dB -- low means squashed/distorted
    crest=20*np.log10(peak/max(rms,1e-9))
    # DC offset
    dc=x.mean()
    # spectrum: energy by band
    N=1<<15
    seg=x[:len(x)//N*N].reshape(-1,N)
    if len(seg)==0: seg=x[None,:N]
    win=np.hanning(N)
    S=np.abs(np.fft.rfft(seg*win,axis=1)).mean(axis=0)
    f=np.fft.rfftfreq(N,1/sr)
    tot=(S**2).sum()
    def band(a,b): return 100*(S[(f>=a)&(f<b)]**2).sum()/tot
    print(f"\n{p.split('/')[-1]}")
    print(f"  peak {peak:.3f}   rms {rms:.4f}   crest {crest:.1f} dB   clipped samples {clip}  ({100*clip/len(x):.2f}%)")
    print(f"  DC offset {dc:+.5f}")
    print(f"  sub<60 {band(0,60):5.1f}%   bass 60-250 {band(60,250):5.1f}%   mid 250-2k {band(250,2000):5.1f}%"
          f"   hi-mid 2k-6k {band(2000,6000):5.1f}%   air>6k {band(6000,sr/2):5.1f}%")
