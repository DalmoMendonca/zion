#!/usr/bin/env bash
# Run a developer-only Zion victory scenario until the native success assertion
# appears. A full-match process normally keeps running after a test succeeds;
# terminate it promptly rather than burning through the complete timeout.
set -euo pipefail
if [[ "$#" -ne 4 ]]; then
  echo "usage: $0 MODE ORDER_MARKER SUCCESS_MARKER TIMEOUT_SECONDS" >&2
  exit 2
fi
mode="$1"
order_marker="$2"
success_marker="$3"
maximum="$4"
case "$mode" in
  gather|construction|combat) ;;
  *) echo "invalid native scenario: $mode" >&2; exit 2 ;;
esac
[[ "$maximum" =~ ^[0-9]+$ ]] && (( maximum > 0 )) || exit 2
log="binaries/system/zion-${mode}.log"
(
  cd binaries/system
  exec timeout --signal=TERM --kill-after=5s "${maximum}s" ./pyrogenesis \
    -autostart="scenarios/arcadia" "-autostart-victory=zion_${mode}" \
    -autostart-nonvisual -autostart-disable-replay -nosound -quickstart \
    >"zion-${mode}.log" 2>&1
) &
pid=$!
cleanup() {
  kill -TERM "$pid" 2>/dev/null || true
  wait "$pid" 2>/dev/null || true
}
trap cleanup EXIT
passed=0
for ((elapsed=0; elapsed<maximum; ++elapsed)); do
  if [[ -f "$log" ]] && grep -Fq "$success_marker" "$log"; then
    passed=1
    break
  fi
  if ! kill -0 "$pid" 2>/dev/null; then
    break
  fi
  sleep 1
done
cleanup
trap - EXIT
if (( !passed )); then
  echo "Native $mode did not reach $success_marker before timeout/exit" >&2
  tail -100 "$log" || true
  exit 1
fi
grep -F "GAME STARTED, ALL INIT COMPLETE" "$log"
grep -F "$order_marker" "$log"
grep -F "$success_marker" "$log"
if grep -Ei '(^| )ERROR:|JavaScript error:|unhandled exception|assertion failed|ZION_(GATHER|CONSTRUCTION|COMBAT)_FAILED' "$log"; then
  tail -100 "$log"
  exit 1
fi
echo "ZION_NATIVE_MODE_PASS: $mode after ${elapsed}s wall-clock"
