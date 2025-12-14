# 🚀 Exploring Odoo - N2 Branch

## ⚙️ About the N2 Branch

This branch is specifically dedicated to **N2-related modules**.

If you find this useful, consider giving the repo a **star ⭐️** — it helps keep the project visible and motivates continued work!

---

## Current State of N2 Development

The N2 project is currently under private development.

### About N2

N2 is a personal, experimental project designed as a learning reference and guide. It’s not a commercial product—its main goal is to explore ideas and provide a resource for anyone curious to learn.

---

### Note on Availability

The site at https://n2.skysize.io is no longer available and could not be restored. As it was hosted on a free tier and used a free subdomain, occasional disruptions like this are unfortunately possible, and support options were limited.

To minimize any impact on users, no critical data is stored on the website. You can always sign in using your GitHub account, so your access and work are not tied to a specific domain.

For transparency, the website only requests the `user:email` scope during GitHub OAuth. This permission is used solely for authentication and to check whether the user has starred the repository, and is not used for any other purpose.

### Quick Update

-   The website is now available under a new domain: https://nuido2.skysize.io.  
    Please update your bookmarks accordingly.
-   The following modules are currently available on the website:

    -   `n2`
    -   `n2_ui`
    -   `n2_trigger`
    -   `n2_data`
    -   `n2_messaging`
    -   `n2_elk`
    -   `n2_ai`

        More modules are coming.

-   Basic documentation for **N2** is now available, including:
    -   Quick start
    -   Core concepts
    -   Base framework
    -   Creating custom nodes
    -   Documentation for core nodes and extension nodes, such as trigger nodes, data nodes, and more will be added.

---

### 🧭 Roadmap

The roadmap below outlines current and planned improvements.

-   [x] **Undo / Redo** — Add reversible actions for node editing and movement.
-   [x] **New Node Styles** — New, more compact node styles to provide additional workspace.
-   [x] **Keyboard Shortcuts** — Add keyboard shortcuts.
-   [x] **Minimap** — Add an overview of the full workspace for easier navigation.
-   [x] **Export / Import** — Enable saving and loading of node structures.
-   [x] **Hints on Nodes** — Add tooltips or info buttons showing what each node does (the framework is complete, but not all nodes have tooltips yet).
-   [x] **Linked Node Properties** - New mechanism supports setting properties on connected auxiliary nodes.
-   [x] **Automatic Layout** — This feature is implemented using `elk-js`.
-   [x] **Replicate Nuido Nodes to N2** — Implement nodes modeled after existing Nuido nodes.
    -   [x] Core Nodes
    -   [x] Trigger Nodes
    -   [x] Data Nodes
    -   [x] Messaging Nodes
    -   [x] AI Nodes
    -   [x] Action Nodes
-   [ ] ???

---

