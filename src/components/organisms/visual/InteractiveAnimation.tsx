import { useState } from "react";
import {
    AnimatedBackground,
    MorphingShapes,
    ParticleSystem,
    AnimatedGraph,
} from "@/components/atoms";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/atoms/ui/card";
import { Label } from "@/components/atoms/ui/label";
import { Slider } from "@/components/atoms/ui/slider";
import { Switch } from "@/components/atoms/ui/switch";
import { Button } from "@/components/atoms/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/atoms/ui/tabs";
import {
    RotateCcw,
    Play,
    Pause,
    Palette
} from "lucide-react";

export interface InteractiveAnimationProps {
    /** Animation type */
    type?: "background" | "shapes" | "particles" | "graph";
    /** Initial variant */
    initialVariant?: string;
    /** Show controls */
    showControls?: boolean;
    /** Canvas width */
    width?: number;
    /** Canvas height */
    height?: number;
    /** Title */
    title?: string;
    /** Description */
    description?: string;
    /** Optional className */
    className?: string;
}

/**
 * InteractiveAnimation - Two.js animation with interactive controls
 * 
 * Provides sliders, switches, and buttons to control animation parameters in real-time.
 * Perfect for educational demonstrations.
 * 
 * @example
 * ```tsx
 * <InteractiveAnimation
 *   type="graph"
 *   initialVariant="sine-wave"
 *   title="Wave Visualization"
 *   showControls={true}
 * />
 * ```
 */
