/**
 * Type declarations for Module Federation remote containers.
 *
 * When a remote entry script (remoteEntry.js) is loaded, it registers
 * a container on the window object. These declarations provide type
 * safety when interacting with the container API.
 */

/** Module Federation container interface */
interface MfeContainer {
  init(shareScopes: Record<string, any>): Promise<void>;
  get(moduleName: string): Promise<() => any>;
}

/** Extend Window to include known remote containers */
interface Window {
  igotLearnerPortal?: MfeContainer;
}
