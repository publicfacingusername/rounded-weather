# Rounded Weather

A simple Progressive Web App (PWA) that displays the current weather for a given US ZIP code. It shows the temperature rounded to the nearest 5 degrees, with an option to toggle to the "real feel" temperature and see a brief weather description.

The backend is a Cloudflare Worker that acts as a proxy to the OpenWeatherMap API, fetching weather data based on the provided ZIP code.

## Features

*   Displays current temperature (rounded and real feel).
*   Shows location name and a weather condition emoji.
*   Allows users to input a US ZIP code.
*   Basic PWA functionality (installable, offline support for app shell via Service Worker).

## Tech Stack

*   **Frontend:** HTML, CSS, JavaScript, Service Worker
*   **Backend:** Cloudflare Workers (TypeScript)
*   **API:** OpenWeatherMap (for weather data)

## Setup and Running

### Frontend (Static Files)

The frontend consists of static HTML, CSS, and JavaScript files (`index.html`, `styles.css`, `app.js`, `sw.js`, icons, manifest).

1.  **Hosting:**
    *   These files can be hosted on any static site hosting service (e.g., GitHub Pages, Netlify, Vercel).
    *   If using GitHub Pages, ensure your repository is configured to serve from the appropriate branch (e.g., `main` or `gh-pages`) and that your custom domain, like `roundedweather.com` (and `www.roundedweather.com`), is correctly pointing to your GitHub Pages site.
2.  **Local Serving:**
    *   You can serve these files locally using any simple HTTP server. For example, using Cloudflare's wrangler CLI utility:
        ```bash
        wrangler dev --remote
        ```
        Then open the provided link in your browser.

### Backend (Cloudflare Worker: `weather-proxy`)

The Cloudflare Worker in the `/worker` directory proxies requests to the OpenWeatherMap API and handles CORS.

1.  **Prerequisites:**
    *   Node.js and npm installed.
    *   A Cloudflare account.
    *   `wrangler` CLI installed (`npm install -g wrangler`).
    *   An API key from [OpenWeatherMap](https://openweathermap.org/api).

2.  **Configuration:**
    *   Navigate to the `worker` directory:
        ```bash
        cd worker
        ```
    *   Log in to Wrangler:
        ```bash
        wrangler login
        ```
    *   Set your OpenWeatherMap API key as a secret for the worker. Replace `YOUR_OPENWEATHER_KEY` with your actual key:
        ```bash
        wrangler secret put OPENWEATHER_KEY
        ```
        (You'll be prompted to enter the key value).

3.  **Local Development (testing the worker):**
    *   To run the worker locally (it will make actual calls to OpenWeatherMap):
        ```bash
        wrangler dev --remote
        ```
    *   The `endpoint` variable in the frontend `app.js` (`https://api.roundedweather.com`) should be accessible and routed to this worker (either via a deployed version or local tunneling if you set that up). For simple local testing of the frontend against a *deployed* worker, ensure the worker is already deployed.

4.  **Deployment:**
    *   To deploy the worker to your Cloudflare account (it will be available at `api.roundedweather.com/*` as per `wrangler.jsonc`):
        ```bash
        wrangler deploy
        ```

    *   Ensure your Cloudflare DNS for `roundedweather.com` has an `A` record for `api` (e.g., `api.roundedweather.com`) pointing to a placeholder IP like `192.0.2.1` and **proxied (orange cloud)** through Cloudflare. This allows the route in `wrangler.jsonc` to direct traffic to your worker.

## Service Worker (`sw.js`)

The main `sw.js` caches the application shell (HTML, CSS, JS, icons). Ensure it's updated and deployed correctly if you make changes to these core files.

