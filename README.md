# Universal Ad-Bypasser

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

The ultimate companion for your ad-blocker. This script combines a massive, auto-updating domain blocklist with precise, keyword-based filtering to defeat even the most aggressive, self-hosted anti-adblock scripts.

---

## ✨ NEW in v2.1: The Hybrid Blocking Engine!

This version introduces a powerful **dual-check mechanism**, getting the best of both worlds:

1.  **Precision Keyword Filtering (Your `MANUAL_BLOCKLIST`):**
    *   **How:** Scans the *entire URL* for specific keywords (like `adblock`, `anti-adblock`).
    *   **Why:** This is the "scalpel". It catches tricky, self-hosted scripts (e.g., `domain.com/js/anti-adblock.js`) that broad-spectrum blockers miss. This is what makes it work on sites like `lxmanga`.

2.  **Broad Domain Blocking (The `REMOTE_BLOCKLIST`):**
    *   **How:** Checks the *domain name* against a massive, auto-updating list of tens of thousands of known ad/tracker domains.
    *   **Why:** This is the "shotgun". It provides comprehensive, high-performance blocking of common ad networks.

This hybrid engine ensures maximum compatibility and blocking power, crushing both common ads and site-specific anti-adblock.

## 🚀 Features

-   **✅ Hybrid Blocking Engine:** Catches both broad ad-networks and specific anti-adblock scripts.
-   **✅ Auto-Updating Blocklist:** Stays current with thousands of rules from community sources.
-   **✅ Your Ad-Blocker's Best Friend:** Works perfectly alongside uBlock Origin, AdGuard, etc.
-   **✅ Defeats Aggressive Anti-Adblock:** The #1 reason to use this script.
-   **✅ Kills Popups & Pop-unders.**
-   **✅ Lightweight & Fast:** Caches the blocklist for instant performance.

## D_🔧 Installation

1.  You need a userscript manager like **[Tampermonkey](https://www.tampermonkey.net/)**.
2.  Click the link below to install the latest version:

    **➡️ [Install Universal Ad-Bypasser](https://github.com/0101010KingofCode0101010/universal-ad-bypasser/raw/main/universal-ad-bypasser.user.js)**

3.  Click **"Install"** in the Tampermonkey tab that opens.

## ⚙️ Configuration

You can power-up the script by editing it in the Tampermonkey dashboard.

-   `MANUAL_BLOCKLIST`: Add keywords here to stop a specific site's anti-adblock.
-   `REMOTE_BLOCKLIST`: Change the URL to a different hosts file or adjust the update interval.
-   `CSS_SELECTORS_TO_HIDE`: Add CSS classes/IDs to hide empty ad boxes.

## 🤝 How to Contribute

-   **Report a Site:** Find a website that defeats the script? Please [open an issue](https://github.com/0101010KingofCode0101010/universal-ad-bypasser/issues).
-   **Suggest Improvements:** Fork the repository and submit a pull request!

## 📄 License

This project is licensed under the MIT License.

## ✨ Credits

Developed by [NoName](https://github.com/0101010KingofCode0101010).
