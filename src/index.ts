/**
 * What MKIII offers a caller: compose a record, read it, render it.
 * The CLI and the page are both written against this and nothing else.
 */

export { compose, type Request, type Song } from "./song.ts";
export { isPin, type Edit } from "./core/rng.ts";
export {
  ASPECTS, reroll, candidates, rerollAspect, rerollWord, setTempo, setKey, setMode, setVoice, setWord, split,
  setPlays, setJob, setFigure, setProtagonist, setIntro, setSwing, setRegister, setChords, setForm, setTreatment, parseDeskWord, deskOf, deskWords,
  describeEdit, formatEdit, parseEdit, type Aspect, type Selection,
} from "./edit.ts";
export { dump, summary, motionOf, distinctBars, PROGRAM, type Motion } from "./dump.ts";
export { Engine, render, rms, peak, settle, type Stereo } from "./sound/render.ts";
export {
  RACK_ORDER, PEDAL_ORDER, PEDALS_ADD, FX_ORDER, FX_WHERE, SENDS, ROLES, PITCHED_ROLES, DRUM_LANES, KIT_NAMES, CIRCUITS,
  ELEMENTS, TEXTURES, LEGAL_TEXTURES, INTRO_KINDS, SECTION_FNS, TREATMENTS,
  type RackSpec, type RackRules, type SoundSpec,
} from "./genre/spec.ts";
export { wav } from "./sound/wav.ts";
export { midi, live, type LiveEvent } from "./sound/midi.ts";
export { offeredBy } from "./stage/treat.ts";
export { wire, rigOf, rigWords, DEVICES, DEVICE_NAMES, RIGS, type Rig, type Dest, type LaneDest, type DeviceName } from "./sound/wire.ts";
export { GENRES, GENRE_NAMES, genre, type GenreName } from "./genre/index.ts";
export { NOTE_NAMES, noteName, pc } from "./core/theory.ts";
export * as dsp from "./sound/dsp.ts";
export { KITS, voiceOf } from "./sound/tr1000.ts";
