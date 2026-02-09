import { useEffect, useState, type ReactElement, isValidElement, Children, type ReactNode, cloneElement } from "react";
import { Block } from "./Block";
import { SectionInput } from "./SectionInput";
import { type SlashCommandType } from "./SlashCommandMenu";
import {
    EditableH1,
    EditableH2,
    EditableH3,
    EditableParagraph,
    InlineScrubbleNumber,
    InlineDropdown,
    InlineTextInput
} from "@/components/atoms";
import { EditableText } from "@/components/editing/EditableText";
import { FullWidthLayout } from "@/components/layouts";
import { WelcomeScreen } from "./WelcomeScreen";
import { Card } from "@/components/atoms/ui/card";
import SectionRenderer from "./SectionRenderer";
import { loadSections, createSectionsWatcher } from "@/lib/section-loader";
import sectionLoaderConfig from "@/config/sections-loader.config";
import { useAppMode } from "@/contexts/AppModeContext";
import { LoadingScreen } from "@/components/atoms/LoadingScreen";
import { useOptionalEditing } from "@/contexts/EditingContext";

/**
 * Parse content that may contain inline component markers and convert to React elements
 * Markers are in format: {{componentType:uniqueId}}
 * Example: "Text with {{inlineScrubbleNumber:123}} inline component"
 */
