// ==UserScript==
// @name         Universal Ad-Bypasser
// @namespace    https://github.com/0101010KingofCode0101010/universal-ad-bypasser
// @version      2.5.0
// @description  Defeats anti-adblock by actively sabotaging detection scripts. Works with uBlock Origin to achieve total stealth.
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
        // ** NEW ** Variables to sabotage. These will be defined as empty, inert objects
        // to neutralize anti-adblock scripts that rely on them.
        SABOTAGE_VARIABLES: [
            'googletag', 'adsbygoogle', 'ad_block_detector', 'AdBlock', 'AdRevolver', 'adBlocked'
        ],
        MANUAL_BLOCKLIST: [ 'ad-block', 'adblock', 'fuckadblock', 'anti-adblock', 'googlesyndication.com', 'doubleclick.net', 'adsterra.com', 'popads.net' ],
        REMOTE_BLOCKLIST: { URL: 'https://raw.githubusercontent.com/StevenBlack/hosts/master/hosts', UPDATE_INTERVAL_HOURS: 24 },
        CSS_SELECTORS_TO_HIDE: [ '.ad', '.ads', '.adsbox', '.ad-banner', '.ad-container', '.ad-wrapper', '.ad-placeholder', '[id*="ads"]', '[id*="banner"]', '[id^="ad-"]', '[class*="ads"]', '[class*="banner"]', '[class^="ad-"]', '[aria-label*="advertisement"]', '.anti-adblock-overlay', '#adblock-popup' ]
    };

    const LOG_PREFIX = '[UAB]';
    function log(message, ...args) { if (CONFIG.debug) console.log(`${LOG_PREFIX} ${message}`, ...args); }

    // =================================================================================
    // SECTION 2: THE SABOTAGE ENGINE (Honeypot Injection)
    // =================================================================================
    
    // This function must run before any other script on the page.
    // It injects a script tag directly into the document's head.
    function injectHoneypotScript() {
        const script = document.createElement('script');
        let scriptContent = '';
        for (const varName of CONFIG.SABOTAGE_VARIABLES) {
            // Define each variable as a harmless empty object or a dummy function.
            // Using `defineProperty` makes it harder for sites to overwrite.
            scriptContent += `try { Object.defineProperty(window, '${varName}', { value: {}, writable: false }); } catch(e) {}\n`;
        }
        script.textContent = scriptContent;

        // Use MutationObserver to ensure the script is injected into the <head>
        // as soon as it exists, making it the first script to run.
        new MutationObserver((mutations, observer) => {
            const head = document.head || document.querySelector('head');
            if (head) {
                head.insertBefore(script, head.firstChild);
                observer.disconnect();
                log('Sabotage Engine (Honeypot) injected.');
            }
        }).observe(document.documentElement, { childList: true });
    }

    // =================================================================================
    // SECTION 3: STEALTH INTERCEPTION ENGINE & BLOCKLISTS
    // =================================================================================
    
    if (unsafeWindow.uabEngineActive) return;

    const manualBlocklist = new Set(CONFIG.MANUAL_BLOCKLIST);
    let remoteBlocklist = new Set();
    
    function isBlocked(urlString) { /* ... Unchanged ... */ }
    const originalFetch = unsafeWindow.fetch;
    const fakeFetch = function(resource, options) { /* ... Unchanged ... */ };
    const originalXhr = unsafeWindow.XMLHttpRequest;
    function FakeXMLHttpRequest() { /* ... Unchanged ... */ }
    const originalOpen = unsafeWindow.open;
    const fakeOpen = function(url, target, features){ /* ... Unchanged ... */ }

    const proxyHandler = {
        get: function(target, prop) {
            if (prop === 'fetch') return fakeFetch;
            if (prop === 'XMLHttpRequest') return FakeXMLHttpRequest;
            if (prop === 'open') return fakeOpen;
            const value = Reflect.get(target, prop);
            return typeof value === 'function' ? value.bind(target) : value;
        }
    };

    unsafeWindow.uabEngineActive = true;
    unsafeWindow = new Proxy(unsafeWindow, proxyHandler);
    log('Stealth Interception Engine is ACTIVE.');
    
    // =================================================================================
    // SECTION 4: INITIALIZATION & BACKGROUND TASKS
    // =================================================================================
    (function initialize() {
        // ** PRIORITY 1: ** Inject the honeypot immediately.
        injectHoneypotScript();

        // Then, proceed with other tasks.
        GM_addStyle(CONFIG.CSS_SELECTORS_TO_HIDE.join(', ') + ` { display: none !important; visibility: hidden !important; }`);
        updateAndHydrateRemoteBlocklist();
    })();
    
    // --- Helper functions (Copied for completeness) ---
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
        xhr.send = function() { if (this._isBlocked) return; return originalSend.apply(this, arguments); };
        return xhr;
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
                        remoteBlocklist = parseHostsFile(response.responseText); GM_setValue('blocklistCache', JSON.stringify([...remoteBlocklist])); GM_setValue('blocklistLastUpdated', Date.now());
                    } else { useCache(); }
                },
                onerror: () => { useCache(); }
            });
        }
    }
    function parseHostsFile(text) {
        const domains = new Set();
        const lines = text.split('\n');
        for (const line of lines) {
            if (line.startsWith('#') || line.trim() === '') continue;
            const parts = line.split(/\s+/);
            if (parts.length >= 2 && (parts[0] === '0.0.0.0' || parts[0] === '127.0.0.1')) { domains.add(parts[1].trim()); }
        }
        return domains;
    }
})();
