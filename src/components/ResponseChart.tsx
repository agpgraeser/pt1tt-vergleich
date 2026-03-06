import { useEffect, useRef, useState } from 'react';
import Plotly from 'plotly.js';
import { Box, Typography, ToggleButton, ToggleButtonGroup } from '@mui/material';
import type { VergleichState, ComputedModels } from '../types';

interface Props {
  state: VergleichState;
  computed: ComputedModels;
}

const MODEL_COLORS: [string, string, string, string] = [
  '#d32f2f',  // 0: rot
  '#2e7d32',  // 1: dunkelgrün
  '#6a1b9a',  // 2: violett
  '#e65100',  // 3: dunkelorange
];

type BottomMode = 1 | 2 | 3 | 4;

const BOTTOM_LABELS: Record<BottomMode, string> = {
  1: 'Stellgröße',
  2: 'Abweichung',
  3: 'Quadr. Abw.',
  4: 'Σ e²·Δt',
};

export default function ResponseChart({ state, computed }: Props) {
  const topRef = useRef<HTMLDivElement>(null);
  const botRef = useRef<HTMLDivElement>(null);
  const [bottomMode, setBottomMode] = useState<BottomMode>(1);

  // ── Resize observers ────────────────────────────────────────────────────────
  useEffect(() => {
    const topDiv = topRef.current;
    const botDiv = botRef.current;
    if (!topDiv || !botDiv) return;
    const obs = new ResizeObserver(() => {
      Plotly.Plots.resize(topDiv);
      Plotly.Plots.resize(botDiv);
    });
    obs.observe(topDiv);
    obs.observe(botDiv);
    return () => {
      obs.disconnect();
      Plotly.purge(topDiv);
      Plotly.purge(botDiv);
    };
  }, []);

  // ── Top chart: Messdaten (Spalte 2) + Modellantworten ───────────────────────
  useEffect(() => {
    const div = topRef.current;
    if (!div) return;

    const { timeData, xData, fileName, varNames, showExcelData } = state;
    const { models, timeAxis } = computed;

    const hasExcel = showExcelData && timeData.length > 0;
    const hasModels = models.length > 0;

    if (!hasExcel && !hasModels) {
      Plotly.purge(div);
      return;
    }

    const traces: Plotly.Data[] = [];

    if (hasExcel) {
      traces.push({
        x: timeData,
        y: xData,
        mode: 'lines',
        name: varNames.x || 'Messwert',
        line: { width: 2, color: 'blue' },
      });
    }

    models.forEach(m => {
      traces.push({
        x: timeAxis,
        y: m.data,
        mode: 'lines',
        name: m.name,
        line: { width: 2, color: MODEL_COLORS[m.index as 0 | 1 | 2 | 3] },
      });
    });

    const layout: Partial<Plotly.Layout> = {
      title: {
        text: fileName ? `${fileName} — PT1TT Vergleich` : 'PT1TT Vergleich',
        y: 0.97,
      },
      xaxis: { title: { text: varNames.time || 'Zeit' } },
      yaxis: { title: { text: varNames.x || 'Ausgangsgröße' }, autorange: true },
      legend: { orientation: 'h', y: -0.22, x: 0 },
      margin: { t: 45, r: 20, b: 75, l: 60 },
      autosize: true,
    };

    Plotly.react(div, traces, layout, { responsive: true });
  }, [state, computed]);

  // ── Bottom chart ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const div = botRef.current;
    if (!div) return;

    if (state.timeData.length === 0) {
      Plotly.purge(div);
      return;
    }

    const { timeData, xData, yData, varNames } = state;
    const { models } = computed;

    let traces: Plotly.Data[] = [];
    let yTitle = '';
    let showLegend = false;

    if (bottomMode === 1) {
      // Stellgröße – Excel Spalte 3 (yData)
      yTitle = varNames.y || 'Stellgröße';
      if (yData.length > 0) {
        traces = [{
          x: timeData,
          y: yData,
          mode: 'lines',
          name: varNames.y || 'Stellgröße',
          line: { width: 2, color: '#9e9e9e' },
        }];
      }
    } else if (bottomMode === 2) {
      // Abweichungen: Messdaten − Modelldaten
      yTitle = 'Abweichung';
      showLegend = true;
      traces = models.map(m => ({
        x: timeData,
        y: xData.map((v, i) => v - (m.data[i] ?? 0)),
        mode: 'lines',
        name: m.name,
        line: { width: 2, color: MODEL_COLORS[m.index as 0 | 1 | 2 | 3] },
      }));
    } else if (bottomMode === 3) {
      // Quadratische Abweichungen
      yTitle = 'Quadr. Abweichung';
      showLegend = true;
      traces = models.map(m => ({
        x: timeData,
        y: xData.map((v, i) => (v - (m.data[i] ?? 0)) ** 2),
        mode: 'lines',
        name: m.name,
        line: { width: 2, color: MODEL_COLORS[m.index as 0 | 1 | 2 | 3] },
      }));
    } else {
      // Mode 4: Kumulative Summe der quadrierten Abweichungen
      // S(t0) = 0;  S(ti) = S(ti-1) + e(ti)^2 * DT
      yTitle = 'Σ e²·Δt';
      showLegend = true;
      traces = models.map(m => {
        const cumSum: number[] = [];
        let acc = 0;
        for (let i = 0; i < timeData.length; i++) {
          const dt = i === 0 ? 0 : timeData[i] - timeData[i - 1];
          const e = xData[i] - (m.data[i] ?? 0);
          acc += e * e * dt;
          cumSum.push(acc);
        }
        return {
          x: timeData,
          y: cumSum,
          mode: 'lines',
          name: m.name,
          line: { width: 2, color: MODEL_COLORS[m.index as 0 | 1 | 2 | 3] },
        };
      });
    }

    const layout: Partial<Plotly.Layout> = {
      xaxis: { title: { text: varNames.time || 'Zeit' } },
      yaxis: { title: { text: yTitle }, autorange: true },
      legend: { orientation: 'h', y: -0.3, x: 0 },
      margin: { t: 10, r: 20, b: 75, l: 60 },
      autosize: true,
      showlegend: showLegend,
    };

    Plotly.react(div, traces, layout, { responsive: true });
  }, [state, computed, bottomMode]);

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', background: '#fafafa' }}>

      {/* Top chart – 60 % */}
      <Box sx={{ flex: '0 0 60%', minHeight: 0 }}>
        <div ref={topRef} style={{ width: '100%', height: '100%' }} />
      </Box>

      {/* Selector bar */}
      <Box sx={{
        px: 2, py: 0.5,
        borderTop: '1px solid #e0e0e0',
        borderBottom: '1px solid #e0e0e0',
        display: 'flex', alignItems: 'center', gap: 1.5,
        background: '#f5f5f5',
      }}>
        <Typography variant="caption" fontWeight={600} sx={{ whiteSpace: 'nowrap' }}>
          Unteres Diagramm:
        </Typography>
        <ToggleButtonGroup
          value={bottomMode}
          exclusive
          size="small"
          onChange={(_, v) => { if (v !== null) setBottomMode(v as BottomMode); }}
        >
          {([1, 2, 3, 4] as BottomMode[]).map(m => (
            <ToggleButton
              key={m}
              value={m}
              sx={{ fontSize: '0.72rem', py: 0.25, px: 1.2, textTransform: 'none' }}
            >
              {m} · {BOTTOM_LABELS[m]}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Box>

      {/* Bottom chart – remaining space */}
      <Box sx={{ flex: '1 1 0', minHeight: 0 }}>
        <div ref={botRef} style={{ width: '100%', height: '100%' }} />
      </Box>

    </Box>
  );
}
