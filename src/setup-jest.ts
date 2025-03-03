import 'jest-preset-angular/setup-jest'
import '@angular/localize/init'
jest.mock('html2canvas', () => {
  return jest.fn().mockResolvedValue({});
});
Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
  value: () => {
    return {
      // Mock implementation of getContext, for example:
      canvas: {},
      getImageData: jest.fn(),
      putImageData: jest.fn(),
      createImageData: jest.fn(),
    };
  },
});
// Object.defineProperty(window, 'env', {
//     value: {
//       sitePath: 'http://example.com',
//       karmYogiPath: 'http://karmyogi.example.com',
//       portalRoles: 'admin,user',
//       name: 'Test Environment',
//       cbpProvidersRoles: [],
//       userBucket: 'test-bucket',
//       departments: ['HR', 'Finance'],
//       contentHost: 'http://content.example.com',
//       azureBucket: 'test-azure-bucket',
//       spvPath: 'http://spv.example.com',
//       connectionType: 'online',
//       KCMframeworkName: 'Framework 1',
//     },
//     writable: true,
//   })
jest.mock('src/environments/environment', () => ({
  environment: {
    production: false,
    sitePath: ''
  }
}))
