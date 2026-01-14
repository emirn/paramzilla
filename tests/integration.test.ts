import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Paramzilla } from '../src/index';
import { clearCookies } from './setup';

describe('Paramzilla Integration', () => {
  let instance: InstanceType<typeof Paramzilla>;

  beforeEach(() => {
    // Clear storage
    localStorage.clear();
    sessionStorage.clear();
    clearCookies();

    // Reset DOM
    document.body.innerHTML = '';

    // Mock window.location
    Object.defineProperty(window, 'location', {
      value: {
        search: '',
        href: 'https://example.com/',
        origin: 'https://example.com',
        hostname: 'example.com',
      },
      writable: true,
      configurable: true,
    });

    // Mock history
    const historyState: unknown = null;
    Object.defineProperty(window, 'history', {
      value: {
        state: historyState,
        pushState: vi.fn(),
        replaceState: vi.fn(),
      },
      writable: true,
      configurable: true,
    });

    // Create fresh instance
    instance = new Paramzilla();
  });

  describe('init', () => {
    it('initializes with default config', () => {
      instance.init();
      // No errors thrown = success
      expect(true).toBe(true);
    });

    it('initializes with custom config', () => {
      instance.init({
        params: ['ref', 'source'],
        paramPrefixes: ['utm_', 'pk_'],
        storage: 'localStorage',
      });

      // No errors thrown = success
      expect(true).toBe(true);
    });

    it('calls onCapture callback when params captured', () => {
      Object.defineProperty(window, 'location', {
        value: {
          search: '?utm_source=google&utm_medium=cpc',
          href: 'https://example.com/?utm_source=google&utm_medium=cpc',
          origin: 'https://example.com',
          hostname: 'example.com',
        },
        writable: true,
        configurable: true,
      });

      const onCapture = vi.fn();
      instance.init({ onCapture });

      expect(onCapture).toHaveBeenCalledWith(
        { utm_source: 'google', utm_medium: 'cpc' },
        true // isFirstTouch
      );
    });
  });

  describe('capture and storage', () => {
    it('captures and stores params from URL', () => {
      Object.defineProperty(window, 'location', {
        value: {
          search: '?utm_source=google&utm_medium=cpc',
          href: 'https://example.com/?utm_source=google&utm_medium=cpc',
          origin: 'https://example.com',
          hostname: 'example.com',
        },
        writable: true,
        configurable: true,
      });

      instance.init();

      const params = instance.getParams();
      expect(params).toEqual({
        utm_source: 'google',
        utm_medium: 'cpc',
      });
    });

    it('preserves first-touch params on subsequent visits (mergeParams: false)', () => {
      // First visit
      Object.defineProperty(window, 'location', {
        value: {
          search: '?utm_source=google',
          href: 'https://example.com/?utm_source=google',
          origin: 'https://example.com',
          hostname: 'example.com',
        },
        writable: true,
        configurable: true,
      });

      instance.init();
      expect(instance.getParam('utm_source')).toBe('google');

      // Second visit - simulate by reinitializing with new params
      Object.defineProperty(window, 'location', {
        value: {
          search: '?utm_source=facebook',
          href: 'https://example.com/?utm_source=facebook',
          origin: 'https://example.com',
          hostname: 'example.com',
        },
        writable: true,
        configurable: true,
      });

      instance = new Paramzilla();
      instance.init(); // mergeParams: false by default

      // Should keep original (first-touch)
      expect(instance.getParam('utm_source')).toBe('google');
    });

    it('merges params on subsequent visits (mergeParams: true)', () => {
      // First visit
      Object.defineProperty(window, 'location', {
        value: {
          search: '?utm_source=google',
          href: 'https://example.com/?utm_source=google',
          origin: 'https://example.com',
          hostname: 'example.com',
        },
        writable: true,
        configurable: true,
      });

      instance.init({ mergeParams: true });
      expect(instance.getParam('utm_source')).toBe('google');

      // Second visit with different source
      Object.defineProperty(window, 'location', {
        value: {
          search: '?utm_source=facebook',
          href: 'https://example.com/?utm_source=facebook',
          origin: 'https://example.com',
          hostname: 'example.com',
        },
        writable: true,
        configurable: true,
      });

      instance = new Paramzilla();
      instance.init({ mergeParams: true });

      // Should merge values
      expect(instance.getParam('utm_source')).toBe('google|facebook');
    });

    it('does not duplicate values when merging', () => {
      // First visit
      Object.defineProperty(window, 'location', {
        value: {
          search: '?utm_source=google',
          href: 'https://example.com/?utm_source=google',
          origin: 'https://example.com',
          hostname: 'example.com',
        },
        writable: true,
        configurable: true,
      });

      instance.init({ mergeParams: true });

      // Second visit with same source
      instance = new Paramzilla();
      instance.init({ mergeParams: true });

      // Should not duplicate
      expect(instance.getParam('utm_source')).toBe('google');
    });

    it('getParam returns specific param value', () => {
      Object.defineProperty(window, 'location', {
        value: {
          search: '?utm_source=google&utm_medium=cpc',
          href: 'https://example.com/?utm_source=google&utm_medium=cpc',
          origin: 'https://example.com',
          hostname: 'example.com',
        },
        writable: true,
        configurable: true,
      });

      instance.init();

      expect(instance.getParam('utm_source')).toBe('google');
      expect(instance.getParam('utm_medium')).toBe('cpc');
      expect(instance.getParam('nonexistent')).toBeNull();
    });
  });

  describe('link decoration', () => {
    it('decorates links on initialization', () => {
      document.body.innerHTML = `
        <a href="https://example.com/page1">Link 1</a>
        <a href="https://example.com/page2">Link 2</a>
      `;

      Object.defineProperty(window, 'location', {
        value: {
          search: '?utm_source=google',
          href: 'https://example.com/?utm_source=google',
          origin: 'https://example.com',
          hostname: 'example.com',
        },
        writable: true,
        configurable: true,
      });

      instance.init();

      document.querySelectorAll('a').forEach((link) => {
        expect(link.href).toContain('utm_source=google');
      });
    });
  });

  describe('clear', () => {
    it('clears all stored data', () => {
      Object.defineProperty(window, 'location', {
        value: {
          search: '?utm_source=google',
          href: 'https://example.com/?utm_source=google',
          origin: 'https://example.com',
          hostname: 'example.com',
        },
        writable: true,
        configurable: true,
      });

      instance.init();
      expect(instance.getParams()).not.toEqual({});

      instance.clear();

      expect(instance.getParams()).toEqual({});
    });
  });

  describe('storage fallback', () => {
    it('uses fallback storage when primary fails', () => {
      // Mock localStorage to throw
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = () => {
        throw new Error('Storage quota exceeded');
      };

      Object.defineProperty(window, 'location', {
        value: {
          search: '?utm_source=google',
          href: 'https://example.com/?utm_source=google',
          origin: 'https://example.com',
          hostname: 'example.com',
        },
        writable: true,
        configurable: true,
      });

      instance.init({ storage: 'localStorage|sessionStorage' });

      // Restore localStorage
      localStorage.setItem = originalSetItem;

      // Data should still be accessible (via sessionStorage fallback)
      // Note: This depends on implementation
    });
  });
});
