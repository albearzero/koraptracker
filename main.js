/**
 * main.js: Korap Tracker (Philippine Corruption Tracker)
 * Features: Live ticker, currency switcher, RSS news feed, impact counters,
 *           case registry filter, scroll animations
 */
'use strict';

/* ═══════════════════════════════════════════════════════════════════════════
   1. CURRENCY STATE & HELPERS
═══════════════════════════════════════════════════════════════════════════ */

let currentCurrency = CURRENCIES[0]; // PHP by default

function convertAmount(php) {
  return php * currentCurrency.rate;
}

function formatCurrency(php, compact = false) {
  const val = convertAmount(php);
  const sym = currentCurrency.symbol;
  const code = currentCurrency.code;

  // JPY and KRW: no decimals
  const noDecimals = ['JPY', 'KRW'].includes(code);

  if (compact) {
    if (val >= 1e12) return `${sym}${(val / 1e12).toFixed(2)}T`;
    if (val >= 1e9)  return `${sym}${(val / 1e9).toFixed(noDecimals ? 0 : 2)}B`;
    if (val >= 1e6)  return `${sym}${(val / 1e6).toFixed(noDecimals ? 0 : 1)}M`;
    if (val >= 1e3)  return `${sym}${(val / 1e3).toFixed(noDecimals ? 0 : 1)}K`;
    return `${sym}${val.toFixed(noDecimals ? 0 : 2)}`;
  }
  return `${sym}${val.toLocaleString('en-PH', { maximumFractionDigits: noDecimals ? 0 : 2 })}`;
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/* ═══════════════════════════════════════════════════════════════════════════
   2. CURRENCY SWITCHER: inject pill UI into navbar area
═══════════════════════════════════════════════════════════════════════════ */

function buildCurrencySwitcher() {
  const style = document.createElement('style');
  style.textContent = `
    .currency-switcher {
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      z-index: 200;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: .5rem;
    }
    .currency-trigger {
      display: flex;
      align-items: center;
      gap: .55rem;
      background: var(--clr-surface-3);
      border: 1px solid var(--clr-border-light);
      border-radius: 100px;
      padding: .6rem 1.1rem;
      cursor: pointer;
      font-size: .85rem;
      font-weight: 700;
      color: var(--clr-text-1);
      font-family: var(--font-sans);
      transition: background var(--dur-fast), border-color var(--dur-fast), box-shadow var(--dur-fast);
      box-shadow: 0 4px 20px rgba(0,0,0,.4);
      white-space: nowrap;
    }
    .currency-trigger:hover {
      background: var(--clr-surface-2);
      border-color: var(--clr-blue);
      box-shadow: 0 4px 20px rgba(59,130,246,.2);
    }
    .currency-trigger-flag { font-size: 1.1rem; }
    .currency-trigger-code { color: var(--clr-cyan); letter-spacing: .06em; }
    .currency-trigger-arrow { color: var(--clr-text-3); font-size: .75rem; transition: transform var(--dur-fast); }
    .currency-trigger.open .currency-trigger-arrow { transform: rotate(180deg); }
    .currency-dropdown {
      background: var(--clr-surface-2);
      border: 1px solid var(--clr-border-light);
      border-radius: 14px;
      overflow: hidden;
      box-shadow: 0 16px 40px rgba(0,0,0,.6);
      max-height: 0;
      overflow: hidden;
      transition: max-height .3s var(--ease-out), opacity .2s;
      opacity: 0;
      pointer-events: none;
      min-width: 200px;
    }
    .currency-dropdown.open {
      max-height: 500px;
      opacity: 1;
      pointer-events: all;
    }
    .currency-option {
      display: flex;
      align-items: center;
      gap: .75rem;
      padding: .7rem 1.1rem;
      cursor: pointer;
      font-size: .85rem;
      transition: background var(--dur-fast);
      border-bottom: 1px solid var(--clr-border);
    }
    .currency-option:last-child { border-bottom: none; }
    .currency-option:hover { background: var(--clr-surface-3); }
    .currency-option.active { background: var(--clr-blue-dim); }
    .currency-option-flag { font-size: 1.1rem; }
    .currency-option-info { display: flex; flex-direction: column; gap: .1rem; }
    .currency-option-code { font-weight: 700; color: var(--clr-text-1); letter-spacing: .04em; }
    .currency-option-name { font-size: .72rem; color: var(--clr-text-3); }
    .currency-rate-note {
      font-size: .62rem;
      color: var(--clr-text-3);
      text-align: center;
      padding: .5rem;
      border-top: 1px solid var(--clr-border);
    }
    @media(max-width:480px){
      .currency-switcher { bottom: 1rem; right: 1rem; }
    }
  `;
  document.head.appendChild(style);

  // Flag emoji map
  const FLAGS = {
    PHP: '🇵🇭', USD: '🇺🇸', EUR: '🇪🇺', GBP: '🇬🇧',
    JPY: '🇯🇵', CNY: '🇨🇳', SGD: '🇸🇬', AUD: '🇦🇺',
    HKD: '🇭🇰', KRW: '🇰🇷',
  };

  const wrapper = document.createElement('div');
  wrapper.className = 'currency-switcher';
  wrapper.innerHTML = `
    <div class="currency-dropdown" id="currency-dropdown">
      ${CURRENCIES.map(c => `
        <div class="currency-option ${c.code === 'PHP' ? 'active' : ''}"
             data-code="${c.code}"
             role="option"
             tabindex="0"
             aria-selected="${c.code === 'PHP'}">
          <span class="currency-option-flag">${FLAGS[c.code] || '🌐'}</span>
          <div class="currency-option-info">
            <span class="currency-option-code">${c.code} ${c.symbol}</span>
            <span class="currency-option-name">${c.name}</span>
          </div>
        </div>
      `).join('')}
      <div class="currency-rate-note">Rates: Oct 1, 2026 (BSP / Xe.com)</div>
    </div>
    <button class="currency-trigger" id="currency-trigger" aria-haspopup="listbox" aria-expanded="false">
      <span class="currency-trigger-flag" id="trigger-flag">🇵🇭</span>
      <span class="currency-trigger-code" id="trigger-code">PHP ₱</span>
      <span class="currency-trigger-arrow">▼</span>
    </button>
  `;
  document.body.appendChild(wrapper);

  const trigger   = document.getElementById('currency-trigger');
  const dropdown  = document.getElementById('currency-dropdown');
  const flagEl    = document.getElementById('trigger-flag');
  const codeEl    = document.getElementById('trigger-code');

  trigger.addEventListener('click', () => {
    const isOpen = dropdown.classList.toggle('open');
    trigger.classList.toggle('open', isOpen);
    trigger.setAttribute('aria-expanded', isOpen);
  });

  // Close on outside click
  document.addEventListener('click', e => {
    if (!wrapper.contains(e.target)) {
      dropdown.classList.remove('open');
      trigger.classList.remove('open');
      trigger.setAttribute('aria-expanded', 'false');
    }
  });

  dropdown.querySelectorAll('.currency-option').forEach(opt => {
    const activate = () => {
      const code = opt.dataset.code;
      currentCurrency = CURRENCIES.find(c => c.code === code);
      flagEl.textContent = FLAGS[code] || '🌐';
      codeEl.textContent = `${code} ${currentCurrency.symbol}`;

      dropdown.querySelectorAll('.currency-option').forEach(o => {
        o.classList.toggle('active', o.dataset.code === code);
        o.setAttribute('aria-selected', o.dataset.code === code);
      });

      dropdown.classList.remove('open');
      trigger.classList.remove('open');
      trigger.setAttribute('aria-expanded', 'false');

      // Refresh all currency-sensitive displays
      updateRates(RATE_PER_SECOND);
      renderCases(activeFilter);
      updateTicker();
      updateCasesTotal();
      renderNewsFeed();
    };
    opt.addEventListener('click', activate);
    opt.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') activate(); });
  });
}

buildCurrencySwitcher();

/* ═══════════════════════════════════════════════════════════════════════════
   3. LIVE CORRUPTION TICKER
═══════════════════════════════════════════════════════════════════════════ */

let tickerMode = 'estimated';

const odometer   = document.getElementById('odometer-display');
const ratePerSec = document.getElementById('rate-per-sec');
const ratePerMin = document.getElementById('rate-per-min');
const ratePerHr  = document.getElementById('rate-per-hour');
const sourceNote = document.getElementById('source-note');

function formatOdometer(phpVal) {
  const val = convertAmount(phpVal);
  const str = Math.floor(val).toLocaleString('en-PH');
  const parts = str.split(',');
  if (parts.length > 1) {
    const last = parts.pop();
    return `${parts.join(',')},<span class="odometer-last">${last}</span>`;
  }
  return str;
}

function updateRates(ratePerSecondPHP) {
  ratePerSec.textContent = formatCurrency(ratePerSecondPHP, true);
  ratePerMin.textContent = formatCurrency(ratePerSecondPHP * 60, true);
  ratePerHr.textContent  = formatCurrency(ratePerSecondPHP * 3600, true);
}

function updateTicker() {
  // Force a re-render of current value
}

function tick() {
  let currentPHP;
  if (tickerMode === 'estimated') {
    const elapsed = (Date.now() - YEAR_START.getTime()) / 1000;
    currentPHP = elapsed * RATE_PER_SECOND;
    updateRates(RATE_PER_SECOND);
  } else {
    currentPHP = CONFIRMED_TOTAL_PHP;
    updateRates(CONFIRMED_TOTAL_PHP / (365 * 24 * 3600 * 40));
  }
  odometer.innerHTML = formatOdometer(currentPHP);
  requestAnimationFrame(tick);
}

function setMode(mode) {
  tickerMode = mode;
  document.querySelectorAll('.mode-btn').forEach(btn =>
    btn.classList.toggle('active', btn.dataset.mode === mode)
  );
  if (mode === 'estimated') {
    sourceNote.innerHTML = `Cumulative loss since Jan 1, 2020: ~₱1.154T/year (~<strong>${formatCurrency(RATE_PER_SECOND, true)}/sec</strong>) × 6.75+ years ≈ <strong>~₱7.8 Trillion</strong>
      · 20% benchmark: UNODC &amp; World Bank ·
      <a href="sources.html" style="color:var(--clr-green);text-decoration:none;font-weight:600">Full Citations ✓</a>`;
  } else {
    sourceNote.innerHTML = `Confirmed documented total: <strong>${formatCurrency(CONFIRMED_TOTAL_PHP, true)}</strong> across ${CORRUPTION_CASES.length} itemized cases.
      Every figure is backed by an official source.`;
  }
}

document.getElementById('btn-estimated').addEventListener('click', () => setMode('estimated'));
document.getElementById('btn-confirmed').addEventListener('click', () => setMode('confirmed'));

// Currency symbol display next to odometer
const currSymbolEl = document.querySelector('.currency-symbol');
(function syncCurrencySymbol() {
  const orig = buildCurrencySwitcher;
  // Update symbol display whenever currency changes: patch via MutationObserver on trigger
  const triggerCodeEl = document.getElementById('trigger-code');
  if (triggerCodeEl) {
    new MutationObserver(() => {
      if (currSymbolEl) currSymbolEl.textContent = currentCurrency.symbol;
      setMode(tickerMode); // refresh source note with new rate
    }).observe(triggerCodeEl, { childList: true, characterData: true, subtree: true });
  }
})();

tick();

/* ═══════════════════════════════════════════════════════════════════════════
   4. IMPACT COUNTER ANIMATION
═══════════════════════════════════════════════════════════════════════════ */

function formatCount(num) {
  if (num >= 1e12) return (num / 1e12).toFixed(1) + 'T';
  if (num >= 1e9)  return (num / 1e9).toFixed(1) + 'B';
  if (num >= 1e6)  return (num / 1e6).toFixed(1) + 'M';
  if (num >= 1e3)  return (num / 1e3).toFixed(0) + 'K';
  return Math.floor(num).toLocaleString('en-PH');
}

function animateCount(el, target, duration = 2200) {
  const start = performance.now();
  function update(now) {
    const p = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    const cur = eased * target;
    el.textContent = formatCount(cur);
    if (p < 1) {
      requestAnimationFrame(update);
    } else {
      el.textContent = formatCount(target);
    }
  }
  requestAnimationFrame(update);
}

/* ═══════════════════════════════════════════════════════════════════════════
   5. SCROLL REVEAL + INTERSECTION OBSERVER
═══════════════════════════════════════════════════════════════════════════ */

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('in-view');
    if (entry.target.classList.contains('impact-card')) {
      const numEl = entry.target.querySelector('.impact-number');
      if (numEl?.dataset.target) {
        const delay = parseInt(entry.target.style.getPropertyValue('--delay')) || 0;
        setTimeout(() => animateCount(numEl, parseInt(numEl.dataset.target, 10)), delay);
      }
    }
    revealObserver.unobserve(entry.target);
  });
}, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

