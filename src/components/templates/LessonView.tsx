import { useEffect, useCallback, useMemo, useState, type ReactElement, isValidElement, Children, Fragment, type ReactNode, cloneElement } from "react";
import { Block } from "./Block";
import { BlockInput } from "./BlockInput";
import { type SlashCommandType } from "./SlashCommandMenu";
import {
    EditableH1,
    EditableH2,
    EditableH3,
    EditableParagraph,
    InlineHyperlink,
    InlineFormula,
} from "@/components/atoms";
import { EditableText } from "@/components/atoms/text/EditableText";
import { StackLayout } from "@/components/layouts";
import { FormulaBlock } from "@/components/molecules";
import { WelcomeScreen } from "./WelcomeScreen";
import { SectionBuildSkeleton } from "./SectionBuildSkeleton";
import { Card } from "@/components/atoms/ui/card";
import BlockRenderer from "./BlockRenderer";
import {
    collectBlockIds,
    getSectionBlockIds,
    isInFlight,
    useSectionBuildStatus,
    type SectionBuildInfo,
} from "@/lib/section-build-status";
import { loadBlocks, createBlocksWatcher } from "@/lib/block-loader";
import blockLoaderConfig from "@/config/blocks-loader.config";
import { useAppMode } from "@/contexts/AppModeContext";
import { LoadingScreen } from "@/components/utility/LoadingScreen";
import { useOptionalEditing } from "@/contexts/EditingContext";
import { decodeMarkerProps } from "@/lib/inlineMarkers";
import { collectBlockIds as collectSortableBlockIds, removeBlockFromTree, serializeBlockLayout } from "@/lib/block-tree";

/**
 * Decode optional base64-encoded props from a marker.
 * Returns parsed object or null.
 */
/**
 * Parse content that may contain inline component markers and convert to React elements.
 * Markers formats:
 *   {{componentType:uniqueId}}              — new component (default props)
 *   {{componentType:uniqueId|base64Props}}  — existing component (preserved props)
 */
const parseContentWithInlineComponents = (content: string): React.ReactNode[] => {
    // Regex: group1=type, group2=id (up to | or }}), group3=optional base64 props
    const markerRegex = /\{\{(inlineHyperlink|inlineFormula):([^|}]+)(?:\|([A-Za-z0-9+/=]*))?\}\}/g;

    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;

    while ((match = markerRegex.exec(content)) !== null) {
        // Add text before the marker
        if (match.index > lastIndex) {
            parts.push(content.slice(lastIndex, match.index));
        }

        const [, componentType, uniqueId, encodedProps] = match;
        const savedProps = decodeMarkerProps(encodedProps);

        // Create the appropriate inline component, using saved props when available
        switch (componentType) {
            case "inlineHyperlink": {
                const p = savedProps as { text?: string; href?: string; targetBlockId?: string; color?: string; bgColor?: string } | null;
                parts.push(
                    <InlineHyperlink
                        key={uniqueId}
                        id={uniqueId}
                        href={p?.href}
                        targetBlockId={p?.targetBlockId}
                        color={p?.color}
                        bgColor={p?.bgColor}
                    >
                        {p?.text ?? "link"}
                    </InlineHyperlink>
                );
                break;
            }
            case "inlineFormula": {
                const p = savedProps as { latex?: string } | null;
                parts.push(
                    <InlineFormula key={uniqueId} id={uniqueId} latex={p?.latex ?? "x^2"} />
                );
                break;
            }
            default:
                // If unknown, just keep the text
                parts.push(match[0]);
        }

        lastIndex = match.index + match[0].length;
    }

    // Add any remaining text after the last marker
    if (lastIndex < content.length) {
        parts.push(content.slice(lastIndex));
    }

    // If no markers were found, return the original content
    if (parts.length === 0) {
        return [content];
    }

    return parts;
};

/**
 * Check if content contains inline component markers (with or without props)
 */
const hasInlineComponents = (content: string): boolean => {
    return /\{\{(inlineHyperlink|inlineFormula):[^}]+\}\}/.test(content);
};

interface LessonViewProps {
    onEditBlock?: (instruction: string) => void;
}

/**
 * Helper to check if a React element or its children contains a section or block with the given ID
 */
const hasElementId = (element: ReactNode, targetId: string): boolean => {
    if (!isValidElement(element)) return false;

    // Check for section id or block id
    if (element.props.id === targetId) return true;

    let found = false;
    Children.forEach(element.props.children, (child) => {
        if (!found && hasElementId(child, targetId)) {
            found = true;
        }
    });
    return found;
};

