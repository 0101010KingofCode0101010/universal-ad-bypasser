# Universal Ad-Bypasser

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

The ultimate ad-blocker companion, featuring a **Stealth Proxy Engine** to bypass function integrity checks and an advanced **Just-In-Time Click Interceptor** to block event-based popups.

---

## ✨ NEW in v2.4: Just-In-Time Click Interception!

**The Problem:** Many sites have defeated traditional popup blockers by attaching a listener to the entire page. They wait for your *first click*—anywhere on the page—to trigger an unwanted popup.

**The Solution:** This version introduces a **Just-In-Time Click Interceptor**.
-   **It gets ahead of the website.** Using event capturing, our script's click listener runs *before* the website's.
-   **It temporarily disarms `window.open`.** For a few milliseconds after your first click, the ability to open popups is neutralized.
-   **The site's popup script fires, but its weapon is disabled.** It tries to call `window.open` and fails silently.
-   **Normal functionality is restored instantly,** so legitimate links and actions are not affected.

This surgical strike defeats the most common and annoying form of pop-under ads.

## 🚀 Features

-   **✅ Advanced Popup Blocking:** Defeats "first-click" and event-based popups.
-   **✅ Undetectable Stealth Engine:** Bypasses anti-adblock that uses function integrity (`toString()`) checks.
-   **✅ Hybrid Blocking Power:** Combines a high-priority manual list with a massive, auto-updating community list.
-   **✅ Your Ad-Blocker's Best Friend:** Works in harmony with uBlock Origin, AdGuard, etc.
-   **✅ Lightweight & Fast:** Caches the main blocklist for instant performance.

## 🔧 Installation

1.  You need a userscript manager like **[Tampermonkey](https://www.tampermonkey.net/)**.
2.  Click the link below to install the latest, most powerful version:

    **➡️ [Install Universal Ad-Bypasser](https://github.com/0101010KingofCode0101010/universal-ad-bypasser/raw/main/universal-ad-bypasser.user.js)**

3.  Click **"Install"** in the Tampermonkey tab that opens.

## 🤝 How to Contribute

-   **Report a Site:** Find a website that still gets through? Please [open an issue](https://github.com/0101010KingofCode0101010/universal-ad-bypasser/issues).
-   **Suggest Improvements:** Fork the repository and submit a pull request!

## 📄 License

This project is licensed under the MIT License.

## ✨ Credits

Developed by [NoName](https://github.com/0101010KingofCode0101010).
