import { ParamzillaConfig, ParamzillaAPI, ParamData } from './types';
import { DEFAULT_CONFIG } from './config';
import { Storage } from './storage';
import { ParamCapture } from './capture';
import { LinkDecorator } from './decorator';
import { DynamicObserver } from './observer';
import { URLRestorer } from './restorer';

const STORAGE_KEYS = {
  FIRST: 'first',
  LAST: 'last',
};

class Paramzilla implements ParamzillaAPI {
  private config: ParamzillaConfig = { ...DEFAULT_CONFIG };
  private storage: Storage | null = null;
  private paramCapture: ParamCapture | null = null;
  private decorator: LinkDecorator | null = null;
  private observer: DynamicObserver | null = null;
  private restorer: URLRestorer | null = null;
  private initialized = false;

  private log(msg: string, ...args: unknown[]): void {
    if (this.config.debug) console.log(`[Paramzilla] ${msg}`, ...args);
  }

  private handleError(error: Error, context: string): void {
    this.log(`Error in ${context}:`, error);
    this.config.onError?.(error, context);
  }

  init(userConfig?: Partial<ParamzillaConfig>): void {
    try {
      this.config = { ...DEFAULT_CONFIG, ...userConfig };
      this.log('Initializing with config:', this.config);

      if (!this.config.enabled) {
        this.log('Disabled by config');
        return;
      }

      // Initialize components
      this.storage = new Storage(
        this.config.storage,
        this.config.storagePrefix,
        this.config.cookieDomain,
        this.config.debug
      );
      this.paramCapture = new ParamCapture(this.config);
      this.decorator = new LinkDecorator(this.config);
      this.restorer = new URLRestorer(this.config, this.paramCapture);
      this.observer = new DynamicObserver(this.config, this.decorator, () => this.getParams());

      // Process current page
      this.processPage();

      // Start dynamic observation
      this.observer.start();

      this.initialized = true;
      this.log('Initialized');
    } catch (e) {
      this.handleError(e as Error, 'init');
    }
  }

  private processPage(): void {
    // 1. Try to capture from URL
    const captured = this.captureInternal();

    // 2. If no params captured, try to restore from storage
    if (!captured && this.storage) {
      const stored = this.storage.get(STORAGE_KEYS.LAST) || this.storage.get(STORAGE_KEYS.FIRST);
      this.restorer?.restore(stored);
    }

    // 3. Decorate links
    this.decorator?.decorateAll(this.getParams());
  }

  private captureInternal(): ParamData | null {
    if (!this.paramCapture || !this.storage) return null;

    const data = this.paramCapture.capture();
    if (!data) return null;

    let isFirstTouch = false;

    // Store first touch (only if not exists)
    if (this.config.enableFirstTouch) {
      const existing = this.storage.get(STORAGE_KEYS.FIRST);
      if (!existing) {
        this.storage.set(STORAGE_KEYS.FIRST, data, this.config.firstTouchTTL);
        isFirstTouch = true;
      }
    }

    // Store last touch (always update)
    if (this.config.enableLastTouch) {
      this.storage.set(STORAGE_KEYS.LAST, data, this.config.lastTouchTTL);
    }

    // Call onCapture callback
    this.config.onCapture?.(data.params, isFirstTouch);

    return data;
  }

  // ═══════════════════════════════════════════════════════════════
  // PUBLIC API
  // ═══════════════════════════════════════════════════════════════

  getConfig(): ParamzillaConfig {
    return { ...this.config };
  }

  configure(config: Partial<ParamzillaConfig>): void {
    this.config = { ...this.config, ...config };
    this.paramCapture?.updateConfig(this.config);
    this.decorator?.updateConfig(this.config);
    this.restorer?.updateConfig(this.config);
    this.observer?.updateConfig(this.config);
    this.log('Config updated');
  }

  getFirstTouch(): ParamData | null {
    return this.storage?.get(STORAGE_KEYS.FIRST) ?? null;
  }

  getLastTouch(): ParamData | null {
    return this.storage?.get(STORAGE_KEYS.LAST) ?? null;
  }

  getParams(): Record<string, string> {
    const last = this.getLastTouch();
    if (last) return last.params;

    const first = this.getFirstTouch();
    if (first) return first.params;

    return {};
  }

  getParam(name: string): string | null {
    return this.getParams()[name] ?? null;
  }

  capture(): Record<string, string> | null {
    const data = this.captureInternal();
    return data?.params ?? null;
  }

  decorateLinks(): number {
    return this.decorator?.decorateAll(this.getParams()) ?? 0;
  }

  restoreUrl(): boolean {
    const stored = this.getLastTouch() || this.getFirstTouch();
    return this.restorer?.restore(stored) ?? false;
  }

  clear(): void {
    this.storage?.clearAll();
    this.decorator?.reset();
    this.log('Cleared all data');
  }

  isActive(): boolean {
    return this.config.enabled && this.initialized;
  }

  destroy(): void {
    this.observer?.stop();
    this.initialized = false;
    this.log('Destroyed');
  }
}

// Singleton instance
const paramzilla = new Paramzilla();

// Auto-init from script tag attributes
if (typeof document !== 'undefined') {
  const autoInit = () => {
    const script = document.currentScript as HTMLScriptElement | null;
    if (script?.hasAttribute('data-auto-init')) {
      let config: Partial<ParamzillaConfig> = {};

      // 1. Parse JSON config first (lowest priority)
      const configAttr = script.getAttribute('data-config');
      if (configAttr) {
        try {
          config = JSON.parse(configAttr);
        } catch {
          // Ignore parse errors
        }
      }

      // 2. Parse individual data-* attributes (override JSON config)

      // Boolean: debug
      if (script.dataset.debug === 'true') {
        config.debug = true;
      }

      // String: storage
      if (script.dataset.storage) {
        config.storage = script.dataset.storage;
      }

      // Array: params (comma-separated exact param names)
      if (script.dataset.params) {
        config.params = script.dataset.params
          .split(',')
          .map((s) => s.trim())
          .filter((s) => s.length > 0);
      }

      // Array: prefixes (comma-separated param prefixes)
      if (script.dataset.prefixes) {
        config.paramPrefixes = script.dataset.prefixes
          .split(',')
          .map((s) => s.trim())
          .filter((s) => s.length > 0);
      }

      // Array: allowed-domains (comma-separated domains)
      if (script.dataset.allowedDomains) {
        config.allowedDomains = script.dataset.allowedDomains
          .split(',')
          .map((s) => s.trim())
          .filter((s) => s.length > 0);
      }

      // Array: exclude-patterns (comma-separated URL patterns)
      if (script.dataset.excludePatterns) {
        config.excludePatterns = script.dataset.excludePatterns
          .split(',')
          .map((s) => s.trim())
          .filter((s) => s.length > 0);
      }

      paramzilla.init(config);
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoInit);
  } else {
    autoInit();
  }
}

// Expose globally
if (typeof window !== 'undefined') {
  (window as unknown as { Paramzilla: Paramzilla }).Paramzilla = paramzilla;
}

export default paramzilla;
export { Paramzilla, ParamzillaConfig, ParamzillaAPI, ParamData };