/* ═══════════════════════════════════════════════════════════════════════════
   6. NAVBAR SCROLL
═══════════════════════════════════════════════════════════════════════════ */

window.addEventListener('scroll', () => {
  document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

/* ═══════════════════════════════════════════════════════════════════════════
   7. CASE REGISTRY TABLE
═══════════════════════════════════════════════════════════════════════════ */

const casesGrid    = document.getElementById('cases-tbody');
let activeFilter = 'all';

const STATUS_CONFIG = {
  coa:       { label: 'Flagged by Auditors',  cls: 'status-badge--coa',       icon: '🔍' },
  court:     { label: 'Criminal Case Filed',  cls: 'status-badge--court',     icon: '⚖' },
  senate:    { label: 'Senate Investigation', cls: 'status-badge--senate',    icon: '🏛' },
  recovered: { label: 'Partially Recovered',  cls: 'status-badge--recovered', icon: '✅' },
};

function updateCasesTotal() {
  const filtered = activeFilter === 'all'
    ? CORRUPTION_CASES
    : CORRUPTION_CASES.filter(c => c.category === activeFilter || c.statusType === activeFilter);
  const total = filtered.reduce((s, c) => s + c.amount, 0);
  document.getElementById('cases-total').textContent = formatCurrency(total, true);
}

function renderCases(filter = 'all') {
  activeFilter = filter;
  updateCasesTotal();

  const filtered = filter === 'all'
    ? CORRUPTION_CASES
    : CORRUPTION_CASES.filter(c => c.category === filter || c.statusType === filter);

  // Sort newest first
  const sorted = [...filtered].sort((a, b) => b.year - a.year);

  casesGrid.innerHTML = sorted.map(c => {
    const sc = STATUS_CONFIG[c.statusType] || STATUS_CONFIG.coa;
    const isNew = c.year >= 2025;
    return `
      <div class="case-card">
        <div class="case-card-top">
          <div class="case-card-left">
            ${isNew ? '<span class="new-badge">NEW</span>' : ''}
            <div class="case-card-name">${escHtml(c.name)}</div>
            <div class="case-card-meta">
              <span class="case-card-agency">${escHtml(c.agency)}</span>
              <span class="case-card-year">${c.year}</span>
            </div>
          </div>
          <div class="case-card-right">
            <div class="case-card-amount">${formatCurrency(c.amount, true)}</div>
            <span class="status-badge ${sc.cls}">${sc.icon} ${escHtml(sc.label)}</span>
          </div>
        </div>
        <div class="case-card-source">
          <a href="${escHtml(c.source)}" target="_blank" rel="noopener noreferrer" class="case-source-ext" title="Read external article or primary record">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
              <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
            ${escHtml(c.sourceName)}
          </a>
          <a href="sources.html#case-source-${c.id}" class="case-source-reg" title="View official docket & audit citation in Sources Registry">
            ⚖ Sources Registry
          </a>
        </div>
      </div>
    `;
  }).join('');
}

document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderCases(btn.dataset.filter);
  });
});

