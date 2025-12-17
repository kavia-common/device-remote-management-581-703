import React from 'react';
import { useQuery } from 'react-query';
import { apiListDevices } from '../api';
import {
  Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Typography, Box, IconButton, Tooltip, Stack, Skeleton
} from '@mui/material';
import SortIcon from '@mui/icons-material/Sort';
import DownloadIcon from '@mui/icons-material/Download';
import Pagination from '../components/Pagination';
import { exportCSV, exportJSON } from '../utils/exporters';

// PUBLIC_INTERFACE
function DevicesPage() {
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [sort, setSort] = React.useState('name:asc');

  const { data, isLoading, isFetching } = useQuery(['devices', page, pageSize, sort], () =>
    apiListDevices({ page, pageSize, sort }), { keepPreviousData: true });

  const handlePageChange = ({ page: p, pageSize: ps }) => {
    if (p != null) setPage(p);
    if (ps != null) setPageSize(ps);
  };

  const toggleSort = (field) => {
    const [curField, dir] = sort.split(':');
    const nextDir = curField === field && dir === 'asc' ? 'desc' : 'asc';
    setSort(`${field}:${nextDir}`);
  };

  const rows = data?.items || [];
  const totalPages = data?.totalPages || 0;

  return (
    <>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="h4">Devices</Typography>
        <Box>
          <Tooltip title="Export CSV">
            <IconButton onClick={() => exportCSV(rows, 'devices.csv')}><DownloadIcon /></IconButton>
          </Tooltip>
          <Tooltip title="Export JSON">
            <IconButton onClick={() => exportJSON(rows, 'devices.json')}><DownloadIcon /></IconButton>
          </Tooltip>
        </Box>
      </Stack>
      <TableContainer component={Paper}>
        <Table size="small" aria-label="devices table">
          <TableHead>
            <TableRow>
              {[
                { key: 'name', label: 'Name' },
                { key: 'ip', label: 'IP' },
                { key: 'protocol', label: 'Protocol' },
                { key: 'status', label: 'Status' },
                { key: 'createdAt', label: 'Created' },
              ].map((col) => (
                <TableCell key={col.key}>
                  <Box display="flex" alignItems="center" gap={1}>
                    {col.label}
                    <IconButton size="small" onClick={() => toggleSort(col.key)} aria-label={`Sort by ${col.label}`}>
                      <SortIcon fontSize="inherit" />
                    </IconButton>
                  </Box>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              Array.from({ length: pageSize }).map((_, idx) => (
                <TableRow key={`sk-${idx}`}>
                  <TableCell colSpan={5}><Skeleton variant="rectangular" height={24} /></TableCell>
                </TableRow>
              ))
            ) : (
              rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.name}</TableCell>
                  <TableCell>{row.ip}</TableCell>
                  <TableCell>{row.protocol}</TableCell>
                  <TableCell>{row.status}</TableCell>
                  <TableCell>{new Date(row.createdAt).toLocaleString()}</TableCell>
                </TableRow>
              ))
            )}
            {!isLoading && rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={5}><Typography align="center">No devices found.</Typography></TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <Pagination page={page} pageSize={pageSize} totalPages={totalPages} onChange={handlePageChange} />
      {isFetching && <Typography variant="body2" color="text.secondary" mt={1}>Updating...</Typography>}
    </>
  );
}

export default DevicesPage;
