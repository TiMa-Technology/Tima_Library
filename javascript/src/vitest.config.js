import { defineConfig } from "vitest/config";
import path from "node:path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom", // 用到 window/document，否則可用 'node'
    include: ["src/**/__tests__/**/*.test.{js,ts}"], // 測試檔案路徑
    alias: {
      "@/*": path.resolve(__dirname, "./src"), // 這樣 '@/xxx' 就是指向 ./src/xxx
    },
    env: {
      APP_ACCOUNT: "test-account",
      APP_PASSWORD: "test-password",
    },
    coverage: {
      enabled: true,
      reporter: ["text", "html", "json-summary"], // 報告格式
      reportsDirectory: "./coverage",
      exclude: ["node_modules/", "**/__tests__/", "**/*.d.ts", "**/*.config.*"],
    },
  },
});
