/**
 * Storage backends in priority order
 * Examples: 'localStorage', 'cookie|localStorage', 'cookie|localStorage|sessionStorage'
 */
export type StorageType = 'localStorage' | 'sessionStorage' | 'cookie';
export type StorageConfig = StorageType | StorageType[] | string;

/**
 * Behavior when link already has a parameter
 */
export type ExistingParamBehavior = 'skip' | 'fill' | 'overwrite';

/**
 * Captured parameter data
 */
export interface ParamData {
  /** Key-value pairs of captured parameters */
  params: Record<string, string>;
  /** Timestamp when captured (Unix ms) */
  timestamp: number;
}

/**
 * Main configuration
 */
export interface ParamzillaConfig {
  // ═══════════════════════════════════════════════════════════════
  // FEATURE TOGGLES
  // ═══════════════════════════════════════════════════════════════

  /** Master enable/disable switch */
  enabled: boolean;

  /** Enable console debug logging */
  debug: boolean;

  /** Enable first-touch attribution (stores first visit params forever) */
  enableFirstTouch: boolean;

  /** Enable last-touch attribution (updates on each visit with params) */
  enableLastTouch: boolean;

  /** Enable automatic link decoration */
  enableLinkDecoration: boolean;

  /** Enable URL restoration from storage when visiting without params */
  enableUrlRestoration: boolean;

  /** Enable MutationObserver for dynamically added links */
  enableDynamicObserver: boolean;

  /** Enable SPA support (History API interception) */
  enableSPASupport: boolean;

  // ═══════════════════════════════════════════════════════════════
  // PARAMETER CONFIGURATION
  // ═══════════════════════════════════════════════════════════════

  /**
   * Exact parameter names to capture
   * @example ['utm_source', 'utm_medium', 'ref', 'source', 'gclid']
   */
  params: string[];

  /**
   * Parameter prefixes - captures any param starting with these
   * @example ['utm_', 'pk_', 'mtm_'] - captures utm_source, utm_custom, pk_campaign, etc.
   */
  paramPrefixes: string[];

  /**
   * Parameters to explicitly EXCLUDE (takes precedence over params/prefixes)
   * @example ['utm_id', 'secret_token']
   */
  excludeParams: string[];

  // ═══════════════════════════════════════════════════════════════
  // STORAGE CONFIGURATION
  // ═══════════════════════════════════════════════════════════════

  /**
   * Storage backend(s) with fallback support
   * @example 'localStorage'
   * @example 'cookie|localStorage' - try cookie first, fallback to localStorage
   * @example ['cookie', 'localStorage', 'sessionStorage'] - array format
   */
  storage: StorageConfig;

  /** Storage key prefix */
  storagePrefix: string;

  /** TTL for first-touch data in days (0 = never expires) */
  firstTouchTTL: number;

  /** TTL for last-touch data in days (0 = never expires) */
  lastTouchTTL: number;

  /** Cookie domain for cross-subdomain sharing (e.g., '.example.com') */
  cookieDomain: string;

  // ═══════════════════════════════════════════════════════════════
  // LINK DECORATION CONFIGURATION
  // ═══════════════════════════════════════════════════════════════

  /**
   * Allowed domains for link decoration (supports wildcards)
   * Empty array = current domain only
   * @example ['example.com', '*.example.com', 'partner.com']
   */
  allowedDomains: string[];

  /**
   * Patterns to EXCLUDE from decoration (supports wildcards)
   * Checked against full URL
   * @example ['*.exe', '*.pdf', '*.zip', '*logout*', '*unsubscribe*']
   */
  excludePatterns: string[];

  /**
   * CSS selector for links to exclude from decoration
   * @example '.no-track, [data-no-params]'
   */
  excludeSelector: string;

  /**
   * Behavior when link already has a tracked parameter
   * - 'skip': Don't modify (default, safest)
   * - 'fill': Only add value if param exists but is empty (?utm_source=&...)
   * - 'overwrite': Always replace with stored value
   */
  existingParamBehavior: ExistingParamBehavior;

  // ═══════════════════════════════════════════════════════════════
  // URL RESTORATION CONFIGURATION
  // ═══════════════════════════════════════════════════════════════

  /** Only restore params if current URL has none of the tracked params */
  restoreOnlyIfEmpty: boolean;

  // ═══════════════════════════════════════════════════════════════
  // CALLBACKS
  // ═══════════════════════════════════════════════════════════════

  /** Called when params are captured. Receives params and whether it's first touch */
  onCapture?: (params: Record<string, string>, isFirstTouch: boolean) => void;

  /** Called on errors */
  onError?: (error: Error, context: string) => void;
}

/**
 * Public API
 */
export interface ParamzillaAPI {
  /** Initialize with configuration */
  init(config?: Partial<ParamzillaConfig>): void;

  /** Get current config */
  getConfig(): ParamzillaConfig;

  /** Update config at runtime */
  configure(config: Partial<ParamzillaConfig>): void;

  /** Get first-touch params */
  getFirstTouch(): ParamData | null;

  /** Get last-touch params */
  getLastTouch(): ParamData | null;

  /** Get best available params (last-touch preferred, then first-touch) */
  getParams(): Record<string, string>;

  /** Get a specific param value */
  getParam(name: string): string | null;

  /** Manually trigger capture from current URL */
  capture(): Record<string, string> | null;

  /** Manually decorate all links, returns count of decorated links */
  decorateLinks(): number;

  /** Manually restore params to URL */
  restoreUrl(): boolean;

  /** Clear all stored data */
  clear(): void;

  /** Check if initialized and enabled */
  isActive(): boolean;

  /** Cleanup and destroy */
  destroy(): void;
}