renderCases();

// Inject "NEW 2026" badge style
(function() {
  const s = document.createElement('style');
  s.textContent = `
    .new-badge {
      display: inline-flex;
      align-items: center;
      font-size: .6rem;
      font-weight: 800;
      letter-spacing: .08em;
      padding: .15rem .45rem;
      border-radius: 4px;
      background: rgba(245,158,11,.2);
      color: var(--clr-amber);
      border: 1px solid rgba(245,158,11,.35);
      margin-right: .35rem;
      vertical-align: middle;
    }
    .odometer-last {
      color: var(--clr-red);
      text-shadow: 0 0 20px rgba(239,68,68,.8);
    }
  `;
  document.head.appendChild(s);
})();

/* ═══════════════════════════════════════════════════════════════════════════
   8. NEWS & INTELLIGENCE FEEDS (CAROUSEL)
   Tabs:
   1. "Accountability Tracker" (Official legal/audit milestones, newest to oldest)
   2. "Latest News" (Live RSS + curated fallback, newest to oldest)
   3. "Investigative Reports" (In-depth journalistic pieces, newest to oldest)
═══════════════════════════════════════════════════════════════════════════ */

const newsGrid = document.getElementById('news-grid');
const newsTabBtns = document.querySelectorAll('.news-tab-btn');
const carouselPrev = document.getElementById('carousel-prev');
const carouselNext = document.getElementById('carousel-next');
const carouselCounter = document.getElementById('carousel-counter');
const carouselDots = document.getElementById('carousel-dots');

