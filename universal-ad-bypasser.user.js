// ==UserScript==
// @name         Universal Ad-Bypasser
// @namespace    https://github.com/0101010KingofCode0101010/universal-ad-bypasser
// @version      1.0.0
// @description  A powerful, lightweight, and configurable userscript to block ads, popups, trackers, and bypass anti-adblock mechanisms on most websites. A standalone alternative to ad-blocking extensions.
// @author       NoName
// @match        *://*/*
// @exclude      /^https?://(www\.)?(google|youtube|facebook|twitter|instagram)\..*/
// @grant        unsafeWindow
// @grant        GM_addStyle
// @run-at       document-start
// @license      MIT
// ==/UserScript==

(function() {
    'use strict';

    // SECTION 1: CONFIGURATION
    const CONFIG = {
        debug: false,
        BLOCKLIST: [
            'googlesyndication.com', 'doubleclick.net', 'adservice.google.com', 'adsterra.com',
            'exoclick.com', 'popads.net', 'ad-maven.com', 'propellerads.com', 'yandex.ru/ads',
            'google-analytics.com', 'yandex.ru/metrika', 'hotjar.com', 'clarity.ms', 'taboola.com',
            'outbrain.com', 'disqus.com', 'ad-block', 'adblock', 'fuckadblock', 'anti-adblock'
        ],
        CSS_SELECTORS_TO_HIDE: [
            '.ad', '.ads', '.adsbox', '.ad-banner', '.ad-container', '.ad-wrapper', '.ad-placeholder',
            '[id*="ads"]', '[id*="banner"]', '[id^="ad-"]', '[class*="ads"]', '[class*="banner"]',
            '[class^="ad-"]', '[aria-label*="advertisement"]', '.anti-adblock-overlay', '#adblock-popup'
        ]
    };

    // SECTION 2: CORE LOGIC
    const LOG_PREFIX = '[UAB]';
    function log(message) { if (CONFIG.debug) console.log(`${LOG_PREFIX} ${message}`); }

    const cssToInject = CONFIG.CSS_SELECTORS_TO_HIDE.join(', ') +
        ` { display: none !important; visibility: hidden !important; opacity: 0 !important; width: 0 !important; height: 0 !important; }`;
    GM_addStyle(cssToInject);

    const originalFetch = unsafeWindow.fetch;
    const originalXhrOpen = unsafeWindow.XMLHttpRequest.prototype.open;
    const originalWindowOpen = unsafeWindow.open;

    function isBlocked(urlString) {
        try {
            const url = new URL(urlString, window.location.origin);
            return CONFIG.BLOCKLIST.some(keyword => url.href.includes(keyword));
        } catch (e) {
            return CONFIG.BLOCKLIST.some(keyword => urlString.includes(keyword));
        }
    }

    unsafeWindow.fetch = function(resource, options) {
        const url = (resource instanceof Request) ? resource.url : resource;
        if (isBlocked(url)) {
            log(`Blocked FETCH: ${url}`);
            return Promise.resolve(new Response(null, { status: 204, statusText: "No Content" }));
        }
        return originalFetch.apply(this, arguments);
    };

    unsafeWindow.XMLHttpRequest.prototype.open = function(method, url) {
        if (isBlocked(url)) {
            log(`Blocked XHR: ${url}`);
            this._isBlocked = true;
            return;
        }
        return originalXhrOpen.apply(this, arguments);
    };
    const originalXhrSend = unsafeWindow.XMLHttpRequest.prototype.send;
    unsafeWindow.XMLHttpRequest.prototype.send = function() {
        if (this._isBlocked) return;
        return originalXhrSend.apply(this, arguments);
    };

    unsafeWindow.open = function(url) {
        if (!url || url.startsWith('about:blank') || isBlocked(url)) {
            log(`Blocked popup: ${url || 'blank'}`);
            return null;
        }
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
    log('Universal Ad-Bypasser is active.');
})();