import type { Section } from "@/components/SectionBlock";

type SectionDSL = {
  id?: string;
  type?: "html" | "mermaid" | "excalidraw" | "desmos" | "geogebra";
  title?: string;
  description?: string;
  content?: string;
  mermaid?: string;
  elements?: any[];
  files?: Record<string, any>;
};

type SectionsFile =
  | { meta?: Record<string, any>; sections: SectionDSL[] }
  | SectionDSL[];

function ensureId(): string {
  return Math.random().toString(36).slice(2);
}

function normalizeSection(dsl: SectionDSL): Section {
  return {
    id: dsl.id && typeof dsl.id === "string" && dsl.id.trim() ? dsl.id : ensureId(),
    type: dsl.type,
    title: typeof dsl.title === "string" ? dsl.title : "",
    description: typeof dsl.description === "string" ? dsl.description : undefined,
    content: typeof dsl.content === "string" ? dsl.content : undefined,
    mermaid: typeof dsl.mermaid === "string" ? dsl.mermaid : undefined,
    elements: Array.isArray(dsl.elements) ? dsl.elements : undefined,
    files: dsl.files && typeof dsl.files === "object" ? dsl.files : undefined,
  };
}

export async function loadSectionsFromJSON(url = "/sections.json"): Promise<Section[]> {
  try {
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) throw new Error(`Failed to load sections: ${res.status}`);
    const json = (await res.json()) as SectionsFile;
    const list: SectionDSL[] = Array.isArray(json)
      ? json
      : Array.isArray(json.sections)
      ? json.sections
      : [];
    return list.map(normalizeSection);
  } catch (err) {
    console.warn("loadSectionsFromJSON error:", err);
    return [];
  }
}

export default loadSectionsFromJSON;