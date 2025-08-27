// ==UserScript==
// @name         Universal Ad-Bypasser
// @namespace    https://github.com/0101010KingofCode0101010/universal-ad-bypasser
// @version      2.3.0
// @description  Defeats the most advanced anti-adblock scripts using a stealth Proxy-based interception engine. Undetectable by function integrity checks.
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
            // Keywords to block any URL containing them. Catches self-hosted scripts.
            'ad-block', 'adblock', 'fuckadblock', 'anti-adblock',
            // High-priority domains used as anti-adblock bait.
            'googlesyndication.com', 'doubleclick.net', 'adsterra.com', 'popads.net'
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
    // SECTION 2: BLOCKLIST MANAGEMENT
    // =================================================================================
    const manualBlocklist = new Set(CONFIG.MANUAL_BLOCKLIST);
    let remoteBlocklist = new Set();

    // =================================================================================
    // SECTION 3: STEALTH INTERCEPTION ENGINE (Proxy-based)
    // =================================================================================

    // Prevent script from running multiple times on the same page
    if (unsafeWindow.uabEngineActive) return;

    function isBlocked(urlString) {
        if (!urlString) return false;
        // Check manual list first (high priority, keyword-based)
        for (const keyword of manualBlocklist) {
            if (urlString.includes(keyword)) return true;
        }
        // Then, check remote list (broad, domain-based)
        if (remoteBlocklist.size > 0) {
            try {
                const url = new URL(urlString, window.location.origin);
                const hostname = url.hostname;
                for (const blockedDomain of remoteBlocklist) {
                    if (hostname === blockedDomain || hostname.endsWith('.' + blockedDomain)) return true;
                }
            } catch (e) { /* Invalid URL, ignore */ }
        }
        return false;
    }

    // --- Define our fake functions that will be served by the proxy ---
    const originalFetch = unsafeWindow.fetch;
    const fakeFetch = function(resource, options) {
        const url = (resource instanceof Request) ? resource.url : String(resource);
        if (isBlocked(url)) {
            log(`[PROXY] Blocked FETCH: ${url}`);
            return Promise.resolve(new Response(null, { status: 204, statusText: "No Content" }));
        }
        return originalFetch.apply(unsafeWindow, arguments);
    };

    const originalXhr = unsafeWindow.XMLHttpRequest;
    function FakeXMLHttpRequest() {
        const xhr = new originalXhr();
        const originalOpen = xhr.open;
        xhr.open = function(method, url) {
            if (isBlocked(url)) {
                log(`[PROXY] Blocked XHR: ${url}`);
                this._isBlocked = true;
            }
            return originalOpen.apply(this, arguments);
        };
        const originalSend = xhr.send;
        xhr.send = function() {
            if (this._isBlocked) return;
            return originalSend.apply(this, arguments);
        };
        return xhr;
    }
    
    const originalOpen = unsafeWindow.open;
    const fakeOpen = function(url, target, features){
        if (isBlocked(url || '')) {
            log(`[PROXY] Blocked window.open: ${url || 'blank'}`);
            return null;
        }
        return originalOpen.apply(unsafeWindow, arguments);
    }

    // --- The core of the stealth engine: The Proxy Handler ---
    const proxyHandler = {
        get: function(target, prop) {
            // When a script asks for `window.fetch`, we return our fake version
            if (prop === 'fetch') return fakeFetch;
            if (prop === 'XMLHttpRequest') return FakeXMLHttpRequest;
            if (prop === 'open') return fakeOpen;

            // For all other properties, return the original value
            const value = Reflect.get(target, prop);
            return typeof value === 'function' ? value.bind(target) : value;
        }
    };

    // --- Activation ---
    unsafeWindow.uabEngineActive = true;
    // Overwrite the `window` object with a proxy of itself. All property access
    // from this point on will be intercepted by our handler.
    unsafeWindow = new Proxy(unsafeWindow, proxyHandler);
    log('Stealth Interception Engine is ACTIVE.');
    
    // =================================================================================
    // SECTION 4: INITIALIZATION & BACKGROUND TASKS
    // =================================================================================
    (function initialize() {
        GM_addStyle(CONFIG.CSS_SELECTORS_TO_HIDE.join(', ') + 
            ` { display: none !important; visibility: hidden !important; opacity: 0 !important; width: 0 !important; height: 0 !important; }`);
        
        // Start updating the blocklist in the background
        updateAndHydrateRemoteBlocklist();
    })();

    // Helper function for parsing hosts files
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

    // Helper function for fetching and caching the remote list
    async function updateAndHydrateRemoteBlocklist() {
        const lastUpdated = await GM_getValue('blocklistLastUpdated', 0);
        const cachedList = await GM_getValue('blocklistCache', null);
        const now = Date.now();
        const cacheAgeHours = (now - lastUpdated) / (1000 * 60 * 60);

        const useCache = () => {
            if (cachedList) {
                remoteBlocklist = new Set(JSON.parse(cachedList));
                log(`Loaded ${remoteBlocklist.size} remote domains from cache.`);
            }
        };

        if (cachedList && cacheAgeHours < CONFIG.REMOTE_BLOCKLIST.UPDATE_INTERVAL_HOURS) {
            useCache();
        } else {
            GM_xmlhttpRequest({
                method: 'GET',
                url: CONFIG.REMOTE_BLOCKLIST.URL,
                onload: (response) => {
                    if (response.status >= 200 && response.status < 300) {
                        remoteBlocklist = parseHostsFile(response.responseText);
                        log(`Hydrated remote blocklist with ${remoteBlocklist.size} domains.`);
                        GM_setValue('blocklistCache', JSON.stringify([...remoteBlocklist]));
                        GM_setValue('blocklistLastUpdated', Date.now());
                    } else {
                        log(`Failed to fetch remote list (status: ${response.status}). Using cache as fallback.`);
                        useCache();
                    }
                },
                onerror: () => {
                    log('Error fetching remote list. Using cache as fallback.');
                    useCache();
                }
            });
        }
    }
})();
