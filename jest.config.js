module.exports = {
  preset: 'jest-preset-angular',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setup-jest.ts'],
  transformIgnorePatterns: [
    'node_modules/(?!.*\\.mjs$)'
  ],  
  moduleNameMapper: {
    '^@ws/(.*)$': '<rootDir>/project/ws/$1',
    '^@ws-widget/(.*)$': '<rootDir>/library/ws-widget/$1',
    '^@ws/author/(.*)$': '<rootDir>/project/ws/author/$1',
    '^@ws/app/(.*)$': '<rootDir>/project/ws/app/$1',
    '^@ws/viewer/(.*)$': '<rootDir>/project/ws/viewer/$1',
    '^@sunbird-cb/collection/(.*)$': '<rootDir>/library/ws-widget/collection/$1',
    '^@sunbird-cb/resolver/(.*)$': '<rootDir>/library/ws-widget/resolver/$1',
    'worker-loader!.*': '<rootDir>/test/mocks/workerMock.js',
    'pdfjs-dist/build/pdf.worker': '<rootDir>/test/mocks/workerMock.js',
    'smartech': '<rootDir>/test/mocks/workerMock.js',
    'pdfjs-dist/webpack': 'pdfjs-dist',
    "^src/environments/environment$": "<rootDir>/src/environments/environment.ts",
    '@ckeditor/.*': '<rootDir>/test/mocks/mock-ckeditor.js',
    '^@sunbird-cb/discussion-v2': '<rootDir>/test/mocks/mock-ckeditor.js',
    "uuid": require.resolve('uuid'),
  },
  coverageReporters: ["clover", "json", "lcov", "text", "text-summary"],
  collectCoverage: true,
  testResultsProcessor: "jest-sonar-reporter",
  setupFiles: ['zone.js', ]
};