// Endpoints de la API de Habitat
// Base URL: /api (configurado en apiClient.js)

/**
 * Endpoints de datos (Data)
 * Diferentes fuentes de datos: LoRa, Sigfox, etc.
 */
export const DATA_ENDPOINTS = {
  LORA: '/data-lora/',
  FF: '/data-ff/',
  FF_CHIRPSTACK: '/data-ff-schirpStack/',
  SIGFOX: '/data-sigfox/',
  GEO_SIGFOX: '/geo-sigfox/',
};

/**
 * Endpoints de Sensores
 */
export const SENSOR_ENDPOINTS = {
  SENSOR: '/Sensor/',
  SENSOR_PAGINATOR: '/SensorPaginator/',
  GET_ALL_ASSIGNED: '/GetAllAssignedSensors/',
  GET_ALL_UNASSIGNED: '/GetAllUnassignedSensor/',
  FIND_SENSOR: '/FindSensor/',
  GET_STATUS: '/GetSensorStatus/',
  ASSIGN: '/AssignSensor/',
  UNASSIGN: '/UnassignSensor/',
};

/**
 * Endpoints de Eventos
 */
export const EVENT_ENDPOINTS = {
  EVENTS: '/events/',
  EVENTS_BY_DATE: '/eventsByDate/',
  OCCURRENCE: '/occurrence/',
  TYPES: '/types/',
  HISTORIC: '/historic/',
};

/**
 * Endpoints de Ubicaciones
 */
export const LOCATION_ENDPOINTS = {
  LOCATION: '/location/',
  FIND: '/FindLocation/',
  SET: '/SetLocation/',
};

/**
 * Endpoints de Usuarios y Perfiles
 */
export const USER_ENDPOINTS = {
  USERS: '/users/',
  PROFILE: '/profile/',
};

/**
 * Endpoints de Productos
 */
export const PRODUCT_ENDPOINTS = {
  PRODUCTS: '/products/',
  DASHBOARD_PRODUCTS: '/dashboard/products',
};

/**
 * Endpoints de Payloads
 */
export const PAYLOAD_ENDPOINTS = {
  PAYLOADS: '/database/payloads',
  PARSER: '/parserPayload/',
  BREAK_MESSAGE: '/break-message/',
};

/**
 * Endpoints adicionales
 */
export const OTHER_ENDPOINTS = {
  REGION: '/region/',
  HEADERS: '/headers/',
  DNP3_SECTION: '/Dnp3Section/',
};

/**
 * Endpoints de autenticación
 */
export const AUTH_ENDPOINTS = {
  LOGIN: '/rest-auth/login/',
};

// Objeto que agrupa todos los endpoints
export const API_ENDPOINTS = {
  ...DATA_ENDPOINTS,
  ...SENSOR_ENDPOINTS,
  ...EVENT_ENDPOINTS,
  ...LOCATION_ENDPOINTS,
  ...USER_ENDPOINTS,
  ...PRODUCT_ENDPOINTS,
  ...PAYLOAD_ENDPOINTS,
  ...OTHER_ENDPOINTS,
  ...AUTH_ENDPOINTS,
};

