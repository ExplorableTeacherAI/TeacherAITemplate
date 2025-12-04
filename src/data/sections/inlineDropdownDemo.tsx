import { InlineDropdown } from "@/components/atoms";

export const inlineDropdownDemoSection = {
    id: "inline-dropdown-demo",
    title: "Interactive Dropdown Demo",
    content: (
        <div className="space-y-8">
            <p className="text-lg leading-relaxed">
                Notice how the definition of a sphere is almost the same as the definition of a{" "}
                <InlineDropdown
                    correctAnswer="circle"
                    options={["cube", "circle", "radius"]}
                    color="#3B82F6"
                    bgColor="rgba(59, 130, 246, 0.15)"
                />{" "}
                – except in three dimensions!
            </p>

            <p className="text-lg leading-relaxed">
                The{" "}
                <InlineDropdown
                    correctAnswer="Pythagorean theorem"
                    options={["Pythagorean theorem", "quadratic formula", "distance formula"]}
                    color="#8B5CF6"
                    bgColor="rgba(139, 92, 246, 0.15)"
                />{" "}
                states that in a right triangle, a² + b² = c².
            </p>

            <p className="text-lg leading-relaxed">
                A{" "}
                <InlineDropdown
                    correctAnswer="parallelogram"
                    options={["triangle", "parallelogram", "pentagon"]}
                    color="#10B981"
                    bgColor="rgba(16, 185, 129, 0.15)"
                />{" "}
                is a quadrilateral with two pairs of parallel sides.
            </p>

            <p className="text-lg leading-relaxed">
                Newton's second law states that{" "}
                <InlineDropdown
                    correctAnswer="force"
                    options={["energy", "force", "momentum"]}
                    color="#06B6D4"
                    bgColor="rgba(6, 182, 212, 0.15)"
                />{" "}
                equals mass times acceleration.
            </p>
        </div>
    ),
};
