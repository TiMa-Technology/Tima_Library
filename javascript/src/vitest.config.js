import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom", // 用到 window/document，否則可用 'node'
    include: ["src/**/__tests__/**/*.test.{js,ts}"], // 測試檔案路徑
    coverage: {
      enabled: true,
      reporter: ["text", "html"], // 報告格式
      reportsDirectory: "./coverage",
      exclude: ["**/__tests__/**"],
    },
  },
});
