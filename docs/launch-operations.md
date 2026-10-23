# Launch operations

## What is implemented

- Report a problem appears below the app and in Display settings. It opens a native dialog with a public GitHub issue link and a technical summary the person can review and copy. A GitHub account is required to submit. The app never submits an issue automatically.
- An independent, early-loading script captures runtime errors, unhandled rejections, failed image/script/stylesheet loads and handled progress-storage failures. A dismissible notice provides a direct reporting action even when the main app cannot boot. Events stay in memory for this page only, deduplicate by type/screen/position, cap at 20 entries and 99 repetitions each, and can be cleared.
- Diagnostics contain a support release identifier, screen, viewport, online flag, feature support and event types/positions. No error message, rejection value, URL query, stack trace, browser identifier, workout history, local storage, user identifier or backup content is collected. Nothing is transmitted automatically. Choosing the GitHub report link sends the visible technical summary to GitHub as a draft; explain the problem there and submit only after review.
- An hourly Codex heartbeat, `bodyweight-ladder-availability`, checks public HTTPS from the owner's local computer, independently of the VPS. It checks the page, icon and manifest for HTTP 200, expected content types and normal certificate validation, with bounded requests and one retry on failure. It is read-only and has no authority to repair, deploy or restart anything. It is an availability monitor, not a UI test suite.
- `.github/workflows/uptime.yml` retains a manual version of the HTTPS checks, with no repository write permissions, deploy credentials, third-party actions or paid-service setup. Its first run could not connect to the VPS, so its recurring schedule was removed to avoid repeated failures from that source. No firewall, DNS or server access settings were changed.

## Operations and notification limits

The recurring monitor is attached to this Codex task. It depends on the owner's local execution host being available; it is not an always-on hosted paging service. Its first scheduled heartbeat and notification delivery have not yet been verified. The same public page returned HTTP 200 with valid TLS from the owner's computer during deployment confirmation.

GitHub connectivity evidence: https://github.com/camster91/bodyweight-ladder/actions/runs/40015208383 — three connection timeouts to port 443. The cause was not established. The server and owner's computer could reach the site. Do not treat this runner-specific result as proven global downtime or retry it without new evidence of changed access. The manual workflow remains available for a future operator to use after resolving that limitation.

Centralized browser-error ingestion is **not configured**. These diagnostics help people report failures; they do not provide a fleet-wide error count, silent-user failure alerts or session replay. A separate ingestion destination and retention policy would be needed for that capability. The static site still needs no backend or database.

## Responding to a report or failed monitor

1. Read the failed URL/status or the reporter's reproduction steps and support release. Do not request their full backup in a public issue. Remove accidentally posted personal information through the repository's supported moderation controls.
2. For a save warning, advise keeping the page open and exporting completed progress before refreshing. Never advise clearing site data as a first step. Unfinished sets are not included in the progress export.
3. Check only the dedicated app: `/var/www/bodyweight-ladder`, container `bodyweight-ladder`, localhost port 3198, and its existing HTTPS route. Do not restart the shared proxy or other sites.
4. Resolve in Git, deploy with `/usr/local/bin/deploy-ladder`, and confirm the deployed commit and public response. If rollback is needed, revert the change in Git and deploy the resulting fast-forward commit. Keep the existing deploy script's dirty-tree and config checks.

## Current launch status

The owner requested skipping additional testing for this release. No new unit, browser, physical-device or assistive-technology test pass is claimed. Parsing, source synchronization, code review, deploy-script safeguards and live delivery confirmation are release checks only.

Independent exercise-professional review, photo/technique sign-off and a real-user pilot remain outstanding. See `launch-review-packet.md` and `exercise-photo-review.html`; preparing those materials does not complete the reviews.
