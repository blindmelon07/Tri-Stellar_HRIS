# TriStellar HRIS — Mobile (Flutter)

Employee kiosk app for Android and iOS. It talks to the Laravel system's `/api/v1`
endpoints with Sanctum tokens (stored in the Android Keystore / iOS Keychain).

**Features:** sign in, today's logs, attendance per cut-off, filing Unaccounted / Leave /
Overtime / Early Out / Shift Change, withdrawing pending filings, payslips, and team
endorsements for Department Heads.

## Build the Android APK

```powershell
cd C:\xampp2\htdocs\TriStellarHRIS\mobile
flutter build apk --release
copy build\app\outputs\flutter-apk\app-release.apk dist\TriStellar-HRIS.apk
```

Build all processor types (the default). Some plugins ship native libraries for several
types, so an arm64-only APK crashes on 32-bit and x86_64 devices.

Upload `dist\TriStellar-HRIS.apk` to the site's `public/downloads/` folder and share
`https://mistyrose-rook-580675.hostingersite.com/downloads/TriStellar-HRIS.apk` with employees.

The app connects to `https://mistyrose-rook-580675.hostingersite.com` by default. To use a
different server, add `--dart-define=API_URL=https://your-domain` to the build command.

## Develop

```powershell
flutter pub get
flutter run            # on a connected phone or emulator
flutter test
flutter analyze
```

## iOS

Building for iPhone needs a Mac with Xcode (`flutter build ipa`) and an Apple Developer
account for TestFlight or the App Store.
