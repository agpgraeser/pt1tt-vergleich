import {
  Box, Typography, Divider, TextField, Checkbox, FormControlLabel,
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
  value, onChange, error = false, step,
}: {
  value: string;
  onChange: (v: string) => void;
  error?: boolean;
  step?: number;
}) {
  return (
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
  gridTemplateColumns: 'auto 95px auto 95px',
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
            <Lbl>XA</Lbl>
            <NumInput
              value={state.XA}
              step={0.01}
              error={errors.XA}
              onChange={v => setSignal('XA', v)}
            />
            <Lbl>t₀</Lbl>
            <NumInput
              value={state.t0}
              step={0.1}
              error={errors.t0}
              onChange={v => setSignal('t0', v)}
            />
            <Lbl>YA</Lbl>
            <NumInput
              value={state.YA}
              step={0.01}
              error={errors.YA}
              onChange={v => setSignal('YA', v)}
            />
            <Lbl>DY</Lbl>
            <NumInput
              value={state.DY}
              step={0.01}
              error={errors.DY}
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
                        {`System ${i + 1}`}
                      </Typography>
                    }
                    sx={{ mr: 1, ml: 0 }}
                  />
                  <TextField
                    value={sys.name}
                    onChange={e => setSysStr(i, 'name', e.target.value)}
                    size="small"
                    placeholder={`System ${i + 1}`}
                    disabled={!sys.enabled}
                    inputProps={{
                      style: { fontSize: '0.82rem', padding: '5px 8px' },
                    }}
                    sx={{ flex: 1 }}
                  />
                </Box>

                {/* KS | TT | TG */}
                <Box sx={{ ...row6, opacity: sys.enabled ? 1 : 0.4 }}>
                  <Lbl>KS</Lbl>
                  <NumInput
                    value={sys.KS}
                    step={0.01}
                    error={sysErrors.KS}
                    onChange={v => setSysStr(i, 'KS', v)}
                  />
                  <Lbl>TT</Lbl>
                  <NumInput
                    value={sys.TT}
                    step={0.1}
                    error={sysErrors.TT}
                    onChange={v => setSysStr(i, 'TT', v)}
                  />
                  <Lbl>TG</Lbl>
                  <NumInput
                    value={sys.TG}
                    step={0.1}
                    error={sysErrors.TG}
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
          <SectionTitle>Messdaten laden</SectionTitle>
          <ExcelImport state={state} dispatch={dispatch} />
        </Box>
      </Box>
    </Box>
  );
}
