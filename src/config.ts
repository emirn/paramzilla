import { ParamzillaConfig } from './types';

export const DEFAULT_CONFIG: ParamzillaConfig = {
  // Feature toggles - all ON by default
  enabled: true,
  debug: false,
  enableFirstTouch: true,
  enableLastTouch: true,
  enableLinkDecoration: true,
  enableUrlRestoration: true,
  enableDynamicObserver: true,
  enableSPASupport: true,

  // Parameters - empty by default, user MUST configure
  params: [],
  paramPrefixes: ['utm_'], // Common default, captures all utm_* params
  excludeParams: [],

  // Storage - localStorage only (GDPR-compliant, no cookie fallback)
  storage: 'localStorage',
  storagePrefix: 'pz_',
  firstTouchTTL: 365, // 1 year
  lastTouchTTL: 30, // 30 days
  cookieDomain: '', // Current domain only

  // Link decoration
  allowedDomains: [], // Current domain only by default
  excludePatterns: [
    '*.exe',
    '*.msi',
    '*.dmg',
    '*.pkg', // Executables
    '*.zip',
    '*.rar',
    '*.7z',
    '*.tar*', // Archives
    '*.pdf', // Documents (often external)
    'mailto:*',
    'tel:*',
    'javascript:*', // Protocols
    '*logout*',
    '*signout*',
    '*unsubscribe*', // Common exclusions
  ],
  excludeSelector: '[data-pz-ignore], .pz-ignore',
  existingParamBehavior: 'skip',

  // URL restoration
  restoreOnlyIfEmpty: true,

  // Callbacks
  onCapture: undefined,
  onError: undefined,
};
