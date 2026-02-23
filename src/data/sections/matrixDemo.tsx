/**
 * Matrix Visualization Demo
 * -------------------------
 * Showcases the MatrixVisualization component with variable-store integration:
 *   - Scalar multiplication with InlineScrubbleNumber
 *   - Dynamic row/col resizing
 *   - Color scheme toggling
 *   - Row/column highlighting
 *   - Identity & determinant exercises
 */

import { type ReactElement } from "react";
import { Block } from "@/components/templates";
import { StackLayout, SplitLayout, GridLayout } from "@/components/layouts";
import {
    EditableH1,
    EditableH2,
    EditableParagraph,
    InlineScrubbleNumber,
    InlineToggle,
    InlineTooltip,
    InlineTrigger,
    InlineFormula,
    MatrixVisualization,
} from "@/components/atoms";
import { FormulaBlock } from "@/components/molecules";
import {
    getExampleVariableInfo as getVariableInfo,
    numberPropsFromDefinition,
    togglePropsFromDefinition,
} from "../exampleVariables";
import { useVar, useSetVar } from "@/stores";

// ─────────────────────────────────────────────────────
// Reactive wrapper components
// ─────────────────────────────────────────────────────

/** Scales a fixed base matrix by a scrubble multiplier */
function ScaledMatrixViz() {
    const scale = useVar("matrixScale", 1) as number;
    const colorScheme = useVar("matrixColorScheme", "heatmap") as
        | "none"
        | "heatmap"
        | "diverging"
        | "categorical";

    const base = [
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9],
    ];

    const scaled = base.map((row) => row.map((v) => v * scale));

    return (
        <MatrixVisualization
            data={scaled}
            label={scale === 1 ? "A" : `${scale} · A`}
            colorScheme={colorScheme}
            showIndices
            showBrackets
            width={360}
        />
    );
}

/** Dynamic-size matrix driven by matrixRows / matrixCols */
function DynamicSizeMatrix() {
    const rows = useVar("matrixRows", 3) as number;
    const cols = useVar("matrixCols", 3) as number;

    // Generate a matrix with entry = row + col (1-indexed)
    const data: number[][] = [];
    for (let r = 0; r < rows; r++) {
        const row: number[] = [];
        for (let c = 0; c < cols; c++) {
            row.push(r + c + 1);
        }
        data.push(row);
    }

    return (
        <MatrixVisualization
            data={data}
            label={`${rows}×${cols}`}
            colorScheme="heatmap"
            showIndices
            showBrackets
            width={380}
        />
    );
}

/** Matrix with row/column highlighting controlled by variables */
function HighlightableMatrix() {
    const highlightRow = useVar("matrixHighlightRow", -1) as number;
    const highlightCol = useVar("matrixHighlightCol", -1) as number;

    const data = [
        [2, 7, 6],
        [9, 5, 1],
        [4, 3, 8],
    ];

    return (
        <MatrixVisualization
            data={data}
            label="Magic Square"
            colorScheme="heatmap"
            color="#8B5CF6"
            showIndices
            showBrackets
            highlightRows={highlightRow >= 0 ? [highlightRow] : []}
            highlightCols={highlightCol >= 0 ? [highlightCol] : []}
            width={340}
        />
    );
}

// ─────────────────────────────────────────────────────
// Block array (flat, follows project conventions)
// ─────────────────────────────────────────────────────

