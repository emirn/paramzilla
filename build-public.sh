#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Paramzilla Public Build${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Step 1: Run npm build
echo -e "${YELLOW}[1/5] Building project...${NC}"
npm run build
echo -e "${GREEN}      Build complete!${NC}"
echo ""

# Step 2: Create public directory
echo -e "${YELLOW}[2/5] Creating public directory...${NC}"
rm -rf public
mkdir -p public
echo -e "${GREEN}      Directory created!${NC}"
echo ""

# Step 3: Copy minified bundle
echo -e "${YELLOW}[3/5] Copying paramzilla.min.js...${NC}"
cp dist/paramzilla.min.js public/
echo -e "${GREEN}      Copied!${NC}"
echo ""

# Step 4: Create standalone version (strip sourcemap comment)
echo -e "${YELLOW}[4/5] Creating paramzilla.standalone.js...${NC}"
sed '/^\/\/# sourceMappingURL=/d' dist/paramzilla.min.js > public/paramzilla.standalone.js
echo -e "${GREEN}      Created!${NC}"
echo ""

# Step 5: Create example.html
echo -e "${YELLOW}[5/5] Generating example.html...${NC}"
cat > public/example.html << 'HTMLEOF'
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Paramzilla - GDPR-Compliant Example</title>
  <style>
    * { box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
      max-width: 900px;
      margin: 0 auto;
      padding: 2rem;
      background: #f5f5f5;
      color: #333;
    }
    h1 { color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 0.5rem; }
    h2 { color: #1e40af; margin-top: 2rem; }
    .card {
      background: white;
      border-radius: 8px;
      padding: 1.5rem;
      margin: 1rem 0;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    pre {
      background: #1e293b;
      color: #e2e8f0;
      padding: 1rem;
      border-radius: 6px;
      overflow-x: auto;
      font-size: 0.875rem;
      line-height: 1.5;
    }
    code { font-family: 'SF Mono', Monaco, 'Courier New', monospace; }
    .inline-code {
      background: #e2e8f0;
      color: #1e293b;
      padding: 0.125rem 0.375rem;
      border-radius: 4px;
      font-size: 0.875em;
    }
    .badge {
      display: inline-block;
      background: #10b981;
      color: white;
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
    }
    .output {
      background: #fef3c7;
      border: 1px solid #f59e0b;
      border-radius: 6px;
      padding: 1rem;
      margin: 1rem 0;
      font-family: monospace;
      font-size: 0.875rem;
      white-space: pre-wrap;
      word-break: break-all;
    }
    .output-label { font-weight: bold; color: #92400e; margin-bottom: 0.5rem; }
    a { color: #2563eb; }
    .test-links { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 1rem; }
    .test-links a {
      background: #2563eb;
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 6px;
      text-decoration: none;
      font-size: 0.875rem;
    }
    .test-links a:hover { background: #1d4ed8; }
    button {
      background: #2563eb;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.875rem;
      margin-right: 0.5rem;
      margin-bottom: 0.5rem;
    }
    button:hover { background: #1d4ed8; }
    .note {
      background: #dbeafe;
      border-left: 4px solid #2563eb;
      padding: 1rem;
      margin: 1rem 0;
      font-size: 0.875rem;
    }
    table { width: 100%; border-collapse: collapse; }
    th, td { text-align: left; padding: 0.5rem; border-bottom: 1px solid #e5e7eb; }
    th { font-weight: 600; }
  </style>
</head>
<body>

  <h1>Paramzilla <span class="badge">GDPR-Compliant</span></h1>

  <p>
    A lightweight URL parameter tracking library. This build uses <strong>localStorage only</strong>
    (no cookies) making it GDPR-compliant by default without requiring consent banners.
  </p>

  <h2>Quick Start</h2>

  <div class="card">
    <h3>Basic Usage (Auto-Init)</h3>
    <pre><code>&lt;script
  src="paramzilla.min.js"
  data-auto-init
  data-prefixes="utm_,pk_"
&gt;&lt;/script&gt;</code></pre>
    <p>That's it! Paramzilla will automatically capture UTM and Piwik parameters.</p>
  </div>

  <div class="card">
    <h3>Advanced Configuration</h3>
    <pre><code>&lt;script
  src="paramzilla.min.js"
  data-auto-init
  data-debug="true"
  data-params="ref,source,campaign_id"
  data-prefixes="utm_,pk_,mtm_"
  data-allowed-domains="example.com,*.example.com"
  data-exclude-patterns="*.pdf,*logout*,*admin*"
&gt;&lt;/script&gt;</code></pre>
  </div>

  <div class="card">
    <h3>JSON Configuration</h3>
    <pre><code>&lt;script
  src="paramzilla.min.js"
  data-auto-init
  data-config='{"params":["ref","gclid"],"paramPrefixes":["utm_"],"debug":true}'
&gt;&lt;/script&gt;</code></pre>
    <div class="note">
      <strong>Note:</strong> Individual <code class="inline-code">data-*</code> attributes
      override values from <code class="inline-code">data-config</code> JSON.
    </div>
  </div>

  <h2>Configuration Options</h2>

  <div class="card">
    <table>
      <tr>
        <th>Attribute</th>
        <th>Description</th>
        <th>Example</th>
      </tr>
      <tr>
        <td><code class="inline-code">data-params</code></td>
        <td>Exact parameter names to capture</td>
        <td><code class="inline-code">"ref,gclid,fbclid"</code></td>
      </tr>
      <tr>
        <td><code class="inline-code">data-prefixes</code></td>
        <td>Parameter prefixes (captures all matching)</td>
        <td><code class="inline-code">"utm_,pk_"</code></td>
      </tr>
      <tr>
        <td><code class="inline-code">data-allowed-domains</code></td>
        <td>Domains for link decoration</td>
        <td><code class="inline-code">"*.example.com"</code></td>
      </tr>
      <tr>
        <td><code class="inline-code">data-exclude-patterns</code></td>
        <td>URL patterns to exclude</td>
        <td><code class="inline-code">"*.pdf,*logout*"</code></td>
      </tr>
      <tr>
        <td><code class="inline-code">data-storage</code></td>
        <td>Storage backend</td>
        <td><code class="inline-code">"localStorage"</code></td>
      </tr>
      <tr>
        <td><code class="inline-code">data-debug</code></td>
        <td>Enable console logging</td>
        <td><code class="inline-code">"true"</code></td>
      </tr>
    </table>
  </div>

  <h2>JavaScript API</h2>

  <div class="card">
    <pre><code>// Access the global Paramzilla instance
const pz = window.Paramzilla;

// Get all captured parameters
const params = pz.getParams();
// Returns: { utm_source: 'google', utm_medium: 'cpc', ... }

// Get a specific parameter
const source = pz.getParam('utm_source');

// Get first-touch attribution data
const firstTouch = pz.getFirstTouch();
// Returns: { params: {...}, timestamp: 1234567890 }

// Get last-touch attribution data
const lastTouch = pz.getLastTouch();

// Check if Paramzilla is active
const isActive = pz.isActive();

// Manually trigger link decoration
pz.decorateLinks();

// Clear all stored data
pz.clear();</code></pre>
  </div>

  <h2>Live Demo</h2>

  <div class="card">
    <h3>Current State</h3>
    <div class="output">
      <div class="output-label">Captured Parameters:</div>
      <div id="params-output">Loading...</div>
    </div>
    <div class="output">
      <div class="output-label">First Touch:</div>
      <div id="first-touch-output">Loading...</div>
    </div>
    <div class="output">
      <div class="output-label">Last Touch:</div>
      <div id="last-touch-output">Loading...</div>
    </div>

    <h4>Actions</h4>
    <button onclick="refreshOutput()">Refresh Display</button>
    <button onclick="window.Paramzilla.clear(); refreshOutput();">Clear Data</button>
    <button onclick="window.Paramzilla.decorateLinks()">Decorate Links</button>

    <h4>Test Links (will be decorated with your params)</h4>
    <div class="test-links">
      <a href="?utm_source=test&utm_medium=demo&utm_campaign=example">Add Test Params</a>
      <a href="/internal-page">Internal Link</a>
      <a href="#section">Hash Link</a>
    </div>
  </div>

  <h2>GDPR Compliance</h2>

  <div class="card">
    <p>This build is <strong>GDPR-compliant by default</strong> because:</p>
    <ul>
      <li>Uses <strong>localStorage only</strong> - not covered by cookie consent requirements</li>
      <li>No automatic cookie fallback</li>
      <li>No third-party data sharing</li>
      <li>All data stays in the user's browser</li>
    </ul>
    <div class="note">
      If you need cross-subdomain tracking (cookies), you can enable it with
      <code class="inline-code">data-storage="localStorage|cookie"</code>, but you'll
      need to implement proper consent mechanisms.
    </div>
  </div>

  <!-- Paramzilla Script - loaded with demo config -->
  <script
    src="paramzilla.standalone.js"
    data-auto-init
    data-debug="true"
    data-params="ref,gclid,fbclid"
    data-prefixes="utm_,pk_,mtm_"
  ></script>

  <script>
    function refreshOutput() {
      var pz = window.Paramzilla;

      // Display params
      var params = pz.getParams();
      document.getElementById('params-output').textContent =
        Object.keys(params).length > 0
          ? JSON.stringify(params, null, 2)
          : '(no parameters captured)';

      // Display first touch
      var firstTouch = pz.getFirstTouch();
      document.getElementById('first-touch-output').textContent =
        firstTouch
          ? JSON.stringify(firstTouch, null, 2)
          : '(no first touch data)';

      // Display last touch
      var lastTouch = pz.getLastTouch();
      document.getElementById('last-touch-output').textContent =
        lastTouch
          ? JSON.stringify(lastTouch, null, 2)
          : '(no last touch data)';
    }

    // Refresh on page load
    document.addEventListener('DOMContentLoaded', function() {
      setTimeout(refreshOutput, 100);
    });
  </script>

</body>
</html>
HTMLEOF
echo -e "${GREEN}      Generated!${NC}"
echo ""

# Calculate and display file sizes
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Build Summary${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

echo -e "${YELLOW}Files in public/:${NC}"
ls -la public/
echo ""

echo -e "${YELLOW}File Sizes:${NC}"

# paramzilla.min.js
MIN_SIZE=$(wc -c < public/paramzilla.min.js | tr -d ' ')
MIN_GZIP=$(gzip -c public/paramzilla.min.js | wc -c | tr -d ' ')
echo -e "  paramzilla.min.js:        ${GREEN}${MIN_SIZE} bytes${NC} (${MIN_GZIP} bytes gzipped)"

# paramzilla.standalone.js
STANDALONE_SIZE=$(wc -c < public/paramzilla.standalone.js | tr -d ' ')
STANDALONE_GZIP=$(gzip -c public/paramzilla.standalone.js | wc -c | tr -d ' ')
echo -e "  paramzilla.standalone.js: ${GREEN}${STANDALONE_SIZE} bytes${NC} (${STANDALONE_GZIP} bytes gzipped)"

# example.html
EXAMPLE_SIZE=$(wc -c < public/example.html | tr -d ' ')
echo -e "  example.html:             ${GREEN}${EXAMPLE_SIZE} bytes${NC}"

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Build complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "To test locally:"
echo -e "  ${BLUE}cd public && python3 -m http.server 8080${NC}"
echo -e "  ${BLUE}open http://localhost:8080/example.html?utm_source=test&utm_medium=demo${NC}"
echo ""
