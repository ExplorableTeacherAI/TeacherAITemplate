
import { useAppMode } from '@/contexts/AppModeContext';
import { Eye, Edit3 } from 'lucide-react';
import { Badge } from '@/components/atoms/ui/badge';

/**
 * ModeIndicator component displays the current app mode (editor/preview)
 * Shows only in development mode to help developers identify which mode is active
 */
export const ModeIndicator = () => {
    const { isEditor } = useAppMode();

    // Only show in development mode
    if (!import.meta.env.DEV) {
        return null;
    }

    return (
        <div className="fixed top-4 right-4 z-50">
            <Badge
                variant={isEditor ? "default" : "secondary"}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium shadow-md"
            >
                {isEditor ? (
                    <>
                        <Edit3 className="h-3 w-3" />
                        <span>Editor Mode</span>
                    </>
                ) : (
                    <>
                        <Eye className="h-3 w-3" />
                        <span>Preview Mode</span>
                    </>
                )}
            </Badge>
        </div>
    );
};

export default ModeIndicator;
