import { useReducer, useMemo } from 'react';
import { ThemeProvider, CssBaseline, Box } from '@mui/material';
import { theme } from './theme';
import { reducer, initialState } from './store/reducer';
import { computeModels } from './utils/math';
import ParameterPanel from './components/ParameterPanel';
import ResponseChart from './components/ResponseChart';

export default function App() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const computed = useMemo(() => computeModels(state), [state]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: '400px 1fr',
          height: '100vh',
          overflow: 'hidden',
        }}
      >
        <ParameterPanel state={state} dispatch={dispatch} />
        <ResponseChart state={state} computed={computed} />
      </Box>
    </ThemeProvider>
  );
}
