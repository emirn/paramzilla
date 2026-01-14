/**
 * Storage backends in priority order
 * Examples: 'localStorage', 'cookie|localStorage', 'cookie|localStorage|sessionStorage'
 */
export type StorageType = 'localStorage' | 'sessionStorage' | 'cookie';
export type StorageConfig = StorageType | StorageType[] | string;

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
  /** Enable console debug logging */
  debug: boolean;

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

  /**
   * Storage backend(s) with fallback support
   * @example 'localStorage'
   * @example 'cookie|localStorage' - try cookie first, fallback to localStorage
   */
  storage: StorageConfig;

  /** TTL for stored data in days (0 = never expires) */
  ttl: number;

  /** Cookie domain for cross-subdomain sharing (e.g., '.example.com') */
  cookieDomain: string;

  /**
   * Allowed domains for link decoration (supports wildcards)
   * Empty array = current domain only
   * @example ['example.com', '*.example.com', 'partner.com']
   */
  allowedDomains: string[];

  /**
   * Patterns to EXCLUDE from decoration (supports wildcards)
   * @example ['*.exe', '*.pdf', '*logout*']
   */
  excludePatterns: string[];

  /** Called when params are captured. Receives params and whether it's first touch */
  onCapture?: (params: Record<string, string>, isFirstTouch: boolean) => void;
}

/**
 * Public API
 */
export interface ParamzillaAPI {
  /** Initialize with configuration */
  init(config?: Partial<ParamzillaConfig>): void;

  /** Get current config */
  getConfig(): ParamzillaConfig;

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

  /** Clear all stored data */
  clear(): void;

  /** Check if initialized */
  isActive(): boolean;

  /** Cleanup and destroy */
  destroy(): void;
}
