/**
 * Minimal Python tokenizer for the CodeSandbox editor's colouring layer.
 * Line-based, no dependencies; good enough for beginner programs (strings,
 * numbers, comments, keywords, built-in names, operators). Multi-line
 * strings are coloured per line.
 */

export type TokenKind = "keyword" | "builtin" | "string" | "number" | "comment" | "operator" | "plain";

export interface Token {
    kind: TokenKind;
    text: string;
}

const KEYWORDS = new Set([
    "False", "None", "True", "and", "as", "assert", "async", "await", "break", "class", "continue",
    "def", "del", "elif", "else", "except", "finally", "for", "from", "global", "if", "import", "in",
    "is", "lambda", "nonlocal", "not", "or", "pass", "raise", "return", "try", "while", "with", "yield",
]);

const BUILTINS = new Set([
    "print", "range", "len", "int", "str", "float", "input", "list", "dict", "set", "tuple", "sum",
    "min", "max", "abs", "round", "sorted", "reversed", "enumerate", "zip", "type", "bool", "append",
]);

const TOKEN_RE =
    /(#.*$)|("""[\s\S]*?"""|'''[\s\S]*?'''|"(?:[^"\\\n]|\\.)*"?|'(?:[^'\\\n]|\\.)*'?)|(\b\d+(?:\.\d+)?\b)|([A-Za-z_][A-Za-z0-9_]*)|(==|!=|<=|>=|\*\*|\/\/|[-+*/%=<>()[\]{},:.])|(\s+)|(.)/gm;

/** Tokenize one line of Python. */
export const tokenizeLine = (line: string): Token[] => {
    const tokens: Token[] = [];
    TOKEN_RE.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = TOKEN_RE.exec(line)) !== null) {
        const [text, comment, str, num, word, op] = match;
        if (text === "") {
            TOKEN_RE.lastIndex += 1;
            continue;
        }
        let kind: TokenKind = "plain";
        if (comment) kind = "comment";
        else if (str) kind = "string";
        else if (num) kind = "number";
        else if (word) kind = KEYWORDS.has(word) ? "keyword" : BUILTINS.has(word) ? "builtin" : "plain";
        else if (op) kind = "operator";
        tokens.push({ kind, text });
    }
    return tokens;
};

/** Ink colours for each token kind: readable on white, muted, no neon. */
export const TOKEN_COLORS: Record<TokenKind, string> = {
    keyword: "#7C5CD6",
    builtin: "#3F7BC2",
    string: "#2F9E7E",
    number: "#B4761A",
    comment: "#94A3B8",
    operator: "#64748B",
    plain: "#334155",
};
