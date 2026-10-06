import { createContext, useContext } from 'react';

/**
 * The answer feedback of the InlineFeedback wrapped around a cloze, so the
 * cloze's editor can show and change it (the text lives on the wrapper, not
 * on the cloze). Null when a cloze has no InlineFeedback around it.
 */
export interface ClozeFeedback {
    successMessage: string;
    failureMessage: string;
    hint: string;
}

export const InlineFeedbackContext = createContext<ClozeFeedback | null>(null);

export const useClozeFeedback = (): ClozeFeedback | null => useContext(InlineFeedbackContext);
