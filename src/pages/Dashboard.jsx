import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  CircularProgress,
  Alert,
  useTheme,
  Tabs,
  Tab,
  Grid,
  Card,
  CardContent,
  Chip,
  Stack,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Wifi as WifiIcon,
  WifiOff as WifiOffIcon,
} from '@mui/icons-material';
import { getEventTypes, getEvents } from '../services/eventService';
import { getDashboardProducts } from '../services/productService';
import { useAuth } from '../context/AuthContext';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`dashboard-tabpanel-${index}`}
      aria-labelledby={`dashboard-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

function Dashboard() {
  const { authenticated, loading: authLoading } = useAuth();
  const [types, setTypes] = useState([]);
  const [selectedTypeIndex, setSelectedTypeIndex] = useState(0);
  const [typeData, setTypeData] = useState({}); // { typeId: { events: [], products: [], loading: boolean, error: string } }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(15);
  
  const theme = useTheme();

  // Esperar a que la autenticación esté lista antes de hacer peticiones
  useEffect(() => {
    if (!authLoading && authenticated) {
      fetchTypes();
    }
  }, [authLoading, authenticated]);

  useEffect(() => {
    if (types.length > 0) {
      loadTypeData(types[selectedTypeIndex]);
    }
  }, [types, selectedTypeIndex, page, pageSize]);

  const fetchTypes = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getEventTypes();
      setTypes(Array.isArray(response) ? response : []);
    } catch (err) {
      console.error('Error al cargar tipos:', err);
      // Si es un error 401, no mostrar error ya que el AuthContext manejará la redirección
      if (err.message && err.message.includes('401')) {
        return; // El AuthContext ya manejará la redirección
      }
      setError(err.message || 'Error al cargar los tipos');
    } finally {
      setLoading(false);
    }
  };

  const loadTypeData = async (type, forceReload = false) => {
    if (!type || !type._id) return;
    
    const typeId = type._id;
    const existingData = typeData[typeId];
    
    // Si ya tenemos los eventos y no es recarga forzada, solo cargar productos
    if (existingData && existingData.events && !forceReload) {
      // Solo recargar productos con la página actual
      setTypeData(prev => ({
        ...prev,
        [typeId]: { ...prev[typeId], loading: true, error: null }
      }));

      try {
        const productsResponse = await getDashboardProducts({
          typ_id: typeId,
          page: page + 1,
          page_size: pageSize,
          limit: 50,
          lang: 'pt',
        });

        const products = productsResponse.results || (Array.isArray(productsResponse) ? productsResponse : []);

        setTypeData(prev => ({
          ...prev,
          [typeId]: {
            ...prev[typeId],
            products,
            count: productsResponse.count || products.length,
            loading: false,
            error: null,
          }
        }));
      } catch (err) {
        console.error(`Error al cargar productos del tipo ${type.name}:`, err);
        setTypeData(prev => ({
          ...prev,
          [typeId]: {
            ...prev[typeId],
            loading: false,
            error: err.message || 'Error al cargar los productos',
          }
        }));
      }
      return;
    }

    // Primera carga: cargar eventos y productos
    setTypeData(prev => ({
      ...prev,
      [typeId]: { ...prev[typeId], loading: true, error: null }
    }));

    try {
      // Cargar eventos y productos en paralelo
      // Nota: Si typ_id no funciona, intentar con 'typ' o 'type_id' según la API
      const [eventsResponse, productsResponse] = await Promise.all([
        getEvents({ typ: typeId }),
        getDashboardProducts({
          typ_id: typeId,
          page: page + 1,
          page_size: pageSize,
          limit: 50,
          lang: 'pt',
        }),
      ]);

      // Manejar diferentes formatos de respuesta de eventos
      let events = [];
      if (Array.isArray(eventsResponse)) {
        events = eventsResponse;
      } else if (eventsResponse && eventsResponse.results && Array.isArray(eventsResponse.results)) {
        events = eventsResponse.results;
      } else if (eventsResponse && eventsResponse.data && Array.isArray(eventsResponse.data)) {
        events = eventsResponse.data;
      } else if (eventsResponse && typeof eventsResponse === 'object') {
        // Si es un objeto pero no tiene results/data, intentar extraer eventos
        console.warn('Formato de respuesta de eventos inesperado:', eventsResponse);
        events = [];
      }

      const products = productsResponse.results || (Array.isArray(productsResponse) ? productsResponse : []);

      setTypeData(prev => ({
        ...prev,
        [typeId]: {
          events,
          products,
          count: productsResponse.count || products.length,
          loading: false,
          error: null,
        }
      }));
    } catch (err) {
      console.error(`Error al cargar datos del tipo ${type.name}:`, err);
      // Si es un error 401, no actualizar el estado ya que el AuthContext manejará la redirección
      if (err.message && (err.message.includes('401') || err.message.includes('Sesión expirada'))) {
        return; // El AuthContext ya manejará la redirección
      }
      console.error('Detalles del error:', {
        message: err.message,
        stack: err.stack,
        typeId: typeId,
        typeName: type.name
      });
      setTypeData(prev => ({
        ...prev,
        [typeId]: {
          ...prev[typeId],
          loading: false,
          error: err.message || 'Error al cargar los datos',
        }
      }));
    }
  };

  const handleTabChange = (event, newValue) => {
    setSelectedTypeIndex(newValue);
    setPage(0); // Resetear página al cambiar de tipo
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setPageSize(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Función para formatear fechas
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${day}/${month}/${year} ${hours}:${minutes}`;
    } catch (error) {
      return dateString;
    }
  };

  // Función para obtener el nombre del evento por código
  const getEventName = (typeCode, events) => {
    const event = events.find(e => e.code === typeCode);
    return event ? (event.name_es || event.name) : `Código ${typeCode}`;
  };

  const currentType = types[selectedTypeIndex];
  const currentTypeData = currentType ? typeData[currentType._id] : null;

  return (
    <Container maxWidth="xl">
      <Box sx={{ mt: 2, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <DashboardIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              Dashboard
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Visualización de productos y estados por tipo
            </Typography>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {authLoading || loading ? (
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
        ) : types.length === 0 ? (
          <Alert severity="info" sx={{ mt: 2 }}>
            No hay tipos disponibles
          </Alert>
        ) : (
          <>
            <Paper elevation={2} sx={{ mb: 3 }}>
              <Tabs
                value={selectedTypeIndex}
                onChange={handleTabChange}
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                  borderBottom: 1,
                  borderColor: 'divider',
                }}
              >
                {types.map((type, index) => (
                  <Tab key={type._id || index} label={type.name} />
                ))}
              </Tabs>
            </Paper>

            {types.map((type, index) => {
              const typeId = type._id;
              const data = typeData[typeId];
              
              return (
                <TabPanel key={typeId} value={selectedTypeIndex} index={index}>
                  {!data ? (
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        minHeight: '300px',
                      }}
                    >
                      <CircularProgress />
                    </Box>
                  ) : data.error ? (
                    <Alert severity="error" sx={{ mb: 2 }}>
                      {data.error}
                    </Alert>
                  ) : data.loading ? (
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        minHeight: '300px',
                      }}
                    >
                      <CircularProgress />
                    </Box>
                  ) : (
                    <>
                      {/* Resumen de eventos */}
                      {data.events && data.events.length > 0 ? (
                        <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
                          <Typography variant="h6" gutterBottom>
                            Eventos Disponibles ({data.events.length})
                          </Typography>
                          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                            {data.events.map((event) => (
                              <Chip
                                key={event.code || event._id || event.id}
                                label={`${event.name_es || event.name || 'Sin nombre'} (${event.code || 'N/A'})`}
                                size="small"
                                color="primary"
                                variant="outlined"
                              />
                            ))}
                          </Stack>
                        </Paper>
                      ) : (
                        <Alert severity="info" sx={{ mb: 2 }}>
                          No hay eventos disponibles para este tipo
                        </Alert>
                      )}

                      {/* Lista de productos con Cards */}
                      {data.products && data.products.length > 0 ? (
                        <>
                          <Grid container spacing={2} sx={{ mb: 2 }}>
                            {data.products.map((product, idx) => (
                              <Grid item xs={12} sm={6} md={4} key={product._id || idx}>
                                <Card 
                                  elevation={2}
                                  sx={{
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    transition: 'transform 0.2s, box-shadow 0.2s',
                                    '&:hover': {
                                      transform: 'translateY(-4px)',
                                      boxShadow: 4,
                                    },
                                  }}
                                >
                                  <CardContent sx={{ flexGrow: 1, p: 2 }}>
                                    {/* Header del producto */}
                                    <Box sx={{ 
                                      display: 'flex', 
                                      justifyContent: 'space-between', 
                                      alignItems: 'center',
                                      mb: 2,
                                      pb: 1.5,
                                      borderBottom: `2px solid ${theme.palette.divider}`
                                    }}>
                                      <Box>
                                        <Typography 
                                          variant="caption" 
                                          color="text.secondary" 
                                          sx={{ display: 'block', mb: 0.5 }}
                                        >
                                          Sigfox ID
                                        </Typography>
                                        <Typography 
                                          variant="h6" 
                                          sx={{ 
                                            fontFamily: 'monospace', 
                                            fontWeight: 600,
                                            color: theme.palette.primary.main
                                          }}
                                        >
                                          {product.sigfox || '-'}
                                        </Typography>
                                      </Box>
                                      <Chip
                                        icon={product.online ? <WifiIcon /> : <WifiOffIcon />}
                                        label={product.online ? 'Online' : 'Offline'}
                                        color={product.online ? 'success' : 'error'}
                                        size="small"
                                        sx={{ fontWeight: 500 }}
                                      />
                                    </Box>

                                    {/* Estados del producto */}
                                    {product.status && product.status.length > 0 ? (
                                      <Stack spacing={1.5}>
                                        {product.status.map((status, statusIdx) => (
                                          <Box 
                                            key={statusIdx}
                                            sx={{
                                              p: 1.5,
                                              borderRadius: 1,
                                              backgroundColor: theme.palette.mode === 'dark' 
                                                ? 'rgba(255, 255, 255, 0.05)' 
                                                : 'rgba(0, 0, 0, 0.02)',
                                              border: `1px solid ${theme.palette.divider}`,
                                            }}
                                          >
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                              <Typography 
                                                variant="body2" 
                                                fontWeight="600"
                                                color="text.primary"
                                                sx={{ minWidth: 'fit-content' }}
                                              >
                                                {status.verbose_name_es || status.verbose_name}:
                                              </Typography>
                                              <Chip
                                                label={status.verbose_value_es || status.verbose_value}
                                                size="small"
                                                color={
                                                  status.verbose_value_es?.toLowerCase().includes('abierto') ||
                                                  status.verbose_value_es?.toLowerCase().includes('open')
                                                    ? 'error'
                                                    : status.verbose_value_es?.toLowerCase().includes('online') ||
                                                      status.verbose_value_es?.toLowerCase().includes('cerrado') ||
                                                      status.verbose_value_es?.toLowerCase().includes('closed')
                                                    ? 'success'
                                                    : 'default'
                                                }
                                                sx={{ fontWeight: 500 }}
                                              />
                                            </Box>
                                            {status.show_datetime !== false && status.datetime && (
                                              <Typography 
                                                variant="caption" 
                                                color="text.secondary"
                                                sx={{ 
                                                  display: 'block',
                                                  mt: 0.5,
                                                  fontStyle: 'italic'
                                                }}
                                              >
                                                {formatDate(status.datetime)}
                                              </Typography>
                                            )}
                                          </Box>
                                        ))}
                                      </Stack>
                                    ) : (
                                      <Box 
                                        sx={{ 
                                          p: 2, 
                                          textAlign: 'center',
                                          borderRadius: 1,
                                          backgroundColor: theme.palette.mode === 'dark' 
                                            ? 'rgba(255, 255, 255, 0.05)' 
                                            : 'rgba(0, 0, 0, 0.02)',
                                        }}
                                      >
                                        <Typography variant="body2" color="text.secondary">
                                          Sin estados disponibles
                                        </Typography>
                                      </Box>
                                    )}
                                  </CardContent>
                                </Card>
                              </Grid>
                            ))}
                          </Grid>
                          
                          {/* Paginación */}
                          <Paper elevation={1} sx={{ p: 1 }}>
                            <TablePagination
                              component="div"
                              count={data.count || 0}
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
                          </Paper>
                        </>
                      ) : (
                        <Alert severity="info">
                          No hay productos disponibles para este tipo
                        </Alert>
                      )}
                    </>
                  )}
                </TabPanel>
              );
            })}
          </>
        )}
      </Box>
    </Container>
  );
}

export default Dashboard;
