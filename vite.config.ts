import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  const isProd = mode === 'production';

  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
      allowedHosts: ['.cnb.run', 'orvy5cqpu6-3000.cnb.run'],
    },

    plugins: [react()],

    define: {
      // 移除 Gemini 相关配置（已使用预制问题）
      // 'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },

    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },

    // 生产构建优化
    build: isProd ? {
      // 代码分割配置
      rollupOptions: {
        output: {
          // 手动分包策略
          manualChunks: (id) => {
            // Supabase 单独打包
            if (id.includes('node_modules/@supabase/')) {
              return 'supabase-vendor';
            }
            // GSAP 动画库单独打包
            if (id.includes('node_modules/gsap/')) {
              return 'gsap-vendor';
            }
            // Three.js 单独打包
            if (id.includes('node_modules/three/') || id.includes('node_modules/@types/three/')) {
              return 'three-vendor';
            }
            // 其他 node_modules 包
            if (id.includes('node_modules/')) {
              return 'vendor';
            }
          },
          // 设置 chunk 文件命名格式
          chunkFileNames: 'assets/js/[name]-[hash].js',
          entryFileNames: 'assets/js/[name]-[hash].js',
          assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
        },
      },
      // 启用源码映射 (生产环境建议关闭，这里仅用于调试)
      sourcemap: false,
      // 设置 chunk 大小警告阈值 (KB)
      chunkSizeWarningLimit: 1000,
      // 压缩配置
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true, // 生产环境移除 console
          drop_debugger: true,
        },
      },
    } : {},

    // 依赖预构建优化
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        '@supabase/supabase-js',
        'gsap',
        'lucide-react',
      ],
    },

    // 全局环境变量前缀
    envPrefix: 'VITE_',
  };
});
