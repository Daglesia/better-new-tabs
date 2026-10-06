export type Mode = 'major' | 'minor';

export interface DiatonicChord {
  numeral: string;
  name: string;
}

const LETTERS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const LETTER_PC = [0, 2, 4, 5, 7, 9, 11];

const MAJOR_STEPS = [0, 2, 4, 5, 7, 9, 11];
const MINOR_STEPS = [0, 2, 3, 5, 7, 8, 10]; // natural minor

const MAJOR_CHORDS = [
  { numeral: 'I', suffix: '' },
  { numeral: 'ii', suffix: 'm' },
  { numeral: 'iii', suffix: 'm' },
  { numeral: 'IV', suffix: '' },
  { numeral: 'V', suffix: '' },
  { numeral: 'vi', suffix: 'm' },
  { numeral: 'vii°', suffix: '°' },
];

const MINOR_CHORDS = [
  { numeral: 'i', suffix: 'm' },
  { numeral: 'ii°', suffix: '°' },
  { numeral: 'III', suffix: '' },
  { numeral: 'iv', suffix: 'm' },
  { numeral: 'v', suffix: 'm' },
  { numeral: 'VI', suffix: '' },
  { numeral: 'VII', suffix: '' },
];

function parseTonic(note: string): { letterIdx: number; pc: number } {
  const letterIdx = LETTERS.indexOf(note[0] ?? 'C');
  let pc = LETTER_PC[letterIdx] ?? 0;
  for (const ch of note.slice(1)) {
    if (ch === '♯') pc += 1;
    if (ch === '♭') pc -= 1;
  }
  return { letterIdx, pc: ((pc % 12) + 12) % 12 };
}

/** Spell a pitch class using a specific letter, so scales never repeat letters. */
function spell(letterIdx: number, pc: number): string {
  const base = LETTER_PC[letterIdx] ?? 0;
  let diff = (((pc - base) % 12) + 12) % 12;
  if (diff > 6) diff -= 12;
  const accidental = diff > 0 ? '♯'.repeat(diff) : '♭'.repeat(-diff);
  return `${LETTERS[letterIdx]}${accidental}`;
}

export function getDiatonicChords(tonic: string, mode: Mode): DiatonicChord[] {
  const { letterIdx, pc } = parseTonic(tonic);
  const steps = mode === 'major' ? MAJOR_STEPS : MINOR_STEPS;
  const chords = mode === 'major' ? MAJOR_CHORDS : MINOR_CHORDS;

  return chords.map((chord, degree) => {
    const root = spell((letterIdx + degree) % 7, (pc + (steps[degree] ?? 0)) % 12);
    return { numeral: chord.numeral, name: `${root}${chord.suffix}` };
  });
}