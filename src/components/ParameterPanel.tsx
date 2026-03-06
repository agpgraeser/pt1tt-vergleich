import {
  Box, Typography, Divider, TextField, Checkbox, FormControlLabel, Tooltip,
} from '@mui/material';
import type { Action } from '../store/reducer';
import type { VergleichState } from '../types';
import { validateInputs } from '../utils/math';
import ExcelImport from './ExcelImport';

interface Props {
  state: VergleichState;
  dispatch: React.Dispatch<Action>;
}

// ── Inline helpers ────────────────────────────────────────────────────────────

function NumInput({
  value, onChange, error = false, step, tooltip,
}: {
  value: string;
  onChange: (v: string) => void;
  error?: boolean;
  step?: number;
  tooltip?: string;
}) {
  const field = (
    <TextField
      value={value}
      onChange={e => onChange(e.target.value)}
      type="number"
      size="small"
      error={error}
      inputProps={{
        step,
        style: { textAlign: 'right', fontSize: '0.82rem', padding: '5px 8px' },
      }}
    />
  );
  return tooltip ? (
    <Tooltip title={tooltip} placement="right" arrow>
      <span>{field}</span>
    </Tooltip>
  ) : field;
}

function Lbl({ children }: { children: React.ReactNode }) {
  return (
    <Typography
      variant="body2"
      fontWeight={500}
      sx={{ fontSize: '0.82rem', whiteSpace: 'nowrap' }}
    >
      {children}
    </Typography>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1, fontSize: '0.82rem' }}>
      {children}
    </Typography>
  );
}

// 6-column compact grid: label | input | label | input | label | input
const row6: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'auto 95px auto 95px auto 95px',
  columnGap: '6px',
  rowGap: '4px',
  alignItems: 'center',
};

// 4-column compact grid: label | input | label | input  (2 rows for 4 fields)
const row4: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'max-content 95px max-content 95px',
  columnGap: '6px',
  rowGap: '4px',
  alignItems: 'center',
};

// ── Main component ────────────────────────────────────────────────────────────

