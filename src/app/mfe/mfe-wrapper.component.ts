import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { loadRemoteModule } from './load-remote'

/**
 * MfeWrapperComponent — Generic wrapper that loads a Module Federation
 * remote feature and renders it as a Web Component.
 *
 * Route data properties:
 * - remoteEntry: URL to the remote's remoteEntry.js
 * - remoteName:  Global variable name of the remote container
 * - exposedModule: Module path exposed by the remote (e.g., './HomeFeature')
 * - elementName: Custom element tag registered by the remote (e.g., 'igot-mfe-home')
 *
 * Usage in routes:
 * ```typescript
 * {
 *   path: 'home',
 *   component: MfeWrapperComponent,
 *   data: {
 *     remoteEntry: 'http://localhost:4200/remoteEntry.js',
 *     remoteName: 'igotLearnerPortal',
 *     exposedModule: './HomeFeature',
 *     elementName: 'igot-mfe-home',
 *   }
 * }
 * ```
 */
@Component({
  selector: 'ws-mfe-wrapper',
  template: `
    <div *ngIf="loading" class="mfe-loading">
      <div class="mfe-spinner"></div>
      <p>Loading module…</p>
    </div>
    <div *ngIf="error" class="mfe-error">
      <span class="material-icons">error_outline</span>
      <p>Failed to load the remote module.</p>
      <p class="mfe-error-detail">{{ errorMessage }}</p>
      <button (click)="retry()" class="mfe-retry-btn">Retry</button>
    </div>
    <div #mfeContainer class="mfe-container"></div>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 200px;
    }
    .mfe-loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 4rem 1rem;
      color: #666;
    }
    .mfe-spinner {
      width: 40px;
      height: 40px;
      border: 3px solid #e0e0e0;
      border-top: 3px solid #1976d2;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin-bottom: 1rem;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    .mfe-error {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem 1rem;
      color: #c62828;
      text-align: center;
    }
    .mfe-error .material-icons {
      font-size: 48px;
      margin-bottom: 0.5rem;
    }
    .mfe-error-detail {
      font-size: 0.8rem;
      color: #999;
      max-width: 500px;
      word-break: break-word;
    }
    .mfe-retry-btn {
      margin-top: 1rem;
      padding: 0.5rem 1.5rem;
      border: 1px solid #1976d2;
      border-radius: 4px;
      background: transparent;
      color: #1976d2;
      cursor: pointer;
      font-size: 0.875rem;
    }
    .mfe-retry-btn:hover {
      background: #e3f2fd;
    }
    .mfe-container {
      min-height: 100px;
    }
  `],
})
export class MfeWrapperComponent implements OnInit, OnDestroy {
  @ViewChild('mfeContainer', { static: true }) container!: ElementRef<HTMLDivElement>

  loading = true
  error = false
  errorMessage = ''

  private remoteEntry = ''
  private remoteName = ''
  private exposedModule = ''
  private elementName = ''

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    const data = this.route.snapshot.data
    this.remoteEntry = data['remoteEntry'] || ''
    this.remoteName = data['remoteName'] || ''
    this.exposedModule = data['exposedModule'] || ''
    this.elementName = data['elementName'] || ''


    this.load()
  }

  ngOnDestroy(): void {
    // Clean up: remove the custom element from the DOM
    if (this.container?.nativeElement) {
      this.container.nativeElement.innerHTML = ''
    }
  }

  retry(): void {
    this.error = false
    this.errorMessage = ''
    this.loading = true
    this.container.nativeElement.innerHTML = ''
    this.load()
  }

  /**
   * Inject the new portal's compiled stylesheet into this document once.
   * This brings in design-system tokens (--color-primary, --font-family, etc.),
   * Angular Material M3 theme, Tailwind utilities and the Inter font
   * so MFE web components render correctly inside the old portal shell.
   */
  private injectMfeStyles(): void {
    const STYLE_ID = 'igot-mfe-remote-styles'
    if (document.getElementById(STYLE_ID)) return // already injected

    // Google Fonts — Inter (used by design-system typography tokens)
    const fontLink = document.createElement('link')
    fontLink.id = STYLE_ID + '-fonts'
    fontLink.rel = 'stylesheet'
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap'
    document.head.appendChild(fontLink)

    // New portal compiled styles (design tokens + Material M3 + Tailwind)
    const styleLink = document.createElement('link')
    styleLink.id = STYLE_ID
    styleLink.rel = 'stylesheet'
    styleLink.href = 'http://localhost:4200/styles.css'
    document.head.appendChild(styleLink)
  }

  private async load(): Promise<void> {
    try {
      // 0. Inject new portal styles (tokens, Material M3, Tailwind, fonts)
      this.injectMfeStyles()

      // 1. Load remote module
      const remoteModule = await loadRemoteModule({
        remoteEntry: this.remoteEntry,
        remoteName: this.remoteName,
        exposedModule: this.exposedModule,
      })

      // 2. Bootstrap the Web Component (registers custom element)
      if (typeof remoteModule.bootstrap === 'function') {
        await remoteModule.bootstrap()
      }

      // 3. Create and insert the custom element
      const el = document.createElement(this.elementName)
      el.style.display = 'block'
      el.style.width = '100%'
      // Full-portal MFE (igot-mfe-app) should take the entire viewport height
      if (this.elementName === 'igot-mfe-app') {
        el.style.minHeight = '100vh'
        this.container.nativeElement.style.minHeight = '100vh'
        ;(this.container.nativeElement.closest('ws-mfe-wrapper') as HTMLElement | null)
          ?.style.setProperty('min-height', '100vh')
      }
      this.container.nativeElement.appendChild(el)

      // 4. Trigger the Angular 20 router's initial navigation NOW that the
      //    custom element (<igot-mfe-app>) is in the DOM and <router-outlet>
      //    exists. Without this, navigation fires before the outlet is mounted
      //    and the page renders blank on first load.
      if (typeof remoteModule.triggerNavigation === 'function') {
        // Capture the path SYNCHRONOUSLY here — before the setTimeout callback
        // fires — so that any intermediate pushState calls (e.g. from another
        // Angular router) cannot mutate window.location.pathname between now
        // and when triggerNavigation() actually runs.
        const pathAtMount = window.location.pathname + window.location.search
        // Use setTimeout(0) to allow the custom element's connectedCallback
        // and Angular's component bootstrap to complete before navigating.
        setTimeout(() => remoteModule.triggerNavigation(pathAtMount), 0)
      }

      this.loading = false
    } catch (err: any) {
      console.error('[MFE] Failed to load remote module:', err)
      this.loading = false
      this.error = true
      this.errorMessage = err?.message || 'Unknown error'
    }
  }
}
