module.exports = {
  preset: 'ts-jest', 
  globals: {
    'ts-jest': {
       tsconfig: '<rootDir>/tsconfig.spec.json',
       stringifyContentPathRegex: '\\.(html|svg)$',
     },
   }, 
   coverageDirectory: './coverage',
   transform: {
    '^.+\\.(ts|mjs|js|html)$': 'jest-preset-angular',
  },
  moduleNameMapper: {
    '^@ws/(.*)$': '<rootDir>/project/ws/$1',
    '@ws-widget/(.*)$': '<rootDir>/library/ws-widget/$1',
    '@ws/author/(.*)$': '<rootDir>/project/ws/author/$1',
    // '^@components/(.*)$': '<rootDir>/project/ws/author/src/lib/routing/modules/editor/routing/modules/collection-v2/components/$1',
    'worker-loader!.*': '<rootDir>/test/mocks/workerMock.js',
    'pdfjs-dist/build/pdf.worker': '<rootDir>/test/mocks/workerMock.js',
    "^src/environments/environment$": "<rootDir>/src/environments/environment.ts",
  },
  transformIgnorePatterns: [
    'node_modules/(?!.*\\.mjs$)',
  ],  
  coverageReporters: ["clover", "json", "lcov", "text", "text-summary"],
  collectCoverage: true,
  testResultsProcessor: "jest-sonar-reporter",
  setupFiles: ["jest-localstorage-mock"],
  
 
}
