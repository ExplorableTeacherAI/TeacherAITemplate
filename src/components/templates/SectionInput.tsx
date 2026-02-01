import { useState, type KeyboardEvent, useRef, useEffect } from "react";
import { Textarea } from "@/components/atoms/ui/textarea";

interface SectionInputProps {
    id: string;
    onCommit: (id: string, value: string) => void;
    placeholder?: string;
}

export const SectionInput = ({ id, onCommit, placeholder = "Type '/' for commands" }: SectionInputProps) => {
    const [value, setValue] = useState("");
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.focus();
            // Simple auto-resize
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
        }
    }, [value]);

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (value.trim()) {
                onCommit(id, value);
            }
        }
    };

    return (
        <div className="w-full">
            <Textarea
                ref={textareaRef}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                className="min-h-[2.5rem] resize-none border-none shadow-none focus-visible:ring-0 px-0 text-lg bg-transparent placeholder:text-muted-foreground/50"
            />
        </div>
    );
};