const parseContentWithInlineComponents = (content: string): React.ReactNode[] => {
    // Regex to match inline component markers
    const markerRegex = /\{\{(inlineScrubbleNumber|inlineDropdown|inlineTextInput):([^}]+)\}\}/g;

    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;

    while ((match = markerRegex.exec(content)) !== null) {
        // Add text before the marker
        if (match.index > lastIndex) {
            parts.push(content.slice(lastIndex, match.index));
        }

        const [, componentType, uniqueId] = match;

        // Create the appropriate inline component
        switch (componentType) {
            case "inlineScrubbleNumber":
                parts.push(
                    <InlineScrubbleNumber
                        key={uniqueId}
                        varName={`var_${uniqueId}`}
                        defaultValue={10}
                        min={0}
                        max={100}
                    />
                );
                break;
            case "inlineDropdown":
                parts.push(
                    <InlineDropdown
                        key={uniqueId}
                        correctAnswer="Option 1"
                        options={["Option 1", "Option 2", "Option 3"]}
                    />
                );
                break;
            case "inlineTextInput":
                parts.push(
                    <InlineTextInput
                        key={uniqueId}
                        correctAnswer="answer"
                        placeholder="Type answer..."
                    />
                );
                break;
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
 * Check if content contains inline component markers
 */
const hasInlineComponents = (content: string): boolean => {
    return /\{\{(inlineScrubbleNumber|inlineDropdown|inlineTextInput):[^}]+\}\}/.test(content);
};

interface LessonViewProps {
    onEditSection?: (instruction: string) => void;
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
 * Helper to replace content of a section with given ID
 */
const replaceSectionContent = (element: ReactElement, targetId: string, newContent: ReactNode): ReactElement => {
    if (!isValidElement(element)) return element;

    if ((element as ReactElement).props.id === targetId) {
        // Found the section, Clone it but with new children
        // We preserve other props like className etc.
        return cloneElement(element as ReactElement, {}, newContent);
    }

    // Recursive check children
    if ((element as ReactElement).props.children) {
        const children = Children.map((element as ReactElement).props.children, (child) => {
            return replaceSectionContent(child as ReactElement, targetId, newContent);
        });

        return cloneElement(element as ReactElement, {}, children);
    }

    return element;
};

export const LessonView = ({ onEditSection }: LessonViewProps) => {
    const [initialSections, setInitialSections] = useState<ReactElement[]>([]);
    const [loadingSections, setLoadingSections] = useState(true);
    const { isPreview } = useAppMode();
    const editing = useOptionalEditing();

    const handleCommitSection = (sectionId: string, content: string, blockType?: SlashCommandType) => {
        console.log("Committing section:", { sectionId, content, blockType, hasEditing: !!editing });

        setInitialSections(prevSections => {
            return prevSections.map(section => {
                // Create the appropriate element based on block type
                let contentElement: React.ReactNode;

                // Parse content for inline components
                const parsedContent = hasInlineComponents(content)
                    ? parseContentWithInlineComponents(content)
                    : content;

                switch (blockType) {
                    case "h1":
                        contentElement = (
                            <EditableH1 sectionId={sectionId}>
                                {parsedContent}
                            </EditableH1>
                        );
                        break;
                    case "h2":
                        contentElement = (
                            <EditableH2 sectionId={sectionId}>
                                {parsedContent}
                            </EditableH2>
                        );
                        break;
                    case "h3":
                        contentElement = (
                            <EditableH3 sectionId={sectionId}>
                                {parsedContent}
                            </EditableH3>
                        );
                        break;
                    case "quote":
                        contentElement = (
                            <blockquote className="border-l-4 border-gray-300 pl-4 py-2">
                                <EditableText
                                    sectionId={sectionId}
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
                            <EditableParagraph sectionId={sectionId}>
                                {parsedContent}
                            </EditableParagraph>
                        );
                        break;
                }

                // Replace the Block's children (SectionInput) with the new content
                // The Block wrapper already exists, so we just replace its content
                return replaceSectionContent(section, sectionId, contentElement);
            });
        });

        if (editing) {
            console.log("Adding structure edit for commit");
            editing.addStructureEdit({
                action: 'add',
                sectionId,
                content,
                blockType
            });
        } else {
            // Fallback or dev mode without context?
            console.warn("Editing context not found, cannot batch save section add");
        }
    };

    const handleAddSection = (targetId: string) => {
        console.log("handleAddSection called with targetId:", targetId);
        // Find index of element containing targetId
        const index = initialSections.findIndex(section => hasElementId(section, targetId));
        console.log("Found index:", index, "out of", initialSections.length, "blocks");

        if (index !== -1) {
            // Create new Block directly (no Section wrapper needed)
            const newId = `block-${Date.now()}`;
            const newBlock = (
                <FullWidthLayout key={`layout-${newId}`} maxWidth="xl">
                    <Block id={newId} padding="sm">
                        <SectionInput
                            id={newId}
                            onCommit={handleCommitSection}
                            placeholder="Type '/' for commands"
                        />
                    </Block>
                </FullWidthLayout>
            );

            // Track the addition of the new block placeholder immediately
            if (editing) {
                editing.addStructureEdit({
                    action: 'add',
                    sectionId: newId,
                    blockType: 'placeholder',
                    content: ''
                });
            }

            // Insert after the found element
            const newSections = [
                ...initialSections.slice(0, index + 1),
                newBlock,
                ...initialSections.slice(index + 1)
            ];

            setInitialSections(newSections);
        } else {
            console.warn("Could not find block with id:", targetId);
        }
    };

    useEffect(() => {
        let cancelled = false;
        let cleanup: (() => void) | null = null;

        (async () => {
            // Load sections using the configured strategy
            const secs = await loadSections(sectionLoaderConfig);
            if (cancelled) return;
            setInitialSections(Array.isArray(secs) ? secs : []);
            setInitialSections(Array.isArray(secs) ? secs : []);
            setLoadingSections(false);

            // Set up watcher for automatic updates in dev mode
            if (import.meta.env.DEV) {
                cleanup = createSectionsWatcher(
                    (updatedSections) => {
                        if (!cancelled) {
                            setInitialSections(updatedSections);
                        }
                    },
                    sectionLoaderConfig
                );
            }
        })();

        return () => {
            cancelled = true;
            if (cleanup) cleanup();
        };
    }, []);

    // Show loading screen at top level
    if (loadingSections) {
        return <LoadingScreen />;
    }

    const getSectionIdFromElement = (element: ReactElement): string | undefined => {
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
                    foundId = getSectionIdFromElement(child as ReactElement);
                }
            });
        }
        return foundId;
    };


    const handleReorder = (newSections: ReactElement[]) => {
        setInitialSections(newSections);

        // Extract IDs to track the new order
        const blockIds = newSections.map(s => {
            // If key has format 'layout-...' try to parse it
            if (s.key && typeof s.key === 'string' && s.key.startsWith('layout-')) {
                return s.key.replace('layout-', '');
            }
            // Otherwise try to find inner Block ID
            return getSectionIdFromElement(s) || 'unknown';
        });

        // Record the reorder as an edit
        if (editing) {
            editing.addStructureEdit({
                action: 'reorder',
                sectionIds: blockIds,
            });
        }

        // Also notify parent (for legacy support)
        window.parent.postMessage({
            type: 'commit-section-reorder',
            sectionIds: blockIds
        }, '*');
    };

    const handleDeleteSection = (sectionId: string) => {
        setInitialSections(prev => {
            // We need to remove the top-level element that CONTAINS this sectionId
            return prev.filter(section => !hasElementId(section, sectionId));
        });

        // Record the delete as an edit
        if (editing) {
            editing.addStructureEdit({
                action: 'delete',
                sectionId,
            });
        }

        // Also notify parent (for legacy support)
        window.parent.postMessage({
            type: 'commit-section-delete',
            sectionId
        }, '*');
    };

    return (
        <div className="flex flex-col h-full glass">
            <Card className="flex-1 overflow-hidden bg-white no-border relative">
                {initialSections.length > 0 ? (
                    <div className="relative w-full h-full">
                        <SectionRenderer
                            initialSections={initialSections}
                            isPreview={isPreview}
                            onEditSection={onEditSection}
                            onAddSection={handleAddSection}
                            onReorder={handleReorder}
                            onDeleteSection={handleDeleteSection}
                        />
                    </div>
                ) : (
                    <WelcomeScreen />
                )}
            </Card>
        </div>
    );
};