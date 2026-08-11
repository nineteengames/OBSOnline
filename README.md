<div align="center">
  <img src="public/favicon.svg" alt="OBSOnline Logo" width="120" />
  <h1>OBSOnline</h1>
  <p><strong>A powerful, web-based remote control interface for OBS Studio.</strong></p>

  <p>
    <a href="https://github.com/obsproject/obs-websocket"><img src="https://img.shields.io/badge/OBS%20WebSocket-v5.0-blue.svg?style=flat-square" alt="OBS WebSocket" /></a>
    <a href="https://react.dev/"><img src="https://img.shields.io/badge/React-18.x-61DAFB.svg?style=flat-square&logo=react" alt="React" /></a>
    <a href="https://vitejs.dev/"><img src="https://img.shields.io/badge/Vite-Ready-646CFF.svg?style=flat-square&logo=vite" alt="Vite" /></a>
    <a href="./LICENSE"><img src="https://img.shields.io/badge/License-GPLv3-green.svg?style=flat-square" alt="License: GPL v3" /></a>
  </p>
</div>

---

**OBSOnline** is a sleek, completely client-side web application that lets you control your OBS Studio instance from any browser on your network. Designed to look and feel exactly like the native OBS Studio interface, it features a familiar dark-mode UI, live audio meters, dynamic source control, and real-time streaming/recording status.

## ✨ Features

- 🎨 **Familiar UI**: A 1:1 replica of the OBS Studio layout, including movable and sortable docks.
- 🔄 **Live Scene Switching**: Seamlessly switch between scenes, update the Preview in Studio Mode, and trigger transitions.
- 🔊 **Real-time Audio Mixer**: Monitor your live audio inputs with zero-latency peak meters, volume sliders, and mute toggles.
- 📹 **Live Preview**: See a live-updating screenshot of your stream directly in the browser.
- 🔴 **Status & Timecodes**: Keep track of your exact stream and recording durations, CPU usage, and frame rates.
- ⚙️ **Source Properties**: Edit source settings (like window captures or display captures) on the fly via dynamically generated modal settings.

## 🚀 Getting Started

### Prerequisites
1. **OBS Studio** (v28.0.0 or newer)
2. **OBS WebSocket** must be enabled. 
   - In OBS Studio, go to `Tools` -> `WebSocket Server Settings`.
   - Check `Enable WebSocket server`.
   - Take note of the **Server Port** (default `4455`) and the **Server Password**.

### Using the App
Since OBSOnline is a 100% static web application, no backend server is required! The app connects directly from your browser to your OBS instance.

If you are hosting this on **GitHub Pages**, simply navigate to your deployed URL.

> **⚠️ Important Notice regarding HTTPS (Mixed Content):**
> If you are accessing OBSOnline via a secure `https://` connection (like GitHub Pages), your browser will block the local `ws://` connection to OBS Studio for security reasons. 
> 
> **To fix this in Google Chrome:**
> 1. Click the 🔒 (Lock) or 🎛️ (Tune) icon to the left of the URL bar.
> 2. Click **Site settings**.
> 3. Find **Insecure content** and change it from *Block* to **Allow**.
> 4. Reload the page.

## 🛠️ Local Development

If you want to modify or run the project locally on your machine:

1. Clone the repository:
   ```bash
   git clone https://github.com/YOUR_USERNAME/OBSOnline.git
   cd OBSOnline
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open the provided `localhost` URL in your browser.

## 📦 Deployment (GitHub Pages)

This repository comes pre-configured with a GitHub Actions workflow (`deploy.yml`) to automatically build and deploy the app to GitHub Pages.
Simply push your code to the `main` or `master` branch, ensure GitHub Actions are enabled in your repository settings, and set the Pages source to "GitHub Actions".

## 📄 License

This project is licensed under the **GNU GPLv3 License**. See the [LICENSE](LICENSE) file for more details.
