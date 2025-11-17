// Servicio para gestión de datos (LoRa, Sigfox, etc.)
import { get, post } from './apiClient';
import { DATA_ENDPOINTS } from '../utils/apiEndpoints';

/**
 * Obtiene datos LoRa
 * @param {Object} params - Parámetros de filtrado opcionales
 * @returns {Promise} - Datos LoRa
 */
export async function getLoRaData(params = {}) {
  const queryString = new URLSearchParams(params).toString();
  const endpoint = queryString 
    ? `${DATA_ENDPOINTS.LORA}?${queryString}`
    : DATA_ENDPOINTS.LORA;
  return get(endpoint);
}

/**
 * Obtiene datos FF (Freqüency)
 * @param {Object} params - Parámetros de filtrado opcionales
 * @returns {Promise} - Datos FF
 */
export async function getFFData(params = {}) {
  const queryString = new URLSearchParams(params).toString();
  const endpoint = queryString 
    ? `${DATA_ENDPOINTS.FF}?${queryString}`
    : DATA_ENDPOINTS.FF;
  return get(endpoint);
}

/**
 * Obtiene datos FF de ChirpStack
 * @param {Object} params - Parámetros de filtrado opcionales
 * @returns {Promise} - Datos FF ChirpStack
 */
export async function getFFChirpStackData(params = {}) {
  const queryString = new URLSearchParams(params).toString();
  const endpoint = queryString 
    ? `${DATA_ENDPOINTS.FF_CHIRPSTACK}?${queryString}`
    : DATA_ENDPOINTS.FF_CHIRPSTACK;
  return get(endpoint);
}

/**
 * Obtiene datos Sigfox
 * @param {Object} params - Parámetros de filtrado opcionales
 * @returns {Promise} - Datos Sigfox
 */
export async function getSigfoxData(params = {}) {
  const queryString = new URLSearchParams(params).toString();
  const endpoint = queryString 
    ? `${DATA_ENDPOINTS.SIGFOX}?${queryString}`
    : DATA_ENDPOINTS.SIGFOX;
  return get(endpoint);
}

/**
 * Obtiene datos geográficos de Sigfox
 * @param {Object} params - Parámetros de filtrado opcionales
 * @returns {Promise} - Datos geográficos Sigfox
 */
export async function getGeoSigfoxData(params = {}) {
  const queryString = new URLSearchParams(params).toString();
  const endpoint = queryString 
    ? `${DATA_ENDPOINTS.GEO_SIGFOX}?${queryString}`
    : DATA_ENDPOINTS.GEO_SIGFOX;
  return get(endpoint);
}

