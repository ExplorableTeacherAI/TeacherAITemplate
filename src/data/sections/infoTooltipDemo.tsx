import { InfoTooltip } from "@/components/atoms";

export const infoTooltipDemoSection = {
    id: "info-tooltip-demo",
    title: "Interactive Tooltips Demo",
    content: (
        <p className="text-lg leading-relaxed">
            Every point on a{" "}
            <InfoTooltip
                term="circle"
                description="A circle is a geometric shape where all points are equidistant from a center point. This distance is called the radius."
            />{" "}
            has the same distance from its center. This means that they can be drawn using a{" "}
            <InfoTooltip
                term="compass"
                description="A compass is a drawing tool used for creating circles or arcs. It consists of two arms – the needle on one end is placed in the center, while pencil on the other end traces out the curve."
            />.
        </p>
    ),
};
