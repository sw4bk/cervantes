// Servicio para endpoints adicionales
import { get, post } from './apiClient';
import { OTHER_ENDPOINTS } from '../utils/apiEndpoints';

/**
 * Obtiene todas las regiones
 * @param {Object} params - Parámetros de filtrado opcionales
 * @returns {Promise} - Lista de regiones
 */
export async function getRegions(params = {}) {
  const queryString = new URLSearchParams(params).toString();
  const endpoint = queryString 
    ? `${OTHER_ENDPOINTS.REGION}?${queryString}`
    : OTHER_ENDPOINTS.REGION;
  return get(endpoint);
}

/**
 * Obtiene los headers disponibles
 * @returns {Promise} - Headers disponibles
 */
export async function getHeaders() {
  return get(OTHER_ENDPOINTS.HEADERS);
}

/**
 * Obtiene las secciones DNP3
 * @param {Object} params - Parámetros de filtrado opcionales
 * @returns {Promise} - Secciones DNP3
 */
export async function getDnp3Sections(params = {}) {
  const queryString = new URLSearchParams(params).toString();
  const endpoint = queryString 
    ? `${OTHER_ENDPOINTS.DNP3_SECTION}?${queryString}`
    : OTHER_ENDPOINTS.DNP3_SECTION;
  return get(endpoint);
}

