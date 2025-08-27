# Universal Ad-Bypasser

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

The ultimate companion for your ad-blocker, now featuring an **Instant-On Interception Engine** to defeat the most aggressive, time-sensitive anti-adblock scripts.

---

## ✨ NEW in v2.2: The Instant-On Interception Engine!

Some websites are tricky. They run an anti-adblock check the *instant* the page starts loading, trying to win the "race" against blocker scripts. Version 2.2 is engineered to win that race, every time.

**How it works:**
1.  **Instant Activation:** The moment the script runs, its core blocking functions (`fetch`, `XHR`) are *immediately* activated. There is zero delay.
2.  **Priority Blocking:** It instantly starts blocking using a small, high-priority list of known anti-adblock "bait" domains and keywords.
3.  **Background Hydration:** While the priority shield is active, the script silently fetches and "hydrates" the massive community blocklist in the background for comprehensive protection.

This new architecture ensures that no anti-adblock script can slip through during the first few milliseconds of page load.

## 🚀 Features

-   **✅ Instant-On Interception Engine:** Wins the race against the fastest anti-adblock scripts.
-   **✅ Hybrid Blocking Power:** Combines a high-priority manual list with a massive, auto-updating community list.
-   **✅ Your Ad-Blocker's Best Friend:** Works perfectly alongside uBlock Origin, AdGuard, etc.
-   **✅ Kills Popups & Pop-unders.**
-   **✅ Lightweight & Fast:** Caches the main blocklist and uses an efficient, instant-on approach.

## 🔧 Installation

1.  You need a userscript manager like **[Tampermonkey](https://www.tampermonkey.net/)**.
2.  Click the link below to get the latest, most powerful version:

    **➡️ [Install Universal Ad-Bypasser](https://github.com/0101010KingofCode0101010/universal-ad-bypasser/raw/main/universal-ad-bypasser.user.js)**

3.  Click **"Install"** in the Tampermonkey tab that opens.

## ⚙️ Configuration

-   `MANUAL_BLOCKLIST`: This is now your high-priority list. Add keywords or domains here that need to be blocked *instantly*.
-   `REMOTE_BLOCKLIST`: The URL for the main community list, loaded in the background.

## 🤝 How to Contribute

-   **Report a Site:** Find a website that still gets through? [Open an issue](https://github.com/0101010KingofCode0101010/universal-ad-bypasser/issues). Your report helps make the script smarter.
-   **Suggest Improvements:** Fork the repository and submit a pull request!

## 📄 License

This project is licensed under the MIT License.

## ✨ Credits

Developed by [NoName](https://github.com/0101010KingofCode0101010).
