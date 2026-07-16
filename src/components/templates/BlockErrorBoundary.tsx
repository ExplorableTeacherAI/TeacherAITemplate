import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

interface BlockErrorBoundaryProps {
    blockId?: string;
    children: ReactNode;
}

interface BlockErrorBoundaryState {
    error: Error | null;
}

/**
 * BlockErrorBoundary — contains a render crash to the block that caused it.
 *
 * Without this, one broken block (a bad import fixed at runtime, an R3F
 * data-shape crash, a NaN in a custom SVG) unmounts the WHOLE lesson tree and
 * the viewer sees a blank screen. With it, the rest of the lesson keeps
 * working and the broken block shows a quiet, teacher-readable card with a
 * retry button (useful right after the AI pushes a fix — the iframe may not
 * have reloaded yet).
 */
export class BlockErrorBoundary extends Component<
    BlockErrorBoundaryProps,
    BlockErrorBoundaryState
> {
    state: BlockErrorBoundaryState = { error: null };

    static getDerivedStateFromError(error: Error): BlockErrorBoundaryState {
        return { error };
    }

    componentDidCatch(error: Error, info: ErrorInfo) {
        console.error(
            `Block "${this.props.blockId ?? "unknown"}" crashed while rendering:`,
            error,
            info.componentStack
        );
    }

    render() {
        const { error } = this.state;
        if (!error) return this.props.children;

        return (
            <div
                data-block-error={this.props.blockId ?? true}
                className="my-2 w-full rounded-xl border border-amber-300/60 bg-amber-50/60 p-5"
            >
                <div className="flex items-start gap-3">
                    <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-500" />
                    <div className="min-w-0 flex-1 space-y-1">
                        <p className="text-sm font-medium text-slate-700">
                            This part of the lesson hit a problem
                        </p>
                        <p className="text-xs text-slate-500">
                            The rest of the lesson still works. Ask the AI to fix
                            {this.props.blockId ? (
                                <>
                                    {" "}block{" "}
                                    <code className="rounded bg-amber-100 px-1 py-0.5 text-[11px]">
                                        {this.props.blockId}
                                    </code>
                                </>
                            ) : (
                                " this section"
                            )}
                            , or try reloading it.
                        </p>
                        <p className="break-words font-mono text-[11px] text-amber-700/80">
                            {String(error.message || error).slice(0, 200)}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => this.setState({ error: null })}
                        className="inline-flex flex-shrink-0 items-center gap-1 rounded-md border border-amber-300 bg-white px-2 py-1 text-[11px] font-medium text-amber-700 transition-colors hover:bg-amber-100"
                    >
                        <RotateCcw className="h-3 w-3" />
                        Retry
                    </button>
                </div>
            </div>
        );
    }
}

export default BlockErrorBoundary;
