import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";

type DesmosCalculator = any;

interface DesmosRendererProps {
  /**
   * Provide a single LaTeX expression, e.g. "y=x^2".
   * If `state` is provided, this is ignored.
   */
  latex?: string;
  /**
   * Full calculator state as returned by `calculator.getState()`.
   */
  state?: Record<string, any> | null;
  /**
   * Expressions list to set on initialization. Ignored if `state` is provided.
   */
  expressions?: Array<Record<string, any>>;
  /**
   * Options passed to `Desmos.GraphingCalculator`.
   */
  options?: Record<string, any>;
  className?: string;
  style?: CSSProperties;
  minHeight?: number;
}

/**
 * Lightweight renderer for the Desmos Graphing Calculator.
 * Dynamically loads the Desmos API script and embeds an interactive calculator.
 */
export const DesmosRenderer = ({
  latex,
  state,
  expressions,
  options,
  className,
  style,
  minHeight = 280,
}: DesmosRendererProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const calcRef = useRef<DesmosCalculator | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState<boolean>(false);

  const mergedOptions = useMemo(() => ({
    expressions: true,
    settingsMenu: true,
    keypad: true,
    autosize: true,
    ...(options || {}),
  }), [options]);

  // Load Desmos API script dynamically (guard against duplicates and dev HMR)
  useEffect(() => {
    let cancelled = false;
    const existing = (window as any).Desmos;
    if (existing) {
      setLoaded(true);
      return;
    }
    const id = "desmos-api-script";
    const prior = document.getElementById(id) as HTMLScriptElement | null;
    if (prior) {
      prior.addEventListener("load", () => !cancelled && setLoaded(true));
      prior.addEventListener("error", () => !cancelled && setError("Failed to load Desmos API"));
      return;
    }
    const script = document.createElement("script");
    script.id = id;
    // Use demo API key for development; replace in production if desired.
    script.src = "https://www.desmos.com/api/v1.12/calculator.js?apiKey=dcb31709b452b1cf9dc26972add0fda6";
    script.async = true;
    script.onload = () => {
      if (!cancelled) setLoaded(true);
    };
    script.onerror = () => {
      if (!cancelled) setError("Failed to load Desmos API");
    };
    document.head.appendChild(script);
    return () => {
      cancelled = true;
    };
  }, []);

  // Initialize calculator when script is loaded
  useEffect(() => {
    if (!loaded) return;
    const Desmos = (window as any).Desmos;
    if (!Desmos || !containerRef.current) return;
    try {
      calcRef.current = Desmos.GraphingCalculator(containerRef.current, mergedOptions);
      if (state && typeof state === "object") {
        calcRef.current.setState(state);
      } else if (Array.isArray(expressions) && expressions.length > 0) {
        // Set provided expressions
        for (const expr of expressions) {
          // Expect keys like { id?, latex, color?, hidden? }
          if (expr && typeof expr === "object") {
            calcRef.current.setExpression(expr);
          }
        }
      } else if (typeof latex === "string" && latex.trim().length > 0) {
        calcRef.current.setExpression({ id: "expr-1", latex });
      } else {
        // Default demo expression
        calcRef.current.setExpression({ id: "expr-1", latex: "y=x^2" });
      }
      setError(null);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      setError("Failed to initialize Desmos calculator");
    }
    return () => {
      try {
        calcRef.current?.destroy?.();
      } catch { }
      calcRef.current = null;
    };
  }, [loaded, mergedOptions, latex, state, expressions]);

  return (
    <div
      className={className}
      style={{
        width: "100%",
        minHeight: minHeight,
        height: style?.height || "auto",
        aspectRatio: style?.aspectRatio || undefined,
        ...(style || {})
      }}
    >
      {error ? (
        <div style={{ color: "#b00020", padding: 12 }}>{error}</div>
      ) : (
        <div ref={containerRef} style={{ width: "100%", height: "100%" }} />
      )}
    </div>
  );
};

export default DesmosRenderer;