export const InteractiveAnimation = ({
    type = "graph",
    initialVariant,
    showControls = true,
    width = 600,
    height = 400,
    title = "Interactive Animation",
    description = "Adjust the controls to explore the animation",
    className = "",
}: InteractiveAnimationProps) => {
    // Animation state
    const [speed, setSpeed] = useState(1.0);
    const [color, setColor] = useState("#4F46E5");
    const [secondaryColor, setSecondaryColor] = useState("#7C3AED");
    const [isPlaying, setIsPlaying] = useState(true);

    // Type-specific states
    const [particleCount, setParticleCount] = useState(100);
    const [interactive, setInteractive] = useState(true);
    const [showAxes, setShowAxes] = useState(true);
    const [showGrid, setShowGrid] = useState(false);

    // Variant selection
    const variants = {
        background: ["waves", "particles", "grid", "aurora", "constellation"],
        shapes: ["circle-to-square", "polygon-morph", "flower", "spiral", "geometric"],
        particles: ["fireworks", "galaxy", "fluid", "magnetic", "trail"],
        graph: ["sine-wave", "parametric", "pendulum", "fourier", "lissajous"],
    };

    const defaultVariants = {
        background: "waves",
        shapes: "flower",
        particles: "magnetic",
        graph: "sine-wave",
    };

    const [variant, setVariant] = useState(initialVariant || defaultVariants[type]);

    // Color presets
    const colorPresets = [
        { name: "Indigo", primary: "#4F46E5", secondary: "#7C3AED" },
        { name: "Pink", primary: "#EC4899", secondary: "#F59E0B" },
        { name: "Emerald", primary: "#10B981", secondary: "#3B82F6" },
        { name: "Cyan", primary: "#06B6D4", secondary: "#8B5CF6" },
        { name: "Amber", primary: "#F59E0B", secondary: "#EF4444" },
    ];

    const handleReset = () => {
        setSpeed(1.0);
        setColor("#4F46E5");
        setSecondaryColor("#7C3AED");
        setParticleCount(100);
        setInteractive(true);
        setShowAxes(true);
        setShowGrid(false);
        setIsPlaying(true);
        setVariant(defaultVariants[type]);
    };

    const renderAnimation = () => {
        // Use a very small speed when paused instead of 0 to avoid issues
        const effectiveSpeed = isPlaying ? speed : 0.01;

        // Create a key that changes when we need to remount the component
        // Round speed to nearest 0.2 to avoid remounting on every tiny slider change
        const speedKey = (Math.round(effectiveSpeed * 5) / 5).toFixed(1);
        const getAnimationKey = () => {
            switch (type) {
                case "particles":
                    return `${variant}-${particleCount}-${interactive}-${speedKey}`;
                case "graph":
                    return `${variant}-${showAxes}-${showGrid}-${speedKey}`;
                default:
                    return `${variant}-${speedKey}`;
            }
        };

        switch (type) {
            case "background":
                return (
                    <AnimatedBackground
                        key={`bg-${getAnimationKey()}-${color}-${secondaryColor}`}
                        variant={variant as any}
                        color={color}
                        secondaryColor={secondaryColor}
                        width={width}
                        height={height}
                        speed={effectiveSpeed}
                    />
                );
            case "shapes":
                return (
                    <MorphingShapes
                        key={`shape-${getAnimationKey()}-${color}`}
                        variant={variant as any}
                        color={color}
                        width={width}
                        height={height}
                        speed={effectiveSpeed}
                    />
                );
            case "particles":
                return (
                    <ParticleSystem
                        key={`particle-${getAnimationKey()}-${color}-${secondaryColor}`}
                        variant={variant as any}
                        color={color}
                        secondaryColor={secondaryColor}
                        particleCount={particleCount}
                        width={width}
                        height={height}
                        speed={effectiveSpeed}
                        interactive={interactive}
                    />
                );
            case "graph":
                return (
                    <AnimatedGraph
                        key={`graph-${getAnimationKey()}-${color}-${secondaryColor}`}
                        variant={variant as any}
                        color={color}
                        secondaryColor={secondaryColor}
                        width={width}
                        height={height}
                        speed={effectiveSpeed}
                        showAxes={showAxes}
                        showGrid={showGrid}
                    />
                );
        }
    };

    return (
        <div className={`space-y-4 ${className}`}>
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>{title}</CardTitle>
                            <CardDescription>{description}</CardDescription>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setIsPlaying(!isPlaying)}
                            >
                                {isPlaying ? (
                                    <Pause className="h-4 w-4" />
                                ) : (
                                    <Play className="h-4 w-4" />
                                )}
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={handleReset}
                            >
                                <RotateCcw className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Animation Display */}
                    <div className="rounded-lg border overflow-hidden bg-background">
                        {renderAnimation()}
                    </div>

                    {/* Controls */}
                    {showControls && (
                        <Tabs defaultValue="parameters" className="w-full">
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="parameters">Parameters</TabsTrigger>
                                <TabsTrigger value="colors">Colors</TabsTrigger>
                                <TabsTrigger value="variants">Variants</TabsTrigger>
                            </TabsList>

                            {/* Parameters Tab */}
                            <TabsContent value="parameters" className="space-y-4">
                                {/* Speed Control */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="speed">Animation Speed</Label>
                                        <span className="text-sm text-muted-foreground">
                                            {speed.toFixed(1)}x
                                        </span>
                                    </div>
                                    <Slider
                                        id="speed"
                                        min={0.1}
                                        max={2.0}
                                        step={0.1}
                                        value={[speed]}
                                        onValueChange={(value) => setSpeed(value[0])}
                                    />
                                </div>

                                {/* Particle Count (for particle system) */}
                                {type === "particles" && (
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="particles">Particle Count</Label>
                                            <span className="text-sm text-muted-foreground">
                                                {particleCount}
                                            </span>
                                        </div>
                                        <Slider
                                            id="particles"
                                            min={20}
                                            max={200}
                                            step={10}
                                            value={[particleCount]}
                                            onValueChange={(value) => setParticleCount(value[0])}
                                        />
                                    </div>
                                )}

                                {/* Interactive Toggle (for particle system) */}
                                {type === "particles" && (
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="interactive">Interactive Mode</Label>
                                        <Switch
                                            id="interactive"
                                            checked={interactive}
                                            onCheckedChange={setInteractive}
                                        />
                                    </div>
                                )}

                                {/* Axes Toggle (for graphs) */}
                                {type === "graph" && (
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="axes">Show Axes</Label>
                                        <Switch
                                            id="axes"
                                            checked={showAxes}
                                            onCheckedChange={setShowAxes}
                                        />
                                    </div>
                                )}

                                {/* Grid Toggle (for graphs) */}
                                {type === "graph" && (
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="grid">Show Grid</Label>
                                        <Switch
                                            id="grid"
                                            checked={showGrid}
                                            onCheckedChange={setShowGrid}
                                        />
                                    </div>
                                )}
                            </TabsContent>

                            {/* Colors Tab */}
                            <TabsContent value="colors" className="space-y-4">
                                {/* Color Presets */}
                                <div className="space-y-2">
                                    <Label>
                                        <Palette className="inline h-4 w-4 mr-2" />
                                        Color Presets
                                    </Label>
                                    <div className="grid grid-cols-5 gap-2">
                                        {colorPresets.map((preset) => (
                                            <Button
                                                key={preset.name}
                                                variant="outline"
                                                className="h-auto p-2"
                                                onClick={() => {
                                                    setColor(preset.primary);
                                                    setSecondaryColor(preset.secondary);
                                                }}
                                            >
                                                <div className="space-y-1">
                                                    <div className="flex gap-1">
                                                        <div
                                                            className="w-6 h-6 rounded"
                                                            style={{ backgroundColor: preset.primary }}
                                                        />
                                                        <div
                                                            className="w-6 h-6 rounded"
                                                            style={{ backgroundColor: preset.secondary }}
                                                        />
                                                    </div>
                                                    <span className="text-xs">{preset.name}</span>
                                                </div>
                                            </Button>
                                        ))}
                                    </div>
                                </div>

                                {/* Custom Colors */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="primary-color">Primary Color</Label>
                                        <div className="flex gap-2">
                                            <input
                                                id="primary-color"
                                                type="color"
                                                value={color}
                                                onChange={(e) => setColor(e.target.value)}
                                                className="h-10 w-full rounded border cursor-pointer"
                                            />
                                            <input
                                                type="text"
                                                value={color}
                                                onChange={(e) => setColor(e.target.value)}
                                                className="h-10 flex-1 rounded border px-3 text-sm"
                                                placeholder="#4F46E5"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="secondary-color">Secondary Color</Label>
                                        <div className="flex gap-2">
                                            <input
                                                id="secondary-color"
                                                type="color"
                                                value={secondaryColor}
                                                onChange={(e) => setSecondaryColor(e.target.value)}
                                                className="h-10 w-full rounded border cursor-pointer"
                                            />
                                            <input
                                                type="text"
                                                value={secondaryColor}
                                                onChange={(e) => setSecondaryColor(e.target.value)}
                                                className="h-10 flex-1 rounded border px-3 text-sm"
                                                placeholder="#7C3AED"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>

                            {/* Variants Tab */}
                            <TabsContent value="variants" className="space-y-4">
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                    {variants[type].map((v) => (
                                        <Button
                                            key={v}
                                            variant={variant === v ? "default" : "outline"}
                                            onClick={() => setVariant(v)}
                                            className="capitalize"
                                        >
                                            {v.replace(/-/g, " ")}
                                        </Button>
                                    ))}
                                </div>
                            </TabsContent>
                        </Tabs>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};
