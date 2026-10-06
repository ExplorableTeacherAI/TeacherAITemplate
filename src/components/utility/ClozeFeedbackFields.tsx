import React from 'react';
import type { ClozeFeedback } from '@/components/atoms/text/feedbackContext';
import { BRAND_GREEN } from './editorColors';

const FIELDS: { key: keyof ClozeFeedback; label: string; placeholder: string }[] = [
    { key: 'successMessage', label: 'When correct', placeholder: '— exactly right! (explain why)' },
    { key: 'failureMessage', label: 'When wrong', placeholder: '— not quite.' },
    { key: 'hint', label: 'Hint (after a wrong answer)', placeholder: 'A nudge toward the answer' },
];

/**
 * The answer feedback shown after a student picks or types an answer — the
 * messages of the InlineFeedback around the blank. Shared by the cloze
 * choice and cloze input editors; rendered only when the blank has one.
 */
export const ClozeFeedbackFields: React.FC<{
    value: ClozeFeedback;
    onChange: (value: ClozeFeedback) => void;
}> = ({ value, onChange }) => (
    <div>
        <label className="block text-sm font-medium mb-1">Answer feedback</label>
        <p className="text-xs text-muted-foreground mb-2">
            Shown right after the blank once the student answers. Leave a message empty to use the default.
        </p>
        <div className="space-y-2">
            {FIELDS.map(({ key, label, placeholder }) => (
                <div key={key}>
                    <span className="block text-xs text-muted-foreground mb-1">{label}</span>
                    <textarea
                        value={value[key]}
                        onChange={(e) => onChange({ ...value, [key]: e.target.value })}
                        rows={2}
                        className="w-full px-3 py-2 text-sm bg-muted/30 border rounded-lg resize-y focus:outline-none focus:ring-2"
                        style={{ '--tw-ring-color': BRAND_GREEN } as React.CSSProperties}
                        placeholder={placeholder}
                    />
                </div>
            ))}
        </div>
    </div>
);
