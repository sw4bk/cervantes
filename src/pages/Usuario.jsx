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
  Person as PersonIcon,
  Email as EmailIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { getUsers } from '../services/userService';

function Usuario() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(15);
  const [totalCount, setTotalCount] = useState(0);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    fetchUsers();
  }, [page, pageSize]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        page: page + 1, // La API usa página 1-indexed
        page_size: pageSize,
      };
      
      const response = await getUsers(params);
      
      // Manejar diferentes formatos de respuesta
      if (response.results) {
        // Formato paginado estándar (Django REST Framework)
        setUsers(response.results);
        setTotalCount(response.count || response.results.length);
      } else if (Array.isArray(response)) {
        // Formato array directo
        setUsers(response);
        setTotalCount(response.length);
      } else {
        setUsers([]);
        setTotalCount(0);
      }
    } catch (err) {
      console.error('Error al cargar usuarios:', err);
      setError(err.message || 'Error al cargar los usuarios');
      setUsers([]);
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
      // Formato: DD/MM/YYYY HH:MM
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      
      return `${day}/${month}/${year} ${hours}:${minutes}`;
    } catch (error) {
      return dateString; // Si no se puede parsear, devolver el valor original
    }
  };

  // Función helper para renderizar el valor de una propiedad de usuario
  const renderUserValue = (user, key) => {
    const value = user[key];
    
    if (value === null || value === undefined || value === '') {
      return (
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
          -
        </Typography>
      );
    }
    
    // Si es un campo de fecha, formatearlo
    if (key === 'last_login' || key === 'date_joined') {
      const formattedDate = formatDate(value);
      if (!formattedDate) {
        return (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
            -
          </Typography>
        );
      }
      return (
        <Typography variant="body2" sx={{ textAlign: 'center' }}>
          {formattedDate}
        </Typography>
      );
    }
    
    // Si es un booleano, mostrar un chip
    if (typeof value === 'boolean') {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Chip
            label={value ? 'Sí' : 'No'}
            color={value ? 'success' : 'default'}
            size="small"
          />
        </Box>
      );
    }
    
    // Si es un objeto, mostrar información relevante
    if (typeof value === 'object') {
      return (
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
          {JSON.stringify(value)}
        </Typography>
      );
    }
    
    return (
      <Typography variant="body2" sx={{ textAlign: 'center' }}>
        {String(value)}
      </Typography>
    );
  };

  // Mapeo de propiedades a nombres en español
  const propertyLabels = {
    id: 'ID',
    username: 'Usuario',
    email: 'Correo Electrónico',
    first_name: 'Nombre',
    last_name: 'Apellido',
    last_login: 'Último Acceso',
    date_joined: 'Fecha de Registro',
    is_active: 'Activo',
    is_staff: 'Personal',
    is_superuser: 'Superusuario',
  };

  // Función para obtener la etiqueta en español de una propiedad
  const getPropertyLabel = (prop) => {
    return propertyLabels[prop] || prop.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  // Detectar las propiedades más comunes del objeto usuario
  const getUserProperties = (users) => {
    if (!users || users.length === 0) return [];
    
    const firstUser = users[0];
    // Orden: id, username, email, nombres, fechas importantes, estados, otros
    const commonProps = [
      'id',
      'username',
      'email',
      'first_name',
      'last_name',
      'last_login',
      'date_joined',
      'is_active',
      'is_staff',
      'is_superuser'
    ];
    
    // Priorizar propiedades comunes, luego agregar otras
    const props = [...commonProps];
    Object.keys(firstUser).forEach(key => {
      if (!commonProps.includes(key) && typeof firstUser[key] !== 'object') {
        props.push(key);
      }
    });
    
    return props;
  };

  const userProperties = getUserProperties(users);

  // Vista móvil: Cards
  const renderMobileView = () => {
    if (users.length === 0) {
      return (
        <Alert severity="info" sx={{ mt: 2 }}>
          No hay usuarios disponibles
        </Alert>
      );
    }

    return (
      <Stack spacing={2} sx={{ mt: 2 }}>
        {users.map((user, index) => (
          <Card key={user.id || index} elevation={2}>
            <CardContent>
              <Stack spacing={1}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <PersonIcon color="primary" />
                  <Typography variant="h6">
                    {user.username || user.email || `Usuario ${user.id || index + 1}`}
                  </Typography>
                </Box>
                
                {user.email && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <EmailIcon fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      {user.email}
                    </Typography>
                  </Box>
                )}
                
                {user.first_name && (
                  <Typography variant="body2">
                    <strong>Nombre:</strong> {user.first_name} {user.last_name || ''}
                  </Typography>
                )}
                
                {user.last_login && (
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
                      Último acceso:
                    </Typography>
                    {renderUserValue(user, 'last_login')}
                  </Box>
                )}
                
                {user.date_joined && (
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
                      Fecha de registro:
                    </Typography>
                    {renderUserValue(user, 'date_joined')}
                  </Box>
                )}
                
                {user.is_active !== undefined && (
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
                      Estado:
                    </Typography>
                    {renderUserValue(user, 'is_active')}
                  </Box>
                )}
                
                {/* Mostrar otras propiedades relevantes */}
                {userProperties.slice(6, 9).map(prop => {
                  if (['id', 'username', 'email', 'first_name', 'last_name', 'last_login', 'date_joined', 'is_active'].includes(prop)) return null;
                  return (
                    <Box key={prop}>
                      <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
                        {prop.replace(/_/g, ' ')}:
                      </Typography>
                      {renderUserValue(user, prop)}
                    </Box>
                  );
                })}
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>
    );
  };

  // Vista desktop: Tabla
  const renderDesktopView = () => {
    if (users.length === 0) {
      return (
        <Alert severity="info" sx={{ mt: 2 }}>
          No hay usuarios disponibles
        </Alert>
      );
    }

    return (
      <TableContainer component={Paper} elevation={2} sx={{ mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: theme.palette.primary.main }}>
              {userProperties.slice(0, 8).map((prop) => (
                <TableCell
                  key={prop}
                  sx={{
                    color: theme.palette.primary.contrastText,
                    fontWeight: 'bold',
                    textAlign: 'center',
                  }}
                >
                  {getPropertyLabel(prop)}
                </TableCell>
              ))}
              <TableCell
                sx={{
                  color: theme.palette.primary.contrastText,
                  fontWeight: 'bold',
                  textAlign: 'center',
                }}
              >
                Acciones
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user, index) => (
              <TableRow
                key={user.id || index}
                hover
                sx={{
                  '&:nth-of-type(odd)': {
                    backgroundColor: theme.palette.action.hover,
                  },
                }}
              >
                {userProperties.slice(0, 8).map((prop) => (
                  <TableCell key={prop} sx={{ textAlign: 'center' }}>
                    {renderUserValue(user, prop)}
                  </TableCell>
                ))}
                <TableCell sx={{ textAlign: 'center' }}>
                  <Tooltip title="Ver detalles">
                    <IconButton size="small" color="primary">
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
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
          <PersonIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              Gestión de Usuarios
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Administra y visualiza los usuarios del sistema
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

export default Usuario;

