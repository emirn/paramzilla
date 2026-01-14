# Paramzilla

URL parameter tracking library for marketing attribution. Captures UTM and custom parameters, stores them in the browser, and automatically decorates links.

## Quick Start

Add the script to your page:

```html
<script
  src="paramzilla.min.js"
  data-auto-init
></script>
```

This captures all `utm_*` parameters by default and stores them in localStorage.

## Script Tag Configuration

Configure using data attributes:

```html
<script
  src="paramzilla.min.js"
  data-auto-init
  data-params="ref,gclid,fbclid"
  data-prefixes="utm_,pk_"
  data-storage="localStorage"
  data-debug="true"
></script>
```

### Available Attributes

| Attribute | Description | Example |
|-----------|-------------|---------|
| data-auto-init | Enable automatic initialization | (no value needed) |
| data-params | Exact parameter names to capture | "ref,gclid,fbclid" |
| data-prefixes | Parameter prefixes to capture | "utm_,pk_" |
| data-storage | Storage backend | "localStorage" |
| data-allowed-domains | Domains for link decoration | "example.com,*.example.com" |
| data-exclude-patterns | URL patterns to skip | "*.pdf,*logout*" |
| data-debug | Enable console logging | "true" |

### params vs prefixes

- `data-params="ref,gclid"` captures exact matches: `ref` and `gclid`
- `data-prefixes="utm_"` captures any parameter starting with `utm_`: `utm_source`, `utm_medium`, `utm_campaign`, etc.

Use both together when needed.

## JavaScript API

```javascript
// Get all captured parameters
Paramzilla.getParams()
// Returns: { utm_source: "google", utm_medium: "cpc" }

// Get a specific parameter
Paramzilla.getParam("utm_source")
// Returns: "google" or null

// Get first-touch data (first visit)
Paramzilla.getFirstTouch()
// Returns: { params: {...}, timestamp: 1234567890 }

// Get last-touch data (most recent visit)
Paramzilla.getLastTouch()
// Returns: { params: {...}, timestamp: 1234567890 }

// Clear all stored data
Paramzilla.clear()

// Check if active
Paramzilla.isActive()
// Returns: true or false
```

## Manual Initialization

```javascript
Paramzilla.init({
  params: ["ref", "gclid"],
  paramPrefixes: ["utm_"],
  storage: "localStorage",
  debug: true
});
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| debug | boolean | false | Log to console |
| params | string[] | [] | Exact parameter names to capture |
| paramPrefixes | string[] | ["utm_"] | Parameter prefixes to capture |
| excludeParams | string[] | [] | Parameters to ignore |
| storage | string | "localStorage" | Storage backend |
| ttl | number | 30 | Data expiry in days |
| allowedDomains | string[] | [] | Domains for link decoration (empty = current domain) |
| excludePatterns | string[] | (see below) | URL patterns to skip |
| cookieDomain | string | "" | Cookie domain for cross-subdomain (when using cookies) |

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
