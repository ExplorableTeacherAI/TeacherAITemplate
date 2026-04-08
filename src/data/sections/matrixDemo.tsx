/**
 * Matrix Visualization Demo
 * -------------------------
 * Showcases the MatrixVisualization component with variable-store integration:
 *   - Scalar multiplication
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
    InlineToggle,
    InlineTooltip,
    InlineTrigger,
    InlineFormula,
    MatrixVisualization,
    EditableH3,
    EditableH4,
} from "@/components/atoms";
import { FormulaBlock } from "@/components/molecules";
import {
    getExampleVariableInfo as getVariableInfo,
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
        <Block id="matrix-title" padding="md">
            <EditableH3 id="h3-matrix-title" blockId="matrix-title">
                Matrix Visualization
            </EditableH3>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-matrix-intro" maxWidth="xl">
        <Block id="matrix-intro" padding="sm">
            <EditableParagraph id="para-matrix-intro" blockId="matrix-intro">
                A matrix is a rectangular array of numbers arranged in rows and columns, forming one of the most fundamental structures in linear algebra. Matrices allow us to represent systems of equations, perform geometric transformations, and encode relationships between variables. Below we explore several key matrix operations interactively.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    // ── Section 1: Scalar Multiplication ──────────────
    <StackLayout key="layout-matrix-scalar-heading" maxWidth="xl">
        <Block id="matrix-scalar-heading" padding="sm">
            <EditableH4
                id="h4-scalar-heading"
                blockId="matrix-scalar-heading"
            >
                Scalar Multiplication
            </EditableH4>
        </Block>
    </StackLayout>,

    <SplitLayout key="layout-matrix-scalar" ratio="1:1" gap="lg">
        <div className="space-y-4">
            <Block id="matrix-scalar-text" padding="sm">
                <EditableParagraph
                    id="para-matrix-scalar"
                    blockId="matrix-scalar-text"
                >
                    Scalar multiplication takes a single number (the scalar) and multiplies it with every entry in the matrix. If we denote our scalar as{" "}
                    <InlineFormula
                        latex="\clr{scalar}{k}"
                        colorMap={{ scalar: "#4F46E5" }}
                    />{" "}
                    and our matrix as{" "}
                    <InlineFormula
                        latex="\clr{matrix}{A}"
                        colorMap={{ matrix: "#8B5CF6" }}
                    />
                    , then each cell{" "}
                    <InlineFormula
                        latex="a_{ij}"
                        colorMap={{}}
                    />{" "}
                    becomes{" "}
                    <InlineFormula
                        latex="\clr{scalar}{k} \, a_{ij}"
                        colorMap={{ scalar: "#4F46E5" }}
                    />.
                    Use the slider to change the scalar and watch how every value in the matrix transforms proportionally.
                </EditableParagraph>
            </Block>
            <Block id="matrix-scalar-actions" padding="sm">
                <EditableParagraph
                    id="para-matrix-scalar-actions"
                    blockId="matrix-scalar-actions"
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
            <Block id="matrix-scalar-color" padding="sm">
                <EditableParagraph
                    id="para-matrix-scalar-color"
                    blockId="matrix-scalar-color"
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
        <Block id="matrix-scalar-viz" padding="sm" hasVisualization>
            <ScaledMatrixViz />
        </Block>
    </SplitLayout>,

    // ── Section 2: Dynamic Resizing ───────────────────
    <StackLayout key="layout-matrix-resize-heading" maxWidth="xl">
        <Block id="matrix-resize-heading" padding="sm">
            <EditableH4
                id="h4-resize-heading"
                blockId="matrix-resize-heading"
            >
                Dynamic Resizing
            </EditableH4>
        </Block>
    </StackLayout>,

    <SplitLayout key="layout-matrix-resize" ratio="1:1" gap="lg">
        <Block id="matrix-resize-text" padding="sm">
            <EditableParagraph
                id="para-matrix-resize"
                blockId="matrix-resize-text"
            >
                The shape of a matrix is defined by its dimensions: the number of rows and columns it contains. An m×n matrix has m rows and n columns, giving it m·n total entries. In this example, each entry equals the sum of its row and column indices:{" "}
                <InlineFormula
                    latex="a_{ij} = i + j"
                    colorMap={{}}
                />
                . Use the controls to resize the matrix and observe how the grid structure changes.
            </EditableParagraph>
        </Block>
        <Block id="matrix-resize-viz" padding="sm" hasVisualization>
            <DynamicSizeMatrix />
        </Block>
    </SplitLayout>,

    // ── Section 3: Row / Column Highlighting ──────────
    <StackLayout key="layout-matrix-highlight-heading" maxWidth="xl">
        <Block id="matrix-highlight-heading" padding="sm">
            <EditableH4
                id="h4-highlight-heading"
                blockId="matrix-highlight-heading"
            >
                Row &amp; Column Highlighting
            </EditableH4>
        </Block>
    </StackLayout>,

    <SplitLayout key="layout-matrix-highlight" ratio="1:1" gap="lg">
        <div className="space-y-4">
            <Block id="matrix-highlight-text" padding="sm">
                <EditableParagraph
                    id="para-matrix-highlight"
                    blockId="matrix-highlight-text"
                >
                    A magic square is a special grid where every row, column, and diagonal sums to the same value, called the magic constant. This 3×3 magic square has a magic constant of 15. Click on any row or column in the visualization to highlight it and verify that each line indeed sums to 15.
                </EditableParagraph>
            </Block>
            <Block id="matrix-highlight-triggers" padding="sm">
                <EditableParagraph
                    id="para-highlight-triggers"
                    blockId="matrix-highlight-triggers"
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
        <Block id="matrix-highlight-viz" padding="sm" hasVisualization>
            <HighlightableMatrix />
        </Block>
    </SplitLayout>,

    // ── Section 4: Color Schemes Gallery ──────────────
    <StackLayout key="layout-matrix-gallery-heading" maxWidth="xl">
        <Block id="matrix-gallery-heading" padding="sm">
            <EditableH4
                id="h4-gallery-heading"
                blockId="matrix-gallery-heading"
            >
                Color Scheme Gallery
            </EditableH4>
        </Block>
    </StackLayout>,

    <GridLayout key="layout-matrix-gallery" columns={4} gap="md">
        <Block id="matrix-none" padding="sm" hasVisualization>
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
        <Block id="matrix-heatmap" padding="sm" hasVisualization>
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
        <Block id="matrix-diverging" padding="sm" hasVisualization>
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
        <Block id="matrix-categorical" padding="sm" hasVisualization>
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
        <Block id="matrix-det-heading" padding="sm">
            <EditableH4
                id="h4-det-heading"
                blockId="matrix-det-heading"
            >
                Determinant Challenge
            </EditableH4>
        </Block>
    </StackLayout>,

    <SplitLayout key="layout-matrix-det" ratio="1:1" gap="lg">
        <div className="space-y-4">
            <Block id="matrix-det-text" padding="sm">
                <EditableParagraph
                    id="para-matrix-det"
                    blockId="matrix-det-text"
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
            <Block id="matrix-det-equation" padding="sm">
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
        <Block id="matrix-det-viz" padding="sm" hasVisualization>
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
        <Block id="matrix-identity-heading" padding="sm">
            <EditableH4
                id="h4-identity-heading"
                blockId="matrix-identity-heading"
            >
                The Identity Matrix
            </EditableH4>
        </Block>
    </StackLayout>,

    <SplitLayout key="layout-matrix-identity" ratio="1:1" gap="lg">
        <Block id="matrix-identity-text" padding="sm">
            <EditableParagraph
                id="para-matrix-identity"
                blockId="matrix-identity-text"
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
        <Block id="matrix-identity-viz" padding="sm" hasVisualization>
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
