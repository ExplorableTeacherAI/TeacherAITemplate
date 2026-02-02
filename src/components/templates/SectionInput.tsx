import { type KeyboardEvent, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface SectionInputProps {
    id: string;
    onCommit: (id: string, value: string) => void;
    placeholder?: string;
}

export const SectionInput = ({ id, onCommit, placeholder = "Type '/' for commands" }: SectionInputProps) => {
    const contentRef = useRef<HTMLParagraphElement>(null);

    useEffect(() => {
        if (contentRef.current) {
            contentRef.current.focus();
        }
    }, []);

    const handleKeyDown = (e: KeyboardEvent<HTMLParagraphElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            const text = contentRef.current?.innerText || "";
            if (text.trim()) {
                onCommit(id, text);
            }
        }
    };

    return (
        <div className="w-full">
            <p
                ref={contentRef}
                contentEditable
                onKeyDown={handleKeyDown}
                className={cn(
                    "w-full outline-none text-lg text-gray-800 leading-relaxed empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/50 cursor-text min-h-[1.5em]"
                )}
                data-placeholder={placeholder}
            />
        </div>
    );
};
