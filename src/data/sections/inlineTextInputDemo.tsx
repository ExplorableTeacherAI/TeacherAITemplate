import { InlineTextInput } from "@/components/atoms";

export const inlineTextInputDemoSection = {
    id: "inline-text-input-demo",
    title: "Interactive Text Input Demo",
    content: (
        <p className="text-lg leading-relaxed">
            A quarter circle is{" "}
            <InlineTextInput
                correctAnswer="90"
                color="#3B82F6"
                bgColor="rgba(59, 130, 246, 0.35)"
            />{" "}
            angle, and it represents one-fourth of a complete rotation around a point.
        </p>
    ),
};
