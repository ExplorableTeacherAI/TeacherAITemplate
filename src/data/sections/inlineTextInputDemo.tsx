import { InlineClozeInput } from "@/components/atoms";
import { getVariableInfo, clozePropsFromDefinition } from "../variables";

export const inlineTextInputDemoSection = {
    id: "inline-text-input-demo",
    title: "Interactive Text Input Demo",
    content: (
        <p className="text-lg leading-relaxed">
            A quarter circle is{" "}
            <InlineClozeInput
                varName="quarterCircleAngle"
                correctAnswer="90"
                {...clozePropsFromDefinition(getVariableInfo('quarterCircleAngle'))}
            />{" "}
            angle, and it represents one-fourth of a complete rotation around a point.
        </p>
    ),
};
