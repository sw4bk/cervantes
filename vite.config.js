import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://habitat.bromteck.com',
        changeOrigin: true,
        secure: false,
        cookieDomainRewrite: '',
        configure: (proxy, _options) => {
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            // Preservar cookies y headers
            if (req.headers.cookie) {
              proxyReq.setHeader('Cookie', req.headers.cookie);
            }
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            // Preservar cookies en la respuesta
            const setCookieHeader = proxyRes.headers['set-cookie'];
            if (setCookieHeader) {
              // Ajustar el dominio de las cookies si es necesario
              proxyRes.headers['set-cookie'] = setCookieHeader.map(cookie => {
                return cookie.replace(/Domain=[^;]+/gi, '');
              });
            }
          });
        },
      },
      '/database': {
        target: 'http://habitat.bromteck.com',
        changeOrigin: true,
        secure: false,
        cookieDomainRewrite: '',
        configure: (proxy, _options) => {
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            // Preservar cookies y headers
            if (req.headers.cookie) {
              proxyReq.setHeader('Cookie', req.headers.cookie);
            }
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            // Preservar cookies en la respuesta
            const setCookieHeader = proxyRes.headers['set-cookie'];
            if (setCookieHeader) {
              proxyRes.headers['set-cookie'] = setCookieHeader.map(cookie => {
                return cookie.replace(/Domain=[^;]+/gi, '');
              });
            }
          });
        },
      },
      '/dashboard/products': {
        target: 'http://habitat.bromteck.com',
        changeOrigin: true,
        secure: false,
        cookieDomainRewrite: '',
        configure: (proxy, _options) => {
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            // Preservar cookies y headers
            if (req.headers.cookie) {
              proxyReq.setHeader('Cookie', req.headers.cookie);
            }
            // Preservar el header de Authorization si existe
            if (req.headers.authorization) {
              proxyReq.setHeader('Authorization', req.headers.authorization);
            }
            // Log para debugging
            console.log('🔍 Proxy /dashboard/products - Request:', {
              method: req.method,
              url: req.url,
              hasAuth: !!req.headers.authorization,
              hasCookies: !!req.headers.cookie,
            });
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            // Preservar cookies en la respuesta
            const setCookieHeader = proxyRes.headers['set-cookie'];
            if (setCookieHeader) {
              proxyRes.headers['set-cookie'] = setCookieHeader.map(cookie => {
                return cookie.replace(/Domain=[^;]+/gi, '');
              });
            }
            // Log para debugging
            console.log('🔍 Proxy /dashboard/products - Response:', {
              statusCode: proxyRes.statusCode,
              statusMessage: proxyRes.statusMessage,
              url: req.url,
            });
          });
        },
      },
    },
  },
})
