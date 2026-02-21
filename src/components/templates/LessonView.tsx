import { useEffect, useCallback, useState, type ReactElement, isValidElement, Children, type ReactNode, cloneElement } from "react";
import { Block } from "./Block";
import { BlockInput } from "./BlockInput";
import { type SlashCommandType } from "./SlashCommandMenu";
import {
    EditableH1,
    EditableH2,
    EditableH3,
    EditableParagraph,
    InlineScrubbleNumber,
    InlineClozeInput,
    InlineClozeChoice,
    InlineToggle,
    InlineTooltip,
    InlineTrigger,
    InlineHyperlink,
    InlineFormula,
    InlineSpotColor,
    InlineLinkedHighlight
} from "@/components/atoms";
import { EditableText } from "@/components/atoms/text/EditableText";
import { FullWidthLayout } from "@/components/layouts";
import { FormulaBlock } from "@/components/molecules";
import { WelcomeScreen } from "./WelcomeScreen";
import { Card } from "@/components/atoms/ui/card";
import BlockRenderer from "./BlockRenderer";
import { loadBlocks, createBlocksWatcher } from "@/lib/block-loader";
import blockLoaderConfig from "@/config/blocks-loader.config";
import { useAppMode } from "@/contexts/AppModeContext";
import { LoadingScreen } from "@/components/utility/LoadingScreen";
import { useOptionalEditing } from "@/contexts/EditingContext";

/**
 * Decode optional base64-encoded props from a marker.
 * Returns parsed object or null.
 */
const decodeMarkerProps = (encoded: string | undefined): Record<string, unknown> | null => {
    if (!encoded) return null;
    try {
        return JSON.parse(atob(encoded));
    } catch {
        return null;
    }
};

/**
 * Parse content that may contain inline component markers and convert to React elements.
 * Markers formats:
 *   {{componentType:uniqueId}}              — new component (default props)
 *   {{componentType:uniqueId|base64Props}}  — existing component (preserved props)
 */
