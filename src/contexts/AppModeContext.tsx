import { createContext, useContext, useMemo, type ReactNode } from 'react';

export type AppMode = 'editor' | 'preview';

interface AppModeContextType {
    mode: AppMode;
    isEditor: boolean;
    isPreview: boolean;
}

const AppModeContext = createContext<AppModeContextType | undefined>(undefined);

interface AppModeProviderProps {
    children: ReactNode;
    defaultMode?: AppMode;
}

/**
 * Provider component that determines the app mode.
 *
 * NO-EDITS BUILD: the lesson always renders in `preview` mode. `isEditor` is
 * the master gate for every in-place editing affordance in this app
 * (EditableText, the inline component editors, BlockInput / slash commands,
 * the block hover chrome, the VisualOptionCards chooser), so pinning the mode
 * here is what makes the lesson read-only — the chat is the only way to
 * change a lesson. The `?mode=` URL parameter and `VITE_APP_MODE` are
 * deliberately NOT honoured for the lesson: an editor mode must not be
 * reachable by anyone in this build.
 *
 * The ONE exception is the tutor's single-explorable route (`?explorable=<id>`,
 * see src/pages/ExplorableView.tsx). That is a separate surface from the
 * teacher's lesson and keeps its own editor, so it still resolves its mode
 * from the URL / env the way it always did.
 */
export const AppModeProvider = ({
    children,
    defaultMode = 'preview'
}: AppModeProviderProps) => {
    const mode = useMemo(() => {
        const urlParams = new URLSearchParams(window.location.search);

        // Lesson view (no ?explorable=) is ALWAYS preview — no override.
        if (!urlParams.has('explorable')) {
            return 'preview' as AppMode;
        }

        // Tutor single-explorable route keeps the original resolution order.
        const urlMode = urlParams.get('mode');
        if (urlMode === 'editor' || urlMode === 'preview') {
            return urlMode as AppMode;
        }

        const envMode = import.meta.env.VITE_APP_MODE;
        if (envMode === 'editor' || envMode === 'preview') {
            return envMode as AppMode;
        }

        return defaultMode;
    }, [defaultMode]);

    const value = useMemo(() => ({
        mode,
        isEditor: mode === 'editor',
        isPreview: mode === 'preview',
    }), [mode]);

    return (
        <AppModeContext.Provider value={value}>
            {children}
        </AppModeContext.Provider>
    );
};

/**
 * Hook to access the current app mode
 * @returns AppModeContextType with mode, isEditor, and isPreview
 * @throws Error if used outside of AppModeProvider
 */
export const useAppMode = (): AppModeContextType => {
    const context = useContext(AppModeContext);
    if (!context) {
        throw new Error('useAppMode must be used within AppModeProvider');
    }
    return context;
};
