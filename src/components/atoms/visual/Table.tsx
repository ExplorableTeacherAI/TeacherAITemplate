import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useVarColor } from '@/stores';

/* ──────────────────────────────────────────────
 *  Types
 * ────────────────────────────────────────────── */

export interface TableColumn {
    /** Column header label */
    header: string;
    /** Optional fixed width (px or CSS string) */
    width?: string | number;
    /** Text alignment for cells in this column (default: 'left') */
    align?: 'left' | 'center' | 'right';
}

export interface TableRow {
    /** One cell per column – can be a string, number, or any React element */
    cells: React.ReactNode[];
    /** Optional: highlight this row with a subtle coloured background */
    highlight?: boolean;
    /** Optional: custom highlight colour override for this row */
    highlightColor?: string;
}

export interface TableProps {
    /** Unique identifier for this component instance */
    id?: string;
    /** Column definitions (headers, widths, alignment) */
    columns: TableColumn[];
    /** Row data – each row has an array of cells matching the columns */
    rows: TableRow[];
    /** Optional variable name used to key the accent colour in the store */
    varName?: string;
    /** Accent colour for headers / highlights (default: '#6366f1' indigo) */
    color?: string;
    /** Whether to show the header row (default: true) */
    showHeader?: boolean;
    /** Whether to show alternating row stripes (default: true) */
    striped?: boolean;
    /** Whether the table rows have visible borders (default: true) */
    bordered?: boolean;
    /** Whether the table is compact (smaller padding) (default: false) */
    compact?: boolean;
    /** Caption displayed below the table */
    caption?: string;
    /** Optional className override */
    className?: string;
}

/* ──────────────────────────────────────────────
 *  Component
 * ────────────────────────────────────────────── */

/**
 * Table Component
 *
 * A styled, block-level table designed for embedding inside lessons.
 * Each cell can contain **any** React node — plain text, numbers, or
 * rich inline components such as `InlineScrubbleNumber`, `InlineFormula`,
 * `InlineLinkedHighlight`, `InlineClozeInput`, etc.
 *
 * The component reads its accent colour from the global variable store
 * (via `varName`) so colours can be kept in sync across the lesson.
 *
 * @example
 * ```tsx
 * <Table
 *     columns={[
 *         { header: 'Symbol', align: 'center' },
 *         { header: 'Value', align: 'right' },
 *         { header: 'Description' },
 *     ]}
 *     rows={[
 *         { cells: ['π', '3.14159', 'Ratio of circumference to diameter'] },
 *         { cells: ['e', '2.71828', 'Base of natural logarithm'] },
 *         { cells: [
 *             'r',
 *             <InlineScrubbleNumber varName="radius" defaultValue={5} min={1} max={20} step={0.5} />,
 *             'Radius of the circle',
 *         ] },
 *     ]}
 *     color="#6366f1"
 * />
 * ```
 */
export const Table: React.FC<TableProps> = ({
    id,
    columns,
    rows,
    varName,
    color = '#6366f1',
    showHeader = true,
    striped = true,
    bordered = true,
    compact = false,
    caption,
    className,
}) => {
    // Resolve accent colour from variable store if varName is set
    const accentColor = useVarColor(varName, color);

    // Lighter tint for header background
    const headerBg = useMemo(() => `${accentColor}18`, [accentColor]);
    // Even lighter tint for striped rows
    const stripeBg = useMemo(() => `${accentColor}08`, [accentColor]);

    const cellPadding = compact ? 'px-2.5 py-1.5' : 'px-4 py-2.5';

    const alignClass = (align?: 'left' | 'center' | 'right') => {
        if (align === 'center') return 'text-center';
        if (align === 'right') return 'text-right';
        return 'text-left';
    };

    return (
        <div
            id={id}
            className={cn(
                'w-full overflow-x-auto rounded-lg',
                bordered && 'border border-border',
                className,
            )}
        >
            <table className="w-full border-collapse text-sm">
                {/* ── Header ──────────────────────────── */}
                {showHeader && (
                    <thead>
                        <tr
                            style={{ backgroundColor: headerBg }}
                        >
                            {columns.map((col, ci) => (
                                <th
                                    key={ci}
                                    className={cn(
                                        cellPadding,
                                        alignClass(col.align),
                                        'font-semibold tracking-wide uppercase text-xs',
                                        bordered && 'border-b border-border',
                                    )}
                                    style={{
                                        color: accentColor,
                                        width: col.width ?? 'auto',
                                    }}
                                >
                                    {col.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                )}

                {/* ── Body ────────────────────────────── */}
                <tbody>
                    {rows.map((row, ri) => {
                        const isStriped = striped && ri % 2 === 1;
                        const rowBg = row.highlight
                            ? `${row.highlightColor ?? accentColor}15`
                            : isStriped
                                ? stripeBg
                                : undefined;

                        return (
                            <tr
                                key={ri}
                                className={cn(
                                    'transition-colors duration-150',
                                    'hover:bg-muted/40',
                                )}
                                style={{ backgroundColor: rowBg }}
                            >
                                {row.cells.map((cell, ci) => {
                                    const col = columns[ci];
                                    return (
                                        <td
                                            key={ci}
                                            className={cn(
                                                cellPadding,
                                                alignClass(col?.align),
                                                bordered && ri < rows.length - 1 && 'border-b border-border/50',
                                                'text-foreground',
                                            )}
                                            style={{
                                                width: col?.width ?? 'auto',
                                            }}
                                        >
                                            {cell}
                                        </td>
                                    );
                                })}
                            </tr>
                        );
                    })}
                </tbody>
            </table>

            {/* ── Caption ─────────────────────────── */}
            {caption && (
                <div
                    className="px-4 py-2 text-xs text-muted-foreground text-center border-t border-border/30"
                    style={{ backgroundColor: `${accentColor}06` }}
                >
                    {caption}
                </div>
            )}
        </div>
    );
};

export default Table;
