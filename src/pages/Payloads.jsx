import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  CircularProgress,
  Alert,
  Chip,
  IconButton,
  Tooltip,
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
  Stack,
} from '@mui/material';
import {
  DataObject as DataObjectIcon,
  ContentCopy as ContentCopyIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { getPayloads } from '../services/payloadService';

function Payloads() {
  const [payloads, setPayloads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(15);
  const [limit] = useState(50);
  const [totalCount, setTotalCount] = useState(0);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    fetchPayloads();
  }, [page, pageSize]);

  const fetchPayloads = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        page: page + 1, // La API usa página 1-indexed
        page_size: pageSize,
        limit: limit,
      };
      
      const response = await getPayloads(params);
      
      // Manejar formato paginado estándar
      if (response.results) {
        setPayloads(response.results);
        setTotalCount(response.count || response.results.length);
      } else if (Array.isArray(response)) {
        setPayloads(response);
        setTotalCount(response.length);
      } else {
        setPayloads([]);
        setTotalCount(0);
      }
    } catch (err) {
      console.error('Error al cargar payloads:', err);
      setError(err.message || 'Error al cargar los payloads');
      setPayloads([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setPageSize(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Función helper para formatear fechas
  const formatDate = (dateString) => {
    if (!dateString) return null;
    
    try {
      const date = new Date(dateString);
      // Formato: DD/MM/YYYY HH:MM:SS
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      
      return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
    } catch (error) {
      return dateString;
    }
  };

  // Función para copiar al portapapeles
  const handleCopyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      // Aquí podrías agregar una notificación de éxito
    } catch (err) {
      console.error('Error al copiar:', err);
    }
  };

  // Función para formatear payload (mostrar primeros y últimos caracteres si es muy largo)
  const formatPayload = (payload, maxLength = 30) => {
    if (!payload) return '-';
    if (payload.length <= maxLength) return payload;
    return `${payload.substring(0, maxLength / 2)}...${payload.substring(payload.length - maxLength / 2)}`;
  };

  // Vista móvil: Cards
  const renderMobileView = () => {
    if (payloads.length === 0) {
      return (
        <Alert severity="info" sx={{ mt: 2 }}>
          No hay payloads disponibles
        </Alert>
      );
    }

    return (
      <Stack spacing={2} sx={{ mt: 2 }}>
        {payloads.map((payload, index) => (
          <Card key={index} elevation={2}>
            <CardContent>
              <Stack spacing={1.5}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <DataObjectIcon color="primary" />
                    <Typography variant="h6" sx={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>
                      {payload.product || 'N/A'}
                    </Typography>
                  </Box>
                  {payload.valid !== undefined && (
                    <Chip
                      icon={payload.valid ? <CheckCircleIcon /> : <CancelIcon />}
                      label={payload.valid ? 'Válido' : 'Inválido'}
                      color={payload.valid ? 'success' : 'error'}
                      size="small"
                    />
                  )}
                </Box>
                
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                    Payload:
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                      sx={{
                        fontFamily: 'monospace',
                        fontSize: '0.85rem',
                        backgroundColor: theme.palette.grey[100],
                        padding: '8px',
                        borderRadius: '4px',
                        flex: 1,
                        wordBreak: 'break-all',
                      }}
                    >
                      {payload.payload || '-'}
                    </Box>
                    <Tooltip title="Copiar payload">
                      <IconButton
                        size="small"
                        onClick={() => handleCopyToClipboard(payload.payload)}
                        color="primary"
                      >
                        <ContentCopyIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
                
                {payload.seq_num !== undefined && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Número de Secuencia:
                    </Typography>
                    <Typography variant="body2">{payload.seq_num}</Typography>
                  </Box>
                )}
                
                {payload.datetime && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Fecha y Hora:
                    </Typography>
                    <Typography variant="body2">{formatDate(payload.datetime)}</Typography>
                  </Box>
                )}
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>
    );
  };

  // Vista desktop: Tabla
  const renderDesktopView = () => {
    if (payloads.length === 0) {
      return (
        <Alert severity="info" sx={{ mt: 2 }}>
          No hay payloads disponibles
        </Alert>
      );
    }

    return (
      <TableContainer component={Paper} elevation={2} sx={{ mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: theme.palette.primary.main }}>
              <TableCell
                sx={{
                  color: theme.palette.primary.contrastText,
                  fontWeight: 'bold',
                  textAlign: 'center',
                }}
              >
                Payload
              </TableCell>
              <TableCell
                sx={{
                  color: theme.palette.primary.contrastText,
                  fontWeight: 'bold',
                  textAlign: 'center',
                }}
              >
                Producto
              </TableCell>
              <TableCell
                sx={{
                  color: theme.palette.primary.contrastText,
                  fontWeight: 'bold',
                  textAlign: 'center',
                }}
              >
                N° Secuencia
              </TableCell>
              <TableCell
                sx={{
                  color: theme.palette.primary.contrastText,
                  fontWeight: 'bold',
                  textAlign: 'center',
                }}
              >
                Estado
              </TableCell>
              <TableCell
                sx={{
                  color: theme.palette.primary.contrastText,
                  fontWeight: 'bold',
                  textAlign: 'center',
                }}
              >
                Fecha y Hora
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {payloads.map((payload, index) => (
              <TableRow
                key={index}
                hover
                sx={{
                  '&:nth-of-type(odd)': {
                    backgroundColor: theme.palette.action.hover,
                  },
                }}
              >
                <TableCell sx={{ textAlign: 'center', maxWidth: '350px' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                    <Box
                      sx={{
                        fontFamily: 'monospace',
                        fontSize: '0.85rem',
                        backgroundColor: theme.palette.grey[100],
                        padding: '6px 10px',
                        borderRadius: '4px',
                        flex: 1,
                        maxWidth: '300px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                      title={payload.payload}
                    >
                      {payload.payload || '-'}
                    </Box>
                    <Tooltip title="Copiar payload completo">
                      <IconButton
                        size="small"
                        onClick={() => handleCopyToClipboard(payload.payload)}
                        color="primary"
                      >
                        <ContentCopyIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
                <TableCell 
                  sx={{ 
                    textAlign: 'center', 
                    fontFamily: 'monospace',
                    fontWeight: 500,
                    color: theme.palette.primary.main,
                  }}
                >
                  {payload.product || '-'}
                </TableCell>
                <TableCell sx={{ textAlign: 'center' }}>
                  {payload.seq_num !== undefined ? payload.seq_num : '-'}
                </TableCell>
                <TableCell sx={{ textAlign: 'center' }}>
                  {payload.valid !== undefined ? (
                    <Chip
                      icon={payload.valid ? <CheckCircleIcon /> : <CancelIcon />}
                      label={payload.valid ? 'Válido' : 'Inválido'}
                      color={payload.valid ? 'success' : 'error'}
                      size="small"
                    />
                  ) : (
                    '-'
                  )}
                </TableCell>
                <TableCell sx={{ textAlign: 'center' }}>
                  {payload.datetime ? formatDate(payload.datetime) : '-'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        <TablePagination
          component="div"
          count={totalCount}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={pageSize}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[10, 15, 25, 50]}
          labelRowsPerPage="Filas por página:"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
          }
        />
      </TableContainer>
    );
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ mt: 2, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <DataObjectIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              Gestión de Payloads
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Visualiza y gestiona los payloads del sistema
            </Typography>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '400px',
            }}
          >
            <CircularProgress size={60} />
          </Box>
        ) : (
          <>
            {isMobile ? renderMobileView() : renderDesktopView()}
            
            {/* Paginación móvil */}
            {isMobile && (
              <Paper elevation={2} sx={{ mt: 2, p: 2 }}>
                <TablePagination
                  component="div"
                  count={totalCount}
                  page={page}
                  onPageChange={handleChangePage}
                  rowsPerPage={pageSize}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  rowsPerPageOptions={[10, 15, 25, 50]}
                  labelRowsPerPage="Por página:"
                  labelDisplayedRows={({ from, to, count }) =>
                    `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
                  }
                />
              </Paper>
            )}
          </>
        )}
      </Box>
    </Container>
  );
}

export default Payloads;
