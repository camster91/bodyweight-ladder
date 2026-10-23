# Launch operations

## What is implemented

- Report a problem appears below the app and in Display settings. It opens a native dialog with a public GitHub issue link and a technical summary the person can review and copy. A GitHub account is required to submit. The app never submits an issue automatically.
- An independent, early-loading script captures runtime errors, unhandled rejections, failed image/script/stylesheet loads and handled progress-storage failures. A dismissible notice provides a direct reporting action even when the main app cannot boot. Events stay in memory for this page only, deduplicate by type/screen/position, cap at 20 entries and 99 repetitions each, and can be cleared.
- Diagnostics contain a support release identifier, screen, viewport, online flag, feature support and event types/positions. No error message, rejection value, URL query, stack trace, browser identifier, workout history, local storage, user identifier or backup content is collected. Nothing is transmitted automatically. Choosing the GitHub report link sends the visible technical summary to GitHub as a draft; explain the problem there and submit only after review.
- `.github/workflows/uptime.yml` schedules public HTTPS checks at minutes 7, 22, 37 and 52 each hour, on GitHub-hosted infrastructure rather than the VPS. It checks the page, icon and manifest for HTTP 200 and expected content types, with normal certificate validation. It has no repository write permissions, deploy credentials, third-party actions or paid-service setup. Runs have a four-minute limit. It is an availability monitor, not a UI test suite.

## Operations and notification limits

View monitor runs: https://github.com/camster91/bodyweight-ladder/actions/workflows/uptime.yml

Failed runs use the repository owner's existing GitHub Actions notification preferences. No new email address, webhook or recipient has been configured, and delivery has not been confirmed. GitHub schedules can be delayed or dropped during high load; public repositories can have scheduled workflows disabled after 60 days without repository activity. This is a lightweight monitor, not a paging SLA. See [GitHub schedule documentation](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule).

Centralized browser-error ingestion is **not configured**. These diagnostics help people report failures; they do not provide a fleet-wide error count, silent-user failure alerts or session replay. A separate ingestion destination and retention policy would be needed for that capability. The static site still needs no backend or database.

## Responding to a report or failed monitor

1. Read the failed URL/status or the reporter's reproduction steps and support release. Do not request their full backup in a public issue. Remove accidentally posted personal information through the repository's supported moderation controls.
2. For a save warning, advise keeping the page open and exporting completed progress before refreshing. Never advise clearing site data as a first step. Unfinished sets are not included in the progress export.
3. Check only the dedicated app: `/var/www/bodyweight-ladder`, container `bodyweight-ladder`, localhost port 3198, and its existing HTTPS route. Do not restart the shared proxy or other sites.
4. Resolve in Git, deploy with `/usr/local/bin/deploy-ladder`, and confirm the deployed commit and public response. If rollback is needed, revert the change in Git and deploy the resulting fast-forward commit. Keep the existing deploy script's dirty-tree and config checks.

## Current launch status

The owner requested skipping additional testing for this release. No new unit, browser, physical-device or assistive-technology test pass is claimed. Parsing, source synchronization, code review, deploy-script safeguards and live delivery confirmation are release checks only.

Independent exercise-professional review, photo/technique sign-off and a real-user pilot remain outstanding. See `launch-review-packet.md` and `exercise-photo-review.html`; preparing those materials does not complete the reviews.
