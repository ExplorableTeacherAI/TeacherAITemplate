// rrweb 2.1 snapshots an initially blank iframe after it has navigated. WebKit
// throws SecurityError for contentDocument at that point (Chromium returns null).
// Apply at bundle time, never mutate the shared node_modules installation.
export function patchRrweb(code) {
  const needle = 'const iframeDoc = n2.contentDocument;';
  if (code.split(needle).length !== 2) {
    throw new Error('rrweb snapshot changed: review the WebKit navigation guard before upgrading');
  }
  // WebKit reports some forbidden accesses even when caught. Avoid the access
  // entirely for known foreign origins; postMessage still records those frames.
  const helper = `function mathvibeFrameDocument(frame) {
    const src = frame.getAttribute("src");
    if (src && src !== "about:blank" && !frame.hasAttribute("srcdoc")) {
      if (new URL(src, frame.ownerDocument.baseURI).origin !== frame.ownerDocument.location.origin) return null;
    }
    try { return frame.contentDocument; }
    catch (error) {
      if (error?.name === "SecurityError") return null;
      throw error;
    }
  }\n`;
  return helper + code.replaceAll('n2.contentDocument', 'mathvibeFrameDocument(n2)')
    .replace('function onceIframeLoaded(iframeEl, listener, iframeLoadTimeout) {',
      'function onceIframeLoaded(iframeEl, listener, iframeLoadTimeout) {\n  if (!mathvibeFrameDocument(iframeEl)) return;');
}

export function rrwebWebkitGuard() {
  return {
    name: 'mathvibe-rrweb-webkit',
    enforce: 'pre',
    // Keep this dependency visible to transform in development as well as build.
    config: () => ({ optimizeDeps: { exclude: ['rrweb'] } }),
    transform(code, id) {
      if (!/\/rrweb\/dist\/rrweb\.js(?:\?|$)/.test(id.replaceAll('\\', '/'))) return;
      return { code: patchRrweb(code), map: null };
    },
  };
}
