# Paramzilla

URL parameter tracking library for marketing attribution. Captures UTM and custom parameters, stores them in the browser, and automatically decorates links.

## Quick Start

Add the script to your page:

```html
<script src="paramzilla.min.js"></script>
```

That's it. Captures all `utm_*` parameters by default and stores them in localStorage.

## Script Tag Configuration

Configure using data attributes:

```html
<script
  src="paramzilla.min.js"
  data-params="utm_,gclid,fbclid"
  data-storage="localStorage"
  data-merge-params="true"
  data-debug="true"
></script>
```

### Available Attributes

| Attribute | Description | Example |
|-----------|-------------|---------|
| data-params | Parameters to capture (startsWith matching) | "utm_,gclid,fbclid" |
| data-storage | Storage backend | "localStorage" |
| data-merge-params | Enable attribution journey tracking | "true" |
| data-allowed-domains | Domains for link decoration | "example.com,*.example.com" |
| data-exclude-patterns | URL patterns to skip | "*.pdf,*logout*" |
| data-debug | Enable console logging | "true" |

### How params work

All params use `startsWith` matching:

```
data-params="utm_,gclid,fbclid"

utm_    → captures utm_source, utm_medium, utm_campaign, etc.
gclid   → captures gclid
fbclid  → captures fbclid
```

Default is `['utm_']` which captures all UTM parameters.

## JavaScript API

```javascript
// Get all captured parameters
Paramzilla.getParams()
// Returns: { utm_source: "google", utm_medium: "cpc" }

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
  params: ["utm_", "gclid", "fbclid"],
  storage: "localStorage",
  mergeParams: true,
  debug: true
});
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| debug | boolean | false | Log to console |
| params | string[] | ["utm_"] | Parameters to capture (startsWith matching) |
| storage | string | "localStorage" | Storage backend |
| ttl | number | 30 | Data expiry in days |
| mergeParams | boolean | false | Enable attribution journey tracking |
| allowedDomains | string[] | [] | Domains for link decoration (empty = current domain) |
| excludePatterns | string[] | (see below) | URL patterns to skip |
| cookieDomain | string | "" | Cookie domain for cross-subdomain (when using cookies) |
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

### Default Exclude Patterns

Links matching these patterns are not decorated:
- Executables: *.exe, *.msi, *.dmg, *.pkg
- Archives: *.zip, *.rar, *.7z
- Documents: *.pdf
- Protocols: mailto:, tel:, javascript:
- Pages: *logout*, *signout*, *unsubscribe*

### Excluding Links

Add `data-pz-ignore` attribute or `pz-ignore` class to skip decoration:

```html
<a href="/logout" data-pz-ignore>Logout</a>
<a href="/admin" class="pz-ignore">Admin</a>
```

## Storage Options

```javascript
// localStorage only (default, GDPR-friendly)
storage: "localStorage"

// sessionStorage only (clears on browser close)
storage: "sessionStorage"

// Cookie with localStorage fallback
storage: "cookie|localStorage"
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
