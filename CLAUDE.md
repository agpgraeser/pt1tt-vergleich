# PT1TT-Vergleich – Projektnotizen

## Projektbeschreibung
Web-App zum Vergleich von PT1TT-Parametern aus verschiedenen Methoden.
- **Framework:** React + Vite (TypeScript)
- **UI:** Material UI (MUI)
- **Visualisierung:** Plotly.js
- **Excel-Import:** xlsx
- **Start:** `npm run dev`
- **Port freigeben** (falls Vite noch läuft): `lsof -ti tcp:5173 | xargs kill`
  - Für mehrere Ports: `lsof -ti tcp:5173,5174,5175 | xargs kill`

## Projektstruktur
```
src/
  App.tsx
  main.tsx
  theme.ts
  components/
    ExcelImport.tsx    – Excel-Datei laden
    ParameterPanel.tsx – Parameter-Eingabe/Anzeige
    ResponseChart.tsx  – Diagramm-Anzeige
  store/               – Zustandsverwaltung
  types/               – TypeScript-Typen
  utils/               – Berechnungslogik
```

## Git-Verlauf (Auszug)
- Erste einsetzbare Version v1.0.0

## Verlauf Zusammenarbeit mit Claude
- **2026-02-22:** CLAUDE.md angelegt

## Offene Punkte / Nächste Schritte
- (hier eintragen was als nächstes gemacht werden soll)
