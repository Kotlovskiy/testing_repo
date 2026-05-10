import { createDefaultPreset } from 'ts-jest';

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
export default {
  testEnvironment: "node",
  transform: {
    ...tsJestTransformCfg,
  },
  testMatch: [
    "**/tests/**/*.test.ts",
    "**/__tests__/**/*.test.ts"
  ],
  moduleFileExtensions: ["ts", "js", "json"],
  clearMocks: true,
  collectCoverage: false,
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js']
};