// Servicio para gestión de eventos
import { get, post } from './apiClient';
import { EVENT_ENDPOINTS } from '../utils/apiEndpoints';

/**
 * Obtiene todos los eventos
 * @param {Object} params - Parámetros de filtrado opcionales
 * @returns {Promise} - Lista de eventos
 */
export async function getEvents(params = {}) {
  // Convertir todos los valores a strings para URLSearchParams
  const stringParams = {};
  Object.keys(params).forEach(key => {
    const value = params[key];
    if (value !== null && value !== undefined) {
      stringParams[key] = String(value);
    }
  });
  
  const queryString = new URLSearchParams(stringParams).toString();
  const endpoint = queryString 
    ? `${EVENT_ENDPOINTS.EVENTS}?${queryString}`
    : EVENT_ENDPOINTS.EVENTS;
  return get(endpoint);
}

/**
 * Obtiene eventos filtrados por fecha
 * @param {Object} dateParams - Parámetros de fecha (startDate, endDate, etc.)
 * @returns {Promise} - Eventos filtrados por fecha
 */
export async function getEventsByDate(dateParams) {
  const queryString = new URLSearchParams(dateParams).toString();
  const endpoint = `${EVENT_ENDPOINTS.EVENTS_BY_DATE}?${queryString}`;
  return get(endpoint);
}

/**
 * Obtiene ocurrencias de eventos
 * @param {Object} params - Parámetros de filtrado opcionales
 * @returns {Promise} - Ocurrencias de eventos
 */
export async function getOccurrence(params = {}) {
  const queryString = new URLSearchParams(params).toString();
  const endpoint = queryString 
    ? `${EVENT_ENDPOINTS.OCCURRENCE}?${queryString}`
    : EVENT_ENDPOINTS.OCCURRENCE;
  return get(endpoint);
}

/**
 * Obtiene los tipos de eventos disponibles
 * @returns {Promise} - Lista de tipos de eventos
 */
export async function getEventTypes() {
  return get(EVENT_ENDPOINTS.TYPES);
}

/**
 * Obtiene el historial de eventos
 * @param {Object} params - Parámetros de filtrado opcionales
 * @returns {Promise} - Historial de eventos
 */
export async function getHistoric(params = {}) {
  const queryString = new URLSearchParams(params).toString();
  const endpoint = queryString 
    ? `${EVENT_ENDPOINTS.HISTORIC}?${queryString}`
    : EVENT_ENDPOINTS.HISTORIC;
  return get(endpoint);
}

