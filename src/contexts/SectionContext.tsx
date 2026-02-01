import { createContext, useContext } from 'react';
import type { DragControls } from 'framer-motion';

interface SectionContextValue {
    dragControls?: DragControls;
    onDelete?: () => void;
    id?: string;
}

export const SectionContext = createContext<SectionContextValue>({});

export const useSectionContext = () => useContext(SectionContext);
