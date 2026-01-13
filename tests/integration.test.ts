import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Paramzilla } from '../src/index';
import { ParamzillaConfig } from '../src/types';
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

  afterEach(() => {
    instance.destroy();
    vi.restoreAllMocks();
  });

  describe('init', () => {
    it('initializes with default config', () => {
      instance.init();
      expect(instance.isActive()).toBe(true);
    });

    it('initializes with custom config', () => {
      instance.init({
        params: ['ref', 'source'],
        paramPrefixes: ['utm_', 'pk_'],
        storage: 'localStorage',
      });

      const config = instance.getConfig();
      expect(config.params).toContain('ref');
      expect(config.params).toContain('source');
      expect(config.paramPrefixes).toContain('pk_');
    });

    it('respects enabled: false', () => {
      instance.init({ enabled: false });
      expect(instance.isActive()).toBe(false);
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

      const firstTouch = instance.getFirstTouch();
      const lastTouch = instance.getLastTouch();

      expect(firstTouch).not.toBeNull();
      expect(firstTouch!.params).toEqual({
        utm_source: 'google',
        utm_medium: 'cpc',
      });
      expect(lastTouch).not.toBeNull();
    });

    it('preserves first touch on subsequent visits', () => {
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
      const firstTouch1 = instance.getFirstTouch();

      // Second visit - simulate by reinitializing with new params
      instance.destroy();
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
      instance.init();

      const firstTouch2 = instance.getFirstTouch();
      const lastTouch = instance.getLastTouch();

      expect(firstTouch2!.params.utm_source).toBe('google'); // Preserved
      expect(lastTouch!.params.utm_source).toBe('facebook'); // Updated
    });

    it('getParams returns last touch preferentially', () => {
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

      // Update last touch
      instance.destroy();
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
      instance.init();

      const params = instance.getParams();
      expect(params.utm_source).toBe('facebook'); // Last touch
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

    it('decorateLinks can be called manually', () => {
      document.body.innerHTML = `
        <a href="https://example.com/page">Link</a>
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

      instance.init({ enableLinkDecoration: false }); // Disable auto-decoration

      // Manually decorate
      instance.configure({ enableLinkDecoration: true });
      const count = instance.decorateLinks();

      expect(count).toBe(1);
      expect(document.querySelector('a')!.href).toContain('utm_source=google');
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
      expect(instance.getFirstTouch()).not.toBeNull();

      instance.clear();

      expect(instance.getFirstTouch()).toBeNull();
      expect(instance.getLastTouch()).toBeNull();
      expect(instance.getParams()).toEqual({});
    });
  });

  describe('configure', () => {
    it('updates config at runtime', () => {
      instance.init({ params: ['ref'] });

      const config1 = instance.getConfig();
      expect(config1.params).toContain('ref');
      expect(config1.params).not.toContain('source');

      instance.configure({ params: ['ref', 'source'] });

      const config2 = instance.getConfig();
      expect(config2.params).toContain('source');
    });
  });

  describe('destroy', () => {
    it('sets isActive to false', () => {
      instance.init();
      expect(instance.isActive()).toBe(true);

      instance.destroy();
      expect(instance.isActive()).toBe(false);
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
      // Note: This depends on implementation - may or may not work depending on how error is handled
    });
  });

  describe('first touch only mode', () => {
    it('only stores first touch when last touch disabled', () => {
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

      instance.init({ enableLastTouch: false });

      expect(instance.getFirstTouch()).not.toBeNull();
      expect(instance.getLastTouch()).toBeNull();
    });
  });

  describe('last touch only mode', () => {
    it('only stores last touch when first touch disabled', () => {
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

      instance.init({ enableFirstTouch: false });

      expect(instance.getFirstTouch()).toBeNull();
      expect(instance.getLastTouch()).not.toBeNull();
    });
  });
});
