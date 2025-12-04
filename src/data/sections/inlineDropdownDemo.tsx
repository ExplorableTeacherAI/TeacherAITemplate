import { InlineDropdown } from "@/components/atoms";

export const inlineDropdownDemoSection = {
    id: "inline-dropdown-demo",
    title: "Interactive Dropdown Demo",
    content: (
        <p className="text-lg leading-relaxed">
            Notice how the definition of a sphere is almost the same as the definition of a{" "}
            <InlineDropdown
                correctAnswer="circle"
                options={["cube", "circle", "radius"]}
                color="#3B82F6"
                bgColor="rgba(59, 130, 246, 0.35)"
            />{" "}
            – except in three dimensions! Both shapes are defined by all points being equidistant from a central point.
        </p>
    ),
};
