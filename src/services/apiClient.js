// Cliente base HTTP para comunicación con la API de Habitad

// En desarrollo, usar ruta relativa para que funcione con el proxy de Vite
// En producción, cambiar a la URL completa si es necesario
const API_BASE_URL = '/api';
const TOKEN_STORAGE_KEY = 'habitat_auth_token';
const LOGIN_ENDPOINT = '/rest-auth/login/';

// Callback para manejar errores de autenticación (se establece desde AuthContext)
let onAuthError = null;

/**
 * Establece el callback para manejar errores de autenticación
 * @param {Function} callback - Función a ejecutar cuando hay un error 401/403
 */
export function setAuthErrorHandler(callback) {
  onAuthError = callback;
}

/**
 * Guarda el token de autenticación en localStorage
 * @param {string} token - Token de autenticación
 */
export function setToken(token) {
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
}

/**
 * Obtiene el token de autenticación desde localStorage
 * @returns {string|null} - Token de autenticación o null si no existe
 */
export function getToken() {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

/**
 * Elimina el token de autenticación (cierra sesión)
 */
export function clearToken() {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
}

/**
 * Verifica si el endpoint es el de login
 * @param {string} endpoint - Endpoint a verificar
 * @returns {boolean} - true si es el endpoint de login
 */
function isLoginEndpoint(endpoint) {
  return endpoint === LOGIN_ENDPOINT || endpoint.includes('rest-auth/login');
}

/**
 * Realiza una petición HTTP genérica
 * @param {string} endpoint - Endpoint de la API (sin la URL base)
 * @param {Object} options - Opciones de fetch (method, headers, body, etc.)
 * @param {boolean} includeCredentials - Si se deben incluir credenciales (cookies)
 * @returns {Promise} - Promesa con la respuesta de la API
 */
async function request(endpoint, options = {}, includeCredentials = false) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const headers = {
    'Content-Type': 'application/json',
  };

  // Agregar token de autenticación solo si no es el endpoint de login
  if (!isLoginEndpoint(endpoint)) {
    const token = getToken();
    if (token) {
      headers['Authorization'] = `Token ${token}`;
    }
  }

  // Combinar headers: primero los por defecto, luego los del usuario
  const finalHeaders = {
    ...headers,
    ...options.headers,
  };

  const config = {
    ...options,
    headers: finalHeaders,
  };
  
  // Para el login, incluir credenciales para que las cookies se envíen
  if (includeCredentials || isLoginEndpoint(endpoint)) {
    config.credentials = 'include';
  }

  try {
    const response = await fetch(url, config);

    // Verificar si la respuesta es exitosa
    if (!response.ok) {
      // Manejar errores de autenticación (401) o autorización (403)
      // PERO NO en el endpoint de login (puede ser error de credenciales o CSRF)
      if ((response.status === 401 || response.status === 403) && !isLoginEndpoint(endpoint)) {
        // Limpiar token si está expirado o inválido
        clearToken();
        
        // Notificar al contexto de autenticación si existe el callback
        // Usar setTimeout para evitar problemas de estado durante el render
        if (onAuthError) {
          setTimeout(() => {
            onAuthError();
          }, 0);
        }
        
        throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
      }
      
      // Para otros errores, intentar obtener el mensaje de error del servidor
      let errorMessage = `Error HTTP: ${response.status}`;
      try {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorData.message || errorMessage;
        } else {
          // Si no es JSON, intentar obtener texto
          const text = await response.text();
          if (text) {
            errorMessage = text;
          }
        }
      } catch (e) {
        // Si no se puede parsear el error, usar el mensaje por defecto
      }
      
      throw new Error(errorMessage);
    }

    // Intentar parsear la respuesta como JSON
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }

    // Si no es JSON, devolver como texto
    return await response.text();
  } catch (error) {
    // Re-lanzar errores de autenticación
    if (error.message.includes('Sesión expirada')) {
      throw error;
    }
    
    // Manejo de otros errores
    console.error('Error en petición API:', error);
    throw error;
  }
}

/**
 * Realiza una petición GET
 * @param {string} endpoint - Endpoint de la API
 * @param {Object} headers - Headers adicionales opcionales
 * @returns {Promise} - Promesa con la respuesta de la API
 */
export async function get(endpoint, headers = {}) {
  return request(endpoint, {
    method: 'GET',
    headers,
  });
}

/**
 * Realiza una petición POST
 * @param {string} endpoint - Endpoint de la API
 * @param {Object} data - Datos a enviar en el body
 * @param {Object} headers - Headers adicionales opcionales
 * @returns {Promise} - Promesa con la respuesta de la API
 */
export async function post(endpoint, data = {}, headers = {}) {
  return request(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  });
}

/**
 * Obtiene el token CSRF del servidor (si es necesario)
 * @returns {Promise<string|null>} - Token CSRF o null
 */
async function getCsrfToken() {
  try {
    // Primero, intentar obtener el token desde las cookies existentes
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'csrftoken' && value) {
        return decodeURIComponent(value);
      }
    }
    
    // Si no existe en las cookies, hacer una petición GET para obtenerlo
    // Django REST normalmente lo devuelve en una cookie o header
    const response = await fetch(`${API_BASE_URL}/rest-auth/login/`, {
      method: 'GET',
      credentials: 'include',
    });
    
    // Después de la petición, verificar las cookies nuevamente
    const cookiesAfter = document.cookie.split(';');
    for (let cookie of cookiesAfter) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'csrftoken' && value) {
        return decodeURIComponent(value);
      }
    }
    
    // También verificar si viene en el header X-CSRFToken
    const csrfHeader = response.headers.get('X-CSRFToken');
    if (csrfHeader) {
      return csrfHeader;
    }
    
    return null;
  } catch (error) {
    console.warn('No se pudo obtener el token CSRF:', error);
    return null;
  }
}

/**
 * Realiza el login y guarda automáticamente el token
 * @param {string} username - Nombre de usuario
 * @param {string} password - Contraseña
 * @returns {Promise} - Promesa con la respuesta de la API que incluye el token
 */
export async function login(username, password) {
  try {
    // Obtener token CSRF antes de hacer el login
    const csrfToken = await getCsrfToken();
    
    const headers = {};
    if (csrfToken) {
      headers['X-CSRFToken'] = csrfToken;
    }
    
    const response = await request(LOGIN_ENDPOINT, {
      method: 'POST',
      body: JSON.stringify({ username, password }),
      headers: {
        ...headers,
        // Incluir credenciales para que las cookies se envíen
      },
    }, true); // Pasar flag para incluir credentials

    // Si la respuesta incluye un token, guardarlo automáticamente
    if (response.token) {
      setToken(response.token);
    } else if (response.key) {
      // Algunas APIs de Django REST usan 'key' en lugar de 'token'
      setToken(response.key);
    }

    return response;
  } catch (error) {
    console.error('Error en login:', error);
    throw error;
  }
}

/**
 * Realiza el logout eliminando el token
 */
export function logout() {
  clearToken();
}

/**
 * Verifica si el usuario está autenticado
 * @returns {boolean} - true si hay un token guardado
 */
export function isAuthenticated() {
  return !!getToken();
}

/**
 * Obtiene la URL base de la API
 * @returns {string} - URL base de la API
 */
export function getBaseUrl() {
  return API_BASE_URL;
}

