import { ParamzillaConfig, ParamData } from './types';
import { getQueryParams } from './utils';

export class ParamCapture {
  private config: ParamzillaConfig;

  constructor(config: ParamzillaConfig) {
    this.config = config;
  }

  private log(msg: string, ...args: unknown[]): void {
    if (this.config.debug) console.log(`[Paramzilla:Capture] ${msg}`, ...args);
  }

  /**
   * Check if a param name should be captured
   */
  shouldCapture(name: string): boolean {
    // Check exclusions first
    if (this.config.excludeParams.includes(name)) {
      return false;
    }

    // Check exact match
    if (this.config.params.includes(name)) {
      return true;
    }

    // Check prefixes
    return this.config.paramPrefixes.some((prefix) => name.startsWith(prefix));
  }

  /**
   * Capture params from current URL
   */
  capture(): ParamData | null {
    const allParams = getQueryParams(window.location.search);
    const captured: Record<string, string> = {};

    Object.entries(allParams).forEach(([key, value]) => {
      // Only capture non-empty values
      if (value && this.shouldCapture(key)) {
        captured[key] = value;
      }
    });

    if (Object.keys(captured).length === 0) {
      this.log('No matching params in URL');
      return null;
    }

    const data: ParamData = {
      params: captured,
      timestamp: Date.now(),
    };

    this.log('Captured:', captured);
    return data;
  }

  /**
   * Check if current URL has any capturable params
   */
  hasParams(): boolean {
    const allParams = getQueryParams(window.location.search);
    return Object.keys(allParams).some((k) => this.shouldCapture(k));
  }

  updateConfig(config: ParamzillaConfig): void {
    this.config = config;
  }
}
