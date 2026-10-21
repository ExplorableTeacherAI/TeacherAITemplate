import {
    useCallback,
    useEffect,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
    type CSSProperties,
    type KeyboardEvent,
    type PointerEvent as ReactPointerEvent,
    type UIEvent,
} from "react";
import { Loader2, MousePointerClick, MoveHorizontal, Play, RotateCcw } from "lucide-react";
import { useSetVar, useVar, useVariableStore } from "@/stores";
import {
    DEFAULT_TIMEOUT_MS,
    onRunnerStatus,
    preloadPython,
    retryPython,
    runPython,
    runnerStatus,
    type PythonVariable,
    type RunResult,
    type RunnerStatus,
} from "@/lib/pythonRunner";
import { TOKEN_COLORS, tokenizeLine } from "@/lib/pythonHighlight";

/**
 * CodeSandbox — a small Python editor the student writes in and runs.
 * ===================================================================
 *
 * The programming lesson's counterpart of a draggable figure: the student
 * edits a short program, presses Run, and sees exactly what Python does —
 * what it printed, the variables it left in memory, and, when the program
 * is broken, Python's own error with the line it happened on. Nothing is
 * corrected for them; reading the error and fixing the line IS the task.
 *
 * Programs run in the browser (Pyodide in a web worker, see
 * `@/lib/pythonRunner`). Every run the student starts is reported to the
 * embedding tutor chat (`mathvibe-explorable-feedback`,
 * `interactionKind: "code_run"`): the code, the output and the error, plus
 * whether the task's `check` passed, so the tutor can talk the student
 * through the error.
 *
 * LIVE CODE — `slots`. The inline explorable elements of the lesson prose
 * (a scrubbable number, a toggle between options) can live INSIDE the code
 * text: a slot names a line and a pattern whose capture group is the token,
 * and binds it to a store variable. The token renders as a pill in the
 * editor; dragging it (number) or clicking it (choice) rewrites the code
 * and the variable together, and editing the code by hand updates the
 * variable. With `autoRun` the program re-runs on every slot change, so a
 * figure that reads `resultVarName` (output, variables, and the line-by-line
 * `trace`) follows the student's drag like any other explorable — computed
 * by the real program, never by a hand-written simulation.
 *
 * Height never changes with state (the chat scrolls by the frame height):
 * the editor shows a fixed number of `lines`, the output panel a fixed
 * number of `outputLines`, the memory panel a fixed number of slots.
 *
 * Linked highlights: give the sandbox `highlightVarName` (the explorable's
 * `<id>_highlight` variable) and `highlights`, one entry per chat term, each
 * naming the editor lines (1-based) or the `output` / `variables` panel it
 * stands for. Hovering a term in the chat bands those lines in the term's
 * colour and dims the rest; hovering the lines writes the same variable.
 */

export interface CodeSandboxHighlight {
    /** The chat term id (`chatTerms[].id`, the `value` of its highlight binding) */
    id: string;
    /** 1-based editor lines this term stands for */
    lines?: number[];
    /** Or a panel of the sandbox */
    target?: "output" | "variables";
    /** The term's exact spot colour */
    color: string;
}

export interface CodeSandboxCheck {
    /** Expected printed output (whole, trimmed; `\n` between lines). Several alternatives allowed. */
    output?: string | string[];
    /** A fragment the printed output must contain */
    outputIncludes?: string;
    /** Expected `repr` of variables the program must leave behind, e.g. `{ total: "15" }` */
    variables?: Record<string, string>;
}

export interface CodeSlot {
    /** Unique within the sandbox */
    id: string;
    /** Store variable bound to the token (number for `number`, string for `choice`) — prefixed like every variable */
    varName: string;
    /** 1-based line of the initial program the token is on */
    line: number;
    /**
     * Regex (as a string) matched against that line; its FIRST capture group
     * is the token, e.g. `"range\\((\\d+)\\)"` or `"if temp (>=?) 30"`.
     * When the line stops matching (the student rewrote it) the slot is
     * simply not shown.
     */
    pattern: string;
    kind?: "number" | "choice";
    min?: number;
    max?: number;
    step?: number;
    /** Options for a `choice` slot, in cycling order */
    options?: string[];
    /** The pill's colour (the token's spot colour in prose and figure) */
    color?: string;
    /** Chat term id to highlight while the pill is hovered (needs `highlightVarName`) */
    highlightId?: string;
    /** Short label for the drag hint and tooltip */
    label?: string;
}

