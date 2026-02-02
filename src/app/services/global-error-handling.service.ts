import { Injectable, ErrorHandler } from '@angular/core'

@Injectable({
  providedIn: 'root',
})
export class GlobalErrorHandlingService implements ErrorHandler {

  constructor() { }

  handleError(error: any): void {
    const chunkFailedMessage = /ChunkLoadError|Loading chunk \d+ failed/i

    // Only reload on actual chunk loading errors, not on HTTP/API errors
    if (error && error.message && chunkFailedMessage.test(error.message)) {
      console.warn('ChunkLoadError detected, reloading page...', error)
      window.location.reload()
    } else {
      // Log the error but don't reload the page
      console.error('Application Error:', error)
      // Don't throw the error to prevent crash loops
      // throw error
    }
  }
}
