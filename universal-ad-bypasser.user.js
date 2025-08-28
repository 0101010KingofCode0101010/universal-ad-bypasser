// ==UserScript==
// @name         Universal Ad-Bypasser
// @namespace    https://github.com/0101010KingofCode0101010/universal-ad-bypasser
// @version      2.4.0
// @description  Defeats advanced anti-adblock with a Stealth Proxy Engine and a Just-In-Time Click Interceptor to block popups.
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
        MANUAL_BLOCKLIST: [ 'ad-block', 'adblock', 'fuckadblock', 'anti-adblock', 'googlesyndication.com', 'doubleclick.net', 'adsterra.com', 'popads.net' ],
        REMOTE_BLOCKLIST: { URL: 'https://raw.githubusercontent.com/StevenBlack/hosts/master/hosts', UPDATE_INTERVAL_HOURS: 24 },
        CSS_SELECTORS_TO_HIDE: [ '.ad', '.ads', '.adsbox', '.ad-banner', '.ad-container', '.ad-wrapper', '.ad-placeholder', '[id*="ads"]', '[id*="banner"]', '[id^="ad-"]', '[class*="ads"]', '[class*="banner"]', '[class^="ad-"]', '[aria-label*="advertisement"]', '.anti-adblock-overlay', '#adblock-popup' ]
    };

    const LOG_PREFIX = '[UAB]';
    function log(message, ...args) { if (CONFIG.debug) console.log(`${LOG_PREFIX} ${message}`, ...args); }

    // =================================================================================
    // SECTION 2: BLOCKLIST MANAGEMENT
    // =================================================================================
    const manualBlocklist = new Set(CONFIG.MANUAL_BLOCKLIST);
    let remoteBlocklist = new Set();
    
    // (Blocklist management functions remain unchanged from v2.3)
    async function updateAndHydrateRemoteBlocklist() { /* ... Unchanged ... */ }
    function parseHostsFile(text) { /* ... Unchanged ... */ }

    // =================================================================================
    // SECTION 3: STEALTH INTERCEPTION ENGINE (Proxy-based)
    // =================================================================================

    if (unsafeWindow.uabEngineActive) return;

    function isBlocked(urlString) { /* ... Unchanged from v2.3 ... */ }

    // --- Define our fake functions that will be served by the proxy ---
    const originalFetch = unsafeWindow.fetch;
    const fakeFetch = function(resource, options) { /* ... Unchanged ... */ };

    const originalXhr = unsafeWindow.XMLHttpRequest;
    function FakeXMLHttpRequest() { /* ... Unchanged ... */ }
    
    const originalOpen = unsafeWindow.open;
    // Reinforced fakeOpen to explicitly block blank popups, a common pop-under technique
    const fakeOpen = function(url, target, features){
        if (!url || url.startsWith('about:blank') || isBlocked(url)) {
            log(`[PROXY] Blocked window.open: ${url || 'blank'}`);
            return null;
        }
        return originalOpen.apply(unsafeWindow, arguments);
    }

    // --- The Proxy Handler ---
    const proxyHandler = {
        get: function(target, prop) {
            if (prop === 'fetch') return fakeFetch;
            if (prop === 'XMLHttpRequest') return FakeXMLHttpRequest;
            if (prop === 'open') return fakeOpen;
            const value = Reflect.get(target, prop);
            return typeof value === 'function' ? value.bind(target) : value;
        }
    };

    // --- Activation ---
    unsafeWindow.uabEngineActive = true;
    unsafeWindow = new Proxy(unsafeWindow, proxyHandler);
    log('Stealth Interception Engine is ACTIVE.');
    
    // =================================================================================
    // SECTION 4: INITIALIZATION & BACKGROUND TASKS
    // =================================================================================
    (function initialize() {
        GM_addStyle(CONFIG.CSS_SELECTORS_TO_HIDE.join(', ') + ` { display: none !important; visibility: hidden !important; }`);
        
        // Start updating the blocklist in the background
        updateAndHydrateRemoteBlocklist();

        // ** NEW ** Just-In-Time Click Interceptor for Popups
        let hasClicked = false;
        window.addEventListener('click', () => {
            hasClicked = true;
        }, { capture: true, once: true });

        // We need to proxy the proxied window's open function
        const realOpen = unsafeWindow.open;
        if (realOpen) {
            unsafeWindow.open = function(...args) {
                if (!hasClicked) {
                    log('Blocked programmatic popup attempt before first user click.');
                    return null;
                }
                return realOpen.apply(this, args);
            };
        }
    })();

    // Helper functions (copied for completeness)
    function isBlocked(urlString) {
        if (!urlString) return false;
        for (const keyword of manualBlocklist) { if (urlString.includes(keyword)) return true; }
        if (remoteBlocklist.size > 0) {
            try {
                const url = new URL(urlString, window.location.origin);
                const hostname = url.hostname;
                for (const blockedDomain of remoteBlocklist) { if (hostname === blockedDomain || hostname.endsWith('.' + blockedDomain)) return true; }
            } catch (e) {}
        }
        return false;
    }
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
    async function updateAndHydrateRemoteBlocklist() {
        const lastUpdated = await GM_getValue('blocklistLastUpdated', 0);
        const cachedList = await GM_getValue('blocklistCache', null);
        const now = Date.now();
        const cacheAgeHours = (now - lastUpdated) / (1000 * 60 * 60);
        const useCache = () => { if (cachedList) remoteBlocklist = new Set(JSON.parse(cachedList)); };
        if (cachedList && cacheAgeHours < CONFIG.REMOTE_BLOCKLIST.UPDATE_INTERVAL_HOURS) { useCache(); }
        else {
            GM_xmlhttpRequest({
                method: 'GET', url: CONFIG.REMOTE_BLOCKLIST.URL,
                onload: (response) => {
                    if (response.status >= 200 && response.status < 300) {
                        remoteBlocklist = parseHostsFile(response.responseText);
                        GM_setValue('blocklistCache', JSON.stringify([...remoteBlocklist]));
                        GM_setValue('blocklistLastUpdated', Date.now());
                    } else { useCache(); }
                },
                onerror: () => { useCache(); }
            });
        }
    }
    const fakeFetchFn = function(resource, options) {
        const url = (resource instanceof Request) ? resource.url : String(resource);
        if (isBlocked(url)) {
            log(`[PROXY] Blocked FETCH: ${url}`);
            return Promise.resolve(new Response(null, { status: 204, statusText: "No Content" }));
        }
        return originalFetch.apply(unsafeWindow, arguments);
    };
    function FakeXMLHttpRequestFn() {
        const xhr = new originalXhr();
        const originalOpen = xhr.open;
        xhr.open = function(method, url) {
            if (isBlocked(url)) { this._isBlocked = true; }
            return originalOpen.apply(this, arguments);
        };
        const originalSend = xhr.send;
        xhr.send = function() {
            if (this._isBlocked) return;
            return originalSend.apply(this, arguments);
        };
        return xhr;
    }
    const proxyHandlerObj = {
        get: function(target, prop) {
            if (prop === 'fetch') return fakeFetchFn;
            if (prop === 'XMLHttpRequest') return FakeXMLHttpRequestFn;
            if (prop === 'open') return fakeOpen;
            const value = Reflect.get(target, prop);
            return typeof value === 'function' ? value.bind(target) : value;
        }
    };
    // Re-assigning to avoid redundancy, already defined above.
    //unsafeWindow = new Proxy(unsafeWindow, proxyHandlerObj);

})();
