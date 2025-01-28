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
  transformIgnorePatterns: [
    'node_modules/(?!.*\\.mjs$)',
  ],  
  coverageReporters: ["clover", "json", "lcov", "text", "text-summary"],
  collectCoverage: true,
  testResultsProcessor: "jest-sonar-reporter",
  setupFiles: ["jest-localstorage-mock"],
  
 
}
