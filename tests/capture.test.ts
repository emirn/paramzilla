import { describe, it, expect, beforeEach } from 'vitest';
import { ParamCapture } from '../src/capture';
import { DEFAULT_CONFIG } from '../src/config';
import { ParamzillaConfig } from '../src/types';

describe('ParamCapture', () => {
  let config: ParamzillaConfig;

  beforeEach(() => {
    config = { ...DEFAULT_CONFIG };
    // Reset window.location
    Object.defineProperty(window, 'location', {
      value: {
        search: '',
        href: 'http://localhost/',
        origin: 'http://localhost',
        hostname: 'localhost',
      },
      writable: true,
    });
  });

  describe('shouldCapture', () => {
    it('captures exact param names', () => {
      config.params = ['ref', 'source'];
      config.paramPrefixes = [];
      const capture = new ParamCapture(config);

      expect(capture.shouldCapture('ref')).toBe(true);
      expect(capture.shouldCapture('source')).toBe(true);
      expect(capture.shouldCapture('other')).toBe(false);
    });

    it('captures params by prefix', () => {
      config.params = [];
      config.paramPrefixes = ['utm_', 'pk_'];
      const capture = new ParamCapture(config);

      expect(capture.shouldCapture('utm_source')).toBe(true);
      expect(capture.shouldCapture('utm_medium')).toBe(true);
      expect(capture.shouldCapture('pk_campaign')).toBe(true);
      expect(capture.shouldCapture('other_param')).toBe(false);
    });

    it('excludes params in excludeParams', () => {
      config.params = ['ref'];
      config.paramPrefixes = ['utm_'];
      config.excludeParams = ['utm_id', 'ref'];
      const capture = new ParamCapture(config);

      expect(capture.shouldCapture('utm_source')).toBe(true);
      expect(capture.shouldCapture('utm_id')).toBe(false);
      expect(capture.shouldCapture('ref')).toBe(false);
    });
  });

  describe('capture', () => {
    it('captures params from URL', () => {
      Object.defineProperty(window, 'location', {
        value: {
          search: '?utm_source=google&utm_medium=cpc&ref=affiliate',
          href: 'http://localhost/?utm_source=google&utm_medium=cpc&ref=affiliate',
          origin: 'http://localhost',
          hostname: 'localhost',
        },
        writable: true,
      });

      config.params = ['ref'];
      config.paramPrefixes = ['utm_'];
      const capture = new ParamCapture(config);

      const result = capture.capture();

      expect(result).not.toBeNull();
      expect(result!.params).toEqual({
        utm_source: 'google',
        utm_medium: 'cpc',
        ref: 'affiliate',
      });
      expect(result!.timestamp).toBeLessThanOrEqual(Date.now());
    });

    it('returns null when no matching params', () => {
      Object.defineProperty(window, 'location', {
        value: {
          search: '?other=value',
          href: 'http://localhost/?other=value',
          origin: 'http://localhost',
          hostname: 'localhost',
        },
        writable: true,
      });

      config.params = [];
      config.paramPrefixes = ['utm_'];
      const capture = new ParamCapture(config);

      expect(capture.capture()).toBeNull();
    });

    it('ignores empty param values', () => {
      Object.defineProperty(window, 'location', {
        value: {
          search: '?utm_source=&utm_medium=cpc',
          href: 'http://localhost/?utm_source=&utm_medium=cpc',
          origin: 'http://localhost',
          hostname: 'localhost',
        },
        writable: true,
      });

      config.paramPrefixes = ['utm_'];
      const capture = new ParamCapture(config);

      const result = capture.capture();

      expect(result).not.toBeNull();
      expect(result!.params).toEqual({
        utm_medium: 'cpc',
      });
      expect(result!.params.utm_source).toBeUndefined();
    });
  });

  describe('hasParams', () => {
    it('returns true when URL has capturable params', () => {
      Object.defineProperty(window, 'location', {
        value: {
          search: '?utm_source=google',
          href: 'http://localhost/?utm_source=google',
          origin: 'http://localhost',
          hostname: 'localhost',
        },
        writable: true,
      });

      config.paramPrefixes = ['utm_'];
      const capture = new ParamCapture(config);

      expect(capture.hasParams()).toBe(true);
    });

    it('returns false when URL has no capturable params', () => {
      Object.defineProperty(window, 'location', {
        value: {
          search: '?other=value',
          href: 'http://localhost/?other=value',
          origin: 'http://localhost',
          hostname: 'localhost',
        },
        writable: true,
      });

      config.paramPrefixes = ['utm_'];
      const capture = new ParamCapture(config);

      expect(capture.hasParams()).toBe(false);
    });
  });
});