let activeNewsTab = 'accountability'; // Default to Accountability Tracker
let currentFeedItems = [];
let liveNewsItems = [];
let rssFetchDone = false;

// ── Tab switching ──
newsTabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    newsTabBtns.forEach(b => {
      b.classList.remove('active');
      b.setAttribute('aria-selected', 'false');
    });
    btn.classList.add('active');
    btn.setAttribute('aria-selected', 'true');
    activeNewsTab = btn.dataset.tab;
    renderNewsFeed();
    if (newsGrid) newsGrid.scrollTo({ left: 0, behavior: 'smooth' });
  });
});

function formatDate(dateStr) {
  try {
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString('en-PH', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  } catch { return dateStr; }
}

function stripHtml(html) {
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || div.innerText || '';
}

// ── Card HTML generators ──
function trackerCardHTML(item, delay = 0) {
  const amountStr = item.amount ? formatCurrency(item.amount, true) : null;
  const sourceHref = item.caseId ? `sources.html#case-source-${item.caseId}` : 'sources.html';
  const targetUrl = item.url || sourceHref;

  return `
    <article class="carousel-card carousel-card--tracker" style="--card-delay:${delay}ms" tabindex="0">
      <div class="card-meta-row">
        <span class="news-date">📅 ${formatDate(item.date)}</span>
        <span class="card-publisher-badge" style="color:var(--clr-blue); border-color:rgba(59,130,246,.35); background:rgba(59,130,246,.12);">
          <span class="publisher-dot" style="background:var(--clr-blue)"></span>${escHtml(item.authority || 'Legal Milestone')}
        </span>
        ${amountStr ? `<span class="card-amount-val">${amountStr}</span>` : ''}
      </div>
      <h3 class="news-title">
        <a href="${escHtml(targetUrl)}" target="_blank" rel="noopener noreferrer">
          ${escHtml(item.title)}
        </a>
      </h3>
      <p class="news-summary">${escHtml(item.summary || '')}</p>
      <div class="card-authority-line">
        <span class="authority-chip">🏛 ${escHtml(item.authority)}</span>
        <span class="action-chip">${escHtml(item.actionType)}</span>
      </div>
      <div class="card-links-row">
        <a href="${escHtml(targetUrl)}" target="_blank" rel="noopener noreferrer" class="card-link-ext" title="Read live investigative reports and records">
          ↗ Read Investigation
        </a>
        <a href="${sourceHref}" class="card-link-source" title="View official docket & audit citation in Sources Registry">
          ⚖ Sources Registry
        </a>
      </div>
    </article>
  `;
}

function newsCardHTML(item, delay = 0) {
  const color = item.publisherColor || '#f59e0b';
  const amountStr = item.amount ? formatCurrency(item.amount, true) : null;
  const sourceHref = item.caseId ? `sources.html#case-source-${item.caseId}` : 'sources.html';
  const targetUrl = item.url || item.link || sourceHref;
  const primaryTag = (item.tags && item.tags[0]) || 'Live Coverage';
  const secondaryTag = (item.tags && item.tags[1]) || null;

  return `
    <article class="carousel-card carousel-card--news" style="--card-delay:${delay}ms" tabindex="0">
      <div class="card-meta-row">
        <span class="news-date">📅 ${formatDate(item.date || item.pubDate)}</span>
        <span class="card-publisher-badge" style="color:${escHtml(color)}; border-color:${escHtml(color)}44; background:${escHtml(color)}18;">
          <span class="publisher-dot" style="background:${escHtml(color)}"></span>${escHtml(item.publisher || 'News Desk')}
        </span>
        ${amountStr ? `<span class="card-amount-val">${amountStr}</span>` : ''}
      </div>
      <h3 class="news-title">
        <a href="${escHtml(targetUrl)}" target="_blank" rel="noopener noreferrer">
          ${escHtml(item.title)}
        </a>
      </h3>
      <p class="news-summary">${escHtml(item.summary || item.description || '')}</p>
      <div class="card-authority-line">
        <span class="authority-chip">📰 News Report</span>
        <span class="action-chip">${escHtml(primaryTag)}</span>
        ${secondaryTag ? `<span class="action-chip">${escHtml(secondaryTag)}</span>` : ''}
      </div>
      <div class="card-links-row">
        <a href="${escHtml(targetUrl)}" target="_blank" rel="noopener noreferrer" class="card-link-ext" title="Read live reporting">
          ↗ Read Story
        </a>
        <a href="${sourceHref}" class="card-link-source" title="View official docket & audit citation in Sources Registry">
          ⚖ Sources Registry
        </a>
      </div>
    </article>
  `;
}

function investigativeCardHTML(item, delay = 0) {
  const color = item.publisherColor || '#a855f7';
  const amountStr = item.amount ? formatCurrency(item.amount, true) : null;
  const sourceHref = item.caseId ? `sources.html#case-source-${item.caseId}` : 'sources.html';
  const targetUrl = item.url || sourceHref;
  const primaryTag = (item.tags && item.tags[0]) || 'In-Depth Dossier';
  const secondaryTag = (item.tags && item.tags[1]) || null;

  return `
    <article class="carousel-card carousel-card--investigative" style="--card-delay:${delay}ms" tabindex="0">
      <div class="card-meta-row">
        <span class="news-date">📅 ${formatDate(item.date)}</span>
        <span class="card-publisher-badge" style="color:${escHtml(color)}; border-color:${escHtml(color)}44; background:${escHtml(color)}18;">
          <span class="publisher-dot" style="background:${escHtml(color)}"></span>${escHtml(item.publisher || 'Investigative Desk')}
        </span>
        ${amountStr ? `<span class="card-amount-val">${amountStr}</span>` : ''}
      </div>
      <h3 class="news-title">
        <a href="${escHtml(targetUrl)}" target="_blank" rel="noopener noreferrer">
          ${escHtml(item.title)}
        </a>
      </h3>
      <p class="news-summary">${escHtml(item.summary || '')}</p>
      <div class="card-authority-line">
        <span class="authority-chip">🔍 Investigation</span>
        <span class="action-chip">${escHtml(primaryTag)}</span>
        ${secondaryTag ? `<span class="action-chip">${escHtml(secondaryTag)}</span>` : ''}
      </div>
      <div class="card-links-row">
        <a href="${escHtml(targetUrl)}" target="_blank" rel="noopener noreferrer" class="card-link-ext" title="Read comprehensive investigative report">
          ↗ Read Investigation
        </a>
        <a href="${sourceHref}" class="card-link-source" title="View official docket & audit citation in Sources Registry">
          ⚖ Sources Registry
        </a>
      </div>
    </article>
  `;
}

function standardCardHTML(item, delay = 0) {
  return newsCardHTML(item, delay);
}

// ── Carousel Controls & Dots ──
function getCardStep() {
  if (!newsGrid) return 340;
  const first = newsGrid.firstElementChild;
  if (!first) return 340;
  const gap = 20; // 1.25rem = 20px
  return first.getBoundingClientRect().width + gap;
}

function scrollCarousel(dir) {
  if (!newsGrid) return;
  const step = getCardStep();
  newsGrid.scrollBy({ left: dir * step, behavior: 'smooth' });
}

if (carouselPrev) carouselPrev.addEventListener('click', () => scrollCarousel(-1));
if (carouselNext) carouselNext.addEventListener('click', () => scrollCarousel(1));

function renderCarouselDots(count) {
  if (!carouselDots) return;
  carouselDots.innerHTML = Array.from({ length: count }, (_, i) => `
    <button class="carousel-dot ${i === 0 ? 'active' : ''}" 
            data-index="${i}" 
            aria-label="Go to card ${i + 1}"
            role="tab"
            aria-selected="${i === 0 ? 'true' : 'false'}"></button>
  `).join('');

  carouselDots.querySelectorAll('.carousel-dot').forEach(dot => {
    dot.addEventListener('click', () => {
      const idx = parseInt(dot.dataset.index, 10);
      const step = getCardStep();
      newsGrid.scrollTo({ left: idx * step, behavior: 'smooth' });
    });
  });
}

function updateCarouselState() {
  if (!newsGrid || !currentFeedItems.length) return;
  const step = getCardStep();
  const scrollLeft = newsGrid.scrollLeft;
  const activeIdx = Math.min(
    Math.max(0, Math.round(scrollLeft / step)),
    currentFeedItems.length - 1
  );

  const isAtStart = scrollLeft <= 6;
  const isAtEnd = scrollLeft + newsGrid.clientWidth >= newsGrid.scrollWidth - 10;

  if (carouselCounter) {
    carouselCounter.textContent = `${activeIdx + 1} of ${currentFeedItems.length}`;
  }

  if (carouselPrev) carouselPrev.disabled = isAtStart;
  if (carouselNext) carouselNext.disabled = isAtEnd;

  if (carouselDots) {
    const dots = carouselDots.querySelectorAll('.carousel-dot');
    dots.forEach((dot, idx) => {
      const isActive = idx === activeIdx;
      dot.classList.toggle('active', isActive);
      dot.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });
  }
}

if (newsGrid) {
  let scrollTimeout;
  newsGrid.addEventListener('scroll', () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(updateCarouselState, 35);
  }, { passive: true });

  // Keyboard navigation
  newsGrid.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') {
      scrollCarousel(1);
      e.preventDefault();
    } else if (e.key === 'ArrowLeft') {
      scrollCarousel(-1);
      e.preventDefault();
    }
  });
}

