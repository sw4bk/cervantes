// Servicio para gestión de payloads
import { get, post, getToken } from './apiClient';
import { PAYLOAD_ENDPOINTS } from '../utils/apiEndpoints';

/**
 * Obtiene la lista de payloads paginados
 * @param {Object} params - Parámetros de paginación (page, page_size, limit)
 * @returns {Promise} - Lista paginada de payloads
 */
export async function getPayloads(params = {}) {
  // El endpoint completo es /database/payloads (no usa /api como prefijo)
  // Necesitamos hacer la petición directamente ya que no sigue el patrón /api
  const queryString = new URLSearchParams(params).toString();
  const endpoint = queryString 
    ? `${PAYLOAD_ENDPOINTS.PAYLOADS}?${queryString}`
    : PAYLOAD_ENDPOINTS.PAYLOADS;
  
  // Hacer petición directa ya que el endpoint no usa /api
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Token ${token}`;
  }
  
  const response = await fetch(endpoint, {
    method: 'GET',
    headers,
    credentials: 'include',
  });
  
  if (!response.ok) {
    throw new Error(`Error HTTP: ${response.status}`);
  }
  
  return await response.json();
}

/**
 * Parsea un payload recibido
 * @param {Object} payloadData - Datos del payload a parsear
 * @returns {Promise} - Payload parseado
 */
export async function parsePayload(payloadData) {
  return post(PAYLOAD_ENDPOINTS.PARSER, payloadData);
}

/**
 * Rompe/descompone un mensaje
 * @param {Object} messageData - Datos del mensaje a descomponer
 * @returns {Promise} - Mensaje descompuesto
 */
export async function breakMessage(messageData) {
  return post(PAYLOAD_ENDPOINTS.BREAK_MESSAGE, messageData);
}

