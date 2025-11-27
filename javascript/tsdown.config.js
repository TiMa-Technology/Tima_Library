import { defineConfig } from "tsdown";

export default defineConfig({
  entry: {
    main: "src/main.ts",
    auth: "src/auth/index.ts",
    browserUtils: "src/browserUtils/index.ts",
    baseFunction: "src/baseFunction/index.ts",
  },
  dts: true,
  outDir: "dist",
  format: "esm",
  clean: true,
});
