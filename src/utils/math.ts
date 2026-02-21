import type { VergleichState, ComputedModels, ValidationErrors, ModelResult } from '../types';

function parseNum(s: string): number | null {
  if (s.trim() === '') return null;
  const v = parseFloat(s);
  return isNaN(v) || !isFinite(v) ? null : v;
}

export function validateInputs(state: VergleichState): ValidationErrors {
  const XA = parseNum(state.XA);
  const t0 = parseNum(state.t0);
  const YA = parseNum(state.YA);
  const DY = parseNum(state.DY);

  const systems = state.systems.map(sys => {
    if (!sys.enabled) {
      return { KS: false, TT: false, TG: false };
    }
    const KS = parseNum(sys.KS);
    const TT = parseNum(sys.TT);
    const TG = parseNum(sys.TG);
    return {
      KS: KS === null || KS === 0,
      TT: TT === null || TT < 0,
      TG: TG === null || TG <= 0,
    };
  }) as ValidationErrors['systems'];

  return {
    XA: XA === null,
    t0: t0 === null,
    YA: YA === null,
    DY: DY === null || DY === 0,
    systems,
  };
}

export function computeModels(state: VergleichState): ComputedModels {
  const XA = parseNum(state.XA);
  const t0 = parseNum(state.t0);
  const DY = parseNum(state.DY);

  if (XA === null || t0 === null || DY === null || DY === 0 || state.timeData.length === 0) {
    return { models: [] };
  }

  const models: ModelResult[] = [];

  state.systems.forEach((sys, i) => {
    if (!sys.enabled) return;

    const KS = parseNum(sys.KS);
    const TT = parseNum(sys.TT);
    const TG = parseNum(sys.TG);

    if (KS === null || KS === 0 || TT === null || TT < 0 || TG === null || TG <= 0) return;

    const tDelay = t0 + TT;
    const data = state.timeData.map(t =>
      t <= tDelay ? XA : XA + KS * DY * (1 - Math.exp(-(t - tDelay) / TG)),
    );

    models.push({ index: i, name: sys.name || `System ${i + 1}`, data });
  });

  return { models };
}

export function fmt(val: number | null, decimals = 4): string {
  return val !== null ? val.toFixed(decimals) : '';
}
