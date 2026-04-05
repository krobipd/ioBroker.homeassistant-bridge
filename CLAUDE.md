# CLAUDE.md — ioBroker.homeassistant-bridge

> Gemeinsame ioBroker-Wissensbasis: `../CLAUDE.md` (lokal, nicht im Git). Standards dort, Projekt-Spezifisches hier.

## Projekt

**ioBroker HomeAssistant Bridge Adapter** — Emuliert minimalen HA-Server für Shelly Wall Displays → Redirect zu VIS Dashboard.

- **Version:** 0.9.2 (April 2026)
- **GitHub:** https://github.com/krobipd/ioBroker.homeassistant-bridge
- **npm:** https://www.npmjs.com/package/iobroker.homeassistant-bridge
- **Repository PR:** ioBroker/ioBroker.repositories#5642
- **Runtime-Deps:** `@iobroker/adapter-core`, `express` (v5), `bonjour-service`

## Shelly Wall Display — Limitationen

| Aspekt | Shelly Verhalten |
|--------|------------------|
| Protokoll | **Nur HTTP** — kein HTTPS für HA-Verbindungen |
| Discovery | mDNS (`_home-assistant._tcp`) oder manuelle IP |
| Auth | Erwartet vollständigen HA OAuth2-Flow |
| Nach Auth | Folgt 302 Redirects nativ im WebView |

## Architektur

```
src/main.ts              → Adapter (Lifecycle, UUID-Generierung)
src/lib/types.ts         → Interfaces
src/lib/constants.ts     → HA_VERSION, SESSION_TTL, LOGIN_SCHEMA
src/lib/webserver.ts     → Express 5 HTTP Server + HA API Emulation
src/lib/mdns.ts          → mDNS Broadcasting via bonjour-service
```

## Design-Entscheidungen

1. **Minimale Komplexität** — nur emulieren was Shelly braucht
2. **Shared UUID** (seit v0.9.1) — eine UUID in main.ts, an WebServer + mDNS durchgereicht
3. **Port 8123 fix** — Shelly-Anforderung, nicht konfigurierbar
4. **mDNS kontinuierlich** — Broadcasting solange Adapter läuft (Shelly muss jederzeit finden können)
5. **Kein HTTPS** — Shelly unterstützt es nicht für HA
6. **Kein Rate Limiting** — nur Redirects, keine schützenswerten Daten

## Auth-Flow

1. POST `/auth/login_flow` → `flow_id`
2. POST `/auth/login_flow/:flowId` → Credentials → `authorization_code`
3. POST `/auth/token` → Code → Access Token
4. GET `/` → 302 Redirect zu visUrl

## Tests (108)

```
test/testConstants.ts    → Shared Constants (10)
test/testMdns.ts         → mDNS Lifecycle (14)
test/testWebServer.ts    → HTTP Endpoints, Auth, Sessions (30)
test/testPackageFiles.ts → @iobroker/testing (54)
```

## Versionshistorie

| Version | Highlights |
|---------|------------|
| 0.9.2 | Kompakter Startup-Log, mDNS/WebServer Detail-Logs auf debug |
| 0.9.1 | Shared UUID (WebServer + mDNS konsistent), cleanup redundante Scripts |
| 0.9.0 | mDNS: Avahi durch bonjour-service ersetzt (cross-platform) |
| 0.8.12 | Dev-Tooling modernisiert (esbuild, TS 5.9 Pin, testing-action-check v2) |
| 0.8.9 | Adapter-Timer, Windows/macOS CI, MIT-Volltext README |
| 0.8.8 | Single-Page Admin UI, sync onUnload fix |

## Befehle

```bash
npm run build        # Production (esbuild)
npm run build:test   # Test build (tsc)
npm test             # Build + mocha
npm run lint         # ESLint + Prettier
```
