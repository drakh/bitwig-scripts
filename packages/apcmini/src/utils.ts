import { ROOT_NOTE, SCALE } from './enums';
import { KeyboardPad, Octave } from './types';
import { GRID_SIZE, SCALES, DEFINED_OCTAVES, DEFINED_ROOTS } from './constants';

export const mapPadToScale = (
    pad: number,
    rootNote: ROOT_NOTE,
    baseOcatve: Octave,
    scaleType: SCALE,
    isActive: boolean,
    isShift: boolean
): KeyboardPad => {
    const scale = SCALES[scaleType];
    const c = pad % GRID_SIZE;
    const r = Math.floor(pad / GRID_SIZE);
    const n = r * 3 + c;
    const noteIndex = n % 7;
    const isRoot = noteIndex === 0;
    const octave = Math.floor(n / 7);
    const octaveOffset = DEFINED_OCTAVES.indexOf(baseOcatve);
    const noteOffset = DEFINED_ROOTS.indexOf(rootNote);
    const note =
        isActive && !isShift
            ? scale[noteIndex] + octaveOffset * 12 + noteOffset + octave * 12
            : -1;
    return { pad, note, isRoot };
};

export const createKeyboardFilter = (): any => {
    const args: string[] = [];
    for (let i = 0; i < 64; i++) {
        const p = `000${i.toString(16)}`.slice(-2);
        args.push(`80${p}??`);
        args.push(`90${p}??`);
    }
    return args;
};
