# universal-ad-bypasser

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A powerful, lightweight, and configurable userscript to block ads, popups, trackers, and bypass anti-adblock mechanisms on most websites. A standalone alternative to ad-blocking extensions.

---

## 🚀 Features

-   **✅ Universal Blocking:** Works on a wide range of websites without site-specific configuration.
-   **✅ Proactive Interception:** Blocks ad scripts from loading using `fetch` and `XHR` interception, saving bandwidth.
-   **✅ Popup & Pop-under Blocking:** Prevents annoying new windows and tabs from opening.
-   **✅ Dynamic Content Removal:** Uses `MutationObserver` to detect and remove ads injected after the page has loaded.
-   **✅ Lightweight:** Minimal performance impact compared to full-featured browser extensions.
-   **✅ Highly Configurable:** Easily add your own blocked domains or CSS selectors by editing the script.

## 🔧 Installation

1.  You need a userscript manager. The most popular one is **[Tampermonkey](https://www.tampermonkey.net/)**. Install it for your browser (Chrome, Firefox, Edge, Safari, etc.).
2.  Click the installation link below to add the script to Tampermonkey:

    **➡️ [Install Universal Ad-Bypasser](https://github.com/NoName/universal-ad-bypasser/raw/main/universal-ad-bypasser.user.js)**

3.  Tampermonkey will open a new tab. Review the script's permissions and click **"Install"**.

## ⚙️ Configuration

You can customize the script's behavior by editing it directly in the Tampermonkey dashboard.

-   `CONFIG.debug`: Set to `true` to see blocked requests in the browser's developer console (F12).
-   `CONFIG.BLOCKLIST`: Add new domains or keywords to block.
-   `CONFIG.CSS_SELECTORS_TO_HIDE`: Add new CSS selectors for ad containers that need to be hidden.

## 🤝 How to Contribute

Contributions are welcome! You can help improve this script in several ways:

-   **Report Issues:** If you find a website where the script doesn't work or breaks functionality, please [open an issue](https://github.com/NoName/universal-ad-bypasser/issues).
-   **Suggest Blocklist Additions:** Find a new ad domain? Open an issue or create a pull request to add it to the `BLOCKLIST`.
-   **Improve the Code:** Feel free to fork the repository and submit a pull request with your enhancements.

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## ✨ Credits

Developed by [NoName](https://github.com/NoName).