/** Return the first stable block identity found in a rendered lesson node. */
const extractBlockId = (element: ReactElement): string | undefined => {
    if (!isValidElement(element)) return undefined;
    const el = element as ReactElement<{ id?: string; blockId?: string; children?: ReactNode }>;
    if (el.props.id) return el.props.id;
    if (el.props.blockId) return el.props.blockId;
    if (el.key) {
        const key = String(el.key);
        if (key.startsWith('layout-')) return key.replace('layout-', '');
        if (key.startsWith('.')) return key.substring(1);
        return key;
    }

    let found: string | undefined;
    Children.forEach(el.props.children, child => {
        if (!found && isValidElement(child)) {
            found = extractBlockId(child as ReactElement);
        }
    });
    return found;
};

/**
 * Find the id prop of an EditableParagraph (or similar) that has a matching blockId,
 * so we can preserve it when replacing block content after inline component insertion.
 */
const findParagraphId = (element: ReactNode, targetBlockId: string): string | undefined => {
    if (!isValidElement(element)) return undefined;
    const el = element as ReactElement<Record<string, unknown>>;
    if (el.props.blockId === targetBlockId && typeof el.props.id === 'string') {
        return el.props.id;
    }
    let found: string | undefined;
    Children.forEach(el.props.children, (child) => {
        if (!found) found = findParagraphId(child, targetBlockId);
    });
    return found;
};

/**
 * Helper to replace content of a block with given ID
 */
const replaceBlockContent = (element: ReactElement, targetId: string, newContent: ReactNode): ReactElement => {
    if (!isValidElement(element)) return element;

    if ((element as ReactElement).props.id === targetId) {
        // Found the block, Clone it but with new children
        // We preserve other props like className etc.
        return cloneElement(element as ReactElement, {}, newContent);
    }

    // Recursive check children
    if ((element as ReactElement).props.children) {
        const children = Children.map((element as ReactElement).props.children, (child) => {
            return replaceBlockContent(child as ReactElement, targetId, newContent);
        });

        return cloneElement(element as ReactElement, {}, children);
    }

    return element;
};

const EMPTY_BLOCK_PLACEHOLDER = "Type '/' for commands or press Space to ask AI";

/**
 * React source for an empty paragraph can be `null`, an empty string, or only
 * formatting whitespace. Keep this check at the React-tree level so a saved
 * empty paragraph is rendered with the same editor as a newly inserted block.
 */
const isVisuallyEmptyReactContent = (node: ReactNode): boolean => {
    if (node === null || node === undefined || typeof node === 'boolean') return true;
    if (typeof node === 'string' || typeof node === 'number') {
        return String(node).replace(/(?:\s|\u00a0|\u200B|\uFEFF)+/g, '').length === 0;
    }
    if (Array.isArray(node)) return node.every(isVisuallyEmptyReactContent);
    if (isValidElement(node) && node.type === Fragment) {
        return isVisuallyEmptyReactContent(
            (node as ReactElement<{ children?: ReactNode }>).props.children
        );
    }
    return false;
};

const replacePersistedEmptyParagraph = (
    node: ReactNode,
    onCommit: (id: string, value: string, blockType?: SlashCommandType) => void,
    onAIRequest: (id: string, instruction: string) => void,
): ReactNode => {
    if (!isValidElement(node)) return node;

    const element = node as ReactElement<{ blockId?: string; children?: ReactNode }>;
    if (
        element.type === EditableParagraph &&
        element.props.blockId &&
        isVisuallyEmptyReactContent(element.props.children)
    ) {
        return (
            <BlockInput
                key={element.key ?? `empty-${element.props.blockId}`}
                id={element.props.blockId}
                onCommit={onCommit}
                onAIRequest={onAIRequest}
                placeholder={EMPTY_BLOCK_PLACEHOLDER}
            />
        );
    }

    if (element.props.children === undefined) return element;
    return cloneElement(
        element,
        {},
        Children.map(element.props.children, child =>
            replacePersistedEmptyParagraph(child, onCommit, onAIRequest)
        ),
    );
};

const inlineComponentTypes = new Set<unknown>([
    InlineHyperlink,
    InlineFormula,
]);

const removeInlineComponentById = (node: ReactNode, componentId: string): ReactNode => {
    if (!isValidElement(node)) return node;
    const element = node as ReactElement<Record<string, unknown>>;
    if (inlineComponentTypes.has(element.type) && element.props.id === componentId) {
        return null;
    }
    if (!('children' in element.props)) return element;
    const children = Children.map(element.props.children as ReactNode, child =>
        removeInlineComponentById(child, componentId)
    );
    return cloneElement(element, {}, children);
};

