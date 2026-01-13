import { ParamzillaConfig, ParamData } from './types';
import { ParamCapture } from './capture';

export class URLRestorer {
  private config: ParamzillaConfig;
  private capture: ParamCapture;

  constructor(config: ParamzillaConfig, capture: ParamCapture) {
    this.config = config;
    this.capture = capture;
  }

  private log(msg: string, ...args: unknown[]): void {
    if (this.config.debug) console.log(`[Paramzilla:Restorer] ${msg}`, ...args);
  }

  /**
   * Restore params to URL from stored data
   * @returns true if URL was modified
   */
  restore(storedData: ParamData | null): boolean {
    if (!this.config.enableUrlRestoration) return false;
    if (!storedData || Object.keys(storedData.params).length === 0) return false;

    // Check if URL already has tracked params
    if (this.config.restoreOnlyIfEmpty && this.capture.hasParams()) {
      this.log('URL already has params, skipping restoration');
      return false;
    }

    try {
      const url = new URL(window.location.href);
      let modified = false;

      Object.entries(storedData.params).forEach(([key, value]) => {
        if (!url.searchParams.has(key)) {
          url.searchParams.set(key, value);
          modified = true;
        }
      });

      if (modified) {
        history.replaceState(history.state, '', url.toString());
        this.log('Restored params to URL:', storedData.params);
        return true;
      }
    } catch (e) {
      this.log('Error restoring URL:', e);
    }

    return false;
  }

  updateConfig(config: ParamzillaConfig): void {
    this.config = config;
  }
}
