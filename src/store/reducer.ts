import type { VergleichState, ExcelParseResult, SystemParams } from '../types';

export type Action =
  | { type: 'SET_SIGNAL_FIELD'; field: 'XA' | 't0' | 'YA' | 'DY'; value: string }
  | { type: 'SET_SYSTEM_FIELD'; index: 0 | 1 | 2 | 3; field: keyof SystemParams; value: string | boolean }
  | { type: 'LOAD_EXCEL'; result: ExcelParseResult; fileName: string };

function makeSystem(name: string, enabled: boolean): SystemParams {
  return { name, KS: '', TT: '', TG: '', enabled };
}

export const initialState: VergleichState = {
  XA: '',
  t0: '',
  YA: '',
  DY: '',
  systems: [
    makeSystem('System 1', true),
    makeSystem('System 2', false),
    makeSystem('System 3', false),
    makeSystem('System 4', false),
  ],
  timeData: [],
  xData: [],
  yData: [],
  systemName: '',
  varNames: { time: 'Zeit', x: 'X', y: null },
  units: { time: '', x: '', y: '' },
  fileName: '',
  excelPreviewRows: [],
};

function updateSystem(
  systems: VergleichState['systems'],
  index: 0 | 1 | 2 | 3,
  patch: Partial<SystemParams>,
): VergleichState['systems'] {
  return systems.map((s, i) =>
    i === index ? { ...s, ...patch } : s,
  ) as VergleichState['systems'];
}

export function reducer(state: VergleichState, action: Action): VergleichState {
  switch (action.type) {
    case 'SET_SIGNAL_FIELD':
      return { ...state, [action.field]: action.value };

    case 'SET_SYSTEM_FIELD':
      return {
        ...state,
        systems: updateSystem(state.systems, action.index, {
          [action.field]: action.value,
        }),
      };

    case 'LOAD_EXCEL':
      return {
        ...state,
        XA: '',
        t0: '',
        YA: '',
        DY: '',
        systems: [
          makeSystem('System 1', true),
          makeSystem('System 2', false),
          makeSystem('System 3', false),
          makeSystem('System 4', false),
        ],
        timeData: action.result.timeData,
        xData: action.result.xData,
        yData: action.result.yData,
        systemName: action.result.systemName,
        varNames: action.result.varNames,
        units: action.result.units,
        fileName: action.fileName,
        excelPreviewRows: action.result.previewRows,
      };

    default:
      return state;
  }
}