This repository contains the **source code** featured on the YouTube channel **[Exploring Odoo](https://www.youtube.com/@exploring-odoo)**.

**⚠️ IMPORTANT:** Make sure you are on the **correct branch** for the code you're seeking.

---

### Introduction Video

<p align="center">
<a href="https://youtu.be/GIeGJpBWBvQ">
<img src="https://img.youtube.com/vi/GIeGJpBWBvQ/0.jpg"/>
</a>
</p>

---

### Screenshots, Previews and Demo

#### Previews

<details>
<summary>N2 In Action (Animated Gif)</summary>
<br/>
<p align="center">
  <img src="./images/preview.gif" width="800px" alt="preview" />
</p>
</details>

#### Dark Mode

<details>
<summary>Screenshot 001</summary>
<br/>
<p align="center">
  <img src="./images/screenshot_001.png" width="800px" alt="Screenshot 001" />
</p>
</details>

##### Note on Dark Mode

The dark mode screenshots above use my custom theme based on the Solarized color palette. If your dark mode isn’t Solarized-based or you’d like to customize it, adjust the variables in variable.dark.scss to fit your preferred theme.

#### Light Mode

<details>
<summary>Screenshot 002</summary>
<br/>
<p align="center">
  <img src="./images/screenshot_002.png" width="800px" alt="Screenshot 002" />
</p>
</details>

---

#### Demo

-   Basic demo available at [N2 Website](https://nuido2.skysize.io/). The demo includes only basic nodes, as N2 depends on actual data to deliver meaningful functionality.
-   The simulation is limited to generating a random graph traversal. It does not make any backend calls, and consequently no data is handled or processed.

---

## 🎯 Prerequisites & Target Audience

This branch is **NOT for total beginners**.

-   You should be **comfortable** with core Odoo frameworks such as the **ORM, OWL, and QWeb**.
-   While the code itself avoids advanced techniques, the **concepts** presented in this branch can be **overwhelming and confusing** for someone new to Odoo development.

---

## 📺 Essential Usage Tip

To properly use and understand code on this repository, it is **absolutely essential** to watch the related video on the **[Exploring Odoo channel](https://www.youtube.com/@exploring-odoo)** _thoroughly_.

-   **External Libraries:** Information about external libraries and their required links are provided in the **video description**.
-   **Always check the video description and watch the video entirely** to avoid common setup issues (e.g., missing Chart.js extensions).

---

## 🚨 Critical Disclaimers & Limitations

Please read and understand these points before using the code.

### ⚠️ **Experimental and Educational Use ONLY** ⚠️

-   **Do not use this code, repository, or any of its components in any live, production, mission-critical, or commercial environment.**
-   This project is developed and maintained **solely for experimental, educational, and personal learning purposes.**
-   While this code is **open-source** under the **MIT License**, and the license may technically allow commercial use, deploying it in a production setting is **strongly discouraged and counterproductive** to the project's goal.
-   Its use in commercial settings would be entirely at your own risk. Moreover, the **pressure and demands** resulting from production usage may unfortunately force the maintainers to **stop or significantly slow down development**. Please respect the project's educational focus to ensure its continued evolution.
-   I am **not responsible** for any damage or harm resulting from the use of anything from this repo. **Use it at your own risk.**

### 🐛 No Support

-   This repository serves as an **archive** for the videos.
-   Testing was minimal—only performed for the **specific scenario** of the related video.
-   **I do not provide support in any kind.**
-   The goal of this repo and the channel is to **help you learn**, not to provide you with a fully functional, production-ready module.

### 🧩 Bug Fixes & Feature Development

-   **Bug fixes, enhancements, or new features will only be implemented when they align with planned or upcoming content** for the **[Exploring Odoo](https://www.youtube.com/@exploring-odoo)** YouTube channel.
-   Development priorities are guided **exclusively** by the channel’s educational roadmap — **not by external requests or issue reports**.
-   If you’d like to see certain features or topics explored, the best way to **influence future development** is by **⭐ starring this repository** and **📺 subscribing to the channel**.
    Both actions help signal community interest and directly motivate which areas receive attention in future videos.
-   Requests and suggestions are always welcome for discussion, but **implementation is not guaranteed** unless they align with upcoming content.
-   This ensures the project remains focused on its core purpose as a **teaching and exploration resource**, rather than evolving into a general-purpose or production-ready framework.

### ❌ No Upgrade Path

-   **There are no upgrade/update paths for these modules.**
-   If you want to use an updated version, you will most likely need to **uninstall the previous version first** or install it on a fresh Odoo instance.

---

## 🤝 Contributing

Since this repository is maintained purely for archiving and proof-of-concept purposes:

-   **I am not accepting Pull Requests (PRs).**
-   You are **more than welcome** to open a **discussion** to share your thoughts, ideas, experiences, or difficulties regarding the modules.
-   The best way to contribute and support the project is by giving the repository a star ⭐️. It's a quick action that helps keep the project visible, validates the effort put into the videos, and motivates continued work on new content and modules.
-   If you are having trouble with the code and wish to ask a question, please do so **politely and nicely**.

---

## 📄 Licensing of Modules

Most modules in this repository are licensed under the **MIT License**.
However, **not all modules share the same license**.

-   The **`n2` module on the `N2` branch is MIT-licensed**.
-   **Other modules related to N2 may use different licenses** and **are not MIT**.

To avoid confusion and ensure clarity:

> **Always check the `LICENSE` file inside each individual module directory** for the exact terms that apply to that module.

Each module’s license file is authoritative and may differ from others in this repository.

---

## 📌 Additional Usage Notes (Fork vs. Clone)

-   **Cloning Recommended:** Since this repository is actively and frequently updated to match the latest YouTube content, a direct **`git clone`** is the recommended method for obtaining and working with the code.
-   **Forking Not Recommended:** For most users, **forking is not recommended**. Forks create an independent copy that can quickly become outdated. Manually syncing your fork with this upstream repository would be more complicated than simply pulling changes to a direct clone.
-   **Best Practice:** To ensure you always have the latest version of the code featured in the videos, use a direct clone and perform a regular `git pull`.
