import { Loader2 } from "lucide-react";

const STATUS_LABELS: Record<string, string> = {
    queued: "Waiting to build",
    building: "Building this section",
    verifying: "Checking this section",
};

/**
 * SectionBuildSkeleton — placeholder for a lesson section that is being
 * built in the background but is not yet part of the lesson. Rendered by
 * LessonView below the real blocks (driven by the parent frontend's
 * `section-build-status` messages) so the teacher sees where each upcoming
 * section will land instead of an unchanging screen.
 */
export const SectionBuildSkeleton = ({
    title,
    status,
    detail,
}: {
    title: string;
    status: string;
    /** Live builder activity shown under the title, e.g. "writing spec and code" */
    detail?: string;
}) => (
    <div
        data-build-skeleton
        className="w-full rounded-xl border border-slate-200 bg-white p-6"
    >
        <div className="mb-4 space-y-1">
            <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-[#62D0AD]" />
                <span className="text-sm font-medium text-slate-500">
                    {STATUS_LABELS[status] ?? "Building this section"} — {title}
                </span>
            </div>
            {detail && (
                <p className="pl-6 text-xs text-slate-400">{detail}</p>
            )}
        </div>
        <div className="animate-pulse space-y-3">
            <div className="h-6 w-2/5 rounded bg-slate-100" />
            <div className="h-4 w-4/5 rounded bg-slate-100" />
            <div className="h-4 w-3/5 rounded bg-slate-100" />
            <div className="h-40 rounded-lg bg-slate-100" />
            <div className="h-4 w-1/2 rounded bg-slate-100" />
        </div>
    </div>
);

export default SectionBuildSkeleton;
