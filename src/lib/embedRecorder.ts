/**
 * Companion rrweb recorder for an explorable embedded by the tutor page.
 *
 * It follows the parent recorder's start/stop lifecycle and keeps a tiny set
 * of activity listeners alive while paused. That lets an interaction inside
 * the iframe wake both recorders after the five-minute idle timeout. Status
 * messages make browser/privacy-extension failures visible in teacher replay.
 */
type StopRecorder = () => void;

const SAMPLING = { mousemove: 50, scroll: 150, media: 800, input: "last" } as const;
const ACTIVITY_EVENTS = [
  "pointerdown",
  "pointermove",
  "keydown",
  "input",
  "scroll",
  "touchstart",
  "wheel",
] as const;

export function initEmbedRecorder() {
  if (window.parent === window) return;

  let stopRecorder: StopRecorder | undefined;
  let starting = false;
  let desiredActive = true;
  let lastActivitySent = 0;

  const post = (message: Record<string, unknown>) => {
    window.parent.postMessage(message, "*");
  };

  const stop = () => {
    desiredActive = false;
    if (!stopRecorder) return;
    try {
      stopRecorder();
    } catch {
      // Already stopped.
    }
    stopRecorder = undefined;
  };

  const start = () => {
    desiredActive = true;
    if (stopRecorder) {
      // Also acts as the parent's health-check response when this recorder
      // started before the parent installed its message listener.
      post({
        type: "mathvibe-recorder-status",
        status: "ready",
        frameUrl: window.location.href,
      });
      return;
    }
    if (starting) return;
    starting = true;
    import("rrweb")
      .then(({ record }) => {
        const stopRecording = record({
          emit: () => {
            // recordCrossOriginIframes posts events to the parent recorder.
          },
          recordCrossOriginIframes: true,
          sampling: SAMPLING,
        });
        if (!desiredActive) {
          stopRecording?.();
          return;
        }
        stopRecorder = stopRecording ?? undefined;
        post({
          type: "mathvibe-recorder-status",
          status: "ready",
          frameUrl: window.location.href,
        });
      })
      .catch((error: unknown) => {
        post({
          type: "mathvibe-recorder-status",
          status: "unavailable",
          reason: error instanceof Error ? error.message : "Recorder was blocked",
          frameUrl: window.location.href,
        });
      })
      .finally(() => {
        starting = false;
      });
  };

  const reportActivity = () => {
    const now = Date.now();
    if (now - lastActivitySent < 1_000) return;
    lastActivitySent = now;
    post({ type: "mathvibe-recorder-activity" });
  };

  const onControl = (event: MessageEvent) => {
    if (event.source !== window.parent || event.data?.type !== "mathvibe-recorder-control") {
      return;
    }
    if (event.data.action === "stop") stop();
    if (event.data.action === "start") start();
  };

  ACTIVITY_EVENTS.forEach((eventName) =>
    window.addEventListener(eventName, reportActivity, { capture: true, passive: true })
  );
  window.addEventListener("message", onControl);
  window.addEventListener("pagehide", stop);
  start();
}
