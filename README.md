# Tests (run against a real PHP + MariaDB stack)
1. Import `database/schema.sql`, `seed.sql`, `seed_freight_rates.sql`; serve the project so that
   `http://127.0.0.1:8080/FreightIQ-Marine/frontend/login.php` works (e.g. `php -S 127.0.0.1:8080 -t <parent folder>`).
2. `python3 tests/e2e_api.py` — logs in as admin, loads every page and API endpoint, flags PHP warnings / non-JSON.
   (`forecast.php` returning 400 with no parameters is expected.)
3. `python3 tests/e2e_roles.py` — page access + nav per role.
4. `cd tests && npm i jsdom leaflet` then
   `node audit_pages.js hi` (any language code) — loads every page in a simulated browser, switches language and
   lists English text still on screen (writes `pages_<lang>.json`); `node features.js` — Laytime, fleet map,
   Time Machine, Load Lab, command palette, live language switching.
Notes: the dashboard's Chart.js comes from a CDN, so a "Chart is not defined" error appears only when offline.
