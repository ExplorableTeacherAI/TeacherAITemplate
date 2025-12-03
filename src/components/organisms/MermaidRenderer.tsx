import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";

interface MermaidRendererProps {
  definition: string;
  config?: any;
  className?: string;
  style?: CSSProperties;
}

export const MermaidRenderer = ({
  definition,
  config,
  className,
  style,
}: MermaidRendererProps) => {
  const [svg, setSvg] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const lastDefRef = useRef<string>("");

  const normalized = useMemo(() => {
    return (definition || "").trim();
  }, [definition]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!normalized) return;
      try {
        // Dynamically import mermaid to avoid SSR issues and reduce initial bundle size
        const mermaidModule: any = await import("mermaid");
        const mermaid = mermaidModule.default || mermaidModule;
        // Initialize mermaid once per render cycle
        mermaid.initialize({ startOnLoad: false, logLevel: "error", ...(config || {}) });
        if (lastDefRef.current === normalized) return;
        lastDefRef.current = normalized;
        const { svg: outSvg } = await mermaid.render("mermaid-diagram-" + Math.random().toString(36).slice(2), normalized);
        if (cancelled) return;
        setSvg(outSvg);
        setError(null);
      } catch (e: any) {
        if (cancelled) return;
        setError("Failed to render Mermaid diagram");
        // eslint-disable-next-line no-console
        console.error(e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [normalized, config]);

  return (
    <div className={className} style={{ width: "100%", ...(style || {}) }}>
      {error ? (
        <div style={{ color: "#b00020", padding: 12 }}>{error}</div>
      ) : (
        <div
          className="mermaid-svg"
          style={{ display: "block", width: "100%" }}
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      )}
    </div>
  );
};

export default MermaidRenderer;