export interface CodeSandboxProps {
    /** Unique id (prefixed with the explorable id), used for element ids */
    id: string;
    /** Store variable holding the student's program (a string) — prefixed with the explorable id */
    varName: string;
    /** The program the sandbox starts with (often one with a deliberate mistake to fix) */
    initialCode: string;
    /** Fixed number of visible editor rows (default: lines of the initial code + 1, at least 4) */
    lines?: number;
    /** Fixed number of output rows (default 3) */
    outputLines?: number;
    /** Hide the sandbox's own output panel (a figure next to it shows the output instead) */
    showOutput?: boolean;
    /** Show the memory panel (the variables left after the run); a number sets its slot count (default 3) */
    showVariables?: boolean | number;
    /** The task: when the run satisfies it, the sandbox marks the task solved and reports `correct: true` */
    check?: CodeSandboxCheck;
    /** Shown in the status row once the check passes (no trailing period) */
    successMessage?: string;
    /** Store variable the chat's linked highlights write (`<explorableId>_highlight`) */
    highlightVarName?: string;
    /** What each chat term points at (see CodeSandboxHighlight) */
    highlights?: CodeSandboxHighlight[];
    /** Live tokens inside the code (see CodeSlot) */
    slots?: CodeSlot[];
    /**
     * Run the program automatically: once Python is ready, and again after
     * every slot change (debounced). Default: true when `slots` are given.
     * Automatic runs are not reported to the tutor; the student's own Run is.
     */
    autoRun?: boolean;
    /** Show the drag hint on the first slot (default true when slots are given) */
    slotHint?: boolean;
    /** Boolean store flag set to true after the student's first run or slot change (for RevealOnInteraction) */
    exploredVarName?: string;
    /** Optional store variable receiving every run's result: `{ ok, output, error, variables, trace, solved, runs }` */
    resultVarName?: string;
    /** Run button label (default "Run") */
    runLabel?: string;
    /** Time limit per run in milliseconds (default 5000) */
    timeoutMs?: number;
}

const MONO = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
const INK = "#334155";
const MUTED = "#64748B";
const FAINT = "#94A3B8";
const EDITOR_BG = "#F8FAFC";
const PANEL_BG = "#F1F5F9";
const BOX_COLOR = "#8E90F5";
const ERROR_COLOR = "#D9534F";
const SUCCESS_COLOR = "#22c55e";
const RUN_COLOR = "#62D0AD";
const LINE_H = 24; // px, both editor and output rows
const FONT_PX = 14;
const PAD = 12;
const TEXT_LEFT = 8; // text inset inside the editor column
const GUTTER = 36;
const EASE = "opacity 150ms ease-out, background-color 150ms ease-out";
const STORE_DEBOUNCE_MS = 800;
const AUTO_RUN_DEBOUNCE_MS = 80;
const PX_PER_STEP = 10; // horizontal drag distance per slot step

/** Output comparison: ignore trailing spaces on lines and surrounding blank lines. */
const normalizeOutput = (text: string): string =>
    text
        .replace(/\r/g, "")
        .split("\n")
        .map((line) => line.trimEnd())
        .join("\n")
        .trim();

export const checkPasses = (check: CodeSandboxCheck | undefined, result: RunResult): boolean => {
    if (!check || !result.ok) return false;
    const got = normalizeOutput(result.output);
    if (check.output !== undefined) {
        const wanted = Array.isArray(check.output) ? check.output : [check.output];
        if (!wanted.some((w) => normalizeOutput(w) === got)) return false;
    }
    if (check.outputIncludes !== undefined && !got.includes(normalizeOutput(check.outputIncludes))) return false;
    if (check.variables) {
        for (const [name, repr] of Object.entries(check.variables)) {
            const found = result.variables.find((v) => v.name === name);
            if (!found || found.repr !== repr) return false;
        }
    }
    return true;
};

const indentationOf = (line: string): string => /^[ \t]*/.exec(line)?.[0] ?? "";

const hexToRgba = (hex: string, alpha: number): string => {
    const h = hex.length === 4 ? hex.slice(1).split("").map((c) => c + c).join("") : hex.slice(1);
    const n = parseInt(h, 16);
    if (Number.isNaN(n)) return `rgba(98, 208, 173, ${alpha})`;
    return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
};

/** Where a slot's token currently sits in the code, or null when its line no longer matches. */
interface SlotMatch {
    slot: CodeSlot;
    line: number; // 1-based
    start: number; // column of the token
    text: string; // the token
}

const matchSlot = (slot: CodeSlot, codeLines: string[]): SlotMatch | null => {
    const line = codeLines[slot.line - 1];
    if (line === undefined) return null;
    let re: RegExp;
    try {
        re = new RegExp(slot.pattern);
    } catch {
        return null;
    }
    const m = re.exec(line);
    if (!m || m[1] === undefined) return null;
    const start = m.index + m[0].indexOf(m[1]);
    return { slot, line: slot.line, start, text: m[1] };
};

const replaceToken = (code: string, match: SlotMatch, next: string): string => {
    const lines = code.split("\n");
    const line = lines[match.line - 1];
    lines[match.line - 1] = line.slice(0, match.start) + next + line.slice(match.start + match.text.length);
    return lines.join("\n");
};

const decimalsOf = (step: number): number => {
    const s = String(step);
    const i = s.indexOf(".");
    return i === -1 ? 0 : s.length - i - 1;
};