export default function ParameterPanel({ state, dispatch }: Props) {
  const errors = validateInputs(state);

  function setSignal(field: 'XA' | 't0' | 'YA' | 'DY', value: string) {
    dispatch({ type: 'SET_SIGNAL_FIELD', field, value });
  }

  function setSysStr(index: 0 | 1 | 2 | 3, field: 'name' | 'KS' | 'TT' | 'TG', value: string) {
    dispatch({ type: 'SET_SYSTEM_FIELD', index, field, value });
  }

  function setSysEnabled(index: 0 | 1 | 2 | 3, value: boolean) {
    dispatch({ type: 'SET_SYSTEM_FIELD', index, field: 'enabled', value });
  }

  return (
    <Box
      sx={{
        background: '#fff',
        boxShadow: '2px 0 4px rgba(0,0,0,0.06)',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        overflow: 'hidden',
      }}
    >
      {/* ══ Scrollable top zone ══════════════════════════════════════════════ */}
      <Box sx={{ flex: 1, overflowY: 'auto' }}>

        {/* ── Section 1: Eingangssignal ── */}
        <Box sx={{ px: 2, pt: 2, pb: 1.5 }}>
          <SectionTitle>Eingangssignal</SectionTitle>
          <Box sx={row4}>
            <Tooltip title="Anfangswert der Sprungantwort" placement="right" arrow>
              <span><Lbl>XA</Lbl></span>
            </Tooltip>
            <NumInput
              value={state.XA}
              step={0.01}
              error={errors.XA}
              tooltip="Anfangswert der Sprungantwort"
              onChange={v => setSignal('XA', v)}
            />
            <Tooltip title="Zeitpunkt der Sprunganregung" placement="right" arrow>
              <span><Lbl>t₀</Lbl></span>
            </Tooltip>
            <NumInput
              value={state.t0}
              step={0.1}
              error={errors.t0}
              tooltip="Zeitpunkt der Sprunganregung"
              onChange={v => setSignal('t0', v)}
            />
            <Tooltip title="Anfangswert der Stellgröße" placement="right" arrow>
              <span><Lbl>YA</Lbl></span>
            </Tooltip>
            <NumInput
              value={state.YA}
              step={0.01}
              error={errors.YA}
              tooltip="Anfangswert der Stellgröße"
              onChange={v => setSignal('YA', v)}
            />
            <Tooltip title="Änderung der Stellgröße zum Zeitpunkt t₀" placement="right" arrow>
              <span><Lbl>DY</Lbl></span>
            </Tooltip>
            <NumInput
              value={state.DY}
              step={0.01}
              error={errors.DY}
              tooltip="Änderung der Stellgröße zum Zeitpunkt t₀"
              onChange={v => setSignal('DY', v)}
            />
          </Box>
        </Box>

        <Divider />

        {/* ── Sections 2–5: System 1–4 ── */}
        {([0, 1, 2, 3] as const).map(i => {
          const sys = state.systems[i];
          const sysErrors = errors.systems[i];
          return (
            <Box key={i}>
              <Box sx={{ px: 2, py: 1.5 }}>
                {/* Header: checkbox + name field */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 1 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={sys.enabled}
                        size="small"
                        onChange={e => setSysEnabled(i, e.target.checked)}
                        sx={{ p: 0.3 }}
                      />
                    }
                    label={
                      <Typography variant="subtitle2" fontWeight={600} sx={{ fontSize: '0.82rem' }}>
                        {`Anzeige System ${i + 1}`}
                      </Typography>
                    }
                    sx={{ mr: 1, ml: 0 }}
                  />
                  <TextField
                    value={sys.name}
                    onChange={e => setSysStr(i, 'name', e.target.value)}
                    size="small"
                    placeholder={`Sys ${i + 1}`}
                    disabled={!sys.enabled}
                    inputProps={{
                      maxLength: 10,
                      style: { fontSize: '0.82rem', padding: '5px 8px', width: '80px' },
                    }}
                    sx={{ width: 96 }}
                  />
                </Box>

                {/* KS | TT | TG */}
                <Box sx={{ ...row6, opacity: sys.enabled ? 1 : 0.4 }}>
                  <Tooltip title="Verstärkungsfaktor des Systems" placement="right" arrow>
                    <span><Lbl>KS</Lbl></span>
                  </Tooltip>
                  <NumInput
                    value={sys.KS}
                    step={0.01}
                    error={sysErrors.KS}
                    tooltip="Verstärkungsfaktor des Systems"
                    onChange={v => setSysStr(i, 'KS', v)}
                  />
                  <Tooltip title="Totzeit des Systems" placement="right" arrow>
                    <span><Lbl>TT</Lbl></span>
                  </Tooltip>
                  <NumInput
                    value={sys.TT}
                    step={0.1}
                    error={sysErrors.TT}
                    tooltip="Totzeit des Systems"
                    onChange={v => setSysStr(i, 'TT', v)}
                  />
                  <Tooltip title="Zeitkonstante des Systems" placement="right" arrow>
                    <span><Lbl>TG</Lbl></span>
                  </Tooltip>
                  <NumInput
                    value={sys.TG}
                    step={0.1}
                    error={sysErrors.TG}
                    tooltip="Zeitkonstante des Systems"
                    onChange={v => setSysStr(i, 'TG', v)}
                  />
                </Box>
              </Box>
              <Divider />
            </Box>
          );
        })}

        {/* ── Section: Messdaten laden ── */}
        <Box sx={{ px: 2, py: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 1 }}>
            <Typography variant="subtitle2" fontWeight={600} sx={{ fontSize: '0.82rem', flex: 1 }}>
              Messdaten laden
            </Typography>
            <FormControlLabel
              control={
                <Checkbox
                  checked={state.showExcelData}
                  size="small"
                  onChange={e => dispatch({ type: 'SET_SHOW_EXCEL_DATA', value: e.target.checked })}
                  sx={{ p: 0.3 }}
                />
              }
              label={
                <Typography variant="body2" sx={{ fontSize: '0.82rem' }}>
                  anzeigen
                </Typography>
              }
              sx={{ mr: 0, ml: 0 }}
            />
          </Box>
          <ExcelImport state={state} dispatch={dispatch} />
        </Box>
      </Box>
    </Box>
  );
}
