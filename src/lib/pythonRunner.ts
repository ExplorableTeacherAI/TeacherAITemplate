/**
 * Python runner — real CPython in the browser (Pyodide) inside a Web Worker.
 *
 * `CodeSandbox` hands a program to `runPython` and shows what comes back:
 * everything the program printed, the variables it left behind, and, when
 * it crashed, the real Python error (type, message, line). The student
 * learns to read Python's own words, which is the point of a sandbox.
 *
 * Why a worker: a program with an endless loop would freeze the whole
 * explorable frame on the main thread. In a worker it can be killed from
 * outside after a time limit and a fresh interpreter started.
 *
 * One worker per frame, created on first use (`preloadPython()` warms it up
 * while the student still reads). Pyodide is loaded from the jsDelivr CDN and
 * cached by the browser; nothing is executed on any server.
 */

export interface PythonError {
    /** Python's exception class, e.g. "NameError", "SyntaxError", "IndentationError" */
    type: string;
    /** Python's own message, e.g. "name 'totl' is not defined" */
    message: string;
    /** 1-based line in the student's program, when the traceback names one */
    line?: number;
}

export interface PythonVariable {
    name: string;
    /** `type(value).__name__`, e.g. "int", "str", "list" */
    type: string;
    /** `repr(value)`, cut to 80 characters */
    repr: string;
}

/** One step of the program: Python is about to run `line`; `vars` is memory at that moment. */
export interface TraceEvent {
    /** 1-based line about to run; 0 with `end: true` for the state after the last line */
    line: number;
    end?: boolean;
    /** Top-level variables (name → repr, cut to 60 chars) */
    vars: Record<string, string>;
}

export interface RunResult {
    ok: boolean;
    /** Everything printed to stdout/stderr, in order (capped) */
    output: string;
    error?: PythonError;
    /** Top-level variables the program defined, in definition order */
    variables: PythonVariable[];
    durationMs: number;
    /** True when the output was cut at the cap */
    outputTruncated: boolean;
    /** Line-by-line trace of the run (module level only), for figures drawn from the real program */
    trace: TraceEvent[];
    /** True when the trace stopped at its cap (long loops) */
    traceTruncated: boolean;
}

export type RunnerStatus = "idle" | "loading" | "ready" | "failed";

const PYODIDE_VERSION = "0.27.8";
const PYODIDE_BASE = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;
/** A program that runs longer than this is stopped (endless loops). */
export const DEFAULT_TIMEOUT_MS = 5000;
/** Printed output beyond this is dropped and the run is marked truncated. */
const OUTPUT_CAP = 4000;