const formatSlotNumber = (value: number, slot: CodeSlot): string => value.toFixed(decimalsOf(slot.step ?? 1));

const clampSlot = (value: number, slot: CodeSlot): number => {
    const step = slot.step ?? 1;
    let v = Math.round(value / step) * step;
    if (slot.min !== undefined) v = Math.max(slot.min, v);
    if (slot.max !== undefined) v = Math.min(slot.max, v);
    return Number(v.toFixed(decimalsOf(step)));
};

export function CodeSandbox({
    id,
    varName,
    initialCode,
    lines,
    outputLines = 3,
    showOutput = true,
    showVariables = false,
    check,
    successMessage = "the program does what the task asked",
    highlightVarName,
    highlights = [],
    slots = [],
    autoRun,
    slotHint,
    exploredVarName,
    resultVarName,
    runLabel = "Run",
    timeoutMs = DEFAULT_TIMEOUT_MS,
}: CodeSandboxProps) {
    const setVar = useSetVar();
    const stored = useVar<string>(varName, initialCode);
    const highlight = useVar<string>(highlightVarName ?? `${varName}__noHighlight`, "");
    // Slot variables, read as ONE primitive snapshot (a selector returning a
    // fresh array every time would re-render without end).
    const slotNames = slots.map((s) => s.varName);
    const slotSignature = useVariableStore((state) =>
        JSON.stringify(slotNames.map((n) => state.variables[n] ?? null)),
    );
    const slotValues = useMemo(() => JSON.parse(slotSignature) as unknown[], [slotSignature]);
    const [text, setText] = useState<string>(typeof stored === "string" ? stored : initialCode);
    const [result, setResult] = useState<RunResult | null>(null);
    const [solved, setSolved] = useState(false);
    const [running, setRunning] = useState(false);
    const [status, setStatus] = useState<RunnerStatus>(runnerStatus());
    const [charW, setCharW] = useState(FONT_PX * 0.6);
    const [scroll, setScroll] = useState({ top: 0, left: 0 });
    const lastWritten = useRef<string>(typeof stored === "string" ? stored : initialCode);
    const debounce = useRef<number | null>(null);
    const autoRunTimer = useRef<number | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const preRef = useRef<HTMLPreElement>(null);
    const gutterRef = useRef<HTMLDivElement>(null);
    const measureRef = useRef<HTMLSpanElement>(null);
    const runCount = useRef(0);
    const codeAtResult = useRef<string>("");
    const textRef = useRef(text);
    textRef.current = text;
    const dragRef = useRef<{ slot: CodeSlot; startX: number; startValue: number; moved: boolean } | null>(null);
    const [draggingSlot, setDraggingSlot] = useState<string | null>(null);
    const initialSlotValues = useRef<Record<string, unknown>>({});
    // The slot hint: a small chip after the first pill until the student
    // touches a slot or types; remembered for the session like other hints.
    const hintKey = `mathvibe-sandbox-hint-${id}`;
    const [hintDismissed, setHintDismissed] = useState<boolean>(() => {
        try {
            return window.sessionStorage.getItem(hintKey) === "1";
        } catch {
            return false;
        }
    });
    const dismissHint = () => {
        if (hintDismissed) return;
        setHintDismissed(true);
        try {
            window.sessionStorage.setItem(hintKey, "1");
        } catch {
            // storage may be unavailable
        }
    };

    const shouldAutoRun = autoRun ?? slots.length > 0;
    const showSlotHint = slotHint ?? slots.length > 0;
    const visibleLines = lines ?? Math.max(4, initialCode.split("\n").length + 1);
    const variableSlots = showVariables === false ? 0 : typeof showVariables === "number" ? showVariables : 3;

    // Warm the interpreter up while the student reads.
    useEffect(() => {
        preloadPython();
        setStatus(runnerStatus());
        return onRunnerStatus(setStatus);
    }, []);

    // Monospace advance, for placing slot pills over their tokens.
    useLayoutEffect(() => {
        const el = measureRef.current;
        if (el) setCharW(el.getBoundingClientRect().width / 10);
    }, []);

    // External change of the stored program (reset, activity recovery): adopt it.
    useEffect(() => {
        if (typeof stored !== "string" || stored === lastWritten.current) return;
        lastWritten.current = stored;
        setText(stored);
    }, [stored]);

    const writeStore = useCallback(
        (value: string) => {
            if (debounce.current) {
                window.clearTimeout(debounce.current);
                debounce.current = null;
            }
            if (value === lastWritten.current) return;
            lastWritten.current = value;
            setVar(varName, value);
        },
        [setVar, varName],
    );

    const codeLines = useMemo(() => text.split("\n"), [text]);
    const slotMatches = useMemo(
        () => slots.map((slot) => matchSlot(slot, codeLines)).filter((m): m is SlotMatch => m !== null),
        [slots, codeLines],
    );

    // Slot → store: a token the student typed updates its variable (parse once per text change).
    useEffect(() => {
        for (const m of slotMatches) {
            const slot = m.slot;
            const current = useVariableStore.getState().variables[slot.varName];
            if ((slot.kind ?? "number") === "number") {
                const parsed = Number(m.text);
                if (!Number.isFinite(parsed)) continue;
                if (typeof current !== "number" || Math.abs(current - parsed) > 1e-9) setVar(slot.varName, parsed);
            } else if (current !== m.text && (!slot.options || slot.options.includes(m.text))) {
                setVar(slot.varName, m.text);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [text]);

    // Store → slot: a variable changed elsewhere (the chat, a figure, a drag) rewrites its token.
    useEffect(() => {
        let next = textRef.current;
        let lines = next.split("\n");
        let changed = false;
        slots.forEach((slot, i) => {
            const value = slotValues[i];
            if (value === undefined || value === null) return;
            if (!(slot.varName in initialSlotValues.current)) initialSlotValues.current[slot.varName] = value;
            else if (exploredVarName && initialSlotValues.current[slot.varName] !== value) setVar(exploredVarName, true);
            const m = matchSlot(slot, lines);
            if (!m) return;
            const wanted =
                (slot.kind ?? "number") === "number"
                    ? typeof value === "number"
                        ? formatSlotNumber(value, slot)
                        : null
                    : typeof value === "string"
                        ? value
                        : null;
            if (wanted === null || wanted === m.text) return;
            if ((slot.kind ?? "number") === "number" && Number(m.text) === value) return; // same number, other spelling
            next = replaceToken(next, m, wanted);
            lines = next.split("\n");
            changed = true;
        });
        if (changed) {
            setText(next);
            writeStore(next);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [slotSignature]);

    const onChange = (value: string) => {
        dismissHint();
        setText(value);
        if (debounce.current) window.clearTimeout(debounce.current);
        debounce.current = window.setTimeout(() => writeStore(value), STORE_DEBOUNCE_MS);
    };

    useEffect(
        () => () => {
            if (debounce.current) window.clearTimeout(debounce.current);
            if (autoRunTimer.current) window.clearTimeout(autoRunTimer.current);
        },
        [],
    );

    const report = useCallback(
        (code: string, run: RunResult, passed: boolean) => {
            if (typeof window === "undefined" || window.parent === window) return;
            const explorableId = new URLSearchParams(window.location.search).get("explorable") ?? undefined;
            const correct: boolean | undefined = check ? passed : run.ok ? undefined : false;
            const payload = {
                code,
                output: run.output,
                error: run.error ?? null,
                variables: run.variables.map((v) => `${v.name} = ${v.repr}`),
                solved: check ? passed : null,
                outputTruncated: run.outputTruncated,
            };
            if (correct === undefined) {
                // A clean run with no task to judge: exploration, not an attempt.
                window.parent.postMessage(
                    {
                        type: "mathvibe-explorable-interaction",
                        explorableId,
                        varName,
                        value: payload,
                        interactionKind: "code_run",
                        at: Date.now(),
                        source: "iframe",
                    },
                    "*",
                );
                return;
            }
            window.parent.postMessage(
                {
                    type: "mathvibe-explorable-feedback",
                    explorableId,
                    varName,
                    value: payload,
                    correct,
                    interactionKind: "code_run",
                    at: Date.now(),
                    attempt: runCount.current,
                },
                "*",
            );
        },
        [check, varName],
    );

    const publishResult = useCallback(
        (outcome: RunResult, passed: boolean) => {
            if (!resultVarName) return;
            setVar(resultVarName, {
                ok: outcome.ok,
                output: outcome.output,
                error: outcome.error ? { ...outcome.error } : null,
                variables: outcome.variables.map((v) => ({ ...v })),
                trace: outcome.trace.map((e) => ({ ...e, vars: { ...e.vars } })),
                traceTruncated: outcome.traceTruncated,
                solved: passed,
                runs: runCount.current,
            });
        },
        [resultVarName, setVar],
    );

    const runningRef = useRef(false);
    const pendingRerun = useRef<"auto" | "manual" | null>(null);

    /** Run the current program. `manual` = the student pressed Run (reported, counts as explored). */
    const run = useCallback(
        async (manual: boolean) => {
            if (runningRef.current) {
                // Keep the newest intent; a manual run wins over an automatic one.
                pendingRerun.current = manual ? "manual" : pendingRerun.current ?? "auto";
                return;
            }
            const code = textRef.current;
            writeStore(code);
            runningRef.current = true;
            setRunning(true);
            if (manual) runCount.current += 1;
            const outcome = await runPython(code, { timeoutMs });
            const passed = checkPasses(check, outcome);
            codeAtResult.current = code;
            setResult(outcome);
            setSolved(passed);
            runningRef.current = false;
            setRunning(false);
            if (manual && exploredVarName) setVar(exploredVarName, true);
            publishResult(outcome, passed);
            if (manual) report(code, outcome, passed);
            const again = pendingRerun.current;
            pendingRerun.current = null;
            if (again) void run(again === "manual");
        },
        [check, exploredVarName, publishResult, report, setVar, timeoutMs, writeStore],
    );

    // Automatic runs: once Python is ready, and after every slot change.
    useEffect(() => {
        if (!shouldAutoRun || status !== "ready") return;
        if (autoRunTimer.current) window.clearTimeout(autoRunTimer.current);
        autoRunTimer.current = window.setTimeout(() => {
            autoRunTimer.current = null;
            void run(false);
        }, AUTO_RUN_DEBOUNCE_MS);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [shouldAutoRun, status, slotSignature]);

    const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
        const el = event.currentTarget;
        if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
            event.preventDefault();
            void run(true);
            return;
        }
        if (event.key === "Tab") {
            event.preventDefault();
            const { selectionStart, selectionEnd, value } = el;
            const next = value.slice(0, selectionStart) + "    " + value.slice(selectionEnd);
            onChange(next);
            requestAnimationFrame(() => {
                el.selectionStart = el.selectionEnd = selectionStart + 4;
            });
            return;
        }
        if (event.key === "Enter") {
            event.preventDefault();
            const { selectionStart, selectionEnd, value } = el;
            const before = value.slice(0, selectionStart);
            const currentLine = before.slice(before.lastIndexOf("\n") + 1);
            const extra = currentLine.trimEnd().endsWith(":") ? "    " : "";
            const insert = "\n" + indentationOf(currentLine) + extra;
            const next = before + insert + value.slice(selectionEnd);
            onChange(next);
            requestAnimationFrame(() => {
                el.selectionStart = el.selectionEnd = selectionStart + insert.length;
            });
        }
    };

    // Keep the colouring layer, the gutter and the slot pills aligned with the textarea's scroll.
    const onScroll = (event: UIEvent<HTMLTextAreaElement>) => {
        const el = event.currentTarget;
        if (preRef.current) {
            preRef.current.scrollTop = el.scrollTop;
            preRef.current.scrollLeft = el.scrollLeft;
        }
        if (gutterRef.current) gutterRef.current.scrollTop = el.scrollTop;
        setScroll({ top: el.scrollTop, left: el.scrollLeft });
    };

    const errorLine = result && !result.ok && codeAtResult.current === text ? result.error?.line : undefined;
    const stale = result !== null && codeAtResult.current !== text;

    const highlightFor = (lineNumber: number): CodeSandboxHighlight | undefined =>
        highlights.find((h) => h.lines?.includes(lineNumber));
    const active = highlight ? highlights.find((h) => h.id === highlight) : undefined;
    const dimUnless = (match: boolean) => (active && !match ? 0.4 : 1);

    const setHighlight = (value: string) => {
        if (highlightVarName && highlight !== value) setVar(highlightVarName, value);
    };
    const onEditorPointerMove = (event: ReactPointerEvent<HTMLTextAreaElement>) => {
        if (!highlightVarName) return;
        const el = event.currentTarget;
        const rect = el.getBoundingClientRect();
        const lineNumber = Math.floor((event.clientY - rect.top + el.scrollTop - PAD) / LINE_H) + 1;
        setHighlight(highlightFor(lineNumber)?.id ?? "");
    };
    const panelHover = (target: "output" | "variables") => {
        const term = highlights.find((h) => h.target === target);
        if (!term || !highlightVarName) return {};
        return {
            onPointerEnter: () => setHighlight(term.id),
            onPointerLeave: () => setHighlight(""),
        };
    };
    const outputTerm = highlights.find((h) => h.target === "output");
    const variablesTerm = highlights.find((h) => h.target === "variables");
    const outputActive = !!outputTerm && highlight === outputTerm.id;
    const variablesActive = !!variablesTerm && highlight === variablesTerm.id;

    // ── Slot pills: drag a number, click a choice ──────────────────────────
    const setSlotValue = (slot: CodeSlot, value: number | string) => {
        dismissHint();
        if (exploredVarName) setVar(exploredVarName, true);
        setVar(slot.varName, value);
    };
    const onSlotPointerDown = (event: ReactPointerEvent<HTMLDivElement>, m: SlotMatch) => {
        event.preventDefault();
        const slot = m.slot;
        if ((slot.kind ?? "number") === "choice") return; // click handled on pointer up
        const current = useVariableStore.getState().variables[slot.varName];
        const startValue = typeof current === "number" ? current : Number(m.text) || 0;
        event.currentTarget.setPointerCapture(event.pointerId);
        dragRef.current = { slot, startX: event.clientX, startValue, moved: false };
        setDraggingSlot(slot.id);
    };
    const onSlotPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
        const drag = dragRef.current;
        if (!drag) return;
        const step = drag.slot.step ?? 1;
        const dx = event.clientX - drag.startX;
        if (Math.abs(dx) > 2) drag.moved = true;
        const next = clampSlot(drag.startValue + Math.round(dx / PX_PER_STEP) * step, drag.slot);
        const current = useVariableStore.getState().variables[drag.slot.varName];
        if (current !== next) setSlotValue(drag.slot, next);
    };
    const onSlotPointerUp = (event: ReactPointerEvent<HTMLDivElement>, m: SlotMatch) => {
        const slot = m.slot;
        if ((slot.kind ?? "number") === "choice") {
            const options = slot.options ?? [];
            if (options.length > 0) {
                const i = options.indexOf(m.text);
                setSlotValue(slot, options[(i + 1) % options.length]);
            }
            return;
        }
        if (dragRef.current && !dragRef.current.moved) {
            // A click without a drag: put the caret on the token so it can be typed over.
            const el = textareaRef.current;
            if (el) {
                const offset = codeLines.slice(0, m.line - 1).reduce((n, l) => n + l.length + 1, 0) + m.start;
                el.focus();
                el.setSelectionRange(offset, offset + m.text.length);
            }
        }
        dragRef.current = null;
        setDraggingSlot(null);
        void event;
    };

    const editorHeight = visibleLines * LINE_H + 2 * PAD;
    const outputHeight = outputLines * LINE_H + 2 * PAD;
    const monoStyle: CSSProperties = {
        fontFamily: MONO,
        fontSize: FONT_PX,
        lineHeight: `${LINE_H}px`,
        fontVariantNumeric: "tabular-nums",
    };

    const loading = status === "loading" || status === "idle";
    const failed = status === "failed";
    const outputText = result?.output ?? "";
    const outputRows = outputText.length > 0 ? outputText.replace(/\n$/, "").split("\n") : [];

    let statusText = shouldAutoRun ? "The program runs by itself as you change it" : "Press Run to see what Python does";
    let statusColor = FAINT;
    if (result) {
        if (!result.ok) {
            statusText = "Python stopped at an error. Read it, fix the line, run again";
            statusColor = ERROR_COLOR;
        } else if (check) {
            statusText = solved ? `Solved, ${successMessage}` : "It ran without errors, but the task is not done yet";
            statusColor = solved ? SUCCESS_COLOR : MUTED;
        } else {
            statusText = `Ran without errors in ${Math.max(1, result.durationMs)} ms`;
            statusColor = MUTED;
        }
        if (stale) statusText += " (code changed since)";
    }

    const variables: PythonVariable[] = result?.variables ?? [];
    const shownVariables = variables.slice(0, variableSlots);
    const extraVariables = Math.max(0, variables.length - variableSlots);

    // Slot token colours in the colouring layer: the token's columns on its line.
    const slotAt = (lineNumber: number, col: number): SlotMatch | undefined =>
        slotMatches.find((m) => m.line === lineNumber && col >= m.start && col < m.start + m.text.length);

    const firstSlot = slotMatches[0];

    return (
        <div id={id} data-code-sandbox={id} className="mx-auto w-full max-w-[560px]" style={{ color: INK }}>
            {/* editor: the hint overlay is a sibling of the flex row, never a
                flex item (as one it would take the column's width). */}
            <div className="relative" style={{ height: editorHeight }}>
            <div
                className="relative flex h-full overflow-hidden rounded-xl"
                style={{ background: EDITOR_BG }}
            >
                <span
                    ref={measureRef}
                    aria-hidden
                    className="pointer-events-none absolute opacity-0"
                    style={{ ...monoStyle, left: -9999, top: 0 }}
                >
                    0000000000
                </span>
                <div
                    ref={gutterRef}
                    aria-hidden
                    className="shrink-0 select-none overflow-hidden text-right"
                    style={{ ...monoStyle, width: GUTTER, padding: `${PAD}px 0`, color: FAINT, fontSize: 12 }}
                >
                    {codeLines.map((_, i) => {
                        const n = i + 1;
                        const isError = errorLine === n;
                        return (
                            <div key={n} style={{ height: LINE_H, paddingRight: 10, color: isError ? ERROR_COLOR : FAINT, fontWeight: isError ? 700 : 400 }}>
                                {isError ? "!" : n}
                            </div>
                        );
                    })}
                </div>
                <div className="relative min-w-0 flex-1">
                    <pre
                        ref={preRef}
                        aria-hidden
                        className="pointer-events-none absolute inset-0 m-0 overflow-hidden"
                        style={{ ...monoStyle, padding: `${PAD}px ${PAD}px ${PAD}px 0`, whiteSpace: "pre", color: INK }}
                    >
                        {codeLines.map((line, i) => {
                            const n = i + 1;
                            const term = highlightFor(n);
                            const isActive = !!term && !!active && term.id === active.id;
                            const isError = errorLine === n;
                            const background = isError
                                ? hexToRgba(ERROR_COLOR, 0.12)
                                : isActive
                                    ? hexToRgba(term!.color, 0.18)
                                    : term
                                        ? hexToRgba(term.color, 0.06)
                                        : "transparent";
                            const borderColor = isError ? ERROR_COLOR : isActive ? term!.color : "transparent";
                            let col = 0;
                            return (
                                <div
                                    key={n}
                                    style={{
                                        height: LINE_H,
                                        background,
                                        boxShadow: `inset 3px 0 0 ${borderColor}`,
                                        paddingLeft: TEXT_LEFT,
                                        opacity: dimUnless(isActive),
                                        transition: EASE,
                                    }}
                                >
                                    {tokenizeLine(line).map((token, k) => {
                                        const inSlot = slotAt(n, col);
                                        col += token.text.length;
                                        const color = inSlot ? inSlot.slot.color ?? RUN_COLOR : TOKEN_COLORS[token.kind];
                                        return (
                                            <span key={k} style={{ color, fontWeight: inSlot ? 700 : undefined }}>
                                                {token.text}
                                            </span>
                                        );
                                    })}
                                    {line.length === 0 ? " " : null}
                                </div>
                            );
                        })}
                    </pre>
                    <textarea
                        ref={textareaRef}
                        value={text}
                        onChange={(e) => onChange(e.target.value)}
                        onBlur={() => writeStore(text)}
                        onKeyDown={onKeyDown}
                        onScroll={onScroll}
                        onPointerMove={onEditorPointerMove}
                        onPointerLeave={() => setHighlight("")}
                        spellCheck={false}
                        autoCapitalize="off"
                        autoCorrect="off"
                        wrap="off"
                        aria-label="Python program"
                        className="absolute inset-0 m-0 w-full resize-none border-0 bg-transparent outline-none"
                        style={{
                            ...monoStyle,
                            padding: `${PAD}px ${PAD}px ${PAD}px ${TEXT_LEFT}px`,
                            whiteSpace: "pre",
                            overflow: "auto",
                            color: "transparent",
                            caretColor: INK,
                            WebkitTextFillColor: "transparent",
                        }}
                    />
                    {/* slot pills sit above the textarea, exactly over their tokens */}
                    {slotMatches.map((m) => {
                        const slot = m.slot;
                        const color = slot.color ?? RUN_COLOR;
                        const isChoice = (slot.kind ?? "number") === "choice";
                        const isDragging = draggingSlot === slot.id;
                        const isLit = !!slot.highlightId && highlight === slot.highlightId;
                        const left = TEXT_LEFT + m.start * charW - 5 - scroll.left;
                        const top = PAD + (m.line - 1) * LINE_H + 2 - scroll.top;
                        return (
                            <div
                                key={slot.id}
                                role={isChoice ? "button" : "slider"}
                                aria-label={slot.label ?? slot.id}
                                aria-valuenow={isChoice ? undefined : Number(m.text)}
                                title={isChoice ? `Click to switch${slot.label ? ` ${slot.label}` : ""}` : `Drag to change${slot.label ? ` ${slot.label}` : ""}`}
                                data-code-slot={slot.id}
                                className="absolute select-none rounded-md"
                                style={{
                                    left,
                                    top,
                                    width: m.text.length * charW + 10,
                                    height: LINE_H - 4,
                                    border: `${isDragging || isLit ? 2.5 : 1.75}px solid ${color}`,
                                    background: hexToRgba(color, isDragging || isLit ? 0.22 : 0.12),
                                    boxShadow: isDragging || isLit ? `0 0 0 4px ${hexToRgba(color, 0.22)}` : "none",
                                    cursor: isChoice ? "pointer" : isDragging ? "grabbing" : "ew-resize",
                                    touchAction: "none",
                                    transition: "box-shadow 150ms ease-out, border-width 150ms ease-out",
                                }}
                                onPointerDown={(e) => onSlotPointerDown(e, m)}
                                onPointerMove={onSlotPointerMove}
                                onPointerUp={(e) => onSlotPointerUp(e, m)}
                                onPointerCancel={() => {
                                    dragRef.current = null;
                                    setDraggingSlot(null);
                                }}
                                onPointerEnter={() => slot.highlightId && setHighlight(slot.highlightId)}
                                onPointerLeave={() => slot.highlightId && setHighlight("")}
                            />
                        );
                    })}
                    {showSlotHint && firstSlot && !hintDismissed ? (
                        <div
                            aria-hidden
                            className="pointer-events-none absolute flex items-center gap-1 rounded-md px-1.5 text-[11px] font-medium text-white animate-pulse"
                            style={{
                                left: TEXT_LEFT + (firstSlot.start + firstSlot.text.length) * charW + 12 - scroll.left,
                                top: PAD + (firstSlot.line - 1) * LINE_H + 3 - scroll.top,
                                height: LINE_H - 6,
                                background: firstSlot.slot.color ?? RUN_COLOR,
                                whiteSpace: "nowrap",
                            }}
                        >
                            {(firstSlot.slot.kind ?? "number") === "choice" ? (
                                <>
                                    <MousePointerClick className="h-3 w-3" /> click to switch
                                </>
                            ) : (
                                <>
                                    <MoveHorizontal className="h-3 w-3" /> drag me
                                </>
                            )}
                        </div>
                    ) : null}
                </div>
            </div>
            </div>

            {/* run row */}
            <div className="flex items-center gap-3" style={{ height: 44 }}>
                <button
                    type="button"
                    onClick={() => void run(true)}
                    disabled={running || failed}
                    data-sandbox-run
                    className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-white transition-opacity disabled:opacity-60"
                    style={{ background: RUN_COLOR }}
                >
                    {running || loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                    {running ? "Running" : loading ? "Loading Python" : runLabel}
                </button>
                <span className="text-xs" style={{ color: FAINT }}>
                    {failed ? (
                        <button type="button" onClick={retryPython} className="inline-flex items-center gap-1 underline" style={{ color: MUTED }}>
                            <RotateCcw className="h-3 w-3" /> Python could not load, try again
                        </button>
                    ) : loading ? (
                        "getting Python ready (first time takes a moment)"
                    ) : showOutput ? (
                        "Ctrl+Enter also runs"
                    ) : (
                        <span style={{ color: statusColor }}>{statusText}</span>
                    )}
                </span>
            </div>

            {/* output */}
            {showOutput ? (
                <div
                    className="overflow-hidden rounded-xl"
                    style={{
                        background: PANEL_BG,
                        height: outputHeight + LINE_H,
                        boxShadow: outputActive ? `inset 0 0 0 2px ${outputTerm!.color}` : "none",
                        opacity: dimUnless(outputActive),
                        transition: EASE,
                    }}
                    {...panelHover("output")}
                >
                    <div className="flex items-center justify-between" style={{ height: LINE_H, padding: `0 ${PAD}px` }}>
                        <span className="text-xs" style={{ color: outputActive && outputTerm ? outputTerm.color : MUTED }}>
                            what Python printed
                        </span>
                        <span className="text-xs" style={{ color: statusColor }}>
                            {statusText}
                        </span>
                    </div>
                    <div className="overflow-auto" style={{ ...monoStyle, height: outputHeight, padding: `${PAD / 2}px ${PAD}px ${PAD}px`, whiteSpace: "pre" }}>
                        {outputRows.map((row, i) => (
                            <div key={i} style={{ height: LINE_H, color: INK }}>
                                {row.length === 0 ? " " : row}
                            </div>
                        ))}
                        {result?.outputTruncated ? (
                            <div style={{ height: LINE_H, color: FAINT }}>… (more output was cut)</div>
                        ) : null}
                        {result && !result.ok && result.error ? (
                            <div style={{ color: ERROR_COLOR }}>
                                <div style={{ height: LINE_H, fontWeight: 700 }}>
                                    {result.error.type}
                                    {result.error.line ? ` on line ${result.error.line}` : ""}
                                </div>
                                <div style={{ whiteSpace: "pre-wrap" }}>{result.error.message}</div>
                            </div>
                        ) : null}
                        {!result && outputRows.length === 0 ? (
                            <div style={{ height: LINE_H, color: FAINT }}>(nothing yet)</div>
                        ) : null}
                    </div>
                </div>
            ) : null}

            {/* memory panel */}
            {variableSlots > 0 ? (
                <div
                    className="mt-2 rounded-xl"
                    style={{
                        padding: `${PAD / 2}px ${PAD}px ${PAD}px`,
                        boxShadow: variablesActive ? `inset 0 0 0 2px ${variablesTerm!.color}` : "none",
                        opacity: dimUnless(variablesActive),
                        transition: EASE,
                    }}
                    {...panelHover("variables")}
                >
                    <div className="text-xs" style={{ height: LINE_H, lineHeight: `${LINE_H}px`, color: variablesActive && variablesTerm ? variablesTerm.color : MUTED }}>
                        memory after the run (one box per variable)
                    </div>
                    <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${variableSlots}, minmax(0, 1fr))` }}>
                        {Array.from({ length: variableSlots }, (_, i) => {
                            const v = shownVariables[i];
                            const overflow = i === variableSlots - 1 && extraVariables > 0;
                            return (
                                <div key={i} style={{ minWidth: 0 }}>
                                    <div
                                        className="truncate"
                                        style={{ ...monoStyle, fontSize: 12, height: 20, lineHeight: "20px", color: v ? BOX_COLOR : "transparent", fontWeight: 700 }}
                                    >
                                        {overflow ? "…" : v ? v.name : "·"}
                                    </div>
                                    <div
                                        className="flex items-center justify-center rounded-lg px-2"
                                        style={{
                                            ...monoStyle,
                                            height: 44,
                                            border: v ? `2px solid ${BOX_COLOR}` : "1.5px dashed #CBD5E1",
                                            background: v ? hexToRgba(BOX_COLOR, 0.1) : "transparent",
                                            color: INK,
                                            fontWeight: 700,
                                            fontSize: 15,
                                            transition: EASE,
                                        }}
                                    >
                                        <span className="truncate">{overflow ? `+${extraVariables + 1} more` : v ? v.repr : ""}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ) : null}
        </div>
    );
}

export default CodeSandbox;
