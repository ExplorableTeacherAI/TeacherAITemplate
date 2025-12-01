import type { Section } from "@/components/SectionBlock";

/**
 * Sections configuration for the canvas.
 * This file is now in src/ so Vite will watch it for changes and hot-reload automatically.
 */

export const sectionsMetadata = {
    version: "1.0",
    title: "TeacherAI Sections",
    description: "Configurable sections for the canvas, defined via a simple JSON DSL.",
};

export const sections: Section[] = [
    {
        id: "1",
        type: "html",
        title: "Overview",
        description: "sample html",
        content: "\n<h1>Geometric interpretation of quadratic and cubic equations</h1>",
    },
    {
        id: "2",
        type: "html",
        title: "Overview",
        description: "sample html",
        content: '\n<p class="mathjax-process text-base">Consider a quadratic equation</p>',
    },
    {
        id: "3",
        type: "html",
        title: "Equation (1)",
        description: "Quadratic equation from the image",
        content: `
<div class="relative my-2">
  <div class="text-center text-lg mathjax-process">$x^2 = mx + n.$</div>
  <span class="absolute right-0 top-1/2 -translate-y-1/2">(1)</span>
</div>`,
    },
    {
        id: "4",
        type: "html",
        title: "Overview",
        description: "sample html",
        content: '\n<p class="mathjax-process text-base">From elementary school we have learned how to find its solutions, that is, all the values of $x$ that satisfy equation (1). To do so we just need to use the widely known quadratic formula</p>',
    },
    {
        id: "5",
        type: "html",
        title: "Equation (2)",
        description: "Quadratic equation",
        content: `
<div class="relative my-2">
  <div class="text-center text-lg mathjax-process">\\[ x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a} \\]</div>
  <span class="absolute right-0 top-1/2 -translate-y-1/2">(2)</span>
</div>`,
    },
    {
        id: "5_1",
        type: "html",
        title: "Overview",
        description: "sample html",
        content: `
<div class="mathjax-process text-base">of the general quadratic equation
 <div class="relative my-2">
 <div class="text-center text-lg  mathjax-process">$$ax^2 + bx + c = 0$$</div><span class="absolute right-0 top-1/2 -translate-y-1/2">(3)</span>
</div>
</div>`,
    },
    {
        id: "5_2",
        type: "html",
        title: "Overview",
        description: "sample html",
        content: '\n<p class="mathjax-process text-base">By rewriting equation $x^2 - mx - n = 0$ (1) as we can use (2) to obtain</p>',
    },
    {
        id: "5_3",
        type: "html",
        title: "Equation (2)",
        description: "Quadratic equation",
        content: `
<div class="relative my-2">
  <div class="text-center text-lg mathjax-process">\\[ x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a} \\]</div>
  <span class="absolute right-0 top-1/2 -translate-y-1/2">(4)</span>
</div>`,
    },
    {
        id: "5_4",
        type: "html",
        title: "Overview",
        description: "sample html",
        content: '\n<p class="mathjax-process text-base">If we plot equation (1) we can observe geometrically that it represents the intersection of the parabola $y = x^2$ with the line $y = mx + n.$ This can be appreciated in the following applet. Drag the sliders below and observe what happens with the intersection points $x_0$ and $x_1.$</p>',
    },
    {
        id: "5_5",
        type: "html",
        title: "",
        description: "",
        content: "",
    },
    {
        id: "7",
        type: "desmos",
        title: "Parabola and Line with Sliders",
        description: "y=x^2 and y=mx+n with adjustable m and n, showing intersections",
        content: `{
  "expressions": [
    {
      "id": "parabola",
      "latex": "y=x^2",
      "color": "#c74440",
      "label": "x^2",
      "showLabel": true
    },
    {
      "id": "m",
      "latex": "m=0.3",
      "sliderBounds": { "min": -2, "max": 2, "step": 0.1 }
    },
    {
      "id": "n",
      "latex": "n=1.5",
      "sliderBounds": { "min": -3, "max": 3, "step": 0.1 }
    },
    {
      "id": "line",
      "latex": "y=m x + n",
      "color": "#000000",
      "label": "mx+n",
      "showLabel": true
    },
    {
      "id": "x0",
      "latex": "x_0=\\\\frac{m-\\\\sqrt{m^2+4n}}{2}",
      "hidden": true
    },
    {
      "id": "x1",
      "latex": "x_1=\\\\frac{m+\\\\sqrt{m^2+4n}}{2}",
      "hidden": true
    },
    {
      "id": "p0",
      "latex": "(x_0, x_0^2)",
      "color": "#2d70b3",
      "showLabel": true,
      "label": "x_0"
    },
    {
      "id": "p1",
      "latex": "(x_1, x_1^2)",
      "color": "#2d70b3",
      "showLabel": true,
      "label": "x_1"
    }
  ],
  "options": { "expressions": true, "settingsMenu": false, "keypad": false, "zoomButtons": false }
}`,
    },
    {
        id: "7_1",
        type: "html",
        title: "",
        description: "",
        content: "",
    },
    {
        id: "9",
        type: "geogebra",
        title: "GeoGebra: Parabola and Line with Sliders",
        description: "y=x^2 and y=mx+n with sliders m and n; intersection points labeled",
        content: `{
  "mode": "applet",
  "app": "graphing",
  "params": { "showMenuBar": false, "showToolBar": false, "showAlgebraInput": false, "showZoomButtons": true },
  "height": 440,
  "commands": [
    "m = 0.3",
    "n = 2",
    "f(x) = x^2",
    "g(x) = m*x + n",
    "x0 = Intersect(f, g, 1)",
    "x1 = Intersect(f, g, 2)",
    "ShowLabel(x0, true)",
    "ShowLabel(x1, true)",
    "SetPointSize(x0, 6)",
    "SetPointSize(x1, 6)",
    "SetColor(f, 199, 68, 64)",
    "SetLineThickness(f, 6)",
    "SetColor(g, 64, 64, 64)"
  ]
}`,
    },
];
