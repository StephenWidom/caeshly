import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "Caeshly",
        short_name: "Caeshly",
        description: "Task tracking app",
        theme_color: "#ffffff",
        icons: [
          {
            src: "public/logo192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "public/logo512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
      workbox: {
        // Customize caching rules here
        runtimeCaching: [
          {
            urlPattern: /.*\.(js|css|html|png|jpg|jpeg|svg|gif)/,
            handler: "CacheFirst",
            options: {
              cacheName: "assets-cache",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
              },
            },
          },
        ],
      },
    }),
  ],
  optimizeDeps: {
    include: ["@ant-design/icons", "antd"],
  },
  define: {
    global: "window",
  },
  build: {
    minify: "terser",
  },
});
