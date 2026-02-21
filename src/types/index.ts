export interface VarNames {
  time: string;
  x: string;
  y: string | null;
}

export interface Units {
  time: string;
  x: string;
  y: string;
}

export interface ExcelParseResult {
  timeData: number[];
  xData: number[];
  yData: number[];
  systemName: string;
  varNames: VarNames;
  units: Units;
  previewRows: (string | number | undefined)[][];
}

export interface SystemParams {
  name: string;
  KS: string;
  TT: string;
  TG: string;
  enabled: boolean;
}

export interface VergleichState {
  XA: string;
  t0: string;
  YA: string;
  DY: string;
  systems: [SystemParams, SystemParams, SystemParams, SystemParams];
  timeData: number[];
  xData: number[];
  yData: number[];
  systemName: string;
  varNames: VarNames;
  units: Units;
  fileName: string;
  excelPreviewRows: (string | number | undefined)[][];
}

export interface ModelResult {
  index: number;
  name: string;
  data: number[];
}

export interface ComputedModels {
  models: ModelResult[];
}

export interface SystemErrors {
  KS: boolean;
  TT: boolean;
  TG: boolean;
}

export interface ValidationErrors {
  XA: boolean;
  t0: boolean;
  YA: boolean;
  DY: boolean;
  systems: [SystemErrors, SystemErrors, SystemErrors, SystemErrors];
}
