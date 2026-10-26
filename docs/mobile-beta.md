# Mobile beta handoff

## Current package

- App name: Bodyweight Ladder. Proposed bundle/application ID: `ca.ashbi.ladder`.
- Version 1.0, build 1. Confirm the ID is unused in your Apple/Google accounts before registering it; keep it stable after first installation.
- Capacitor 8.5.3; Android minimum API 24, target/compile API 36; iOS minimum 15. Xcode 26+ and Node 22+ required.
- App HTML, fonts, images and exercise data are bundled locally. External demonstration links and email need connectivity. Offline/device behavior has not been tested.
- No account, ad or analytics SDK added. Native progress uses the app WebView's local storage. It does not automatically sync with ladder.ashbi.ca or another device.
- Backups use the system share/save sheet. A temporary copy remains in app cache so receiving apps can finish copying it; OS cache cleanup may remove it. Save a durable copy to Files or your chosen location.
- Android automatic backup is disabled. Uninstalling/clearing app storage can remove progress. iOS device backups are OS-controlled, not app sync.
- App backgrounding calls the existing pause action; resuming the app does not automatically resume exercise timers. This requires device verification.

## Android

Run `npm ci`, then `npm run mobile:prepare`. Open with `npx cap open android` or compile `android/gradlew -p android assembleDebug` (Windows: `android/gradlew.bat`). Set ANDROID_HOME to your SDK and JAVA_HOME to JDK 21.

The debug APK is `android/app/build/outputs/apk/debug/app-debug.apk`. It is for direct device beta installation, not Google Play submission. Install through Android Studio or `adb install -r <apk>` on an authorized device. Keep the same debug signing key to retain upgrade compatibility. Do not uninstall an existing build without exporting progress.

Google Play internal testing additionally needs a release signing/upload key, a signed AAB, Play Console app record and completed declarations. None are created or uploaded automatically.

## Mac / TestFlight

1. Clone the private repo and check out the mobile beta PR branch (or main once merged).
2. Run `npm ci` and `npm run mobile:prepare`.
3. Run `npx cap open ios` to open `ios/App/App.xcodeproj`. Swift Package Manager resolves native dependencies.
4. Select App target > Signing & Capabilities. Choose your existing Apple team, enable automatic signing, and confirm `ca.ashbi.ladder` is the intended registered identifier.
5. In App Store Connect, create/select the matching iOS app record. Choose your own SKU and confirm app name availability. Complete current agreements/account requirements yourself if prompted.
6. Check version/build numbers and increment build number for every upload. Select a generic iOS device, then Product > Archive. Validate the archive, then Distribute App > App Store Connect.
7. Complete Apple's export-compliance questions based on the final archive. This project intentionally does not guess an encryption-exemption answer.
8. After processing, add the build to an internal TestFlight group. External testers may require Beta App Review. Supply beta contact, description, feedback email and What to Test.

No Apple signing team/certificates, account record, tester invitations or TestFlight upload have been configured from Windows. Mac access is still needed to perform and verify these steps.

## Migrating from the website

Export a normal backup from website Settings, save the JSON file, then use the installed app's backup/restore controls to merge it. Normal exports include completed records, not unfinished workout drafts. Finish or safely save the unfinished workout first. Browser and installed-app stores remain separate afterward.

## What to test (pending, not executed)

- Onboarding, equipment choices, first workout, skip/swap/pause/finish, optional extra exercises.
- Timed holds never start without confirmation; lock/background interrupts safely; resume preserves elapsed time/rest.
- Export to Files/downloads, cancel sharing, restore valid backup, reject invalid backup, verify no duplicates or lost records.
- Upgrade the app without uninstalling; confirm progress survives. Confirm airplane-mode cold launch.
- Android system Back, keyboard, safe areas, large text, VoiceOver/TalkBack, portrait/landscape, small phone/tablet.
- External video/email links return to the app without losing work.
- Generated exercise photos and instructions still need qualified technique review.

Application tests remain skipped per user instruction. Native compilation alone does not establish beta quality or store approval.

## Sources

- https://capacitorjs.com/docs/getting-started/environment-setup
- https://capacitorjs.com/docs/apis/filesystem
- https://developer.apple.com/help/app-store-connect/manage-builds/upload-builds/
- https://developer.apple.com/help/app-store-connect/test-a-beta-version/testflight-overview/

## Dependency inspection

The npm audit at preparation time reported no production-package advisories and three moderate development-tool advisories through Capacitor CLI / xcode / uuid. No forced downgrade or incompatible override was applied. Review these before establishing an automated release pipeline.

## Play internal-track upload preparation

`android/gradlew -p android :app:bundleRelease` creates the Android App Bundle. Set all four environment variables from your existing upload-key credentials to sign it: `LADDER_UPLOAD_KEYSTORE` (absolute path), `LADDER_UPLOAD_ALIAS`, `LADDER_UPLOAD_STORE_PASSWORD`, `LADDER_UPLOAD_KEY_PASSWORD`. Do not put passwords in chat, source files or command history. Partial configuration fails; no configuration produces an unsigned bundle, which cannot be uploaded to the internal testing track.

Confirm the package ID and unused version code in Play Console first. Upload the signed AAB under Testing > Internal testing. No public production rollout is authorized by this beta task. Account agreements and final privacy/health declarations remain owner decisions. The current browser connection is unavailable, so no upload has taken place.
