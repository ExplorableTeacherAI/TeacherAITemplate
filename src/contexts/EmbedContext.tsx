import { createContext, useContext } from 'react';

/**
 * True while the explorable is rendered embedded in the tutor chat (the
 * ExplorableView iframe, see BlockRenderer's `embedded` prop). Text atoms use
 * it to pick the chat's typography scale (14px body) instead of the lesson
 * page's, so an explorable reads as part of the conversation around it.
 */
export const EmbedContext = createContext<boolean>(false);

export const useEmbedded = (): boolean => useContext(EmbedContext);
