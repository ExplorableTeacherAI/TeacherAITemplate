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
        // Find all potential section elements
        // We look for elements with data-section-id or actual <section> tags
        const allElements = Array.from(document.querySelectorAll('section, [data-section-id]'));

        // Filter out elements that might be hidden or inside ignored containers
        const sections = allElements.filter(el => !el.closest('.hierarchy-ignore'));

        if (sections.length === 0) {
            window.parent.postMessage({ type: 'hierarchy-update', hierarchy: [] }, '*');
            return;
        }

        interface FlatNode extends HierarchyNode {
            level: number;
        }

        const flatNodes: FlatNode[] = [];
        let lastHeaderLevel = 0; // 0 means no header seen yet

        sections.forEach((section) => {
            // 1. Identify Heading Level
            const header = section.querySelector('h1, h2, h3, h4, h5, h6');
            let level = 1; // Default level
            let label = "Section";

            if (header) {
                const tagName = header.tagName.toLowerCase();
                const hLevel = parseInt(tagName.replace('h', ''), 10);
                if (!isNaN(hLevel)) {
                    level = hLevel;
                    lastHeaderLevel = hLevel;
                    // Use header text as label
                    label = header.textContent?.trim() || "Untitled Section";
                    if (label.length > 30) label = label.substring(0, 30) + "...";
                }
            } else {
                // No header.
                // Rule: "if below sections do not have [headers], then below sections will be childs"
                // Logic: If we have seen a header at level L, this "body" section becomes L + 1.
                // If we haven't seen any header yet, it stays at level 1.
                if (lastHeaderLevel > 0) {
                    level = lastHeaderLevel + 1;
                } else {
                    level = 1;
                }

                // Try to get a label from first text block or use ID
                const idLabel = section.getAttribute('data-section-id') || section.id;
                if (idLabel && idLabel.length < 20) {
                    label = idLabel;
                } else {
                    // Fallback to truncated content
                    const text = section.textContent?.trim();
                    if (text) {
                        label = text.substring(0, 20) + (text.length > 20 ? "..." : "");
                    }
                }
            }

            // Generate stable ID
            let nodeId = section.getAttribute('data-section-id') || section.id;
            if (!nodeId) {
                if (section.hasAttribute('data-hierarchy-temp-id')) {
                    nodeId = section.getAttribute('data-hierarchy-temp-id')!;
                } else {
                    nodeId = `sec-${Math.random().toString(36).substr(2, 9)}`;
                    section.setAttribute('data-hierarchy-temp-id', nodeId);
                }
            }

            flatNodes.push({
                id: nodeId,
                type: "section",
                sectionId: section.getAttribute('data-section-id') || undefined,
                label: label,
                children: [],
                depth: 0, // Will be fixed during tree build
                level: level
            });
        });

        // 2. Build Tree from Flat List
        const rootNodes: HierarchyNode[] = [];
        const stack: FlatNode[] = []; // Stack tracks the current parent chain

        flatNodes.forEach(node => {
            // Pop stack until we find the correct parent level
            // A node of level L should be a child of the closest node in stack with level < L
            while (stack.length > 0 && stack[stack.length - 1].level >= node.level) {
                stack.pop();
            }

            if (stack.length === 0) {
                // No parent found, add to root
                node.depth = 1;
                rootNodes.push(node);
            } else {
                // Parent found
                const parent = stack[stack.length - 1];
                node.depth = parent.depth + 1;
                parent.children.push(node);
            }

            // Push current node to stack as potential parent for next nodes
            stack.push(node);
        });

        // Send update
        window.parent.postMessage({
            type: 'hierarchy-update',
            hierarchy: rootNodes
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

                // 1. Clear previous selection
                document.querySelectorAll('[data-hierarchy-selected="true"]').forEach(el => {
                    (el as HTMLElement).style.outline = (el as HTMLElement).dataset.originalOutline || "";
                    (el as HTMLElement).style.outlineOffset = (el as HTMLElement).dataset.originalOffset || "";
                    delete (el as HTMLElement).dataset.originalOutline;
                    delete (el as HTMLElement).dataset.originalOffset;
                    el.removeAttribute('data-hierarchy-selected');
                });

                if (sectionId) {
                    const el = document.querySelector(`[data-section-id="${sectionId}"]`);
                    if (el) {
                        el.scrollIntoView({ behavior: 'smooth', block: 'center' });

                        // Apply new selection
                        const htmlEl = el as HTMLElement;

                        // Save original styles if not already saved (though we just cleared global so it should be clean)
                        if (!htmlEl.dataset.originalOutline) {
                            htmlEl.dataset.originalOutline = htmlEl.style.outline;
                            htmlEl.dataset.originalOffset = htmlEl.style.outlineOffset;
                        }

                        htmlEl.style.outline = "3px solid #0D7377";
                        htmlEl.style.outlineOffset = "4px";
                        htmlEl.setAttribute('data-hierarchy-selected', 'true');
                    }
                }
            }

            if (event.data.type === 'highlight-section') {
                const { sectionId, isHovering } = event.data;

                // Remove existing highlights
                document.querySelectorAll('[data-hierarchy-highlight]').forEach(el => {
                    // Don't clear if it's the selected one? 
                    // Hover uses dashed, Selection uses solid. 
                    // To avoid conflict, we can leave selected alone or override.
                    // If we clear outline, we might mess up selection.

                    // Only clear if it is NOT the selected one, OR store distinct hover state.
                    // For simplicity, let's allow hover to override or coexist carefully.
                    // But 'style.outline' is singular.

                    if (!el.hasAttribute('data-hierarchy-selected')) {
                        (el as HTMLElement).style.outline = "";
                        (el as HTMLElement).style.outlineOffset = "";
                    }
                    el.removeAttribute('data-hierarchy-highlight');
                });

                if (isHovering && sectionId) {
                    const el = document.querySelector(`[data-section-id="${sectionId}"]`);
                    if (el && !el.hasAttribute('data-hierarchy-selected')) {
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
