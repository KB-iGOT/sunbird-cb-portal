import 'jest-preset-angular/setup-jest'
// components with i18n templates compile to $localize calls, which is a global the
// AOT build provides but jest does not; without it they fail with "$localize is not defined"
import '@angular/localize/init'
// jsdom has no canvas: jspdf (pulled in through @sunbird-cb/consumption -> @sunbird-cb/toc) probes
// getContext() at import time and jsdom logs "Not implemented: HTMLCanvasElement.prototype.getContext"
// in every suite that reaches it. Returning null is what a canvas-less browser does, so jspdf just
// skips its canvas path
Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', { value: () => null, writable: true })

// Import-time warnings from third-party code that every suite loading the widget library prints.
// None of them fails a test, but they fill the head of the CI console - which is all the PR bot
// posts - and push the real failure out of view. Only these exact messages are dropped
const KNOWN_IMPORT_NOISE = [
  /NG0912: Component ID generation collision/,
  /videojs\.extend is deprecated/,
  /Please use the `legacy` build in Node\.js environments/,
]
// video.js logs its text in pieces ('VIDEOJS:', 'WARN:', message), so match on the whole line
const isKnownNoise = (args: any[]) => {
  const line = args.map(arg => String(arg)).join(' ')
  return KNOWN_IMPORT_NOISE.some(pattern => pattern.test(line))
}
for (const level of ['warn', 'log'] as const) {
  const original = console[level].bind(console)
  console[level] = (...args: any[]) => {
    if (!isKnownNoise(args)) {
      original(...args)
    }
  }
}
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
