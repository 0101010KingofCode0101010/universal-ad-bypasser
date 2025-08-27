# Universal Ad-Bypasser

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

The ultimate companion for your ad-blocker (uBlock Origin, AdGuard). This script is your **second layer of defense**, defeating aggressive anti-adblock scripts with a **dynamically updated, community-powered blocklist.**

---

## ✨ NEW in v2.0: Auto-Updating Blocklist!

This script now automatically fetches and caches a massive, professionally maintained list of ad, tracker, and malware domains from the [Steven Black hosts project](https://github.com/StevenBlack/hosts).

**What this means for you:**
-   **Effortless Power:** You get the blocking power of tens of thousands of rules without manually adding them.
-   **Always Up-to-Date:** The list silently updates itself every 24 hours, keeping you protected from new threats.
-   **Smarter Blocking:** Your browsing is safer and cleaner than ever before.

## 🤔 How It Works

Your primary ad-blocker is great for 99% of cases. Universal Ad-Bypasser handles the tough 1% by:
1.  **Fetching Community Lists:** Downloads a comprehensive list of known ad/malware domains.
2.  **Executing First:** Runs before the website's own scripts, getting a critical head start.
3.  **Direct Interception:** Overrides browser functions (`fetch`, `XHR`) to neutralize anti-adblock scripts before they can even run.

It's the intelligence unit that provides critical data to your main army.

## 🚀 Features

-   **✅ Auto-Updating Blocklist:** Stays current with thousands of rules from community sources.
-   **✅ Your Ad-Blocker's Best Friend:** Works perfectly alongside uBlock Origin, AdGuard, etc.
-   **✅ Defeats Aggressive Anti-Adblock:** Neutralizes scripts that complain about your ad-blocker.
-   **✅ Kills Popups & Pop-unders:** Prevents annoying new tabs from opening.
-   **✅ Lightweight & Fast:** Caches the blocklist for instant performance on every page load.

## 🔧 Installation

1.  You need a userscript manager. The best is **[Tampermonkey](https://www.tampermonkey.net/)**. Install it for your browser.
2.  Then, click the link below to install the script. The link always points to the latest version.

    **➡️ [Install Universal Ad-Bypasser](https://github.com/0101010KingofCode0101010/universal-ad-bypasser/raw/main/universal-ad-bypasser.user.js)**

3.  Tampermonkey will open. Simply review the permissions and click **"Install"**.

## ⚙️ Configuration

You can still add your own rules by editing the script in the Tampermonkey dashboard.

-   `MANUAL_BLOCKLIST`: Add your personal keywords or domains here. They will be combined with the remote list.
-   `REMOTE_BLOCKLIST`: You can change the URL to a different hosts file or adjust the update interval.

## 🤝 How to Contribute

Your help makes the script better for everyone!

-   **Report a Site:** Find a website where the script fails? Please [open an issue](https://github.com/0101010KingofCode0101010/universal-ad-bypasser/issues).
-   **Suggest Improvements:** Have an idea for a new feature? Fork the repository and submit a pull request!

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## ✨ Credits

Developed by [NoName](https://github.com/0101010KingofCode0101010).
