// Servicio para gestión de productos
import { get, post, getToken, clearToken } from './apiClient';
import { PRODUCT_ENDPOINTS } from '../utils/apiEndpoints';

/**
 * Obtiene el token CSRF desde las cookies
 * @returns {string|null} - Token CSRF o null
 */
function getCsrfTokenFromCookie() {
  try {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'csrftoken' && value) {
        return decodeURIComponent(value);
      }
    }
    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Obtiene todos los productos
 * @param {Object} params - Parámetros de filtrado opcionales
 * @returns {Promise} - Lista de productos
 */
export async function getProducts(params = {}) {
  const queryString = new URLSearchParams(params).toString();
  const endpoint = queryString 
    ? `${PRODUCT_ENDPOINTS.PRODUCTS}?${queryString}`
    : PRODUCT_ENDPOINTS.PRODUCTS;
  return get(endpoint);
}

/**
 * Obtiene un producto específico por ID
 * @param {string|number} productId - ID del producto
 * @returns {Promise} - Producto encontrado
 */
export async function getProductById(productId) {
  return get(`${PRODUCT_ENDPOINTS.PRODUCTS}${productId}/`);
}

/**
 * Crea un nuevo producto
 * @param {Object} productData - Datos del producto
 * @returns {Promise} - Producto creado
 */
export async function createProduct(productData) {
  return post(PRODUCT_ENDPOINTS.PRODUCTS, productData);
}

/**
 * Obtiene productos del dashboard filtrados por tipo
 * @param {Object} params - Parámetros (typ, page, page_size, limit, lang)
 * @returns {Promise} - Lista paginada de productos del dashboard
 */
export async function getDashboardProducts(params = {}) {
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
    ? `${PRODUCT_ENDPOINTS.DASHBOARD_PRODUCTS}?${queryString}`
    : PRODUCT_ENDPOINTS.DASHBOARD_PRODUCTS;
  
  // Hacer petición directa ya que el endpoint /dashboard no usa el prefijo /api
  const token = getToken();
  const csrfToken = getCsrfTokenFromCookie();
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Token ${token}`;
  }
  
  // Agregar CSRF token si está disponible (para coincidir con el servidor)
  if (csrfToken) {
    headers['X-CSRFToken'] = csrfToken;
  }
  
  // Log para debugging (solo en desarrollo)
  if (import.meta.env.DEV) {
    console.log('🔍 getDashboardProducts - Request:', {
      endpoint,
      hasToken: !!token,
      tokenPreview: token ? `${token.substring(0, 10)}...` : 'none',
      params: stringParams,
    });
  }
  
  const response = await fetch(endpoint, {
    method: 'GET',
    headers,
    credentials: 'include',
  });
  
  // Verificar el tipo de contenido antes de parsear
  const contentType = response.headers.get('content-type');
  
  // Log de respuesta (solo en desarrollo)
  if (import.meta.env.DEV) {
    console.log('🔍 getDashboardProducts - Response:', {
      status: response.status,
      statusText: response.statusText,
      contentType,
      url: response.url,
    });
  }
  
  if (!response.ok) {
    // Manejar errores 401/403 de autenticación
    if (response.status === 401 || response.status === 403) {
      // Limpiar token si está expirado o inválido
      clearToken();
      
      // Redirigir al login si no estamos ya ahí
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
      
      throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
    }
    
    // Si la respuesta es HTML (página de error), intentar obtener el mensaje
    if (contentType && contentType.includes('text/html')) {
      const text = await response.text();
      throw new Error(`Error HTTP ${response.status}: El servidor devolvió HTML en lugar de JSON. Posible problema de autenticación o endpoint incorrecto.`);
    }
    throw new Error(`Error HTTP: ${response.status}`);
  }
  
  // Verificar que la respuesta sea JSON
  if (!contentType || !contentType.includes('application/json')) {
    const text = await response.text();
    console.error('Respuesta no es JSON:', text.substring(0, 200));
    throw new Error('El servidor devolvió una respuesta que no es JSON');
  }
  
  const data = await response.json();
  
  // Log del resultado (solo en desarrollo)
  if (import.meta.env.DEV) {
    console.log('🔍 getDashboardProducts - Data:', {
      count: data.count,
      resultsLength: data.results?.length || 0,
      hasNext: !!data.next,
      hasPrevious: !!data.previous,
    });
  }
  
  return data;
}

