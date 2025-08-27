// ==UserScript==
// @name         Universal Ad-Bypasser
// @namespace    https://github.com/0101010KingofCode0101010/universal-ad-bypasser
// @version      2.1.0
// @description  Combines a dynamic community blocklist with precise keyword filtering to defeat the most aggressive anti-adblock scripts. The ultimate ad-blocker companion.
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
        // Chứa các TỪ KHÓA. Sẽ chặn BẤT KỲ URL nào chứa các từ này.
        // Dùng để chặn các script anti-adblock tự host (ví dụ: /assets/js/adblock.js)
        MANUAL_BLOCKLIST: [
            'ad-block', 'adblock', 'fuckadblock', 'anti-adblock',
            'adsbygoogle', 'popads.net', 'adsterra.com'
        ],
        // Chứa các TÊN MIỀN. Sẽ chặn các tên miền chính xác (hoặc tên miền phụ).
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
    
    // Khởi tạo các Set. `manualBlocklist` là để quét từ khóa, `remoteBlocklist` là để quét tên miền.
    const manualBlocklist = new Set(CONFIG.MANUAL_BLOCKLIST);
    let remoteBlocklist = new Set(); // Sẽ được điền bởi hàm update

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
            log('Loading remote blocklist from cache.');
            remoteBlocklist = new Set(JSON.parse(cachedList));
        } else {
            log(cachedList ? 'Cache is stale, fetching remote blocklist...' : 'No cache, fetching remote blocklist...');
            return new Promise((resolve) => {
                GM_xmlhttpRequest({
                    method: 'GET',
                    url: CONFIG.REMOTE_BLOCKLIST.URL,
                    onload: function(response) {
                        if (response.status >= 200 && response.status < 300) {
                            remoteBlocklist = parseHostsFile(response.responseText);
                            log(`Fetched and parsed ${remoteBlocklist.size} remote domains.`);
                            GM_setValue('blocklistCache', JSON.stringify([...remoteBlocklist]));
                            GM_setValue('blocklistLastUpdated', Date.now());
                        } else {
                            log(`Failed to fetch remote list (status: ${response.status}). Using cached list as fallback.`);
                            if (cachedList) remoteBlocklist = new Set(JSON.parse(cachedList));
                        }
                        resolve();
                    },
                    onerror: function(error) {
                        log('Error fetching remote blocklist. Using cached list as fallback.', error);
                        if (cachedList) remoteBlocklist = new Set(JSON.parse(cachedList));
                        resolve();
                    }
                });
            });
        }
    }

    // =================================================================================
    // SECTION 3: CORE LOGIC - HYBRID BLOCKING ENGINE
    // =================================================================================
    
    function isBlocked(urlString) {
        if (!urlString) return false;

        // BƯỚC 1: KIỂM TRA TỪ KHÓA THỦ CÔNG (Độ chính xác cao, ưu tiên hàng đầu)
        // Quét toàn bộ URL để tìm các từ khóa trong manualBlocklist.
        for (const keyword of manualBlocklist) {
            if (urlString.includes(keyword)) {
                log(`Blocked by MANUAL keyword [${keyword}] in URL: ${urlString}`);
                return true;
            }
        }

        // BƯỚC 2: KIỂM TRA TÊN MIỀN TỪ XA (Phạm vi rộng, hiệu năng cao)
        // Chỉ kiểm tra nếu Bước 1 không thành công.
        try {
            const url = new URL(urlString, window.location.origin);
            const hostname = url.hostname;

            for (const blockedDomain of remoteBlocklist) {
                // Chặn nếu tên miền khớp chính xác HOẶC là một tên miền phụ
                if (hostname === blockedDomain || hostname.endsWith('.' + blockedDomain)) {
                    log(`Blocked by REMOTE domain [${blockedDomain}]: ${hostname}`);
                    return true;
                }
            }
        } catch (e) {
            // URL không hợp lệ (ví dụ: 'about:blank'), bỏ qua bước này
        }
        
        return false;
    }

    function activateInterceptors() {
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
            // Phải kiểm tra url tồn tại, vì window.open() có thể được gọi không có tham số
            if (isBlocked(url || '')) {
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
                        log(`Dynamically removed element: ${node.className || node.id}`);
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
        // Tiêm CSS ngay lập tức để tránh FOUC (Flash of Unstyled Content)
        GM_addStyle(CONFIG.CSS_SELECTORS_TO_HIDE.join(', ') + 
            ` { display: none !important; visibility: hidden !important; opacity: 0 !important; width: 0 !important; height: 0 !important; }`);

        // Bắt đầu tải danh sách chặn trong nền
        await updateBlocklistIfNeeded();
        log(`Blocklist initialized with ${remoteBlocklist.size} remote rules and ${manualBlocklist.size} manual rules.`);
        
        // Kích hoạt các cơ chế chặn
        activateInterceptors();
        log('Universal Ad-Bypasser is fully active.');
    }

    initialize();
})();
