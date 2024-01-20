// This is the vitest.config.js file
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    setupFiles: ["dotenv/config"],
    include: ["tests/**/*.test.ts"]
  },
});
