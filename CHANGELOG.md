# Changelog
## 0.9.1 (2026-04-05)

- Fix UUID inconsistency between WebServer and mDNS (now shared from main.ts)
- Remove redundant `build:ts` and `prepare` scripts

## 0.9.0 (2026-04-04)

- Replace Avahi mDNS with bonjour-service for cross-platform support (Linux, macOS, Windows)
- No avahi-daemon required anymore — pure JavaScript mDNS broadcasting
- Updated admin UI translations to remove Avahi-specific instructions

## 0.8.12 (2026-04-03)

- Modernize dev tooling: esbuild via build-adapter, @tsconfig/node20, rimraf, TypeScript ~5.9.3 pin
- Upgrade testing-action-check to v2.0.0
- Dependabot: monthly schedule, auto-merge skips major updates
- Branch protection: require check-and-lint status check

## 0.8.11 (2026-03-28)

- Add error middleware for malformed JSON requests (returns 400 instead of 500)

## 0.8.10 (2026-03-28)

- Consistent admin UI i18n keys (supportHeader)
- Add PayPal to FUNDING.yml

## 0.8.9 (2026-03-28)

- Use adapter timer methods (setInterval/clearInterval) instead of native timers
- Add Windows and macOS to CI test matrix
- README: standard license format with full MIT text
- Split old changelog entries into CHANGELOG_OLD.md

## 0.8.8 (2026-03-25)

- Simplified admin UI from tabs to single page layout
- Fixed onUnload to be synchronous (prevents SIGKILL on shutdown)
- Removed broken Ko-fi icon from donation button
- Added translate script

Older changes: [CHANGELOG_OLD.md](CHANGELOG_OLD.md)
