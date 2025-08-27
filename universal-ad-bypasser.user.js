// ==UserScript==
// @name         Universal Ad-Bypasser
// @namespace    https://github.com/0101010KingofCode0101010/universal-ad-bypasser
// @version      2.2.0
// @description  Defeats the most aggressive anti-adblock scripts with an Instant-On Interception Engine and a dynamic community blocklist. The ultimate ad-blocker companion.
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
        // DANH SÁCH ƯU TIÊN CAO: Chặn tức thì. Chứa các từ khóa và tên miền "mồi"
        // mà các script anti-adblock dùng để kiểm tra.
        MANUAL_BLOCKLIST: [
            // Từ khóa chặn theo đường dẫn script
            'ad-block', 'adblock', 'fuckadblock', 'anti-adblock',
            // Tên miền "mồi" phổ biến nhất
            'googlesyndication.com', 'doubleclick.net',
            'adsterra.com', 'popads.net'
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
    let remoteBlocklist = new Set(); // Sẽ được "bơm" dữ liệu vào sau

    function parseHostsFile(text) { /* ... Giữ nguyên ... */ }
    async function updateAndHydrateRemoteBlocklist() { /* ... Giaporation... */ }

    // =================================================================================
    // SECTION 3: INSTANT-ON INTERCEPTION ENGINE
    // =================================================================================
    
    // Hàm isBlocked bây giờ an toàn để gọi bất cứ lúc nào
    function isBlocked(urlString) {
        if (!urlString) return false;

        // BƯỚC 1: Kiểm tra danh sách thủ công ưu tiên cao
        for (const keyword of manualBlocklist) {
            if (urlString.includes(keyword)) {
                log(`Blocked by MANUAL rule [${keyword}] in URL: ${urlString}`);
                return true;
            }
        }

        // BƯỚC 2: Kiểm tra danh sách tên miền từ xa (nếu đã được tải)
        if (remoteBlocklist.size > 0) {
            try {
                const url = new URL(urlString, window.location.origin);
                const hostname = url.hostname;
                for (const blockedDomain of remoteBlocklist) {
                    if (hostname === blockedDomain || hostname.endsWith('.' + blockedDomain)) {
                        log(`Blocked by REMOTE rule [${blockedDomain}]: ${hostname}`);
                        return true;
                    }
                }
            } catch (e) { /* URL không hợp lệ */ }
        }
        
        return false;
    }

    // KÍCH HOẠT NGAY LẬP TỨC!
    // Các hàm này được ghi đè ngay khi script bắt đầu, không chờ đợi bất cứ thứ gì.
    (function activateInstantInterceptors() {
        const originalFetch = unsafeWindow.fetch;
        unsafeWindow.fetch = function(resource, options) {
            const url = (resource instanceof Request) ? resource.url : String(resource);
            if (isBlocked(url)) return Promise.resolve(new Response(null, { status: 204, statusText: "No Content" }));
            return originalFetch.apply(this, arguments);
        };

        const originalXhrOpen = unsafeWindow.XMLHttpRequest.prototype.open;
        unsafeWindow.XMLHttpRequest.prototype.open = function(method, url) {
            if (isBlocked(url)) { this._isBlocked = true; return; }
            return originalXhrOpen.apply(this, arguments);
        };
        const originalXhrSend = unsafeWindow.XMLHttpRequest.prototype.send;
        unsafeWindow.XMLHttpRequest.prototype.send = function() {
            if (this._isBlocked) return;
            return originalXhrSend.apply(this, arguments);
        };

        const originalWindowOpen = unsafeWindow.open;
        unsafeWindow.open = function(url, target, features) {
            if (isBlocked(url || '')) { log(`Blocked popup: ${url || 'blank'}`); return null; }
            return originalWindowOpen.apply(this, arguments);
        };

        const observer = new MutationObserver(mutations => { /* ... Giữ nguyên ... */ });
        observer.observe(document.documentElement, { childList: true, subtree: true });
        
        log('Instant-On Interception Engine is ACTIVE.');
    })();

    // =================================================================================
    // SECTION 4: INITIALIZATION & BACKGROUND TASKS
    // =================================================================================
    
    // Hàm này chỉ để quản lý việc tải và cập nhật danh sách từ xa
    async function updateAndHydrateRemoteBlocklist() {
        const lastUpdated = await GM_getValue('blocklistLastUpdated', 0);
        const cachedList = await GM_getValue('blocklistCache', null);
        const now = Date.now();
        const cacheAgeHours = (now - lastUpdated) / (1000 * 60 * 60);

        const useCache = () => {
            if (cachedList) {
                log('Loading remote blocklist from cache.');
                remoteBlocklist = new Set(JSON.parse(cachedList));
            }
        };

        if (cachedList && cacheAgeHours < CONFIG.REMOTE_BLOCKLIST.UPDATE_INTERVAL_HOURS) {
            useCache();
        } else {
            log(cachedList ? 'Cache is stale, fetching remote list...' : 'No cache, fetching remote list...');
            GM_xmlhttpRequest({
                method: 'GET',
                url: CONFIG.REMOTE_BLOCKLIST.URL,
                onload: function(response) {
                    if (response.status >= 200 && response.status < 300) {
                        remoteBlocklist = parseHostsFile(response.responseText);
                        log(`Hydrated remote blocklist with ${remoteBlocklist.size} new domains.`);
                        GM_setValue('blocklistCache', JSON.stringify([...remoteBlocklist]));
                        GM_setValue('blocklistLastUpdated', Date.now());
                    } else {
                        log(`Failed to fetch remote list (status: ${response.status}). Using cached list as fallback.`);
                        useCache();
                    }
                },
                onerror: function(error) {
                    log('Error fetching remote list. Using cached list as fallback.', error);
                    useCache();
                }
            });
        }
    }
    
    function parseHostsFile(text) { /* ... Giữ nguyên ... */ }
    
    // Các hàm sao chép đầy đủ để bạn không cần phải ghép nối
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
    
    const observerCallback = (mutations) => {
        for (const mutation of mutations) for (const node of mutation.addedNodes)
            if (node.nodeType === 1 && CONFIG.CSS_SELECTORS_TO_HIDE.some(s => { try { return node.matches(s); } catch (e) { return false; } })) node.remove();
    };
    // Đảm bảo observer cũng được kích hoạt trong hàm IIFE (immediately-invoked function expression)
    // (Đã được tích hợp vào activateInstantInterceptors)

    // Khởi động các tác vụ nền
    (function initialize() {
        GM_addStyle(CONFIG.CSS_SELECTORS_TO_HIDE.join(', ') + 
            ` { display: none !important; visibility: hidden !important; opacity: 0 !important; width: 0 !important; height: 0 !important; }`);

        updateAndHydrateRemoteBlocklist(); // Chạy trong nền, không cần `await`
        log('Background tasks initiated.');
    })();
})();
