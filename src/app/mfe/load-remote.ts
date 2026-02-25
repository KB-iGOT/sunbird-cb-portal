/**
 * Dynamic Module Federation loader for the Angular 16 host.
 *
 * Loads remote entries via <script> tag injection and accesses
 * exposed modules through the webpack container API.
 *
 * No webpack Module Federation plugin or custom-webpack builder is
 * required on the host side — this is pure dynamic loading.
 */

interface LoadRemoteModuleOptions {
  /** URL of the remote's remoteEntry.js */
  remoteEntry: string;
  /** Global variable name the remote registers itself under */
  remoteName: string;
  /** Exposed module path (e.g., './HomeFeature') */
  exposedModule: string;
}

/** Cache loaded remote entries to avoid duplicate script injection */
const remoteEntryCache = new Map<string, Promise<void>>();

/**
 * Inject the remote entry script into the page.
 * Cached per URL so it's only loaded once.
 */
function loadRemoteEntry(url: string): Promise<void> {
  if (remoteEntryCache.has(url)) {
    return remoteEntryCache.get(url)!;
  }

  const promise = new Promise<void>((resolve, reject) => {
    // Check if already loaded (e.g., via SSR or preload)
    const existing = document.querySelector(`script[src="${url}"]`);
    if (existing) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = url;
    // Must be a classic script (not 'module') so the remote container
    // registers itself on window[remoteName] via Module Federation's
    // global variable assignment.
    script.onload = () => {
      // Give the IIFE a microtask to finish assigning the global
      Promise.resolve().then(() => resolve());
    };
    script.onerror = () =>
      reject(new Error(`Failed to load remote entry: ${url}`));
    document.head.appendChild(script);
  });

  remoteEntryCache.set(url, promise);
  return promise;
}

/**
 * Load a module exposed by a Module Federation remote.
 *
 * 1. Injects remoteEntry.js (if not already loaded)
 * 2. Initializes the container with empty shared scopes
 *    (Angular 20 remote bundles its own deps independently)
 * 3. Gets the exposed module factory and returns its exports
 *
 * @example
 * ```typescript
 * const homeModule = await loadRemoteModule({
 *   remoteEntry: 'http://localhost:4200/remoteEntry.js',
 *   remoteName: 'igotLearnerPortal',
 *   exposedModule: './HomeFeature',
 * });
 * await homeModule.bootstrap();
 * // <igot-mfe-home> custom element is now available
 * ```
 */
export async function loadRemoteModule(
  options: LoadRemoteModuleOptions,
): Promise<any> {
  await loadRemoteEntry(options.remoteEntry);

  const container = (window as any)[options.remoteName];
  if (!container) {
    throw new Error(
      `Remote container "${options.remoteName}" not found on window. ` +
        `Ensure remoteEntry.js at ${options.remoteEntry} is valid.`,
    );
  }

  // Initialize with empty shared scopes — the remote bundles everything.
  // This is safe for cross-version federation (Angular 16 host ↔ Angular 20 remote).
  await container.init({});

  const factory = await container.get(options.exposedModule);
  if (!factory) {
    throw new Error(
      `Module "${options.exposedModule}" not found in remote "${options.remoteName}".`,
    );
  }

  return factory();
}
