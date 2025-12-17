import React from 'react';
import { Box, Select, MenuItem, IconButton, Typography } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

// PUBLIC_INTERFACE
function Pagination({ page, pageSize, totalPages, onChange }) {
  const handlePageSize = (e) => onChange({ page: 1, pageSize: e.target.value });
  const prev = () => onChange({ page: Math.max(1, page - 1), pageSize });
  const next = () => onChange({ page: Math.min(totalPages || page + 1, page + 1), pageSize });

  return (
    <Box display="flex" alignItems="center" gap={2} justifyContent="flex-end" mt={2}>
      <Typography variant="body2">Rows:</Typography>
      <Select size="small" value={pageSize} onChange={handlePageSize}>
        {[5, 10, 20, 50].map((n) => <MenuItem key={n} value={n}>{n}</MenuItem>)}
      </Select>
      <IconButton aria-label="Previous page" onClick={prev} disabled={page <= 1}>
        <ChevronLeftIcon />
      </IconButton>
      <Typography variant="body2">Page {page}{totalPages ? ` / ${totalPages}` : ''}</Typography>
      <IconButton aria-label="Next page" onClick={next} disabled={totalPages ? page >= totalPages : false}>
        <ChevronRightIcon />
      </IconButton>
    </Box>
  );
}

export default Pagination;