// Classic worker script. Kept as a string so the runtime needs no extra
// build step and works from any workspace (the template is copied per
// lesson). It only ever receives programs from the explorable it runs in.
const WORKER_SOURCE = `
importScripts(${JSON.stringify(PYODIDE_BASE + "pyodide.js")});
var OUTPUT_CAP = ${OUTPUT_CAP};
var pyodide = null;
var inspect = null;
var runTraced = null;
var ready = loadPyodide({ indexURL: ${JSON.stringify(PYODIDE_BASE)} }).then(function (py) {
    pyodide = py;
    // input() cannot be answered inside a worker; make it a readable error.
    // _mv_inspect lists a program's variables for the memory panel.
    pyodide.runPython(
        "import builtins, json, sys, types\\n" +
        "def _mv_no_input(*args, **kwargs):\\n" +
        "    raise RuntimeError('input() cannot be used here. Give the value in the code instead, for example name = \\"Ada\\"')\\n" +
        "builtins.input = _mv_no_input\\n" +
        "def _mv_inspect(ns):\\n" +
        "    out = []\\n" +
        "    for k, v in ns.items():\\n" +
        "        if k.startswith('_') or isinstance(v, (types.ModuleType, types.FunctionType, type)):\\n" +
        "            continue\\n" +
        "        try:\\n" +
        "            r = repr(v)\\n" +
        "        except Exception:\\n" +
        "            r = '<unprintable>'\\n" +
        "        if len(r) > 80:\\n" +
        "            r = r[:77] + '...'\\n" +
        "        out.append({'name': k, 'type': type(v).__name__, 'repr': r})\\n" +
        "    return json.dumps(out)\\n" +
        "_MV_TRACE_MAX = 400\\n" +
        "_mv_last_trace = '{\\"events\\": [], \\"truncated\\": false}'\\n" +
        "def _mv_snap(f_locals):\\n" +
        "    out = {}\\n" +
        "    for k, v in f_locals.items():\\n" +
        "        if k.startswith('_') or isinstance(v, (types.ModuleType, types.FunctionType, type)):\\n" +
        "            continue\\n" +
        "        try:\\n" +
        "            r = repr(v)\\n" +
        "        except Exception:\\n" +
        "            r = '<unprintable>'\\n" +
        "        out[k] = r if len(r) <= 60 else r[:57] + '...'\\n" +
        "    return out\\n" +
        "def _mv_run(code, ns):\\n" +
        "    global _mv_last_trace\\n" +
        "    events = []\\n" +
        "    state = {'n': 0, 'trunc': False}\\n" +
        "    def tracer(frame, event, arg):\\n" +
        "        if frame.f_code.co_filename != '<program>':\\n" +
        "            return None\\n" +
        "        if event == 'line' or event == 'return':\\n" +
        "            if state['n'] >= _MV_TRACE_MAX:\\n" +
        "                state['trunc'] = True\\n" +
        "                sys.settrace(None)\\n" +
        "                return None\\n" +
        "            state['n'] += 1\\n" +
        "            if event == 'line':\\n" +
        "                events.append({'line': frame.f_lineno, 'vars': _mv_snap(frame.f_locals)})\\n" +
        "            else:\\n" +
        "                events.append({'line': 0, 'end': True, 'vars': _mv_snap(frame.f_locals)})\\n" +
        "        return tracer\\n" +
        "    _mv_last_trace = '{\\"events\\": [], \\"truncated\\": false}'\\n" +
        "    compiled = compile(code, '<program>', 'exec')\\n" +
        "    sys.settrace(tracer)\\n" +
        "    try:\\n" +
        "        exec(compiled, ns)\\n" +
        "    finally:\\n" +
        "        sys.settrace(None)\\n" +
        "        _mv_last_trace = json.dumps({'events': events, 'truncated': state['trunc']})\\n"
    );
    inspect = pyodide.globals.get("_mv_inspect");
    runTraced = pyodide.globals.get("_mv_run");
    postMessage({ type: "ready" });
}).catch(function (err) {
    postMessage({ type: "failed", message: String(err && err.message || err) });
});

function parseError(text) {
    var lines = String(text).trimEnd().split("\\n");
    var last = lines[lines.length - 1] || "Error";
    var m = /^([A-Za-z_][A-Za-z0-9_.]*):\\s*(.*)$/.exec(last);
    var type = m ? m[1] : last;
    var message = m ? m[2] : "";
    var line;
    var re = /File "<program>", line (\\d+)/g;
    var hit;
    while ((hit = re.exec(text)) !== null) line = Number(hit[1]);
    if (line === undefined) {
        re = /File "<exec>", line (\\d+)/g;
        while ((hit = re.exec(text)) !== null) line = Number(hit[1]);
    }
    if (type.indexOf(".") !== -1) type = type.slice(type.lastIndexOf(".") + 1);
    return { type: type, message: message, line: line };
}

onmessage = function (event) {
    var data = event.data || {};
    if (data.type !== "run") return;
    ready.then(function () {
        if (!pyodide) {
            postMessage({ type: "result", id: data.id, ok: false, output: "", variables: [], durationMs: 0,
                outputTruncated: false, error: { type: "Python unavailable", message: "Python could not be loaded" } });
            return;
        }
        var chunks = [];
        var size = 0;
        var truncated = false;
        var sink = function (s) {
            if (truncated) return;
            if (size + s.length > OUTPUT_CAP) {
                chunks.push(s.slice(0, Math.max(0, OUTPUT_CAP - size)));
                size = OUTPUT_CAP;
                truncated = true;
                throw new Error("__mv_output_cap__");
            }
            chunks.push(s);
            size += s.length;
        };
        pyodide.setStdout({ batched: function (s) { sink(s + "\\n"); } });
        pyodide.setStderr({ batched: function (s) { sink(s + "\\n"); } });
        var ns = pyodide.globals.get("dict")();
        var started = Date.now();
        var ok = true;
        var error;
        try {
            // Through the traced helper: the program itself is compiled as
            // "<program>" so tracebacks name the student's lines.
            runTraced(data.code, ns);
        } catch (err) {
            ok = false;
            var text = String(err && err.message || err);
            if (text.indexOf("__mv_output_cap__") !== -1) {
                error = { type: "Too much output", message: "the program printed more than " + OUTPUT_CAP + " characters, so it was stopped" };
            } else {
                error = parseError(text);
            }
        }
        var variables = [];
        try { variables = JSON.parse(inspect(ns)); } catch (e) { variables = []; }
        var trace = { events: [], truncated: false };
        try { trace = JSON.parse(pyodide.globals.get("_mv_last_trace")); } catch (e) {}
        try { ns.destroy(); } catch (e) {}
        postMessage({
            type: "result", id: data.id, ok: ok, output: chunks.join(""), error: error,
            variables: variables, durationMs: Date.now() - started, outputTruncated: truncated,
            trace: trace.events || [], traceTruncated: trace.truncated === true,
        });
    });
};
`;

type Pending = {
    resolve: (result: RunResult) => void;
    timer: number;
};

