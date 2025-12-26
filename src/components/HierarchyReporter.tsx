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

        const buildHierarchy = (element: Element, depth = 0, parentId = ""): HierarchyNode | null => {
            // Check if this is a section
            const sectionId = element.getAttribute("data-section-id");
            const elementId = element.getAttribute("id");

            // Determine if this is a layout component or section
            const layoutType = element.getAttribute("data-layout-type");
            const isLayout = element.classList.contains("layout") || layoutType ||
                (element.tagName === "DIV" &&
                    (element.classList.contains("split-layout") ||
                        element.classList.contains("grid-layout") ||
                        element.classList.contains("sidebar-layout") ||
                        element.classList.contains("full-width-layout")));

            const isSection = element.tagName === "SECTION" || sectionId;

            if (!isLayout && !isSection && depth === 0) {
                // Root level - look for children
                const children: HierarchyNode[] = [];
                Array.from(element.children).forEach((child) => {
                    const childNode = buildHierarchy(child, depth + 1, parentId);
                    if (childNode) children.push(childNode);
                });
                // Flatten root if it's just a container wrapper
                return children.length > 0 ? {
                    id: "root",
                    type: "layout",
                    label: "Root",
                    children,
                    depth
                } : null;
            }

            if (!isLayout && !isSection) {
                // Not a trackable element, check children
                const children: HierarchyNode[] = [];
                Array.from(element.children).forEach((child) => {
                    const childNode = buildHierarchy(child, depth, parentId);
                    if (childNode) children.push(childNode);
                });

                if (children.length === 0) return null;
                if (children.length === 1) return children[0]; // Return single child if wrapper

                // If multiple children, wrap them in a container to preserve structure
                return {
                    id: `${parentId}-${element.tagName.toLowerCase()}-${Math.random().toString(36).substr(2, 9)}`,
                    type: "layout",
                    label: element.tagName.toLowerCase(), // e.g. "div", "main"
                    children,
                    depth,
                };
            }

            // Generate unique ID for this node
            const nodeId = `${parentId}-${sectionId || elementId || element.tagName}-${Math.random().toString(36).substr(2, 9)}`;

            // Get label
            let label = "";
            if (sectionId) {
                label = sectionId;
            } else if (elementId) {
                label = elementId;
            } else if (isLayout) {
                if (layoutType) {
                    // Normalize layout type to readable label
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
                else if (element.classList.contains("full-width-layout")) label = "Full Width Layout";
                else label = "Layout";
            } else {
                label = element.tagName.toLowerCase();
            }

            const node: HierarchyNode = {
                id: nodeId,
                type: isSection ? "section" : "layout",
                sectionId: sectionId || undefined,
                label,
                children: [],
                depth,
            };

            // Parse children
            const children = Array.from(element.children);
            children.forEach((child) => {
                const childNode = buildHierarchy(child, depth + 1, nodeId);
                if (childNode) {
                    if (childNode.id === "root") {
                        node.children.push(...childNode.children);
                    } else {
                        node.children.push(childNode);
                    }
                }
            });

            return node;
        };

        const rootNode = buildHierarchy(body, 0, "root");
        if (rootNode) {
            const nodes = rootNode.id === "root" ? rootNode.children : [rootNode];

            // Send to parent
            window.parent.postMessage({
                type: 'hierarchy-update',
                hierarchy: nodes
            }, '*');
        }
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
