/**
 * embedRecorder — when this app is embedded as an explorable iframe inside
 * the student tutor page, mirror everything that happens in here into the
 * parent page's rrweb screen recording.
 *
 * The parent records with `recordCrossOriginIframes: true`; running rrweb in
 * this (cross-origin) frame with the same flag makes it post its events up to
 * the parent, which merges them into one replayable stream.
 *
 * Entirely best-effort: dynamic import so a workspace whose shared
 * node_modules doesn't have rrweb yet skips recording instead of crashing,
 * and a parent that isn't recording just ignores the messages.
 */
export function initEmbedRecorder() {
  if (window.parent === window) return; // not embedded — nothing to mirror
  import("rrweb")
    .then(({ record }) => {
      record({
        emit: () => {
          // events are delivered to the parent recorder via postMessage
        },
        recordCrossOriginIframes: true,
        // Match the parent's sampling so chunk sizes stay sane
        sampling: { mousemove: 50, scroll: 150, media: 800, input: "last" },
      });
    })
    .catch(() => {
      // rrweb not installed in this workspace — explorables work regardless
    });
}