// ── Feed Renderers ──
function renderNewsFeed() {
  if (!newsGrid) return;

  if (activeNewsTab === 'accountability') {
    // Sort strictly newest to oldest
    const sorted = [...ACCOUNTABILITY_TRACKER_ITEMS].sort((a, b) => new Date(b.date) - new Date(a.date));
    currentFeedItems = sorted;
    newsGrid.innerHTML = sorted.map((item, i) => trackerCardHTML(item, i * 40)).join('');
  } else if (activeNewsTab === 'investigations') {
    // Sort strictly newest to oldest
    const sorted = [...INVESTIGATIVE_ITEMS].sort((a, b) => new Date(b.date) - new Date(a.date));
    currentFeedItems = sorted;
    newsGrid.innerHTML = sorted.map((item, i) => investigativeCardHTML(item, i * 40)).join('');
  } else {
    // Latest News tab
    renderLatestNewsFeed();
    return;
  }

  renderCarouselDots(currentFeedItems.length);
  updateCarouselState();
  updatePillCounts();
}

function renderLatestNewsFeed() {
  const baseItems = liveNewsItems.length >= 9 ? liveNewsItems : LATEST_NEWS_ITEMS;
  const sorted = [...baseItems].sort((a, b) => new Date(b.date || b.pubDate) - new Date(a.date || a.pubDate));
  currentFeedItems = sorted;
  newsGrid.innerHTML = sorted.map((item, i) => newsCardHTML(item, i * 40)).join('');

  renderCarouselDots(currentFeedItems.length);
  updateCarouselState();
  updatePillCounts();

  if (!rssFetchDone) fetchAllFeeds();
}