let worker: Worker | null = null;
let status: RunnerStatus = "idle";
let failure = "";
let nextId = 1;
const pending = new Map<number, Pending>();
const listeners = new Set<(status: RunnerStatus) => void>();

const setStatus = (next: RunnerStatus) => {
    status = next;
    for (const listener of listeners) listener(next);
};

/** Current runner status; subscribe with `onRunnerStatus`. */
export const runnerStatus = (): RunnerStatus => status;
export const runnerFailure = (): string => failure;

export const onRunnerStatus = (listener: (status: RunnerStatus) => void): (() => void) => {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
};

const failAll = (error: PythonError) => {
    for (const [, p] of pending) {
        window.clearTimeout(p.timer);
        p.resolve({ ok: false, output: "", error, variables: [], durationMs: 0, outputTruncated: false, trace: [], traceTruncated: false });
    }
    pending.clear();
};

const spawn = (): Worker | null => {
    if (typeof window === "undefined" || typeof Worker === "undefined") {
        failure = "This browser cannot run Python here";
        setStatus("failed");
        return null;
    }
    setStatus("loading");
    const url = URL.createObjectURL(new Blob([WORKER_SOURCE], { type: "text/javascript" }));
    const w = new Worker(url);
    w.onmessage = (event: MessageEvent) => {
        const d = event.data || {};
        if (d.type === "ready") {
            setStatus("ready");
            return;
        }
        if (d.type === "failed") {
            failure = String(d.message || "Python could not be loaded");
            setStatus("failed");
            failAll({ type: "Python unavailable", message: failure });
            return;
        }
        if (d.type === "result") {
            const p = pending.get(d.id);
            if (!p) return;
            pending.delete(d.id);
            window.clearTimeout(p.timer);
            p.resolve({
                ok: d.ok === true,
                output: typeof d.output === "string" ? d.output : "",
                error: d.error,
                variables: Array.isArray(d.variables) ? d.variables : [],
                durationMs: typeof d.durationMs === "number" ? d.durationMs : 0,
                outputTruncated: d.outputTruncated === true,
                trace: Array.isArray(d.trace) ? d.trace : [],
                traceTruncated: d.traceTruncated === true,
            });
        }
    };
    w.onerror = (event: ErrorEvent) => {
        failure = event.message || "Python could not be loaded";
        setStatus("failed");
        failAll({ type: "Python unavailable", message: failure });
    };
    return w;
};

/** Start loading the interpreter so the first Run is quick. Safe to call often. */
export const preloadPython = (): void => {
    if (worker || status === "failed") return;
    worker = spawn();
};

/** Try again after a failed load (e.g. the network came back). */
export const retryPython = (): void => {
    if (worker) {
        worker.terminate();
        worker = null;
    }
    failure = "";
    worker = spawn();
};

/**
 * Run one program in a fresh namespace. Resolves always (never rejects): a
 * crash, a time-out and an unavailable interpreter all come back as a
 * result with `ok: false` and a readable `error`.
 */
export const runPython = (code: string, options: { timeoutMs?: number } = {}): Promise<RunResult> => {
    if (!worker) worker = spawn();
    const w = worker;
    if (!w || status === "failed") {
        return Promise.resolve({
            ok: false,
            output: "",
            error: { type: "Python unavailable", message: failure || "Python could not be loaded" },
            variables: [],
            durationMs: 0,
            outputTruncated: false,
            trace: [],
            traceTruncated: false,
        });
    }
    const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    const id = nextId++;
    return new Promise<RunResult>((resolve) => {
        // The time limit counts from when the interpreter is ready, so a slow
        // first download never reads as an endless loop.
        const arm = () => {
            const timer = window.setTimeout(() => {
                pending.delete(id);
                // A stuck interpreter cannot be interrupted: replace it.
                w.terminate();
                worker = null;
                failAll({ type: "Stopped", message: "another program was still running" });
                preloadPython();
                resolve({
                    ok: false,
                    output: "",
                    error: {
                        type: "Stopped",
                        message: `the program ran for more than ${Math.round(timeoutMs / 1000)} seconds, so it was stopped. A loop that never ends is the usual cause`,
                    },
                    variables: [],
                    durationMs: timeoutMs,
                    outputTruncated: false,
                    trace: [],
                    traceTruncated: false,
                });
            }, timeoutMs);
            pending.set(id, { resolve, timer });
            w.postMessage({ type: "run", id, code });
        };
        if (status === "ready") {
            arm();
            return;
        }
        const off = onRunnerStatus((s) => {
            if (s === "ready") {
                off();
                arm();
            } else if (s === "failed") {
                off();
                resolve({
                    ok: false,
                    output: "",
                    error: { type: "Python unavailable", message: failure || "Python could not be loaded" },
                    variables: [],
                    durationMs: 0,
                    outputTruncated: false,
                    trace: [],
                    traceTruncated: false,
                });
            }
        });
    });
};
