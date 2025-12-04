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
            In two dimensions, this creates a circle, while in three dimensions, it forms a sphere.
            This fundamental concept helps us understand how geometric principles extend across different dimensional spaces
            and how we can visualize mathematical relationships in our physical world.
        </p>
    ),
};