function updatePillCounts() {
  const elAcc = document.getElementById('count-accountability');
  const elLat = document.getElementById('count-latest');
  const elInv = document.getElementById('count-investigations');

  if (elAcc) elAcc.textContent = ACCOUNTABILITY_TRACKER_ITEMS.length;
  if (elLat) elLat.textContent = Math.max(liveNewsItems.length, LATEST_NEWS_ITEMS.length);
  if (elInv) elInv.textContent = INVESTIGATIVE_ITEMS.length;
}

// ── Live RSS via rss2json ──
async function fetchFeed(feedConfig) {
  try {
    const res = await fetch(feedConfig.url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data.status !== 'ok') throw new Error('Feed error');

    const kw = feedConfig.keywords.map(k => k.toLowerCase());
    return (data.items || [])
      .filter(item => {
        const text = ((item.title || '') + ' ' + (item.description || '')).toLowerCase();
        return kw.some(k => text.includes(k));
      })
      .map(item => ({
        title: item.title,
        summary: stripHtml(item.description || item.content || '').slice(0, 200) + '…',
        url: item.link,
        date: item.pubDate,
        publisher: feedConfig.name,
        publisherColor: feedConfig.color,
      }));
  } catch (e) {
    return [];
  }
}

async function fetchAllFeeds() {
  rssFetchDone = true;
  const results = await Promise.allSettled(RSS_FEEDS.map(f => fetchFeed(f)));

  let fetched = [];
  results.forEach(r => {
    if (r.status === 'fulfilled') fetched = fetched.concat(r.value);
  });

  // Combine fetched with curated fallback items, deduplicate by title, and sort newest first
  const combined = [...fetched, ...LATEST_NEWS_ITEMS];
  const seen = new Set();
  const deduped = combined.filter(item => {
    const key = (item.title || '').slice(0, 35).toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).sort((a, b) => new Date(b.date || b.pubDate) - new Date(a.date || a.pubDate));

  if (deduped.length >= 9) {
    liveNewsItems = deduped;
    if (activeNewsTab === 'latest') {
      renderLatestNewsFeed();
    } else {
      updatePillCounts();
    }
  }
}

// Initialize feed display with Accountability Tracker
renderNewsFeed();

/* ═══════════════════════════════════════════════════════════════════════════
   9. SHARE MODAL & FAIL-PROOF CLIPBOARD
═══════════════════════════════════════════════════════════════════════════ */

function getCanonicalShareUrl() {
  if (window.location.protocol === 'file:' || !window.location.hostname || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'https://halalan-tracker.ph/';
  }
  return window.location.href;
}

function showToast(message = 'Link copied to clipboard!') {
  let toast = document.getElementById('share-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'share-toast';
    toast.style.cssText = 'display:none;position:fixed;bottom:1.5rem;left:50%;transform:translateX(-50%);background:#0f172a;border:1px solid rgba(6,182,212,.5);color:#e2e8f0;padding:.65rem 1.25rem;border-radius:8px;font-size:.85rem;font-weight:600;z-index:10001;white-space:nowrap;box-shadow:0 8px 24px rgba(0,0,0,.6)';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.style.display = 'block';
  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(() => {
    toast.style.display = 'none';
  }, 2500);
}

function copyTextToClipboard(text) {
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text).catch(() => fallbackCopy(text));
  }
  return fallbackCopy(text);
}

