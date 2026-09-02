/** A stereo record as a 16-bit PCM WAV file. */
export function wav(left: Float32Array, right: Float32Array, sampleRate: number): Uint8Array {
  const n = Math.min(left.length, right.length);
  const bytes = 44 + n * 4;
  const out = new Uint8Array(bytes);
  const view = new DataView(out.buffer);
  const ascii = (at: number, s: string): void => {
    for (let i = 0; i < s.length; i++) out[at + i] = s.charCodeAt(i);
  };
  ascii(0, "RIFF");
  view.setUint32(4, bytes - 8, true);
  ascii(8, "WAVE");
  ascii(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 2, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 4, true);
  view.setUint16(32, 4, true);
  view.setUint16(34, 16, true);
  ascii(36, "data");
  view.setUint32(40, n * 4, true);
  const clamp = (v: number): number => Math.round(Math.max(-1, Math.min(1, v)) * 32767);
  for (let i = 0; i < n; i++) {
    view.setInt16(44 + i * 4, clamp(left[i]!), true);
    view.setInt16(46 + i * 4, clamp(right[i]!), true);
  }
  return out;
}
