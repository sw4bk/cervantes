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
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
  Stack,
  Chip,
} from '@mui/material';
import {
  NotificationsActive as NotificationsActiveIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { getOccurrence } from '../services/eventService';

function Notificaciones() {
  const [occurrences, setOccurrences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(15);
  const [totalCount, setTotalCount] = useState(0);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    fetchOccurrences();
  }, [page, pageSize]);

  const fetchOccurrences = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        page: page + 1, // La API usa página 1-indexed
      };
      
      const response = await getOccurrence(params);
      
      // Manejar formato paginado estándar
      if (response.results) {
        setOccurrences(response.results);
        setTotalCount(response.count || response.results.length);
      } else if (Array.isArray(response)) {
        setOccurrences(response);
        setTotalCount(response.length);
      } else {
        setOccurrences([]);
        setTotalCount(0);
      }
    } catch (err) {
      console.error('Error al cargar ocurrencias:', err);
      setError(err.message || 'Error al cargar las ocurrencias');
      setOccurrences([]);
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

  // Función para extraer información del evento
  const parseEventInfo = (evt) => {
    if (!evt) return { product: '-', description: '-' };
    
    // Formato esperado: "22889E7-Fusible - 6 (0x06): Aberto"
    const parts = evt.split('-');
    if (parts.length >= 2) {
      const product = parts[0].trim();
      const description = parts.slice(1).join('-').trim();
      return { product, description };
    }
    
    return { product: '-', description: evt };
  };

  // Vista móvil: Cards
  const renderMobileView = () => {
    if (occurrences.length === 0) {
      return (
        <Alert severity="info" sx={{ mt: 2 }}>
          No hay notificaciones disponibles
        </Alert>
      );
    }

    return (
      <Stack spacing={2} sx={{ mt: 2 }}>
        {occurrences.map((occurrence, index) => {
          const { product, description } = parseEventInfo(occurrence.evt);
          return (
            <Card key={occurrence._id || index} elevation={2}>
              <CardContent>
                <Stack spacing={1.5}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <WarningIcon color="warning" />
                    <Typography variant="h6" sx={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>
                      {product}
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                      Evento:
                    </Typography>
                    <Chip
                      label={description}
                      color="warning"
                      size="small"
                      sx={{ maxWidth: '100%' }}
                    />
                  </Box>
                  
                  {occurrence.datetime && (
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                        Fecha y Hora:
                      </Typography>
                      <Typography variant="body2">{formatDate(occurrence.datetime)}</Typography>
                    </Box>
                  )}
                  
                  {occurrence._id && (
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                        ID:
                      </Typography>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'text.secondary' }}>
                        {occurrence._id}
                      </Typography>
                    </Box>
                  )}
                </Stack>
              </CardContent>
            </Card>
          );
        })}
      </Stack>
    );
  };

  // Vista desktop: Tabla
  const renderDesktopView = () => {
    if (occurrences.length === 0) {
      return (
        <Alert severity="info" sx={{ mt: 2 }}>
          No hay notificaciones disponibles
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
                Producto
              </TableCell>
              <TableCell
                sx={{
                  color: theme.palette.primary.contrastText,
                  fontWeight: 'bold',
                  textAlign: 'center',
                }}
              >
                Evento
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
            {occurrences.map((occurrence, index) => {
              const { product, description } = parseEventInfo(occurrence.evt);
              return (
                <TableRow
                  key={occurrence._id || index}
                  hover
                  sx={{
                    '&:nth-of-type(odd)': {
                      backgroundColor: theme.palette.action.hover,
                    },
                  }}
                >
                  <TableCell 
                    sx={{ 
                      textAlign: 'center', 
                      fontFamily: 'monospace',
                      fontWeight: 500,
                      color: theme.palette.primary.main,
                    }}
                  >
                    {product}
                  </TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>
                    <Chip
                      label={description}
                      color="warning"
                      size="small"
                      sx={{ maxWidth: '400px' }}
                    />
                  </TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>
                    {occurrence.datetime ? formatDate(occurrence.datetime) : '-'}
                  </TableCell>
                </TableRow>
              );
            })}
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
          <NotificationsActiveIcon sx={{ fontSize: 40, color: theme.palette.warning.main }} />
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              Campaña de Notificaciones
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Visualiza y gestiona las notificaciones y eventos del sistema
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

export default Notificaciones;
