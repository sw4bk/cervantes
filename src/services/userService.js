// Servicio para gestión de usuarios y perfiles
import { get, post } from './apiClient';
import { USER_ENDPOINTS } from '../utils/apiEndpoints';

/**
 * Obtiene todos los usuarios
 * @param {Object} params - Parámetros de filtrado opcionales
 * @returns {Promise} - Lista de usuarios
 */
export async function getUsers(params = {}) {
  const queryString = new URLSearchParams(params).toString();
  const endpoint = queryString 
    ? `${USER_ENDPOINTS.USERS}?${queryString}`
    : USER_ENDPOINTS.USERS;
  return get(endpoint);
}

/**
 * Obtiene el perfil del usuario autenticado
 * @returns {Promise} - Perfil del usuario
 */
export async function getProfile() {
  return get(USER_ENDPOINTS.PROFILE);
}

/**
 * Actualiza el perfil del usuario autenticado
 * @param {Object} profileData - Datos del perfil a actualizar
 * @returns {Promise} - Perfil actualizado
 */
export async function updateProfile(profileData) {
  return post(USER_ENDPOINTS.PROFILE, profileData);
}

/**
 * Obtiene un usuario específico por ID
 * @param {string|number} userId - ID del usuario
 * @returns {Promise} - Usuario encontrado
 */
export async function getUserById(userId) {
  return get(`${USER_ENDPOINTS.USERS}${userId}/`);
}

