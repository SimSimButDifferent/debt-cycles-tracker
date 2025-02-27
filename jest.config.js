module.exports = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  moduleNameMapper: {
    "^@/app/(.*)$": "<rootDir>/app/$1",
    "^.+\\.(css|sass|scss)$": "identity-obj-proxy",
    "^@/components/(.*)$": "<rootDir>/app/components/$1",
    "^@/hooks/(.*)$": "<rootDir>/app/hooks/$1",
    "^@/services/(.*)$": "<rootDir>/app/services/$1",
  },
  testPathIgnorePatterns: [
    "<rootDir>/.next/",
    "<rootDir>/node_modules/",
    "<rootDir>/app/__tests__/mocks/",
    "<rootDir>/app/__tests__/test-utils.tsx",
    "<rootDir>/app/__tests__/test-environment.js",
    "<rootDir>/app/__tests__/jest.d.ts",
    "<rootDir>/babel.config.test.js",
  ],
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": [
      "babel-jest",
      { configFile: "./babel.config.test.js" },
    ],
  },
  transformIgnorePatterns: [
    "/node_modules/",
    "^.+\\.module\\.(css|sass|scss)$",
  ],
  collectCoverageFrom: [
    "app/**/*.{js,jsx,ts,tsx}",
    "!app/**/*.d.ts",
    "!app/api/**",
  ],
  globals: {
    "ts-jest": {
      tsconfig: "tsconfig.jest.json",
    },
  },
};
