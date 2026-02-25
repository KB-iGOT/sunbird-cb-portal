import { Injectable } from '@angular/core'
import { environment } from '../../environments/environment'

/**
 * MFE (Micro Frontend) configuration.
 *
 * Central place to manage all remote portal URLs.
 * Production URLs should be configured via environment files.
 */
@Injectable({
  providedIn: 'root',
})
export class MfeConfigService {
  /**
   * Map of remote names to their entry URLs.
   * Override via environment.mfeRemotes for production.
   */
  private readonly remotes: Record<string, string> = {
    igotLearnerPortal: (environment as any).mfeRemotes?.igotLearnerPortal
      || 'http://localhost:4200/remoteEntry.js',
  }

  getRemoteEntryUrl(remoteName: string): string {
    const url = this.remotes[remoteName]
    if (!url) {
      throw new Error(`[MFE] No remote entry configured for: ${remoteName}`)
    }
    return url
  }
}
