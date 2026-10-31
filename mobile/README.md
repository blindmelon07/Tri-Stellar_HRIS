# TriStellar HRIS — Mobile (Android & iOS)

Employee kiosk app built with Expo (SDK 58) and Expo Router. It talks to the Laravel
system's `/api/v1` endpoints using Sanctum tokens.

**Features:** sign in, today's logs, attendance per cut-off, filing Unaccounted / Leave /
Overtime / Early Out / Shift Change, withdrawing pending filings, payslips, and team
endorsements for Department Heads.

## Run during development

1. Start Laravel so phones on the same Wi-Fi can reach it:
   `php artisan serve --host=0.0.0.0 --port=8000`
2. Copy `.env.example` to `.env` and set `EXPO_PUBLIC_API_URL` to the server PC's LAN IP,
   e.g. `http://192.168.1.20:8000`.
3. `npm install`, then `npx expo start`.
4. Scan the QR code with a development build of the app (the date picker and secure
   storage are native modules), or press `w` for a quick browser preview.

Checks: `npx tsc --noEmit` and `npx expo lint`.

## Build for the stores

Uses EAS Build in the cloud, so no Mac is needed for iOS:

```bash
npx eas-cli@latest login
npx eas-cli@latest build:configure
npx eas-cli@latest build --platform android   # .aab for Google Play
npx eas-cli@latest build --platform ios       # needs an Apple Developer account
npx eas-cli@latest submit --platform all
```

Before a store build, set `EXPO_PUBLIC_API_URL` to the production HTTPS address of the
HRIS server. App identifiers are `com.tristellar.hris` on both platforms (see `app.json`).
