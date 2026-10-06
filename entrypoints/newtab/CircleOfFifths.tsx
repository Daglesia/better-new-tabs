import { useMemo, useState } from 'react';
import { getDiatonicChords, type Mode } from '@/utils/musicTheory';

interface Segment {
  major: [string, string?];
  minor: [string, string?];
}

// Clockwise from the top; [primary, enharmonic alternative]
const CIRCLE: Segment[] = [
  { major: ['C'], minor: ['A'] },
  { major: ['G'], minor: ['E'] },
  { major: ['D'], minor: ['B'] },
  { major: ['A'], minor: ['F♯'] },
  { major: ['E'], minor: ['C♯'] },
  { major: ['B', 'C♭'], minor: ['G♯', 'A♭'] },
  { major: ['F♯', 'G♭'], minor: ['D♯', 'E♭'] },
  { major: ['D♭', 'C♯'], minor: ['B♭', 'A♯'] },
  { major: ['A♭'], minor: ['F'] },
  { major: ['E♭'], minor: ['C'] },
  { major: ['B♭'], minor: ['G'] },
  { major: ['F'], minor: ['D'] },
];

interface Selection {
  index: number;
  mode: Mode;
  alt: boolean;
}

const SIZE = 400;
const C = SIZE / 2;
const R_OUTER = 195;
const R_MID = 125;
const R_INNER = 75;

function point(r: number, angleDeg: number): [number, number] {
  const rad = (angleDeg * Math.PI) / 180;
  return [C + r * Math.sin(rad), C - r * Math.cos(rad)];
}

function wedgePath(r1: number, r2: number, a0: number, a1: number): string {
  const [x0, y0] = point(r2, a0);
  const [x1, y1] = point(r2, a1);
  const [x2, y2] = point(r1, a1);
  const [x3, y3] = point(r1, a0);
  return `M ${x0} ${y0} A ${r2} ${r2} 0 0 1 ${x1} ${y1} L ${x2} ${y2} A ${r1} ${r1} 0 0 0 ${x3} ${y3} Z`;
}

function keyName(segment: Segment, mode: Mode, alt: boolean): string {
  const [primary, secondary] = segment[mode];
  return alt && secondary ? secondary : primary;
}

export default function CircleOfFifths() {
  const [selected, setSelected] = useState<Selection>({ index: 0, mode: 'major', alt: false });

  const segment = CIRCLE[selected.index]!;
  const tonic = keyName(segment, selected.mode, selected.alt);
  const hasAlt = Boolean(segment[selected.mode][1]);

  const chords = useMemo(() => getDiatonicChords(tonic, selected.mode), [tonic, selected.mode]);

  const renderRing = (mode: Mode, r1: number, r2: number, fontSize: number) =>
    CIRCLE.map((seg, i) => {
      const center = i * 30;
      const a0 = center - 15;
      const a1 = center + 15;
      const [primary, secondary] = seg[mode];
      const labels = secondary ? [primary, secondary] : [primary];

      const isSelected = selected.index === i && selected.mode === mode;
      // Highlight the relative key in the other ring
      const isRelative = selected.index === i && selected.mode !== mode;

      const [tx, ty] = point((r1 + r2) / 2, center);
      const lineHeight = fontSize * 1.1;
      const startY = ty - ((labels.length - 1) * lineHeight) / 2;

      return (
        <g
          key={`${mode}-${i}`}
          className="cof__segment"
          onClick={() => setSelected({ index: i, mode, alt: false })}
        >
          <path
            d={wedgePath(r1, r2, a0, a1)}
            fill={`hsl(${i * 30}, 65%, ${mode === 'major' ? 62 : 72}%)`}
            className={[
              'cof__wedge',
              isSelected ? 'cof__wedge--selected' : '',
              isRelative ? 'cof__wedge--relative' : '',
            ].join(' ')}
          />
          {labels.map((label, li) => (
            <text
              key={label}
              x={tx}
              y={startY + li * lineHeight}
              fontSize={fontSize}
              textAnchor="middle"
              dominantBaseline="central"
              className="cof__label"
            >
              {label}
            </text>
          ))}
        </g>
      );
    });

  return (
    <div className="widget cof">
      <div className="widget__header">
        <span>Circle of Fifths</span>
      </div>

      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="cof__svg">
        {renderRing('major', R_MID, R_OUTER, 26)}
        {renderRing('minor', R_INNER, R_MID, 18)}
        <circle cx={C} cy={C} r={R_INNER} className="cof__center" />
        <text x={C} y={C - 8} textAnchor="middle" className="cof__center-title">
          {tonic}
        </text>
        <text x={C} y={C + 18} textAnchor="middle" className="cof__center-subtitle">
          {selected.mode}
        </text>
      </svg>

      <div className="cof__chords">
        {chords.map((chord) => (
          <div key={chord.numeral} className="cof__chord">
            <span className="cof__chord-numeral">{chord.numeral}</span>
            <span className="cof__chord-name">{chord.name}</span>
          </div>
        ))}
      </div>

      {hasAlt && (
        <button
          type="button"
          className="cof__enharmonic"
          onClick={() => setSelected((s) => ({ ...s, alt: !s.alt }))}
        >
          Show as {keyName(segment, selected.mode, !selected.alt)}
        </button>
      )}
    </div>
  );
}