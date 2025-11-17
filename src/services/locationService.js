// Servicio para gestión de ubicaciones
import { get, post } from './apiClient';
import { LOCATION_ENDPOINTS } from '../utils/apiEndpoints';

/**
 * Obtiene todas las ubicaciones
 * @param {Object} params - Parámetros de filtrado opcionales
 * @returns {Promise} - Lista de ubicaciones
 */
export async function getLocations(params = {}) {
  const queryString = new URLSearchParams(params).toString();
  const endpoint = queryString 
    ? `${LOCATION_ENDPOINTS.LOCATION}?${queryString}`
    : LOCATION_ENDPOINTS.LOCATION;
  return get(endpoint);
}

/**
 * Busca una ubicación específica
 * @param {string|Object} searchParams - Parámetros de búsqueda (ID, nombre, coordenadas, etc.)
 * @returns {Promise} - Ubicación encontrada
 */
export async function findLocation(searchParams) {
  // Si es un objeto, construir query string
  if (typeof searchParams === 'object') {
    const queryString = new URLSearchParams(searchParams).toString();
    return get(`${LOCATION_ENDPOINTS.FIND}?${queryString}`);
  }
  // Si es string, asumir que es ID o parámetro directo
  return get(`${LOCATION_ENDPOINTS.FIND}${searchParams}`);
}

/**
 * Crea o actualiza una ubicación
 * @param {Object} locationData - Datos de la ubicación (name, coordinates, etc.)
 * @returns {Promise} - Ubicación creada/actualizada
 */
export async function setLocation(locationData) {
  return post(LOCATION_ENDPOINTS.SET, locationData);
}

