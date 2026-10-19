import 'jest-preset-angular/setup-jest'
// components with i18n templates compile to $localize calls, which is a global the
// AOT build provides but jest does not; without it they fail with "$localize is not defined"
import '@angular/localize/init'
// jsdom has no canvas: jspdf (pulled in through @sunbird-cb/consumption -> @sunbird-cb/toc) probes
// getContext() at import time and jsdom logs "Not implemented: HTMLCanvasElement.prototype.getContext"
// in every suite that reaches it. Returning null is what a canvas-less browser does, so jspdf just
// skips its canvas path
Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', { value: () => null, writable: true })
Object.defineProperty(window, 'env', {
    value: {
      sitePath: 'http://example.com',
      karmYogiPath: 'http://karmyogi.example.com',
      portalRoles: 'admin,user',
      name: 'Test Environment',
      cbpProvidersRoles: [],
      userBucket: 'test-bucket',
      departments: ['HR', 'Finance'],
      contentHost: 'http://content.example.com',
      azureBucket: 'test-azure-bucket',
      spvPath: 'http://spv.example.com',
      connectionType: 'online',
      KCMframeworkName: 'Framework 1',
    },
    writable: true,
  })
