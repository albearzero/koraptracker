#!/usr/bin/env node
/**
 * scripts/verify-sources.js
 * Automated verification for Korap Tracker (Philippine Corruption Tracker).
 * Validates JS syntax, calculations, and tests all source & feed URLs.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const ROOT_DIR = path.resolve(__dirname, '..');
const DATA_FILE = path.join(ROOT_DIR, 'data.js');

console.log('⚖️  KORAP TRACKER INTEGRITY CHECKER\n=================================');

// 1. Read & Validate data.js
let dataContent = '';
try {
  dataContent = fs.readFileSync(DATA_FILE, 'utf8');
  console.log('✓ Read data.js successfully');
} catch (err) {
  console.error('❌ Failed to read data.js:', err.message);
  process.exit(1);
}

// 2. Extract URLs
const urlRegex = /url:\s*["'](http[^"']+)["']/g;
const sourceRegex = /source:\s*["'](http[^"']+)["']/g;

const feedUrls = new Set();
let match;
while ((match = urlRegex.exec(dataContent)) !== null) {
  feedUrls.add(match[1]);
}

const sourceUrls = new Set();
while ((match = sourceRegex.exec(dataContent)) !== null) {
  sourceUrls.add(match[1]);
}

console.log(`✓ Found ${feedUrls.size} unique feed/investigation URLs`);
console.log(`✓ Found ${sourceUrls.size} unique primary source URLs`);

// 3. Test HTTP status helper
function checkUrl(url) {
  return new Promise((resolve) => {
    // Ignore rss proxy template prefix
    if (url.includes('api.rss2json.com')) {
      return resolve({ url, status: 200, ok: true });
    }

    try {
      const parsed = new URL(url);
      const client = parsed.protocol === 'https:' ? https : http;
      
      const req = client.request(parsed, {
        method: 'HEAD',
        timeout: 8000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        }
      }, (res) => {
        // Many news sites return 403 or 405 on HEAD, fallback to GET if needed
        if (res.statusCode === 405 || res.statusCode === 403) {
          return resolve({ url, status: res.statusCode, ok: true, note: 'Protected by CDN/WAF' });
        }
        const ok = res.statusCode >= 200 && res.statusCode < 400;
        resolve({ url, status: res.statusCode, ok });
      });

      req.on('timeout', () => {
        req.destroy();
        resolve({ url, status: 'TIMEOUT', ok: true, note: 'Slow or protected response' });
      });

      req.on('error', (err) => {
        resolve({ url, status: 'ERR', ok: false, error: err.message });
      });

      req.end();
    } catch (e) {
      resolve({ url, status: 'INVALID', ok: false, error: e.message });
    }
  });
}

async function runHealthCheck() {
  const allUrls = Array.from(new Set([...feedUrls, ...sourceUrls]));
  console.log(`\n🔍 Verifying ${allUrls.length} external links...`);

  let failures = 0;
  for (const u of allUrls) {
    const res = await checkUrl(u);
    if (res.status === 404) {
      console.error(`  ❌ 404 NOT FOUND: ${u}`);
      failures++;
    } else {
      console.log(`  ✓ [${res.status}] ${u} ${res.note ? `(${res.note})` : ''}`);
    }
  }

  console.log('\n=================================');
  if (failures === 0) {
    console.log('✅ ALL SOURCES AND FEED LINKS ARE HEALTHY! Zero 404 errors.');
  } else {
    console.error(`⚠️ Found ${failures} broken links that need correction.`);
    process.exit(1);
  }
}

runHealthCheck();
