import { useEffect, useState, type ReactElement, isValidElement, Children, type ReactNode, cloneElement } from "react";
import { Section } from "./Section";
import { SectionInput } from "./SectionInput";
import { FullWidthLayout } from "@/components/layouts";
import { WelcomeScreen } from "./WelcomeScreen";
import { Card } from "@/components/atoms/ui/card";
import SectionRenderer from "./SectionRenderer";
import { loadSections, createSectionsWatcher } from "@/lib/section-loader";
import sectionLoaderConfig from "@/config/sections-loader.config";
import { useAppMode } from "@/contexts/AppModeContext";
import { LoadingScreen } from "@/components/atoms/LoadingScreen";
import { useOptionalEditing } from "@/contexts/EditingContext";

interface LessonViewProps {
  onEditSection?: (instruction: string) => void;
}

/**
 * Helper to check if a React element or its children contains a section with the given ID
 */
const hasSectionId = (element: ReactNode, targetId: string): boolean => {
  if (!isValidElement(element)) return false;
  if (element.props.id === targetId) return true;

  let found = false;
  Children.forEach(element.props.children, (child) => {
    if (!found && hasSectionId(child, targetId)) {
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

  const handleCommitSection = (sectionId: string, content: string) => {
    setInitialSections(prevSections => {
      return prevSections.map(section => {
        // Replace the content of the section with the new text
        // We wrap it in a p tag for now, or just text?
        // User likely expects a paragraph.
        const contentElement = (
          <p className="text-lg text-gray-800 leading-relaxed">{content}</p>
        );
        return replaceSectionContent(section, sectionId, contentElement);
      });
    });

    if (editing) {
      editing.addStructureEdit({
        action: 'add',
        sectionId,
        content
      });
    } else {
      // Fallback or dev mode without context?
      console.warn("Editing context not found, cannot batch save section add");
    }
  };

  const handleAddSection = (targetId: string) => {
    // Find index of top-level section containing targetId
    const index = initialSections.findIndex(section => hasSectionId(section, targetId));

    if (index !== -1) {
      // Create new section
      const newId = `section-${Date.now()}`;
      const newSection = (
        <FullWidthLayout key={`layout-${newId}`} maxWidth="xl">
          <Section id={newId}>
            <SectionInput
              id={newId}
              onCommit={handleCommitSection}
              placeholder="Type '/' for commands"
            />
          </Section>
        </FullWidthLayout>
      );

      // Insert after the found section
      const newSections = [
        ...initialSections.slice(0, index + 1),
        newSection,
        ...initialSections.slice(index + 1)
      ];

      setInitialSections(newSections);
    } else {
      console.warn("Could not find section with id:", targetId);
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
    // Try to find the section ID by traversing down
    if (!isValidElement(element)) return undefined;

    // Cast to access props safely
    const el = element as ReactElement<{ id?: string; children?: ReactNode }>;

    // Check if this element is a Section
    if (el.props.id && el.type === Section) return el.props.id;
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

    // Extract IDs to send to backend
    // We assume sections are top-level or wrapped in layouts
    // This is a best-effort to find the semantic ID of each block
    const sectionIds = newSections.map(s => {
      // If key has format 'layout-section-...' try to parse it
      if (s.key && typeof s.key === 'string' && s.key.startsWith('layout-')) {
        return s.key.replace('layout-', '');
      }
      // Otherwise try to find inner Section
      return getSectionIdFromElement(s) || 'unknown';
    });

    window.parent.postMessage({
      type: 'commit-section-reorder',
      sectionIds
    }, '*');
  };

  const handleDeleteSection = (sectionId: string) => {
    setInitialSections(prev => {
      // We need to remove the top-level element that CONTAINS this sectionId
      return prev.filter(section => !hasSectionId(section, sectionId));
    });

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