function fallbackCopy(text) {
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.top = '0';
    ta.style.left = '-9999px';
    ta.setAttribute('readonly', '');
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(ta);
    return successful ? Promise.resolve() : Promise.reject();
  } catch (err) {
    return Promise.reject(err);
  }
}

let shareModalInjected = false;

function ensureShareModal() {
  let modal = document.getElementById('share-modal');
  if (shareModalInjected && modal) return;
  shareModalInjected = true;

  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'share-modal';
    modal.className = 'share-modal-backdrop';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'share-modal-title');
    modal.innerHTML = `
      <div class="share-modal-card">
        <div class="share-modal-header">
          <div class="share-modal-header-text">
            <h3 id="share-modal-title" class="share-modal-title">Share Philippine Corruption Tracker</h3>
            <p class="share-modal-desc" id="share-modal-desc">Spread verified data. Inform, educate, and demand accountability.</p>
          </div>
          <button type="button" class="share-modal-close" id="share-modal-close" aria-label="Close share dialog">&times;</button>
        </div>

        <div class="share-copy-section">
          <label class="share-field-label" for="share-url-input">Direct Page Link</label>
          <div class="share-copy-box">
            <input type="text" id="share-url-input" class="share-url-input" readonly value="https://halalan-tracker.ph/" />
            <button type="button" id="share-copy-btn" class="share-copy-btn" title="Copy to clipboard">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
              <span id="share-copy-text">Copy Link</span>
            </button>
          </div>
        </div>

        <div class="share-social-section">
          <div class="share-field-label">Share to Social &amp; Messaging</div>
          <div class="share-social-grid">
            <a id="share-link-x" href="#" target="_blank" rel="noopener noreferrer" class="share-social-btn share-social-btn--x">
              <span class="share-social-icon">𝕏</span>
              <span>X / Twitter</span>
            </a>
            <a id="share-link-fb" href="#" target="_blank" rel="noopener noreferrer" class="share-social-btn share-social-btn--fb">
              <span class="share-social-icon">f</span>
              <span>Facebook</span>
            </a>
            <a id="share-link-wa" href="#" target="_blank" rel="noopener noreferrer" class="share-social-btn share-social-btn--wa">
              <span class="share-social-icon">💬</span>
              <span>WhatsApp</span>
            </a>
            <a id="share-link-tg" href="#" target="_blank" rel="noopener noreferrer" class="share-social-btn share-social-btn--tg">
              <span class="share-social-icon">✈</span>
              <span>Telegram</span>
            </a>
            <a id="share-link-reddit" href="#" target="_blank" rel="noopener noreferrer" class="share-social-btn share-social-btn--reddit">
              <span class="share-social-icon">🔴</span>
              <span>Reddit</span>
            </a>
            <a id="share-link-email" href="#" class="share-social-btn share-social-btn--email">
              <span class="share-social-icon">✉</span>
              <span>Email</span>
            </a>
          </div>
        </div>

        <div id="share-device-row" class="share-device-row">
          <button type="button" id="share-device-btn" class="share-device-btn">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <circle cx="18" cy="5" r="3"></circle>
              <circle cx="6" cy="12" r="3"></circle>
              <circle cx="18" cy="19" r="3"></circle>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
            </svg>
            <span>Open Device Share Menu</span>
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  // Setup event listeners
  const closeBtn = document.getElementById('share-modal-close');
  const copyBtn = document.getElementById('share-copy-btn');
  const copyText = document.getElementById('share-copy-text');
  const urlInput = document.getElementById('share-url-input');
  const deviceBtn = document.getElementById('share-device-btn');

  function closeShareModal() {
    if (modal) modal.classList.remove('open');
  }

  if (closeBtn) closeBtn.onclick = closeShareModal;
  if (modal) {
    modal.onclick = e => {
      if (e.target === modal) closeShareModal();
    };
  }
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && modal && modal.classList.contains('open')) closeShareModal();
  });

  if (copyBtn && urlInput && copyText) {
    copyBtn.onclick = () => {
      const val = urlInput.value;
      copyTextToClipboard(val).then(() => {
        copyText.textContent = 'Copied!';
        copyBtn.style.background = 'var(--clr-green)';
        showToast('Link copied to clipboard!');
        setTimeout(() => {
          copyText.textContent = 'Copy Link';
          copyBtn.style.background = '';
        }, 2000);
      }).catch(() => {
        showToast('Could not copy link automatically. Please copy the URL box.');
      });
    };
  }

  if (urlInput) {
    urlInput.onclick = () => urlInput.select();
  }

  if (deviceBtn && urlInput) {
    if (navigator.share) {
      deviceBtn.style.display = 'flex';
      deviceBtn.onclick = () => {
        const titleEl = document.getElementById('share-modal-title');
        const descEl = document.getElementById('share-modal-desc');
        const title = titleEl ? titleEl.textContent : 'Philippine Corruption Tracker';
        const text = descEl ? descEl.textContent : '';
        const url = urlInput.value;
        navigator.share({ title, text, url }).catch(() => {});
      };
    } else {
      const devRow = document.getElementById('share-device-row');
      if (devRow) devRow.style.display = 'none';
    }
  }
}

function openShareModal(options = {}) {
  ensureShareModal();
  const modal = document.getElementById('share-modal');
  if (!modal) return;

  const title = options.title || 'Korap Tracker | Philippine Corruption Tracker';
  const text = options.text || 'Over P399 billion in documented corruption cases. Every peso linked to an official record. Inform. Educate. Hold accountable.';
  const shareUrl = options.url || getCanonicalShareUrl();

  const titleEl = document.getElementById('share-modal-title');
  const descEl = document.getElementById('share-modal-desc');
  const urlEl = document.getElementById('share-url-input');

  if (titleEl) titleEl.textContent = title;
  if (descEl) descEl.textContent = text;
  if (urlEl) urlEl.value = shareUrl;

  // Configure social URLs
  const encUrl = encodeURIComponent(shareUrl);
  const encText = encodeURIComponent(text);
  const encTitle = encodeURIComponent(title);

  const xLink = document.getElementById('share-link-x');
  if (xLink) xLink.href = `https://twitter.com/intent/tweet?text=${encText}&url=${encUrl}`;

  const fbLink = document.getElementById('share-link-fb');
  if (fbLink) fbLink.href = `https://www.facebook.com/sharer/sharer.php?u=${encUrl}`;

  const waLink = document.getElementById('share-link-wa');
  if (waLink) waLink.href = `https://api.whatsapp.com/send?text=${encodeURIComponent(text + ' ' + shareUrl)}`;

  const tgLink = document.getElementById('share-link-tg');
  if (tgLink) tgLink.href = `https://t.me/share/url?url=${encUrl}&text=${encText}`;

  const redditLink = document.getElementById('share-link-reddit');
  if (redditLink) redditLink.href = `https://reddit.com/submit?url=${encUrl}&title=${encTitle}`;

  const emailLink = document.getElementById('share-link-email');
  if (emailLink) emailLink.href = `mailto:?subject=${encTitle}&body=${encodeURIComponent(text + '\n\n' + shareUrl)}`;

  modal.classList.add('open');
}

function shareKorapTracker() {
  openShareModal({
    title: 'Korap Tracker | Philippine Corruption Tracker',
    text: 'Over P399 billion in documented corruption cases. Every peso linked to an official record. Inform. Educate. Hold accountable.',
    url: getCanonicalShareUrl()
  });
}

const shareHalalan = shareKorapTracker;
window.shareKorapTracker = shareKorapTracker;
window.shareHalalan = shareHalalan;
window.openShareModal = openShareModal;

// Initialize share modal listeners immediately
ensureShareModal();


