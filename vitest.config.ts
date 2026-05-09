import { defineConfig } from 'vitest/config';
import angular from '@analogjs/vite-plugin-angular';

export default defineConfig({
  plugins: [angular()],
  test: {
    environment: 'jsdom',           // 模拟浏览器环境
    globals: true,                  // 全局可用 describe, it, expect
    setupFiles: ['./src/test-setup.ts'],
    include: ['src/**/*.{test,spec}.ts'],
    restoreMocks: true,
    coverage: {
      provider: 'v8',
      include: ['src/app/**/*.ts'],
      exclude: ['**/*.spec.ts', '**/test-setup.ts']
    }
  }
});