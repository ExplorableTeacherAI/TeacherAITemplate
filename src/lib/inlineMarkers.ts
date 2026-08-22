/** UTF-8-safe base64 helpers for inline-component marker properties. */
export const encodeMarkerJson = (json: string): string => {
    const bytes = new TextEncoder().encode(json);
    let binary = '';
    for (const byte of bytes) binary += String.fromCharCode(byte);
    return btoa(binary);
};

export const decodeMarkerJson = (encoded: string): string => {
    const binary = atob(encoded);
    const bytes = Uint8Array.from(binary, char => char.charCodeAt(0));
    return new TextDecoder().decode(bytes);
};

export const encodeMarkerProps = (props: unknown): string =>
    encodeMarkerJson(JSON.stringify(props));

export const decodeMarkerProps = <T extends Record<string, unknown>>(
    encoded: string | undefined,
): T | null => {
    if (!encoded) return null;
    try {
        const parsed = JSON.parse(decodeMarkerJson(encoded));
        return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
            ? parsed as T
            : null;
    } catch {
        return null;
    }
};

export const createInlineMarkerId = (componentType: string): string => {
    const uniquePart = globalThis.crypto?.randomUUID?.()
        ?? `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    return `${componentType}-${uniquePart}`;
};

/**
 * Apply validated editor-panel values to a slash-command placeholder.
 *
 * Newly inserted inline components are plain DOM until the saved source is
 * reloaded. Without this optimistic update, closing the panel exposes the
 * original placeholder label (for example, "variable") even though the new
 * label is already queued for saving.
 */
export const updateProvisionalInlinePlaceholder = (
    componentId: string | undefined,
    componentType: string,
    props: object,
): boolean => {
    if (!componentId || typeof document === 'undefined') return false;

    const element = Array.from(
        document.querySelectorAll<HTMLElement>('[data-component-id]'),
    ).find(candidate =>
        candidate.getAttribute('data-component-id') === componentId &&
        candidate.getAttribute('data-inline-component') === componentType
    );
    if (!element) return false;

    // React-rendered components already expose serialized props and update
    // from pending edits. Only mutate the raw slash-command placeholder.
    const isProvisional =
        element.dataset.provisionalInline === 'true' ||
        !element.hasAttribute('data-component-props');
    if (!isProvisional) return false;

    const values = props as Record<string, unknown>;
    element.dataset.provisionalInline = 'true';
    element.setAttribute('data-component-props', encodeMarkerProps(values));

    const stringValue = (key: string): string | undefined => {
        const value = values[key];
        return typeof value === 'string' && value.length > 0 ? value : undefined;
    };

    let displayText: string | undefined;
    switch (componentType) {
        case 'inlineFormula':
            displayText = stringValue('latex') ?? 'x^2';
            break;
        case 'inlineHyperlink':
            displayText = stringValue('text');
            break;
    }

    if (displayText !== undefined) element.textContent = displayText;

    const color = stringValue('color');
    const bgColor = stringValue('bgColor');
    if (bgColor) element.style.backgroundColor = bgColor;
    if (color) element.style.color = color;

    return true;
};
