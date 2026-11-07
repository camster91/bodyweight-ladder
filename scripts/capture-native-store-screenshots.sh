#!/usr/bin/env bash
set -euo pipefail

# This helper deliberately captures the simulator's native framebuffer. It
# never resizes browser renders or uses the screenshots committed for other
# device classes.

EXPECTED_COMMIT="${EXPECTED_COMMIT:-ec1a97f540ac56137ed8d7de9040ab31d2362de0}"
BUNDLE_ID="ca.ashbi.ladder"
OUTPUT_ROOT="${OUTPUT_ROOT:-${GITHUB_WORKSPACE:-$PWD}/artifacts/ios-native-screenshots}"
RUN_ROOT="${RUNNER_TEMP:-${TMPDIR:-/tmp}}/bodyweight-ladder-native-screenshots"
DERIVED_DATA="$RUN_ROOT/DerivedData"
VERIFY_BIN="$RUN_ROOT/verify-native-screenshot"

mkdir -p "$OUTPUT_ROOT" "$RUN_ROOT"

actual_commit="$(git rev-parse HEAD)"
if [[ "$actual_commit" != "$EXPECTED_COMMIT" ]]; then
  echo "Expected source $EXPECTED_COMMIT but checked out $actual_commit" >&2
  exit 1
fi

if [[ ! -d ios/App/App.xcodeproj || ! -d ios/App/App/public ]]; then
  echo "Prepared iOS project/assets are missing; run npm run mobile:prepare first" >&2
  exit 1
fi

swiftc scripts/verify-native-screenshot.swift \
  -o "$VERIFY_BIN" \
  -framework AppKit \
  -framework Vision

runtime_id="$(xcrun simctl list runtimes available | \
  sed -nE 's/^.* - (com\.apple\.CoreSimulator\.SimRuntime\.iOS-[^ ]+) \(available\).*$/\1/p' | tail -1)"
if [[ -z "$runtime_id" ]]; then
  echo "No available iOS Simulator runtime found" >&2
  exit 1
fi

device_type_id() {
  local pattern="$1"
  xcrun simctl list devicetypes | \
    sed -nE "s/^.*(${pattern}) \((com\\.apple\\.CoreSimulator\\.SimDeviceType\\.[^)]*)\).*$/\2/p" | head -1
}

iphone_type="$(device_type_id 'iPhone 16 Pro Max')"
ipad_type="$(device_type_id 'iPad Pro.*13.*M4')"
if [[ -z "$iphone_type" || -z "$ipad_type" ]]; then
  echo "Required simulator device types are unavailable" >&2
  xcrun simctl list devicetypes >&2
  exit 1
fi

created_devices=()
cleanup() {
  for udid in "${created_devices[@]:-}"; do
    xcrun simctl shutdown "$udid" >/dev/null 2>&1 || true
    xcrun simctl delete "$udid" >/dev/null 2>&1 || true
  done
}
trap cleanup EXIT

create_device() {
  local name="$1" type_id="$2"
  local udid
  udid="$(xcrun simctl create "$name" "$type_id" "$runtime_id")"
  created_devices+=("$udid")
  xcrun simctl boot "$udid" >/dev/null
  xcrun simctl bootstatus "$udid" -b >&2
  printf '%s\n' "$udid"
}

build_app() {
  rm -rf "$DERIVED_DATA"
  xcodebuild \
    -project ios/App/App.xcodeproj \
    -scheme App \
    -configuration Debug \
    -sdk iphonesimulator \
    -destination 'generic/platform=iOS Simulator' \
    -derivedDataPath "$DERIVED_DATA" \
    CODE_SIGNING_ALLOWED=NO \
    CODE_SIGNING_REQUIRED=NO \
    build
}

build_app
app_path="$DERIVED_DATA/Build/Products/Debug-iphonesimulator/App.app"
if [[ ! -d "$app_path" ]]; then
  echo "Simulator app was not produced at $app_path" >&2
  exit 1
fi

capture_device() {
  local label="$1" expected_width="$2" expected_height="$3" type_id="$4"
  local udid screenshot process_state verification sha256
  udid="$(create_device "Ladder Screenshot $label" "$type_id")"
  screenshot="$OUTPUT_ROOT/$label.png"
  xcrun simctl install "$udid" "$app_path"
  xcrun simctl launch "$udid" "$BUNDLE_ID"
  sleep 5

  process_state="$RUN_ROOT/$label-process.txt"
  if ! xcrun simctl spawn "$udid" launchctl print gui/501/"$BUNDLE_ID" >"$process_state" 2>&1; then
    cat "$process_state" >&2
    echo "The native app process was not found after launch ($label)" >&2
    exit 1
  fi
  if ! rg -q 'state = running|running-active|running-interactive' "$process_state"; then
    cat "$process_state" >&2
    echo "The native app was not active after launch ($label)" >&2
    exit 1
  fi

  xcrun simctl io "$udid" screenshot "$screenshot"
  verification="$($VERIFY_BIN "$screenshot" "$expected_width" "$expected_height" 'Welcome,Today,Exercises,Progress,workout')"
  sha256="$(shasum -a 256 "$screenshot" | awk '{print $1}')"
  VERIFY_JSON="$verification" SHA256="$sha256" DEVICE_UDID="$udid" SOURCE_COMMIT="$actual_commit" LABEL="$label" python3 -c '
import json, os
d = json.loads(os.environ["VERIFY_JSON"])
d.update({
    "sha256": os.environ["SHA256"],
    "deviceUdid": os.environ["DEVICE_UDID"],
    "label": os.environ["LABEL"],
    "sourceCommit": os.environ["SOURCE_COMMIT"],
    "bundleId": "ca.ashbi.ladder",
})
print(json.dumps(d, sort_keys=True))
' >"$OUTPUT_ROOT/$label.json"
  printf '%s %s %s\n' "$label" "$udid" "$sha256"
}

capture_device iphone-69 1320 2868 "$iphone_type"
capture_device ipad-13 2064 2752 "$ipad_type"

cat >"$OUTPUT_ROOT/manifest.json" <<EOF
{
  "app": "Bodyweight Ladder",
  "bundleId": "$BUNDLE_ID",
  "sourceCommit": "$actual_commit",
  "runtimeId": "$runtime_id",
  "captureMethod": "xcrun simctl io screenshot after native simulator launch",
  "devices": ["iphone-69", "ipad-13"],
  "dataMode": "empty first-run (no user data)",
  "nativeContentVerification": "Vision OCR required source-owned app navigation/content text; SpringBoard-only screenshots fail"
}
EOF
