// ==UserScript==
// @name         Universal Ad-Bypasser
// @namespace    https://github.com/0101010KingofCode0101010/universal-ad-bypasser
// @version      2.0.0
// @description  Works with your ad-blocker to defeat anti-adblock. Now with a dynamically updated blocklist from community sources.
// @author       NoName
// @match        *://*/*
// @exclude      /^https?://(www\.)?(google|youtube|facebook|twitter|instagram)\..*/
// @grant        unsafeWindow
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// @grant        GM_getValue
// @grant        GM_setValue
// @run-at       document-start
// @license      MIT
// ==/UserScript==

(function() {
    'use strict';

    // =================================================================================
    // SECTION 1: CONFIGURATION
    // =================================================================================
    const CONFIG = {
        debug: false,
        MANUAL_BLOCKLIST: [
            'ad-block', 'adblock', 'fuckadblock', 'anti-adblock'
        ],
        REMOTE_BLOCKLIST: {
            URL: 'https://raw.githubusercontent.com/StevenBlack/hosts/master/hosts',
            UPDATE_INTERVAL_HOURS: 24
        },
        CSS_SELECTORS_TO_HIDE: [
            '.ad', '.ads', '.adsbox', '.ad-banner', '.ad-container', '.ad-wrapper', '.ad-placeholder',
            '[id*="ads"]', '[id*="banner"]', '[id^="ad-"]', '[class*="ads"]', '[class*="banner"]',
            '[class^="ad-"]', '[aria-label*="advertisement"]', '.anti-adblock-overlay', '#adblock-popup'
        ]
    };

    const LOG_PREFIX = '[UAB]';
    function log(message, ...args) { if (CONFIG.debug) console.log(`${LOG_PREFIX} ${message}`, ...args); }

    // =================================================================================
    // SECTION 2: DYNAMIC BLOCKLIST MANAGEMENT
    // =================================================================================
    let combinedBlocklist = new Set(CONFIG.MANUAL_BLOCKLIST);

    function parseHostsFile(text) {
        const domains = new Set();
        const lines = text.split('\n');
        for (const line of lines) {
            if (line.startsWith('#') || line.trim() === '') continue;
            const parts = line.split(/\s+/);
            if (parts.length >= 2 && (parts[0] === '0.0.0.0' || parts[0] === '127.0.0.1')) {
                domains.add(parts[1].trim());
            }
        }
        return domains;
    }

    async function updateBlocklistIfNeeded() {
        const lastUpdated = await GM_getValue('blocklistLastUpdated', 0);
        const cachedList = await GM_getValue('blocklistCache', null);
        const now = Date.now();
        const cacheAgeHours = (now - lastUpdated) / (1000 * 60 * 60);

        if (cachedList && cacheAgeHours < CONFIG.REMOTE_BLOCKLIST.UPDATE_INTERVAL_HOURS) {
            log('Loading blocklist from cache.');
            const remoteDomains = new Set(JSON.parse(cachedList));
            combinedBlocklist = new Set([...CONFIG.MANUAL_BLOCKLIST, ...remoteDomains]);
        } else {
            log(cachedList ? 'Cache is stale, fetching remote blocklist...' : 'No cache, fetching remote blocklist...');
            return new Promise((resolve) => {
                GM_xmlhttpRequest({
                    method: 'GET',
                    url: CONFIG.REMOTE_BLOCKLIST.URL,
                    onload: function(response) {
                        if (response.status >= 200 && response.status < 300) {
                            const remoteDomains = parseHostsFile(response.responseText);
                            log(`Fetched and parsed ${remoteDomains.size} new domains.`);
                            combinedBlocklist = new Set([...CONFIG.MANUAL_BLOCKLIST, ...remoteDomains]);
                            GM_setValue('blocklistCache', JSON.stringify([...remoteDomains]));
                            GM_setValue('blocklistLastUpdated', Date.now());
                        } else {
                            log(`Failed to fetch remote list (status: ${response.status}). Using cached list as fallback.`);
                            if (cachedList) {
                                const remoteDomains = new Set(JSON.parse(cachedList));
                                combinedBlocklist = new Set([...CONFIG.MANUAL_BLOCKLIST, ...remoteDomains]);
                            }
                        }
                        resolve();
                    },
                    onerror: function(error) {
                        log('Error fetching remote blocklist. Using cached list as fallback.', error);
                        if (cachedList) {
                           const remoteDomains = new Set(JSON.parse(cachedList));
                           combinedBlocklist = new Set([...CONFIG.MANUAL_BLOCKLIST, ...remoteDomains]);
                        }
                        resolve();
                    }
                });
            });
        }
    }

    // =================================================================================
    // SECTION 3: CORE LOGIC
    // =================================================================================
    function isBlocked(urlString) {
        if (!urlString) return false;
        try {
            const url = new URL(urlString, window.location.origin);
            for (const blockedItem of combinedBlocklist) {
                if (url.hostname === blockedItem || url.hostname.endsWith('.' + blockedItem) || url.href.includes(blockedItem)) {
                    return true;
                }
            }
            return false;
        } catch (e) { return false; }
    }

    function activateInterceptors() {
        const originalFetch = unsafeWindow.fetch;
        unsafeWindow.fetch = function(resource, options) {
            const url = (resource instanceof Request) ? resource.url : String(resource);
            if (isBlocked(url)) {
                log(`Blocked FETCH: ${url}`);
                return Promise.resolve(new Response(null, { status: 204, statusText: "No Content" }));
            }
            return originalFetch.apply(this, arguments);
        };

        const originalXhrOpen = unsafeWindow.XMLHttpRequest.prototype.open;
        unsafeWindow.XMLHttpRequest.prototype.open = function(method, url) {
            if (isBlocked(url)) { log(`Blocked XHR: ${url}`); this._isBlocked = true; return; }
            return originalXhrOpen.apply(this, arguments);
        };
        const originalXhrSend = unsafeWindow.XMLHttpRequest.prototype.send;
        unsafeWindow.XMLHttpRequest.prototype.send = function() {
            if (this._isBlocked) return;
            return originalXhrSend.apply(this, arguments);
        };

        const originalWindowOpen = unsafeWindow.open;
        unsafeWindow.open = function(url) {
            if (!url || url.startsWith('about:blank') || isBlocked(url)) { log(`Blocked popup: ${url || 'blank'}`); return null; }
            return originalWindowOpen.apply(this, arguments);
        };

        const observer = new MutationObserver(mutations => {
            for (const mutation of mutations) {
                for (const node of mutation.addedNodes) {
                    if (node.nodeType === 1 && CONFIG.CSS_SELECTORS_TO_HIDE.some(selector => {
                        try { return node.matches(selector); } catch (e) { return false; }
                    })) {
                        log(`Dynamically removed: ${node.className || node.id}`);
                        node.remove();
                    }
                }
            }
        });
        observer.observe(document.documentElement, { childList: true, subtree: true });

        log('Interceptors are active.');
    }

    // =================================================================================
    // SECTION 4: INITIALIZATION
    // =================================================================================
    async function initialize() {
        GM_addStyle(CONFIG.CSS_SELECTORS_TO_HIDE.join(', ') +
            ` { display: none !important; visibility: hidden !important; opacity: 0 !important; width: 0 !important; height: 0 !important; }`);

        await updateBlocklistIfNeeded();
        log(`Blocklist initialized with ${combinedBlocklist.size} rules.`);
        
        activateInterceptors();
        log('Universal Ad-Bypasser is fully active.');
    }

    initialize();
})();