export const LessonView = ({ onEditBlock }: LessonViewProps) => {
    const [initialBlocks, setInitialBlocks] = useState<ReactElement[]>([]);
    const [loadingBlocks, setLoadingBlocks] = useState(true);
    const { isEditor, isPreview } = useAppMode();
    const editing = useOptionalEditing();

    // ---- live section-build progress (teacher's editor preview only) ------
    // The parent frontend posts section-build-status messages while builds
    // run. In-flight sections whose blocks are already in the lesson get an
    // update glow; the rest render as skeletons below the existing content.
    const buildSections = useSectionBuildStatus();
    const lessonBlockIds = useMemo(() => {
        const ids = new Set<string>();
        initialBlocks.forEach((block) => collectBlockIds(block, ids));
        return ids;
    }, [initialBlocks]);
    // Block id → badge label for blocks being updated (label only on the
    // section's first block so it isn't repeated on every block).
    const [glowBlocks, setGlowBlocks] = useState<Map<string, string>>(new Map());
    const [skeletonSections, setSkeletonSections] = useState<SectionBuildInfo[]>([]);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            const glow = new Map<string, string>();
            const skeletons: SectionBuildInfo[] = [];
            for (const section of buildSections.filter(isInFlight)) {
                const sectionIds = await getSectionBlockIds(section.id);
                const visible = [...sectionIds].filter((id) => lessonBlockIds.has(id));
                if (visible.length > 0) {
                    const label = "Updating…";
                    visible.forEach((id, index) => glow.set(id, index === 0 ? label : ""));
                } else {
                    skeletons.push(section);
                }
            }
            if (cancelled) return;
            setGlowBlocks((prev) => {
                if (prev.size === glow.size && [...glow].every(([k, v]) => prev.get(k) === v)) {
                    return prev;
                }
                return glow;
            });
            setSkeletonSections((prev) => {
                const same =
                    prev.length === skeletons.length &&
                    prev.every(
                        (s, i) =>
                            s.id === skeletons[i].id &&
                            s.status === skeletons[i].status &&
                            s.detail === skeletons[i].detail
                    );
                return same ? prev : skeletons;
            });
        })();
        return () => {
            cancelled = true;
        };
    }, [buildSections, lessonBlockIds]);

    // Apply the glow at the DOM level: wrapping the block elements would break
    // BlockRenderer's reorder/editing identity, but every Block renders a
    // stable [data-block-id] node we can decorate. pointer-events is disabled
    // via the class so the teacher can't interact with a half-verified section.
    useEffect(() => {
        const applied: HTMLElement[] = [];
        glowBlocks.forEach((label, id) => {
            const el = document.querySelector(
                `[data-block-id="${CSS.escape(id)}"]`
            ) as HTMLElement | null;
            if (!el) return;
            el.classList.add("section-build-glow");
            if (label) el.setAttribute("data-build-label", label);
            applied.push(el);
        });
        return () =>
            applied.forEach((el) => {
                el.classList.remove("section-build-glow");
                el.removeAttribute("data-build-label");
            });
    }, [glowBlocks, initialBlocks, loadingBlocks]);

    const handleCommitBlock = useCallback((blockId: string, content: string, blockType?: SlashCommandType) => {
        console.log("Committing block:", { blockId, content, blockType, hasEditing: !!editing });

        setInitialBlocks(prevBlocks => {
            return prevBlocks.map(block => {
                // Create the appropriate element based on block type
                let contentElement: React.ReactNode;

                // Parse content for inline components
                const parsedContent = hasInlineComponents(content)
                    ? parseContentWithInlineComponents(content)
                    : content;

                switch (blockType) {
                    case "h1":
                        contentElement = (
                            <EditableH1 blockId={blockId}>
                                {parsedContent}
                            </EditableH1>
                        );
                        break;
                    case "h2":
                        contentElement = (
                            <EditableH2 blockId={blockId}>
                                {parsedContent}
                            </EditableH2>
                        );
                        break;
                    case "h3":
                        contentElement = (
                            <EditableH3 blockId={blockId}>
                                {parsedContent}
                            </EditableH3>
                        );
                        break;
                    case "quote":
                        contentElement = (
                            <blockquote className="border-l-4 border-gray-300 pl-4 py-2">
                                <EditableText
                                    blockId={blockId}
                                    as="p"
                                    className="text-lg italic text-gray-600"
                                >
                                    {parsedContent}
                                </EditableText>
                            </blockquote>
                        );
                        break;
                    case "divider":
                        contentElement = (
                            <hr className="my-6 border-t border-gray-200" />
                        );
                        break;
                    case "paragraph":
                    default:
                        contentElement = (
                            <EditableParagraph blockId={blockId}>
                                {parsedContent}
                            </EditableParagraph>
                        );
                        break;
                }

                // Replace the Block's children (BlockInput) with the new content
                // The Block wrapper already exists, so we just replace its content
                return replaceBlockContent(block, blockId, contentElement);
            });
        });

        if (editing) {
            console.log("Adding structure edit for commit");
            editing.addStructureEdit({
                action: 'add',
                blockId,
                content,
                blockType
            });
        } else {
            // Fallback or dev mode without context?
            console.warn("Editing context not found, cannot batch save block add");
        }
    }, [editing]);

    /**
     * Handle inline component insertion from EditableText.
     * When a user inserts an inline component via "/" in an existing paragraph,
     * the block needs to be re-rendered with real React components.
     * Also creates a structure edit so the backend knows to insert the component
     * into the source code.
     */
    const handleInlineContentUpdate = useCallback((blockId: string, content: string) => {
        if (!hasInlineComponents(content)) return;

        const parsedContent = parseContentWithInlineComponents(content);

        setInitialBlocks(prevBlocks => {
            return prevBlocks.map(block => {
                if (!hasElementId(block, blockId)) return block;

                // Preserve the original EditableParagraph's id prop
                const paraId = findParagraphId(block, blockId);

                const contentElement = (
                    <EditableParagraph id={paraId} blockId={blockId}>
                        {parsedContent}
                    </EditableParagraph>
                );

                return replaceBlockContent(block, blockId, contentElement);
            });
        });

        // Create a structure edit so the backend inserts the inline component
        // into the existing paragraph's source code.
        if (editing) {
            editing.addStructureEdit({
                action: 'add' as const,
                blockId,
                content,
                blockType: 'modify-content',
            });
        }
    }, [editing]);

    // Listen for inline component insertions from EditableText
    useEffect(() => {
        const handler = (e: Event) => {
            const { blockId, content } = (e as CustomEvent).detail;
            handleInlineContentUpdate(blockId, content);
        };
        window.addEventListener('block-inline-content-update', handler);
        return () => window.removeEventListener('block-inline-content-update', handler);
    }, [handleInlineContentUpdate]);

    useEffect(() => {
        const handler = (event: Event) => {
            const { componentId } = (event as CustomEvent<{ componentId?: string }>).detail || {};
            if (!componentId) return;
            setInitialBlocks(previous => previous.map(block =>
                removeInlineComponentById(block, componentId) as ReactElement
            ));
        };
        window.addEventListener('inline-component-cancelled', handler);
        return () => window.removeEventListener('inline-component-cancelled', handler);
    }, []);

    // Notify parent when all content (including images) is fully loaded
    useEffect(() => {
        if (loadingBlocks) return;

        let contentReadySent = false;
        const notifyContentReady = () => {
            if (contentReadySent) return;
            contentReadySent = true;
            window.parent.postMessage({ type: 'content-ready' }, '*');
        };

        // Wait for DOM to actually be painted before checking content
        // Use requestAnimationFrame twice to ensure React has committed and painted
        const waitForPaint = () => {
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    // Verify that content is actually rendered in DOM
                    // Either blocks exist, build skeletons are shown, OR the
                    // welcome screen is shown
                    const hasBlocks = document.querySelectorAll('section, [data-block-id], [data-build-skeleton]').length > 0;
                    const hasWelcomeScreen = document.querySelector('.glass') !== null;

                    if (!hasBlocks && !hasWelcomeScreen) {
                        // Content not yet rendered, wait a bit and retry
                        setTimeout(waitForPaint, 100);
                        return;
                    }

                    // Now check for images
                    const images = document.querySelectorAll('img');
                    if (images.length === 0) {
                        // No images, we're ready immediately
                        notifyContentReady();
                        return;
                    }

                    let loadedCount = 0;
                    const totalImages = images.length;

                    const checkAllLoaded = () => {
                        loadedCount++;
                        if (loadedCount >= totalImages) {
                            notifyContentReady();
                        }
                    };

                    images.forEach((img) => {
                        if (img.complete) {
                            checkAllLoaded();
                        } else {
                            img.addEventListener('load', checkAllLoaded, { once: true });
                            img.addEventListener('error', checkAllLoaded, { once: true });
                        }
                    });
                });
            });
        };

        waitForPaint();

        // Fallback: send ready after 5 seconds even if something is slow
        const fallbackTimeout = setTimeout(() => {
            notifyContentReady();
        }, 5000);

        return () => {
            clearTimeout(fallbackTimeout);
        };
    }, [loadingBlocks, initialBlocks]);

    /**
     * Handle AI request from a BlockInput: sends the instruction + location context
     * to the parent window (Frontend) which routes it to the builder chat.
     * Also removes the placeholder structure edit that handleAddBlock created,
     * since the builder chat will handle the block creation.
     */
    const handleAIRequest = useCallback((
        blockId: string,
        instruction: string,
        afterBlockId: string | null,
        beforeBlockId: string | null,
        replaceExisting = false,
    ) => {
        // A newly inserted BlockInput has a provisional add edit. The AI path
        // owns its creation, so discard that edit. A persisted empty paragraph
        // already exists and must instead be addressed as a replacement.
        if (editing && !replaceExisting) {
            const placeholderEdit = editing.pendingEdits.find(
                e => e.type === 'structure' &&
                    e.action === 'add' &&
                    e.blockId === blockId
            );
            if (placeholderEdit) {
                editing.removeEdit(placeholderEdit.id);
            }
        }

        console.log("AI Request:", { blockId, instruction, afterBlockId, beforeBlockId });

        // Send to parent window (Frontend)
        window.parent.postMessage({
            type: 'block-ai-request',
            instruction,
            ...(replaceExisting
                ? { replaceBlockId: blockId }
                : { newBlockId: blockId }),
            afterBlockId,
            beforeBlockId,
        }, '*');
    }, [editing]);

    const handlePersistedEmptyAIRequest = useCallback((blockId: string, instruction: string) => {
        const index = initialBlocks.findIndex(block => hasElementId(block, blockId));
        const afterBlockId = index > 0 ? extractBlockId(initialBlocks[index - 1]) || null : null;
        const beforeBlockId = index >= 0 && index + 1 < initialBlocks.length
            ? extractBlockId(initialBlocks[index + 1]) || null
            : null;
        handleAIRequest(blockId, instruction, afterBlockId, beforeBlockId, true);
    }, [handleAIRequest, initialBlocks]);

    const handleAddBlock = (targetId: string) => {
        console.log("handleAddBlock called with targetId:", targetId);
        // Find index of element containing targetId
        const index = initialBlocks.findIndex(block => hasElementId(block, targetId));
        console.log("Found index:", index, "out of", initialBlocks.length, "blocks");

        if (index !== -1) {
            // Create new Block directly (no Section wrapper needed)
            const newId = `block-${Date.now()}`;

            // Capture location context NOW (targetId is the block we're inserting after)
            const afterId = targetId;
            // The block after the new one is the block currently at index+1
            let beforeId: string | null = null;
            if (index + 1 < initialBlocks.length) {
                beforeId = extractBlockId(initialBlocks[index + 1]) || null;
            }

            const newBlock = (
                <StackLayout key={`layout-${newId}`} maxWidth="xl">
                    <Block id={newId} padding="sm">
                        <BlockInput
                            id={newId}
                            onCommit={handleCommitBlock}
                            onAIRequest={(id, instruction) => handleAIRequest(id, instruction, afterId, beforeId)}
                            placeholder={EMPTY_BLOCK_PLACEHOLDER}
                        />
                    </Block>
                </StackLayout>
            );

            // Insert after the found element
            const newBlocks = [
                ...initialBlocks.slice(0, index + 1),
                newBlock,
                ...initialBlocks.slice(index + 1)
            ];

            // Persist both the insertion anchor and the complete resulting
            // order so add + reorder combinations never depend on file layout.
            if (editing) {
                editing.addStructureEdit({
                    action: 'add',
                    blockId: newId,
                    blockType: 'placeholder',
                    afterBlockId: targetId,
                    content: '',
                    blockIds: collectSortableBlockIds(newBlocks),
                    layout: serializeBlockLayout(newBlocks),
                });
            }

            setInitialBlocks(newBlocks);
        } else {
            console.warn("Could not find block with id:", targetId);
        }
    };

    useEffect(() => {
        let cancelled = false;
        let cleanup: (() => void) | null = null;

        (async () => {
            // Load blocks using the configured strategy
            const blocks = await loadBlocks(blockLoaderConfig);
            if (cancelled) return;
            setInitialBlocks(Array.isArray(blocks) ? blocks : []);
            setLoadingBlocks(false);

            // Set up watcher for automatic updates in dev mode
            if (import.meta.env.DEV) {
                cleanup = createBlocksWatcher(
                    (updatedBlocks) => {
                        if (cancelled) return;
                        // A builder mid-write leaves the blocks file briefly
                        // non-compiling, and the watcher then reports zero
                        // blocks. Keep the last good lesson on screen instead
                        // of blanking to the welcome screen; the next good
                        // update (or the post-turn reload) replaces it.
                        setInitialBlocks((previous) =>
                            updatedBlocks.length === 0 && previous.length > 0
                                ? previous
                                : updatedBlocks
                        );
                    },
                    blockLoaderConfig
                );
            }
        })();

        return () => {
            cancelled = true;
            if (cleanup) cleanup();
        };
    }, []);

    const handleReorder = (newBlocks: ReactElement[]) => {
        setInitialBlocks(newBlocks);

        // Persist every nested Block in visual slot order. Layout wrappers are
        // placement containers, not draggable content units.
        const blockIds = collectSortableBlockIds(newBlocks);

        // Record the reorder as an edit
        if (editing) {
            editing.addStructureEdit({
                action: 'reorder',
                blockIds,
                layout: serializeBlockLayout(newBlocks),
            });
        }

        // Also notify parent (for legacy support)
        window.parent.postMessage({
            type: 'commit-block-reorder',
            blockIds
        }, '*');
    };

    const handleDeleteBlock = (blockId: string) => {
        // Delete only this block, matching the deterministic source mutation
        // performed by the backend. A split row whose other side survives
        // collapses to a stack; the layout goes only when it empties.
        const newBlocks = removeBlockFromTree(initialBlocks, blockId);
        setInitialBlocks(newBlocks);

        // Record the delete as an edit
        if (editing) {
            editing.addStructureEdit({
                action: 'delete',
                blockId,
                blockIds: collectSortableBlockIds(newBlocks),
                layout: serializeBlockLayout(newBlocks),
            });
        }

        // Also notify parent (for legacy support)
        window.parent.postMessage({
            type: 'commit-block-delete',
            blockId
        }, '*');
    };

    // Saved empty paragraphs must remain first-class block inputs. This keeps
    // their caret, slash commands, and Space-to-Ask-AI behavior identical
    // before and after an auto-save/reload.
    const renderedBlocks = useMemo(() => {
        if (!isEditor) return initialBlocks;
        return initialBlocks.map(block =>
            replacePersistedEmptyParagraph(
                block,
                handleCommitBlock,
                handlePersistedEmptyAIRequest,
            ) as ReactElement
        );
    }, [handleCommitBlock, handlePersistedEmptyAIRequest, initialBlocks, isEditor]);

    // Keep every hook above this loading branch so the editor and loading
    // renders always execute hooks in exactly the same order.
    if (loadingBlocks) {
        return <LoadingScreen />;
    }

    // Skeleton placeholders for sections still building in the background,
    // rendered below the real blocks (or instead of the welcome screen).
    const buildSkeletons =
        skeletonSections.length > 0 ? (
            <div className={initialBlocks.length > 0 ? "space-y-4 pt-4" : "space-y-4"}>
                {skeletonSections.map((section) => (
                    <SectionBuildSkeleton
                        key={section.id}
                        title={section.title}
                        status={section.status}
                        detail={section.detail}
                    />
                ))}
            </div>
        ) : null;

    return (
        <div className="flex flex-col h-full glass">
            <Card className="flex-1 overflow-hidden bg-white no-border relative">
                {initialBlocks.length > 0 || skeletonSections.length > 0 ? (
                    <div className="relative w-full h-full">
                        <BlockRenderer
                            initialBlocks={renderedBlocks}
                            isPreview={isPreview}
                            onEditBlock={onEditBlock}
                            onAddBlock={handleAddBlock}
                            onReorder={handleReorder}
                            onDeleteBlock={handleDeleteBlock}
                            trailingContent={buildSkeletons}
                        />
                    </div>
                ) : (
                    // Nothing built yet (e.g. during clarification, before the
                    // plan is confirmed). Once section builds start, their
                    // `Section:` skeletons satisfy the branch above, and an
                    // existing lesson is protected from mid-write blanking by
                    // the watcher keeping the last good blocks.
                    <WelcomeScreen />
                )}
            </Card>
        </div>
    );
};
