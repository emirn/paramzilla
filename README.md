# Paramzilla

URL parameter tracking library for marketing attribution. Captures UTM and custom parameters, stores them in the browser, and automatically decorates links.

## Quick Start

Add the script to your page - no configuration needed:

```html
<script src="paramzilla.min.js"></script>
```

**That's it.** This automatically:
- Captures UTM, Google Ads (gclid), Facebook (fbclid), Bing (msclkid), and ref params
- Decorates links to your domain and all subdomains
- Uses localStorage (GDPR-compliant, no cookies)

## Zero-Config Defaults

Out of the box, Paramzilla captures these tracking parameters:

| Pattern | Captures |
|---------|----------|
| `utm_` | utm_source, utm_medium, utm_campaign, utm_term, utm_content |
| `gclid` | Google Ads click ID |
| `fbclid` | Facebook click ID |
| `msclkid` | Microsoft/Bing Ads click ID |
| `ref` | Common referral parameter |

Links to your root domain and all subdomains are automatically decorated. For example, on `app.example.com`:
- `example.com` ✓
- `app.example.com` ✓
- `other.example.com` ✓
- `different.com` ✗

## Script Tag Configuration

Override defaults with data attributes:

```html
<script
  src="paramzilla.min.js"
  data-params="utm_,custom_"
  data-storage="localStorage"
  data-merge-params="true"
  data-debug="true"
></script>
```

### Available Attributes

| Attribute | Description | Default |
|-----------|-------------|---------|
| data-params | Parameters to capture (startsWith matching) | "utm_,gclid,fbclid,msclkid,ref" |
| data-storage | Storage backend | "localStorage" |
| data-merge-params | Enable attribution journey tracking | "false" |
| data-allowed-domains | Override auto-detected domains | (auto-detect) |
| data-exclude-patterns | URL patterns to skip | (see below) |
| data-debug | Enable console logging | "false" |

## JavaScript API

```javascript
// Get all captured parameters
Paramzilla.getParams()
// Returns: { utm_source: "google", utm_medium: "cpc", gclid: "abc123" }

// Get a specific parameter
Paramzilla.getParam("utm_source")
// Returns: "google" or null

// Clear all stored data
Paramzilla.clear()
```

## Manual Initialization

```javascript
import Paramzilla from 'paramzilla';

Paramzilla.init({
  params: ["utm_", "gclid", "fbclid", "custom_"],
  storage: "localStorage",
  mergeParams: true,
  debug: true
});
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| debug | boolean | false | Log to console |
| params | string[] | ["utm_", "gclid", "fbclid", "msclkid", "ref"] | Parameters to capture (startsWith matching) |
| storage | string | "localStorage" | Storage backend (no cookies by default) |
| ttl | number | 30 | Data expiry in days |
| mergeParams | boolean | false | Enable attribution journey tracking |
| allowedDomains | string[] | [] | Domains for link decoration (empty = auto-detect) |
| excludePatterns | string[] | (see below) | URL patterns to skip |
| onCapture | function | undefined | Callback when params are captured |

## Attribution Modes

### First-Touch (default)

With `mergeParams: false` (default), Paramzilla uses pure first-touch attribution:

```
Visit 1: ?utm_source=google    → stored: "google"
Visit 2: ?utm_source=facebook  → stored: "google" (unchanged)
Visit 3: ?utm_source=medium    → stored: "google" (unchanged)
```

The original attribution is preserved forever.

### Attribution Journey

With `mergeParams: true`, Paramzilla tracks the full attribution journey:

```
Visit 1: ?utm_source=google    → stored: "google"
Visit 2: ?utm_source=facebook  → stored: "google|facebook"
Visit 3: ?utm_source=medium    → stored: "google|facebook|medium"
Visit 4: ?utm_source=medium    → stored: "google|facebook|medium" (no duplicates)
```

Values are unique and maintain their original order.

## Link Decoration

Links are automatically decorated with stored params. The decorator:
- Preserves existing query parameters (only adds missing ones)
- Preserves hash fragments (`#section`)
- Never overwrites existing param values

### Default Exclude Patterns

Links matching these patterns are NOT decorated:
- Executables: *.exe, *.msi, *.dmg, *.pkg
- Archives: *.zip, *.rar, *.7z
- Documents: *.pdf
- Protocols: mailto:, tel:, javascript:
- Pages: *logout*, *signout*, *unsubscribe*

### Excluding Specific Links

Add `data-pz-ignore` attribute or `pz-ignore` class:

```html
<a href="/logout" data-pz-ignore>Logout</a>
<a href="/admin" class="pz-ignore">Admin</a>
```

## Storage Options

**Default: localStorage (GDPR-compliant, no cookies)**

```javascript
// localStorage only (default - no cookies, GDPR-compliant)
storage: "localStorage"

// sessionStorage only (clears on browser close)
storage: "sessionStorage"
```

**Opt-in cookie storage:**

Cookies are only used when explicitly enabled:

```javascript
// Cookie with localStorage fallback
storage: "cookie|localStorage"

// Cross-subdomain cookies: set allowedDomains, first domain becomes cookie domain
allowedDomains: [".example.com", "partner.com"]
// → cookies will be set with domain=.example.com
```

## Callbacks

```javascript
Paramzilla.init({
  onCapture: function(params, isFirstTouch) {
    console.log("Captured:", params);
    console.log("First touch:", isFirstTouch);
  }
});
```

## Build

```bash
npm install
npm run build
```

Output files in `dist/`:
- paramzilla.js (UMD)
- paramzilla.min.js (minified)
- paramzilla.esm.js (ES module)
- paramzilla.d.ts (TypeScript types)

## License

MIT
