import { useEffect } from 'react';

// Define the structure for hierarchy nodes
interface HierarchyNode {
    id: string;
    type: "section" | "layout";
    sectionId?: string;
    label: string;
    children: HierarchyNode[];
    depth: number;
}

export const HierarchyReporter = () => {
    // Function to build and send hierarchy
    const reportHierarchy = () => {
        const body = document.body;
        if (!body) return;

        // Helper to generate stable-ish IDs for elements without IDs
        const getOrAssignId = (el: Element, prefix: string): string => {
            if (el.hasAttribute('data-hierarchy-temp-id')) {
                return el.getAttribute('data-hierarchy-temp-id')!;
            }
            const newId = `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
            el.setAttribute('data-hierarchy-temp-id', newId);
            return newId;
        };

        const collectNodes = (element: Element, depth: number): HierarchyNode[] => {
            // Determine if this is a section or layout we want to show
            const sectionId = element.getAttribute("data-section-id");
            const elementId = element.getAttribute("id");

            const layoutType = element.getAttribute("data-layout-type");
            const isLayout = element.classList.contains("layout") || !!layoutType ||
                (element.tagName === "DIV" &&
                    (element.classList.contains("split-layout") ||
                        element.classList.contains("grid-layout") ||
                        element.classList.contains("sidebar-layout") ||
                        element.classList.contains("full-width-layout")));

            const isSection = element.tagName === "SECTION" || !!sectionId;

            // Only report "significant" nodes (Sections or explicit Layouts)
            if (isSection || isLayout) {
                let nodeId = sectionId || elementId;
                // Assign a stable ID if one doesn't exist (for Layouts mostly)
                if (!nodeId) {
                    nodeId = getOrAssignId(element, isSection ? 'sec' : 'layout');
                }

                // Determine Label
                let label = "Unknown";
                if (sectionId) label = sectionId;
                else if (elementId) label = elementId;
                else if (isLayout) {
                    if (layoutType) {
                        const type = layoutType.toLowerCase();
                        if (type.includes('split')) label = "Split Layout";
                        else if (type.includes('grid')) label = "Grid Layout";
                        else if (type.includes('sidebar')) label = "Sidebar Layout";
                        else if (type.includes('full-width')) label = "Full Width Layout";
                        else label = type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ') + " Layout";
                    }
                    else if (element.classList.contains("split-layout")) label = "Split Layout";
                    else if (element.classList.contains("grid-layout")) label = "Grid Layout";
                    else if (element.classList.contains("sidebar-layout")) label = "Sidebar Layout";
                    else label = "Layout";
                } else if (isSection) {
                    label = "Section";
                }

                const node: HierarchyNode = {
                    id: nodeId,
                    type: isSection ? "section" : "layout",
                    sectionId: sectionId || undefined,
                    label: label,
                    children: [],
                    depth: depth
                };

                // Collect children (increment depth)
                Array.from(element.children).forEach(child => {
                    node.children.push(...collectNodes(child, depth + 1));
                });

                return [node];
            } else {
                // Generic container (e.g. div, main, wrapper) - Skip this node but check children
                // Pass current depth since we aren't visually indenting for this invisible wrapper
                const nodes: HierarchyNode[] = [];
                Array.from(element.children).forEach(child => {
                    nodes.push(...collectNodes(child, depth));
                });
                return nodes;
            }
        };

        const hierarchy = collectNodes(body, 0);

        // Always send update
        window.parent.postMessage({
            type: 'hierarchy-update',
            hierarchy: hierarchy
        }, '*');
    };

    // Auto-report on load and mutation
    useEffect(() => {
        // Initial report
        setTimeout(reportHierarchy, 500);
        setTimeout(reportHierarchy, 1500); // Retry to catch async content

        // Observer for DOM changes
        const observer = new MutationObserver(() => {
            // Debounce reporting
            const timeoutId = setTimeout(reportHierarchy, 200);
            return () => clearTimeout(timeoutId);
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        return () => observer.disconnect();
    }, []);

    // Listen for requests from parent
    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (!event.data) return;

            if (event.data.type === 'request-hierarchy') {
                reportHierarchy();
            }

            if (event.data.type === 'scroll-to-section') {
                const { sectionId } = event.data;
                if (sectionId) {
                    const el = document.querySelector(`[data-section-id="${sectionId}"]`);
                    if (el) {
                        el.scrollIntoView({ behavior: 'smooth', block: 'center' });

                        // Flash highlight
                        const originalOutline = (el as HTMLElement).style.outline;
                        const originalOffset = (el as HTMLElement).style.outlineOffset;

                        (el as HTMLElement).style.outline = "3px solid #0D7377";
                        (el as HTMLElement).style.outlineOffset = "4px";

                        setTimeout(() => {
                            (el as HTMLElement).style.outline = originalOutline;
                            (el as HTMLElement).style.outlineOffset = originalOffset;
                        }, 2000);
                    }
                }
            }

            if (event.data.type === 'highlight-section') {
                const { sectionId, isHovering } = event.data;

                // Remove existing highlights
                document.querySelectorAll('[data-hierarchy-highlight]').forEach(el => {
                    (el as HTMLElement).style.outline = "";
                    (el as HTMLElement).style.outlineOffset = "";
                    el.removeAttribute('data-hierarchy-highlight');
                });

                if (isHovering && sectionId) {
                    const el = document.querySelector(`[data-section-id="${sectionId}"]`);
                    if (el) {
                        (el as HTMLElement).style.outline = "2px dashed #14B8A6";
                        (el as HTMLElement).style.outlineOffset = "2px";
                        el.setAttribute('data-hierarchy-highlight', 'true');
                    }
                }
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    return null; // This component doesn't render anything
};
