import { TranslateHttpLoader, provideTranslateHttpLoader, TRANSLATE_HTTP_LOADER_CONFIG } from '@ngx-translate/http-loader'
import { HttpClient } from '@angular/common/http'
import { Provider } from '@angular/core'

/**
 * Factory function for TranslateHttpLoader - legacy support
 * Note: @ngx-translate/http-loader v17+ requires TRANSLATE_HTTP_LOADER_CONFIG injection token
 */
export function HttpLoaderFactory(http: HttpClient) {
  // Create a minimal TranslateHttpLoader-like object that doesn't rely on injection
  return {
    getTranslation(lang: string) {
      return http.get(`/assets/i18n/${lang}.json`)
    }
  }
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
