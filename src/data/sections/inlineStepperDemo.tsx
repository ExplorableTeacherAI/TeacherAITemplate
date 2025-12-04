import { InlineStepper } from "@/components/atoms";

export const inlineStepperDemoSection = {
    id: "inline-stepper-demo",
    title: "Interactive Stepper Demo",
    content: (
        <p className="text-lg leading-relaxed">
            If we increase the number of wedges to{" "}
            <InlineStepper
                initialValue={10}
                min={1}
                max={20}
                step={1}
                color="#D81B60"
                bgColor="rgba(216, 27, 96, 0.9)"
            />{" "}
            this shape gets closer to a circle as the number increases.
        </p>
    ),
};
