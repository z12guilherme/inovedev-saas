// vite.config.ts
import { defineConfig } from "file:///C:/Users/santa%20fe/Desktop/inovedev-saas/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/santa%20fe/Desktop/inovedev-saas/node_modules/@vitejs/plugin-react-swc/index.js";
import path from "path";
import { componentTagger } from "file:///C:/Users/santa%20fe/Desktop/inovedev-saas/node_modules/lovable-tagger/dist/index.js";
var __vite_injected_original_dirname = "C:\\Users\\santa fe\\Desktop\\inovedev-saas";
var vite_config_default = defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false
    }
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src")
    }
  }
}));
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxzYW50YSBmZVxcXFxEZXNrdG9wXFxcXGlub3ZlZGV2LXNhYXNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXHNhbnRhIGZlXFxcXERlc2t0b3BcXFxcaW5vdmVkZXYtc2Fhc1xcXFx2aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvc2FudGElMjBmZS9EZXNrdG9wL2lub3ZlZGV2LXNhYXMvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidml0ZVwiO1xyXG5pbXBvcnQgcmVhY3QgZnJvbSBcIkB2aXRlanMvcGx1Z2luLXJlYWN0LXN3Y1wiO1xyXG5pbXBvcnQgcGF0aCBmcm9tIFwicGF0aFwiO1xyXG5pbXBvcnQgeyBjb21wb25lbnRUYWdnZXIgfSBmcm9tIFwibG92YWJsZS10YWdnZXJcIjtcclxuXHJcbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXHJcbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZygoeyBtb2RlIH0pID0+ICh7XHJcbiAgc2VydmVyOiB7XHJcbiAgICBob3N0OiBcIjo6XCIsXHJcbiAgICBwb3J0OiA4MDgwLFxyXG4gICAgaG1yOiB7XHJcbiAgICAgIG92ZXJsYXk6IGZhbHNlLFxyXG4gICAgfSxcclxuICB9LFxyXG4gIHBsdWdpbnM6IFtyZWFjdCgpLCBtb2RlID09PSBcImRldmVsb3BtZW50XCIgJiYgY29tcG9uZW50VGFnZ2VyKCldLmZpbHRlcihCb29sZWFuKSxcclxuICByZXNvbHZlOiB7XHJcbiAgICBhbGlhczoge1xyXG4gICAgICBcIkBcIjogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCIuL3NyY1wiKSxcclxuICAgIH0sXHJcbiAgfSxcclxufSkpO1xyXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQW1ULFNBQVMsb0JBQW9CO0FBQ2hWLE9BQU8sV0FBVztBQUNsQixPQUFPLFVBQVU7QUFDakIsU0FBUyx1QkFBdUI7QUFIaEMsSUFBTSxtQ0FBbUM7QUFNekMsSUFBTyxzQkFBUSxhQUFhLENBQUMsRUFBRSxLQUFLLE9BQU87QUFBQSxFQUN6QyxRQUFRO0FBQUEsSUFDTixNQUFNO0FBQUEsSUFDTixNQUFNO0FBQUEsSUFDTixLQUFLO0FBQUEsTUFDSCxTQUFTO0FBQUEsSUFDWDtBQUFBLEVBQ0Y7QUFBQSxFQUNBLFNBQVMsQ0FBQyxNQUFNLEdBQUcsU0FBUyxpQkFBaUIsZ0JBQWdCLENBQUMsRUFBRSxPQUFPLE9BQU87QUFBQSxFQUM5RSxTQUFTO0FBQUEsSUFDUCxPQUFPO0FBQUEsTUFDTCxLQUFLLEtBQUssUUFBUSxrQ0FBVyxPQUFPO0FBQUEsSUFDdEM7QUFBQSxFQUNGO0FBQ0YsRUFBRTsiLAogICJuYW1lcyI6IFtdCn0K
