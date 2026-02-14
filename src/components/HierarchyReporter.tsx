import { useEffect } from 'react';

// Define the structure for hierarchy nodes
interface HierarchyNode {
    id: string;
    type: "block" | "layout";
    blockId?: string;
    label: string;
    children: HierarchyNode[];
    depth: number;
}

export const HierarchyReporter = () => {
    // Function to build and send hierarchy
    const reportHierarchy = () => {
        // Find all potential section/block elements
        // We look for elements with data-block-id or actual <section> tags
        const allElements = Array.from(document.querySelectorAll('section, [data-block-id]'));

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
                const idLabel = section.getAttribute('data-block-id') || section.id;
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
            let nodeId = section.getAttribute('data-block-id') || section.id;
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
                type: "block",
                blockId: section.getAttribute('data-block-id') || undefined,
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

            const scrollPayload = event.data.type === 'scroll-to-block' || event.data.type === 'scroll-to-section';
            if (scrollPayload) {
                const targetId = event.data.blockId ?? event.data.sectionId ?? event.data.nodeId;

                // 1. Clear previous selection
                document.querySelectorAll('[data-hierarchy-selected="true"]').forEach(el => {
                    // Restore original style
                    (el as HTMLElement).style.outline = (el as HTMLElement).dataset.originalOutline || "";
                    (el as HTMLElement).style.outlineOffset = (el as HTMLElement).dataset.originalOffset || "";

                    // Clean up data attributes
                    delete (el as HTMLElement).dataset.originalOutline;
                    delete (el as HTMLElement).dataset.originalOffset;
                    el.removeAttribute('data-hierarchy-selected');
                });

                if (targetId) {
                    const el = document.querySelector(`[data-block-id="${targetId}"]`)
                        ?? document.getElementById(targetId)
                        ?? document.querySelector(`[data-hierarchy-temp-id="${targetId}"]`);
                    if (el) {
                        // Defer scroll to next frame so layout is ready
                        requestAnimationFrame(() => {
                            el!.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
                            // If embedded in iframe, also scroll the iframe into view in the parent
                            window.frameElement?.scrollIntoView?.({ behavior: 'smooth', block: 'center' });
                        });

                        const htmlEl = el as HTMLElement;

                        // Check current style before saving it
                        const currentOutline = htmlEl.style.outline;
                        const isOurHighlight = currentOutline.includes('#14B8A6') || currentOutline.includes('dashed'); // Hover style

                        // Save original styles if not already saved
                        if (!htmlEl.dataset.originalOutline) {
                            // If the current outline is OUR highlight, don't save it! Save empty or previous.
                            if (isOurHighlight) {
                                htmlEl.dataset.originalOutline = "";
                            } else {
                                htmlEl.dataset.originalOutline = currentOutline;
                            }

                            htmlEl.dataset.originalOffset = htmlEl.style.outlineOffset;
                        }

                        // Apply Selection Style (Solid)
                        htmlEl.style.outline = "3px solid #0D7377";
                        htmlEl.style.outlineOffset = "4px";
                        htmlEl.setAttribute('data-hierarchy-selected', 'true');

                        // Also remove highlight attribute if present to keep state clean
                        htmlEl.removeAttribute('data-hierarchy-highlight');
                    }
                }
            }

            const highlightPayload = event.data.type === 'highlight-block' || event.data.type === 'highlight-section';
            if (highlightPayload) {
                const targetId2 = event.data.blockId ?? event.data.sectionId ?? event.data.nodeId;
                const isHovering = event.data.isHovering;

                // Remove existing highlights
                document.querySelectorAll('[data-hierarchy-highlight]').forEach(el => {
                    // Only clear style if it's NOT selected (Selection wins)
                    if (!el.hasAttribute('data-hierarchy-selected')) {
                        (el as HTMLElement).style.outline = "";
                        (el as HTMLElement).style.outlineOffset = "";
                    }
                    el.removeAttribute('data-hierarchy-highlight');
                });

                if (isHovering && targetId2) {
                    const el = document.querySelector(`[data-block-id="${targetId2}"]`)
                        ?? document.getElementById(targetId2)
                        ?? document.querySelector(`[data-hierarchy-temp-id="${targetId2}"]`);
                    // Apply highlight only if not already selected
                    if (el && !el.hasAttribute('data-hierarchy-selected')) {
                        (el as HTMLElement).style.outline = "2px dashed #14B8A6";
                        (el as HTMLElement).style.outlineOffset = "2px";
                        el.setAttribute('data-hierarchy-highlight', 'true');
                    }
                }
            }
        };

        window.addEventListener('message', handleMessage);

        // Global click listener to handle deselecting when clicking outside
        const handleGlobalClick = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            // Check if click was inside a traceable section
            const wasInSection = target.closest('section, [data-block-id]');

            if (!wasInSection) {
                // Clicked outside -> Clear selection

                // 1. Clear visual highlights
                document.querySelectorAll('[data-hierarchy-selected="true"]').forEach(el => {
                    (el as HTMLElement).style.outline = (el as HTMLElement).dataset.originalOutline || "";
                    (el as HTMLElement).style.outlineOffset = (el as HTMLElement).dataset.originalOffset || "";
                    delete (el as HTMLElement).dataset.originalOutline;
                    delete (el as HTMLElement).dataset.originalOffset;
                    el.removeAttribute('data-hierarchy-selected');
                });

                // 2. Notify parent
                window.parent.postMessage({
                    type: 'selection-cleared'
                }, '*');
            }
        };

        window.addEventListener('click', handleGlobalClick);

        return () => {
            window.removeEventListener('message', handleMessage);
            window.removeEventListener('click', handleGlobalClick);
        };
    }, []);

    return null; // This component doesn't render anything
};
