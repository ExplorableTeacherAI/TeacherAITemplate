import { Children, isValidElement, useEffect, useState, type ReactNode } from "react";

/**
 * Live per-section build status, posted into this iframe by the teacher
 * frontend (`section-build-status` messages sourced from the backend's
 * /sections/status poll). Empty everywhere else — published lessons, the
 * verification harness, and explorable embeds never receive these messages,
 * so all build-progress UI is inert outside the teacher's editor preview.
 */
export type SectionBuildInfo = {
    /** Section id — equals the section's file name in src/data/sections/ */
    id: string;
    title: string;
    status: string; // queued | building | verifying | ready | needs_attention | failed | interrupted
    /** True once the section is registered into blocks.tsx */
    registered: boolean;
    /** Live builder activity, e.g. "writing spec and code", "repairing issues (round 1/2)" */
    detail?: string;
};

const IN_FLIGHT_STATES = new Set(["queued", "building", "verifying"]);

export const isInFlight = (section: SectionBuildInfo): boolean =>
    IN_FLIGHT_STATES.has(section.status);

/** Latest section-build-status message from the parent frame (empty until one arrives). */
export function useSectionBuildStatus(): SectionBuildInfo[] {
    const [sections, setSections] = useState<SectionBuildInfo[]>([]);

    useEffect(() => {
        const handler = (event: MessageEvent) => {
            const data = event.data;
            if (data?.type !== "section-build-status" || !Array.isArray(data.sections)) return;
            setSections(
                data.sections.filter(
                    (s: unknown): s is SectionBuildInfo =>
                        !!s && typeof (s as SectionBuildInfo).id === "string"
                )
            );
        };
        window.addEventListener("message", handler);
        return () => window.removeEventListener("message", handler);
    }, []);

    return sections;
}

/**
 * Collect the block-level ids reachable from a rendered element tree.
 * Includes each `<Block id>` and the `blockId` carried by editable children —
 * strays (paragraph/heading ids) are harmless for both uses: set intersection
 * (symmetric) and `[data-block-id]` DOM lookups (only Blocks emit that attr).
 */
export function collectBlockIds(node: ReactNode, into: Set<string> = new Set()): Set<string> {
    if (Array.isArray(node)) {
        node.forEach((child) => collectBlockIds(child, into));
        return into;
    }
    if (!isValidElement(node)) return into;
    const props = node.props as { id?: unknown; blockId?: unknown; children?: ReactNode };
    if (typeof props.blockId === "string") into.add(props.blockId);
    if (typeof props.id === "string" && typeof node.type !== "string") into.add(props.id);
    Children.forEach(props.children, (child) => collectBlockIds(child, into));
    return into;
}

// All section modules, resolved lazily. A section file that appears on disk
// after this module loaded is missing from the map until the parent reloads
// the iframe (which it does the moment the section is registered) — until
// then the section correctly renders as a skeleton.
const sectionModules = import.meta.glob("../data/sections/*.tsx");

const sectionIdsCache = new Map<string, Promise<Set<string>>>();

/**
 * Block ids belonging to one section, extracted from its module's exported
 * block array. Returns an empty set when the module doesn't exist or fails
 * to import (e.g. mid-build code that doesn't compile yet).
 */
export function getSectionBlockIds(sectionId: string): Promise<Set<string>> {
    const key = `../data/sections/${sectionId}.tsx`;
    const loader = sectionModules[key];
    if (!loader) return Promise.resolve(new Set());
    let cached = sectionIdsCache.get(key);
    if (!cached) {
        cached = loader()
            .then((mod) => {
                const blockArray = Object.values(mod as Record<string, unknown>).find(
                    Array.isArray
                ) as ReactNode[] | undefined;
                const ids = new Set<string>();
                (blockArray ?? []).forEach((element) => collectBlockIds(element, ids));
                return ids;
            })
            .catch(() => {
                // Mid-write / non-compiling file — drop the cache so a later
                // status tick retries after the builder fixes it.
                sectionIdsCache.delete(key);
                return new Set<string>();
            });
        sectionIdsCache.set(key, cached);
    }
    return cached;
}