export const matrixDemoBlocks: ReactElement[] = [
    // ── Title ──────────────────────────────────────────
    <StackLayout key="layout-matrix-title" maxWidth="xl">
        <Block id="block-matrix-title" padding="md">
            <EditableH1 id="h1-matrix-title" blockId="block-matrix-title">
                Matrix Visualization
            </EditableH1>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-matrix-intro" maxWidth="xl">
        <Block id="block-matrix-intro" padding="sm">
            <EditableParagraph id="para-matrix-intro" blockId="block-matrix-intro">
                A{" "}
                <InlineTooltip tooltip="A matrix is a rectangular array of numbers arranged in rows and columns.">
                    matrix
                </InlineTooltip>{" "}
                is one of the most fundamental objects in linear algebra. Below we
                explore matrices interactively — scale them, resize them, highlight
                rows and columns, and even answer questions about their properties.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    // ── Section 1: Scalar Multiplication ──────────────
    <StackLayout key="layout-matrix-scalar-heading" maxWidth="xl">
        <Block id="block-matrix-scalar-heading" padding="sm">
            <EditableH2
                id="h2-scalar-heading"
                blockId="block-matrix-scalar-heading"
            >
                Scalar Multiplication
            </EditableH2>
        </Block>
    </StackLayout>,

    <SplitLayout key="layout-matrix-scalar" ratio="1:1" gap="lg">
        <div className="space-y-4">
            <Block id="block-matrix-scalar-text" padding="sm">
                <EditableParagraph
                    id="para-matrix-scalar"
                    blockId="block-matrix-scalar-text"
                >
                    Multiply every entry by the scalar{" "}
                    <InlineScrubbleNumber
                        varName="matrixScale"
                        {...numberPropsFromDefinition(
                            getVariableInfo("matrixScale")
                        )}
                    />
                    . The formula is{" "}
                    <InlineFormula
                        latex="\clr{scalar}{k} \cdot \clr{matrix}{A}"
                        colorMap={{ scalar: "#4F46E5", matrix: "#8B5CF6" }}
                    />
                    , where each cell{" "}
                    <InlineFormula
                        latex="a_{ij}"
                        colorMap={{}}
                    />{" "}
                    becomes{" "}
                    <InlineFormula
                        latex="\clr{scalar}{k} \, a_{ij}"
                        colorMap={{ scalar: "#4F46E5" }}
                    />
                    .
                </EditableParagraph>
            </Block>
            <Block id="block-matrix-scalar-actions" padding="sm">
                <EditableParagraph
                    id="para-matrix-scalar-actions"
                    blockId="block-matrix-scalar-actions"
                >
                    Try{" "}
                    <InlineTrigger varName="matrixScale" value={1} icon="refresh">
                        resetting to 1
                    </InlineTrigger>
                    ,{" "}
                    <InlineTrigger varName="matrixScale" value={-1} icon="zap">
                        negating the matrix
                    </InlineTrigger>
                    , or{" "}
                    <InlineTrigger varName="matrixScale" value={0}>
                        zeroing it out
                    </InlineTrigger>
                    .
                </EditableParagraph>
            </Block>
            <Block id="block-matrix-scalar-color" padding="sm">
                <EditableParagraph
                    id="para-matrix-scalar-color"
                    blockId="block-matrix-scalar-color"
                >
                    Color scheme:{" "}
                    <InlineToggle
                        varName="matrixColorScheme"
                        options={["none", "heatmap", "diverging", "categorical"]}
                        {...togglePropsFromDefinition(
                            getVariableInfo("matrixColorScheme")
                        )}
                    />
                </EditableParagraph>
            </Block>
        </div>
        <Block id="block-matrix-scalar-viz" padding="sm">
            <ScaledMatrixViz />
        </Block>
    </SplitLayout>,

    // ── Section 2: Dynamic Resizing ───────────────────
    <StackLayout key="layout-matrix-resize-heading" maxWidth="xl">
        <Block id="block-matrix-resize-heading" padding="sm">
            <EditableH2
                id="h2-resize-heading"
                blockId="block-matrix-resize-heading"
            >
                Dynamic Resizing
            </EditableH2>
        </Block>
    </StackLayout>,

    <SplitLayout key="layout-matrix-resize" ratio="1:1" gap="lg">
        <Block id="block-matrix-resize-text" padding="sm">
            <EditableParagraph
                id="para-matrix-resize"
                blockId="block-matrix-resize-text"
            >
                Change the number of rows{" "}
                <InlineScrubbleNumber
                    varName="matrixRows"
                    {...numberPropsFromDefinition(
                        getVariableInfo("matrixRows")
                    )}
                />{" "}
                and columns{" "}
                <InlineScrubbleNumber
                    varName="matrixCols"
                    {...numberPropsFromDefinition(
                        getVariableInfo("matrixCols")
                    )}
                />{" "}
                to see how the matrix shape adapts. Each entry is the sum of its
                1-based row and column indices:{" "}
                <InlineFormula
                    latex="a_{ij} = i + j"
                    colorMap={{}}
                />
                .
            </EditableParagraph>
        </Block>
        <Block id="block-matrix-resize-viz" padding="sm">
            <DynamicSizeMatrix />
        </Block>
    </SplitLayout>,

    // ── Section 3: Row / Column Highlighting ──────────
    <StackLayout key="layout-matrix-highlight-heading" maxWidth="xl">
        <Block id="block-matrix-highlight-heading" padding="sm">
            <EditableH2
                id="h2-highlight-heading"
                blockId="block-matrix-highlight-heading"
            >
                Row &amp; Column Highlighting
            </EditableH2>
        </Block>
    </StackLayout>,

    <SplitLayout key="layout-matrix-highlight" ratio="1:1" gap="lg">
        <div className="space-y-4">
            <Block id="block-matrix-highlight-text" padding="sm">
                <EditableParagraph
                    id="para-matrix-highlight"
                    blockId="block-matrix-highlight-text"
                >
                    This is a{" "}
                    <InlineTooltip tooltip="A magic square is a grid where every row, column, and diagonal sums to the same number.">
                        magic square
                    </InlineTooltip>
                    . Highlight row{" "}
                    <InlineScrubbleNumber
                        varName="matrixHighlightRow"
                        {...numberPropsFromDefinition(
                            getVariableInfo("matrixHighlightRow")
                        )}
                        formatValue={(v) => (v < 0 ? "none" : String(v))}
                    />{" "}
                    and column{" "}
                    <InlineScrubbleNumber
                        varName="matrixHighlightCol"
                        {...numberPropsFromDefinition(
                            getVariableInfo("matrixHighlightCol")
                        )}
                        formatValue={(v) => (v < 0 ? "none" : String(v))}
                    />{" "}
                    to verify that each sums to 15.
                </EditableParagraph>
            </Block>
            <Block id="block-matrix-highlight-triggers" padding="sm">
                <EditableParagraph
                    id="para-highlight-triggers"
                    blockId="block-matrix-highlight-triggers"
                >
                    Quick presets:{" "}
                    <InlineTrigger varName="matrixHighlightRow" value={0}>
                        Row 0
                    </InlineTrigger>{" "}
                    <InlineTrigger varName="matrixHighlightRow" value={1}>
                        Row 1
                    </InlineTrigger>{" "}
                    <InlineTrigger varName="matrixHighlightRow" value={2}>
                        Row 2
                    </InlineTrigger>{" "}
                    ·{" "}
                    <InlineTrigger varName="matrixHighlightCol" value={0}>
                        Col 0
                    </InlineTrigger>{" "}
                    <InlineTrigger varName="matrixHighlightCol" value={1}>
                        Col 1
                    </InlineTrigger>{" "}
                    <InlineTrigger varName="matrixHighlightCol" value={2}>
                        Col 2
                    </InlineTrigger>{" "}
                    ·{" "}
                    <InlineTrigger varName="matrixHighlightRow" value={-1} icon="refresh">
                        Clear
                    </InlineTrigger>
                </EditableParagraph>
            </Block>
        </div>
        <Block id="block-matrix-highlight-viz" padding="sm">
            <HighlightableMatrix />
        </Block>
    </SplitLayout>,

    // ── Section 4: Color Schemes Gallery ──────────────
    <StackLayout key="layout-matrix-gallery-heading" maxWidth="xl">
        <Block id="block-matrix-gallery-heading" padding="sm">
            <EditableH2
                id="h2-gallery-heading"
                blockId="block-matrix-gallery-heading"
            >
                Color Scheme Gallery
            </EditableH2>
        </Block>
    </StackLayout>,

    <GridLayout key="layout-matrix-gallery" columns={4} gap="md">
        <Block id="block-matrix-none" padding="sm">
            <MatrixVisualization
                data={[
                    [1, 0],
                    [0, 1],
                ]}
                label="none"
                colorScheme="none"
                width={180}
                showBrackets
            />
        </Block>
        <Block id="block-matrix-heatmap" padding="sm">
            <MatrixVisualization
                data={[
                    [1, 4],
                    [9, 16],
                ]}
                label="heatmap"
                colorScheme="heatmap"
                width={180}
                showBrackets
            />
        </Block>
        <Block id="block-matrix-diverging" padding="sm">
            <MatrixVisualization
                data={[
                    [-3, 2],
                    [1, -5],
                ]}
                label="diverging"
                colorScheme="diverging"
                width={180}
                showBrackets
            />
        </Block>
        <Block id="block-matrix-categorical" padding="sm">
            <MatrixVisualization
                data={[
                    [0, 1],
                    [2, 3],
                ]}
                label="categorical"
                colorScheme="categorical"
                width={180}
                showBrackets
            />
        </Block>
    </GridLayout>,

    // ── Section 5: Determinant Question ───────────────
    <StackLayout key="layout-matrix-det-heading" maxWidth="xl">
        <Block id="block-matrix-det-heading" padding="sm">
            <EditableH2
                id="h2-det-heading"
                blockId="block-matrix-det-heading"
            >
                Determinant Challenge
            </EditableH2>
        </Block>
    </StackLayout>,

    <SplitLayout key="layout-matrix-det" ratio="1:1" gap="lg">
        <div className="space-y-4">
            <Block id="block-matrix-det-text" padding="sm">
                <EditableParagraph
                    id="para-matrix-det"
                    blockId="block-matrix-det-text"
                >
                    For the 2×2 matrix shown on the right, the{" "}
                    <InlineTooltip tooltip="det(A) = ad − bc for a 2×2 matrix [[a,b],[c,d]].">
                        determinant
                    </InlineTooltip>{" "}
                    is computed as{" "}
                    <InlineFormula
                        latex="\det(A) = \clr{a}{a}\clr{d}{d} - \clr{b}{b}\clr{c}{c}"
                        colorMap={{
                            a: "#4F46E5",
                            d: "#4F46E5",
                            b: "#EF4444",
                            c: "#EF4444",
                        }}
                    />
                    .
                </EditableParagraph>
            </Block>
            <Block id="block-matrix-det-equation" padding="sm">
                <FormulaBlock
                    latex="\det\begin{pmatrix} 1 & 3 \\ 2 & 4 \end{pmatrix} = (1)(4) - (3)(2) = \cloze{matrixDeterminantAnswer}"
                    clozeInputs={{
                        matrixDeterminantAnswer: {
                            correctAnswer: "-2",
                            placeholder: "???",
                            color: "#3B82F6",
                        },
                    }}
                />
            </Block>
        </div>
        <Block id="block-matrix-det-viz" padding="sm">
            <MatrixVisualization
                data={[
                    [1, 3],
                    [2, 4],
                ]}
                label="A"
                colorScheme="diverging"
                showIndices
                showBrackets
                highlightCells={[
                    [0, 0],
                    [1, 1],
                ]}
                highlightColor="#4F46E5"
                width={300}
            />
        </Block>
    </SplitLayout>,

    // ── Section 6: Identity Matrix ────────────────────
    <StackLayout key="layout-matrix-identity-heading" maxWidth="xl">
        <Block id="block-matrix-identity-heading" padding="sm">
            <EditableH2
                id="h2-identity-heading"
                blockId="block-matrix-identity-heading"
            >
                The Identity Matrix
            </EditableH2>
        </Block>
    </StackLayout>,

    <SplitLayout key="layout-matrix-identity" ratio="1:1" gap="lg">
        <Block id="block-matrix-identity-text" padding="sm">
            <EditableParagraph
                id="para-matrix-identity"
                blockId="block-matrix-identity-text"
            >
                The{" "}
                <InlineTooltip tooltip="The identity matrix I has 1s on the main diagonal and 0s elsewhere. Multiplying any matrix by I leaves it unchanged.">
                    identity matrix
                </InlineTooltip>{" "}
                <InlineFormula latex="I_n" colorMap={{}} /> is the
                multiplicative identity for matrices:{" "}
                <InlineFormula
                    latex="\clr{matrix}{A} \cdot \clr{identity}{I} = \clr{matrix}{A}"
                    colorMap={{ matrix: "#8B5CF6", identity: "#10B981" }}
                />
                . Notice how the diagonal cells (highlighted) all contain 1 while
                everything else is 0.
            </EditableParagraph>
        </Block>
        <Block id="block-matrix-identity-viz" padding="sm">
            <MatrixVisualization
                data={[
                    [1, 0, 0, 0],
                    [0, 1, 0, 0],
                    [0, 0, 1, 0],
                    [0, 0, 0, 1],
                ]}
                label="I₄"
                colorScheme="heatmap"
                color="#10B981"
                showIndices
                showBrackets
                highlightCells={[
                    [0, 0],
                    [1, 1],
                    [2, 2],
                    [3, 3],
                ]}
                highlightColor="#10B981"
                width={340}
            />
        </Block>
    </SplitLayout>,
];
