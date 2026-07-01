import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'logo.png', 'icons/*.png'],
      manifest: {
        name: 'Semesta Coffee',
        short_name: 'Semesta Cafe',
        description: 'Pesan makanan & minuman, reservasi meja, dan nikmati pengalaman cafe terbaik di Semesta Coffee.',
        theme_color: '#4a2c2a',
        background_color: '#fdf6ec',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        lang: 'id',
        categories: ['food', 'lifestyle'],
        icons: [
          {
            src: '/icons/icon-72x72.png',
            sizes: '72x72',
            type: 'image/png'
          },
          {
            src: '/icons/icon-96x96.png',
            sizes: '96x96',
            type: 'image/png'
          },
          {
            src: '/icons/icon-128x128.png',
            sizes: '128x128',
            type: 'image/png'
          },
          {
            src: '/icons/icon-144x144.png',
            sizes: '144x144',
            type: 'image/png'
          },
          {
            src: '/icons/icon-152x152.png',
            sizes: '152x152',
            type: 'image/png'
          },
          {
            src: '/icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/icons/icon-384x384.png',
            sizes: '384x384',
            type: 'image/png'
          },
          {
            src: '/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ],
        screenshots: [
          {
            src: '/logo.png',
            sizes: '512x512',
            type: 'image/png',
            form_factor: 'narrow',
            label: 'Semesta Coffee App'
          }
        ]
      },
      strategies: 'generateSW',
      injectRegister: 'auto',
      workbox: {
        // Import push notification handler
        importScripts: ['/sw-push.js'],
        // Naikkan batas ukuran file (default 2MB, dinaikkan ke 5MB karena bundle besar)
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        // Cache halaman & assets utama
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg,webp,woff,woff2}'],
        // Strategi cache untuk API calls
        runtimeCaching: [
          {
            // Cache API menu dari backend
            urlPattern: /^https?:\/\/.*\/api\/(menu|categories)/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'api-menu-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 // 24 jam
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            // Cache gambar menu
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 hari
              }
            }
          },
          {
            // Cache font Google jika ada
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'google-fonts-cache'
            }
          }
        ],
        // Navigasi ke index.html untuk SPA routing
        navigateFallback: 'index.html',
        navigateFallbackDenylist: [/^\/api/]
      },
      devOptions: {
        enabled: true // Aktifkan PWA di mode dev untuk testing
      }
    })
  ],
})