const parseContentWithInlineComponents = (content: string): React.ReactNode[] => {
    // Regex: group1=type, group2=id (up to | or }}), group3=optional base64 props
    const markerRegex = /\{\{(inlineScrubbleNumber|inlineClozeInput|inlineClozeChoice|inlineToggle|inlineTooltip|inlineTrigger|inlineHyperlink|inlineFormula|inlineSpotColor|inlineLinkedHighlight):([^|}]+)(?:\|([A-Za-z0-9+/=]*))?\}\}/g;

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
            case "inlineScrubbleNumber": {
                const p = savedProps as { varName?: string; defaultValue?: number; min?: number; max?: number; step?: number; color?: string } | null;
                parts.push(
                    <InlineScrubbleNumber
                        key={uniqueId}
                        varName={p?.varName ?? `var_${uniqueId}`}
                        defaultValue={p?.defaultValue ?? 10}
                        min={p?.min ?? 0}
                        max={p?.max ?? 100}
                        step={p?.step ?? 1}
                        {...(p?.color ? { color: p.color } : {})}
                    />
                );
                break;
            }
            case "inlineClozeChoice": {
                const p = savedProps as { varName?: string; correctAnswer?: string; options?: string[]; placeholder?: string; color?: string; bgColor?: string } | null;
                parts.push(
                    <InlineClozeChoice
                        key={uniqueId}
                        varName={p?.varName}
                        correctAnswer={p?.correctAnswer ?? "Option 1"}
                        options={p?.options ?? ["Option 1", "Option 2", "Option 3"]}
                        placeholder={p?.placeholder ?? "???"}
                        color={p?.color}
                        bgColor={p?.bgColor}
                    />
                );
                break;
            }
            case "inlineClozeInput": {
                const p = savedProps as { varName?: string; correctAnswer?: string; placeholder?: string; color?: string; bgColor?: string; caseSensitive?: boolean } | null;
                parts.push(
                    <InlineClozeInput
                        key={uniqueId}
                        varName={p?.varName}
                        correctAnswer={p?.correctAnswer ?? "answer"}
                        placeholder={p?.placeholder ?? "???"}
                        color={p?.color}
                        bgColor={p?.bgColor}
                        caseSensitive={p?.caseSensitive}
                    />
                );
                break;
            }
            case "inlineToggle": {
                const p = savedProps as { varName?: string; options?: string[]; color?: string; bgColor?: string } | null;
                parts.push(
                    <InlineToggle
                        key={uniqueId}
                        varName={p?.varName}
                        options={p?.options ?? ["Option 1", "Option 2", "Option 3"]}
                        color={p?.color}
                        bgColor={p?.bgColor}
                    />
                );
                break;
            }
            case "inlineTooltip": {
                const p = savedProps as { text?: string; tooltip?: string; color?: string; bgColor?: string; position?: string; maxWidth?: number } | null;
                parts.push(
                    <InlineTooltip
                        key={uniqueId}
                        tooltip={p?.tooltip ?? "Tooltip content"}
                        color={p?.color}
                        bgColor={p?.bgColor}
                        position={p?.position}
                        maxWidth={p?.maxWidth}
                    >
                        {p?.text ?? "term"}
                    </InlineTooltip>
                );
                break;
            }
            case "inlineTrigger": {
                const p = savedProps as { text?: string; varName?: string; value?: string | number | boolean; color?: string; bgColor?: string } | null;
                parts.push(
                    <InlineTrigger
                        key={uniqueId}
                        varName={p?.varName}
                        value={p?.value}
                        color={p?.color}
                        bgColor={p?.bgColor}
                    >
                        {p?.text ?? "trigger"}
                    </InlineTrigger>
                );
                break;
            }
            case "inlineHyperlink": {
                const p = savedProps as { text?: string; href?: string; targetBlockId?: string; color?: string; bgColor?: string } | null;
                parts.push(
                    <InlineHyperlink
                        key={uniqueId}
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
                const p = savedProps as { latex?: string; colorMap?: Record<string, string>; color?: string } | null;
                parts.push(
                    <InlineFormula
                        key={uniqueId}
                        latex={p?.latex ?? "x^2"}
                        colorMap={p?.colorMap}
                        color={p?.color}
                    />
                );
                break;
            }
            case "inlineSpotColor": {
                const p = savedProps as { varName?: string; color?: string; text?: string } | null;
                parts.push(
                    <InlineSpotColor
                        key={uniqueId}
                        varName={p?.varName ?? `var_${uniqueId}`}
                        color={p?.color ?? "#3B82F6"}
                    >
                        {p?.text ?? "variable"}
                    </InlineSpotColor>
                );
                break;
            }
            case "inlineLinkedHighlight": {
                const p = savedProps as { varName?: string; highlightId?: string; color?: string; bgColor?: string; text?: string } | null;
                parts.push(
                    <InlineLinkedHighlight
                        key={uniqueId}
                        varName={p?.varName ?? `highlight_${uniqueId}`}
                        highlightId={p?.highlightId ?? uniqueId}
                        color={p?.color}
                        bgColor={p?.bgColor}
                    >
                        {p?.text ?? "highlight"}
                    </InlineLinkedHighlight>
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
    return /\{\{(inlineScrubbleNumber|inlineClozeInput|inlineClozeChoice|inlineToggle|inlineTooltip|inlineTrigger|inlineHyperlink|inlineFormula|inlineSpotColor|inlineLinkedHighlight):[^}]+\}\}/.test(content);
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

export const LessonView = ({ onEditBlock }: LessonViewProps) => {
    const [initialBlocks, setInitialBlocks] = useState<ReactElement[]>([]);
    const [loadingBlocks, setLoadingBlocks] = useState(true);
    const { isPreview } = useAppMode();
    const editing = useOptionalEditing();

    const handleCommitBlock = (blockId: string, content: string, blockType?: SlashCommandType) => {
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
                    case "formulaBlock":
                        contentElement = (
                            <FormulaBlock
                                latex={content || "E = mc^2"}
                                colorMap={{}}
                                variables={{}}
                            />
                        );
                        // Open the editor modal for the new formula block
                        if (editing) {
                            setTimeout(() => {
                                editing.openFormulaBlockEditor(
                                    { latex: content || "E = mc^2", colorMap: {}, variables: {}, isNew: true },
                                    blockId,
                                    `formulaBlock-${blockId}`
                                );
                            }, 100);
                        }
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
    };

    /**
     * Handle inline component insertion from EditableText.
     * When a user inserts an inline component via "/" in an existing paragraph,
     * the block needs to be re-rendered with real React components.
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
    }, []);

    // Listen for inline component insertions from EditableText
    useEffect(() => {
        const handler = (e: Event) => {
            const { blockId, content } = (e as CustomEvent).detail;
            handleInlineContentUpdate(blockId, content);
        };
        window.addEventListener('block-inline-content-update', handler);
        return () => window.removeEventListener('block-inline-content-update', handler);
    }, [handleInlineContentUpdate]);

    const handleAddBlock = (targetId: string) => {
        console.log("handleAddBlock called with targetId:", targetId);
        // Find index of element containing targetId
        const index = initialBlocks.findIndex(block => hasElementId(block, targetId));
        console.log("Found index:", index, "out of", initialBlocks.length, "blocks");

        if (index !== -1) {
            // Create new Block directly (no Section wrapper needed)
            const newId = `block-${Date.now()}`;
            const newBlock = (
                <FullWidthLayout key={`layout-${newId}`} maxWidth="xl">
                    <Block id={newId} padding="sm">
                        <BlockInput
                            id={newId}
                            onCommit={handleCommitBlock}
                            placeholder="Type '/' for commands"
                        />
                    </Block>
                </FullWidthLayout>
            );

            // Track the addition of the new block placeholder immediately
            if (editing) {
                editing.addStructureEdit({
                    action: 'add',
                    blockId: newId,
                    blockType: 'placeholder',
                    afterBlockId: targetId,
                    content: ''
                });
            }

            // Insert after the found element
            const newBlocks = [
                ...initialBlocks.slice(0, index + 1),
                newBlock,
                ...initialBlocks.slice(index + 1)
            ];

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
                        if (!cancelled) {
                            setInitialBlocks(updatedBlocks);
                        }
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

    // Show loading screen at top level
    if (loadingBlocks) {
        return <LoadingScreen />;
    }

    const getBlockIdFromElement = (element: ReactElement): string | undefined => {
        // Try to find the block ID by traversing down
        if (!isValidElement(element)) return undefined;

        // Cast to access props safely
        const el = element as ReactElement<{ id?: string; children?: ReactNode }>;

        // Check if this element is a Block
        if (el.props.id && el.type === Block) return el.props.id;
        // Also check standard prop
        if (el.props.id) return el.props.id;

        let foundId: string | undefined = undefined;
        if (el.props.children) {
            Children.forEach(el.props.children, (child) => {
                if (!foundId && isValidElement(child)) {
                    foundId = getBlockIdFromElement(child as ReactElement);
                }
            });
        }
        return foundId;
    };


    const handleReorder = (newBlocks: ReactElement[]) => {
        setInitialBlocks(newBlocks);

        // Extract IDs to track the new order
        const blockIds = newBlocks.map(s => {
            // If key has format 'layout-...' try to parse it
            if (s.key && typeof s.key === 'string' && s.key.startsWith('layout-')) {
                return s.key.replace('layout-', '');
            }
            // Otherwise try to find inner Block ID
            return getBlockIdFromElement(s) || 'unknown';
        });

        // Record the reorder as an edit
        if (editing) {
            editing.addStructureEdit({
                action: 'reorder',
                blockIds,
            });
        }

        // Also notify parent (for legacy support)
        window.parent.postMessage({
            type: 'commit-block-reorder',
            blockIds
        }, '*');
    };

    const handleDeleteBlock = (blockId: string) => {
        setInitialBlocks(prev => {
            // We need to remove the top-level element that CONTAINS this blockId
            return prev.filter(block => !hasElementId(block, blockId));
        });

        // Record the delete as an edit
        if (editing) {
            editing.addStructureEdit({
                action: 'delete',
                blockId,
            });
        }

        // Also notify parent (for legacy support)
        window.parent.postMessage({
            type: 'commit-block-delete',
            blockId
        }, '*');
    };

    return (
        <div className="flex flex-col h-full glass">
            <Card className="flex-1 overflow-hidden bg-white no-border relative">
                {initialBlocks.length > 0 ? (
                    <div className="relative w-full h-full">
                        <BlockRenderer
                            initialBlocks={initialBlocks}
                            isPreview={isPreview}
                            onEditBlock={onEditBlock}
                            onAddBlock={handleAddBlock}
                            onReorder={handleReorder}
                            onDeleteBlock={handleDeleteBlock}
                        />
                    </div>
                ) : (
                    <WelcomeScreen />
                )}
            </Card>
        </div>
    );
};