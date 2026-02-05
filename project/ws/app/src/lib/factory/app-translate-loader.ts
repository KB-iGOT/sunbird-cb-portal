
import { TranslateHttpLoader, provideTranslateHttpLoader, TRANSLATE_HTTP_LOADER_CONFIG } from '@ngx-translate/http-loader'
import { Provider } from '@angular/core'

/**
 * Factory function for TranslateHttpLoader - Angular 17+ version
 * Note: @ngx-translate/http-loader v17+ uses dependency injection, not constructor params
 * The TranslateHttpLoader will automatically inject TRANSLATE_HTTP_LOADER_CONFIG
 */
// tslint:disable-next-line:function-name
export function HttpLoaderFactory() {
  // Return a new TranslateHttpLoader instance (config comes from DI)
  return new TranslateHttpLoader()
}

/**
 * Get the providers needed for TranslateHttpLoader
 * Use this in the providers array of modules that configure TranslateModule
 */
export function getTranslateHttpLoaderProviders(config: any = {}): Provider[] {
  return [
    {
      provide: TRANSLATE_HTTP_LOADER_CONFIG,
      useValue: { prefix: '/assets/i18n/', suffix: '.json', ...config }
    }
  ]
}

// Re-export for convenience
export { TranslateHttpLoader, provideTranslateHttpLoader, TRANSLATE_HTTP_LOADER_CONFIG }

