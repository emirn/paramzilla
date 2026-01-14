import { ParamzillaConfig } from './types';

export const DEFAULT_CONFIG: ParamzillaConfig = {
  debug: false,

  // Parameters - captures all utm_* by default (startsWith matching)
  params: ['utm_'],

  // Storage - localStorage only (GDPR-compliant)
  storage: 'localStorage',
  ttl: 30, // 30 days
  cookieDomain: '',

  // Link decoration
  allowedDomains: [], // Current domain only
  excludePatterns: [
    '*.exe',
    '*.msi',
    '*.dmg',
    '*.pkg',
    '*.zip',
    '*.rar',
    '*.7z',
    '*.tar*',
    '*.pdf',
    'mailto:*',
    'tel:*',
    'javascript:*',
    '*logout*',
    '*signout*',
    '*unsubscribe*',
  ],

  // Attribution - pure first-touch by default
  mergeParams: false,

  onCapture: undefined,
};

// Hardcoded constants (no longer configurable)
export const STORAGE_PREFIX = 'pz_';
export const EXCLUDE_SELECTOR = '[data-pz-ignore], .pz-ignore';
