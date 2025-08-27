# Universal Ad-Bypasser

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

The perfect companion for your ad-blocker (like uBlock Origin or AdGuard). This script acts as a **second layer of defense**, specializing in defeating stubborn websites with aggressive anti-adblock mechanisms.

---

## 🤔 How It Works

Your primary ad-blocker (like uBlock Origin) is excellent and handles 99% of ads and trackers using powerful filter lists. However, some websites deploy custom, aggressive scripts to detect and block these extensions.

**Universal Ad-Bypasser fills that 1% gap.** It uses advanced, direct-interception techniques that ad-blocker extensions often can't, such as:
-   Executing *before* the website's own scripts run (`@run-at document-start`).
-   Directly overriding browser functions (`fetch`, `XMLHttpRequest`, `window.open`) to neutralize anti-adblock and tracker scripts before they can even execute.

It's the special forces unit that supports your main army.

## 🚀 Features

-   **✅ Your Ad-Blocker's Best Friend:** Designed to work seamlessly alongside uBlock Origin, AdGuard, and other blockers, without conflicts.
-   **✅ Defeats Aggressive Anti-Adblock:** Neutralizes scripts that detect and complain about your ad-blocker.
-   **✅ Proactive Interception:** Blocks ad/tracker requests before they are made, saving bandwidth and improving privacy.
-   **✅ Kills Popups & Pop-unders:** Prevents annoying new windows and tabs from opening.
-   **✅ Dynamic Content Removal:** Uses `MutationObserver` to find and remove ad elements injected into the page after it loads.
-   **✅ Lightweight & Fast:** Minimal performance impact.

## 🔧 Installation

1.  First, you need a userscript manager. The most popular one is **[Tampermonkey](https://www.tampermonkey.net/)**. Install it for your browser (Chrome, Firefox, Edge, etc.).
2.  Then, click the installation link below to add the script to Tampermonkey:

    **➡️ [Install Universal Ad-Bypasser](https://github.com/0101010KingofCode0101010/universal-ad-bypasser/raw/main/universal-ad-bypasser.user.js)**

3.  Tampermonkey will open, showing the script's source code. Simply click **"Install"**.

## ⚙️ Configuration

You can easily customize the script's blocklists by editing it in the Tampermonkey dashboard.

-   `CONFIG.debug`: Set to `true` to see what the script is blocking in your browser's developer console (F12).
-   `CONFIG.BLOCKLIST`: Add new domains or keywords to block.
-   `CONFIG.CSS_SELECTORS_TO_HIDE`: Add new CSS selectors for ad containers that need to be hidden.

## 🤝 How to Contribute

Found a stubborn site? Help make the script better!

-   **Report Issues:** If you find a website where the script doesn't work or breaks functionality, please [open an issue](https://github.com/0101010KingofCode0101010/universal-ad-bypasser/issues).
-   **Suggest Blocklist Additions:** Find a new ad or anti-adblock domain? Open an issue or create a pull request to add it to the `BLOCKLIST`.
-   **Improve the Code:** Feel free to fork the repository and submit a pull request with your enhancements.

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## ✨ Credits

Developed by [NoName](https://github.com/0101010KingofCode0101010).
