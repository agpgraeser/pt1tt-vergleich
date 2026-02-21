import { useRef } from 'react';
import {
  Box, Button, Typography,
  Table, TableBody, TableCell, TableRow,
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import type { Action } from '../store/reducer';
import type { VergleichState } from '../types';
import { parseExcelFile } from '../utils/excelParser';

interface Props {
  state: VergleichState;
  dispatch: React.Dispatch<Action>;
}

export default function ExcelImport({ state, dispatch }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const result = await parseExcelFile(file);
      dispatch({ type: 'LOAD_EXCEL', result, fileName: file.name });
    } catch (err) {
      console.error('Excel parse error:', err);
    }
    e.target.value = '';
  }

  return (
    <Box>
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
      <Button
        variant="outlined"
        size="small"
        startIcon={<UploadFileIcon />}
        onClick={() => fileInputRef.current?.click()}
        sx={{ mb: 1 }}
      >
        Datei laden
      </Button>

      {state.fileName && (
        <Typography variant="caption" display="block" sx={{ color: 'text.secondary', mb: 1 }}>
          {state.fileName}
        </Typography>
      )}

      {state.excelPreviewRows.length > 0 && (
        <Box sx={{ overflowX: 'auto' }}>
          <Table size="small" sx={{ '& td': { fontSize: '0.75rem', py: 0.3, px: 0.5 } }}>
            <TableBody>
              {state.excelPreviewRows.map((row, i) => (
                <TableRow key={i}>
                  {row.map((cell, j) => (
                    <TableCell key={j}>
                      {cell !== undefined ? String(cell) : ''}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      )}
    </Box>
  );
}
