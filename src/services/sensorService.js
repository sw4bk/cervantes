// Servicio para gestión de sensores
import { get, post } from './apiClient';
import { SENSOR_ENDPOINTS } from '../utils/apiEndpoints';

/**
 * Obtiene todos los sensores
 * @returns {Promise} - Lista de sensores
 */
export async function getSensors() {
  return get(SENSOR_ENDPOINTS.SENSOR);
}

/**
 * Obtiene sensores con paginación
 * @param {Object} params - Parámetros de paginación (page, pageSize, etc.)
 * @returns {Promise} - Sensores paginados
 */
export async function getSensorsPaginated(params = {}) {
  const queryString = new URLSearchParams(params).toString();
  const endpoint = queryString 
    ? `${SENSOR_ENDPOINTS.SENSOR_PAGINATOR}?${queryString}`
    : SENSOR_ENDPOINTS.SENSOR_PAGINATOR;
  return get(endpoint);
}

/**
 * Obtiene todos los sensores asignados
 * @returns {Promise} - Lista de sensores asignados
 */
export async function getAllAssignedSensors() {
  return get(SENSOR_ENDPOINTS.GET_ALL_ASSIGNED);
}

/**
 * Obtiene todos los sensores sin asignar
 * @returns {Promise} - Lista de sensores sin asignar
 */
export async function getAllUnassignedSensors() {
  return get(SENSOR_ENDPOINTS.GET_ALL_UNASSIGNED);
}

/**
 * Busca un sensor específico
 * @param {string|Object} searchParams - Parámetros de búsqueda (ID, nombre, etc.)
 * @returns {Promise} - Sensor encontrado
 */
export async function findSensor(searchParams) {
  // Si es un objeto, construir query string
  if (typeof searchParams === 'object') {
    const queryString = new URLSearchParams(searchParams).toString();
    return get(`${SENSOR_ENDPOINTS.FIND_SENSOR}?${queryString}`);
  }
  // Si es string, asumir que es ID o parámetro directo
  return get(`${SENSOR_ENDPOINTS.FIND_SENSOR}${searchParams}`);
}

/**
 * Obtiene el estado de un sensor
 * @param {string} sensorId - ID del sensor
 * @returns {Promise} - Estado del sensor
 */
export async function getSensorStatus(sensorId) {
  return get(`${SENSOR_ENDPOINTS.GET_STATUS}${sensorId}`);
}

/**
 * Asigna un sensor a una ubicación/usuario/grupo
 * @param {Object} assignmentData - Datos de asignación (sensorId, locationId, etc.)
 * @returns {Promise} - Resultado de la asignación
 */
export async function assignSensor(assignmentData) {
  return post(SENSOR_ENDPOINTS.ASSIGN, assignmentData);
}

/**
 * Desasigna un sensor
 * @param {Object} unassignData - Datos para desasignar (sensorId, etc.)
 * @returns {Promise} - Resultado de la desasignación
 */
export async function unassignSensor(unassignData) {
  return post(SENSOR_ENDPOINTS.UNASSIGN, unassignData);
}

