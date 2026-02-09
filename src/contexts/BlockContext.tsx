import { createContext, useContext } from 'react';
import type { DragControls } from 'framer-motion';

interface BlockContextValue {
    dragControls?: DragControls;
    onDelete?: () => void;
    id?: string;
}

export const BlockContext = createContext<BlockContextValue>({});

export const useBlockContext = () => useContext(BlockContext);
