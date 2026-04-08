import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";

interface GeogebraRendererProps {
  /** Which GeoGebra app to embed: classic | graphing | geometry | 3d | cas */
  app?: "classic" | "graphing" | "geometry" | "3d" | "cas";
  /** Optional GeoGebra material/resource ID to load */
  materialId?: string;
  /** Additional URL params, e.g., { showMenuBar: false, showToolBar: false } */
  params?: Record<string, any>;
  className?: string;
  style?: CSSProperties;
  /** Iframe width; defaults to 100% */
  width?: number | string;
  /** Iframe height; defaults to 400 */
  height?: number | string;
  /**
   * Rendering mode. "iframe" uses a simple embed URL. "applet" uses deployggb.js
   * which allows passing commands and full control via the API.
   */
  mode?: "iframe" | "applet";
  /** Commands to evaluate on load in applet mode, e.g., ["m=0.3", "n=2", "f(x)=x^2"] */
  commands?: string[];
  /** Base64-encoded .ggb file contents for applet mode */
  ggbBase64?: string;
}

/**
 * Lightweight GeoGebra renderer using the official embed iframe.
 * Example content JSON:
 * {
 *   "app": "geometry",
 *   "materialId": "Vh5a4Z7e",
 *   "params": { "showMenuBar": false, "showToolBar": false },
 *   "height": 360
 * }
 */
export const GeogebraRenderer = ({
  app = "geometry",
  materialId,
  params,
  className,
  style,
  width = "100%",
  height = 400,
  mode = "iframe",
  commands,
  ggbBase64,
}: GeogebraRendererProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [appletReady, setAppletReady] = useState(false);

  const embedUrl = useMemo(() => {
    const basePath = `https://www.geogebra.org/${app || "classic"}`;
    const search = new URLSearchParams();
    // GeoGebra recognizes the "embed" flag without value; include as param for clarity.
    search.set("embed", "1");
    if (materialId && materialId.trim().length > 0) {
      search.set("material_id", materialId.trim());
    }
    if (params && typeof params === "object") {
      for (const [k, v] of Object.entries(params)) {
        if (v === undefined || v === null) continue;
        // Booleans should be "true"/"false" strings; numbers/strings passthrough
        if (typeof v === "boolean") search.set(k, v ? "true" : "false");
        else search.set(k, String(v));
      }
    }
    const qs = search.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  }, [app, materialId, params]);

  // Applet mode using deployggb.js for programmatic scenes
  useEffect(() => {
    if (mode !== "applet") return;
    let cancelled = false;
    const hasGGB = (window as any).GGBApplet;
    if (hasGGB) {
      setAppletReady(true);
      return;
    }
    const id = "geogebra-deploy-script";
    let script = document.getElementById(id) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement("script");
      script.id = id;
      script.src = "https://www.geogebra.org/apps/deployggb.js";
      script.async = true;
      script.onload = () => { if (!cancelled) setAppletReady(true); };
      script.onerror = () => { if (!cancelled) setAppletReady(false); };
      document.head.appendChild(script);
    } else {
      // If script exists, wait for load event or set ready if already loaded
      if ((window as any).GGBApplet) setAppletReady(true);
      else script.addEventListener("load", () => !cancelled && setAppletReady(true), { once: true });
    }
    return () => { cancelled = true; };
  }, [mode]);

  useEffect(() => {
    if (mode !== "applet" || !appletReady) return;
    const GGBApplet = (window as any).GGBApplet;
    if (!GGBApplet || !containerRef.current) return;

    // Clear previous applet on hot reloads or prop changes
    containerRef.current.innerHTML = "";

    const config: any = {
      appName: app || "graphing",
      showMenuBar: params?.showMenuBar ?? false,
      showToolBar: params?.showToolBar ?? false,
      showAlgebraInput: params?.showAlgebraInput ?? false,
      showResetIcon: params?.showResetIcon ?? false,
      showZoomButtons: params?.showZoomButtons ?? true,
      enableRightClick: params?.enableRightClick ?? false,
      scaleContainerClass: "ggb-scale-container",
      width: typeof width === "number" ? width : 800,
      height: typeof height === "number" ? height : 400,
      material_id: materialId,
      ggbBase64: ggbBase64,
      appletOnLoad: (api: any) => {
        try {
          if (Array.isArray(commands)) {
            for (const cmd of commands) {
              if (typeof cmd === "string" && cmd.trim()) {
                api.evalCommand(cmd);
              }
            }
          }
        } catch { }
      },
    };

    const applet = new GGBApplet(config, true);
    applet.inject(containerRef.current);

    return () => {
      try {
        containerRef.current && (containerRef.current.innerHTML = "");
      } catch { }
    };
  }, [mode, appletReady, app, params, width, height, materialId, ggbBase64, JSON.stringify(commands)]);

  // Applet mode
  if (mode === "applet") {
    // For applet mode, apply dimensions directly without conversion
    const containerDimensions: CSSProperties = {
      width: width === "100%" ? "100%" : (typeof width === "number" ? `${width}px` : width),
      height: height === "100%" ? "100%" : (typeof height === "number" ? `${height}px` : height),
    };

    return (
      <div className={className} style={{ width: "100%", height: "100%", ...(style || {}) }}>
        <div
          ref={containerRef}
          className="ggb-scale-container"
          style={containerDimensions}
        />
      </div>
    );
  }

  // Iframe mode
  const iframeDimensions: CSSProperties = {
    width: width === "100%" ? "100%" : (typeof width === "number" ? `${width}px` : width),
    height: height === "100%" ? "100%" : (typeof height === "number" ? `${height}px` : height),
    border: 0,
    ...style,
  };

  return (
    <div className={className} style={{ width: "100%", height: "100%", ...(style || {}) }}>
      <iframe
        src={embedUrl}
        title={materialId ? `GeoGebra ${app} – ${materialId}` : `GeoGebra ${app}`}
        style={iframeDimensions}
        allowFullScreen
        loading="lazy"
      />
    </div>
  );
};

export default GeogebraRenderer;