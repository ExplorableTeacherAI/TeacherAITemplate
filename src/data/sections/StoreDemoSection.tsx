/**
 * Variable Store Demo
 * -------------------
 * Demonstrates cross-section variable sharing using the Zustand store.
 * Shows all variable types: number, text, select, and boolean.
 */

import { type ReactElement } from 'react';
import { Block } from '@/components/templates';
import { SplitLayout, FullWidthLayout } from '@/components/layouts';
import { useVar, useSetVar } from '@/stores';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/atoms/ui/card';
import { Slider } from '@/components/atoms/ui/slider';
import { Label } from '@/components/atoms/ui/label';
import { Input } from '@/components/atoms/ui/input';
import { Switch } from '@/components/atoms/ui/switch';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/atoms/ui/select';

/**
 * Control Panel - Sets the shared variables
 */
const ControlPanel = () => {
    const setVar = useSetVar();

    // Number variables
    const amplitude = useVar('amplitude', 1);
    const frequency = useVar('frequency', 1);
    const phase = useVar('phase', 0);

    // Text variable
    const title = useVar('title', 'Interactive Lesson');

    // Select variable
    const waveType = useVar('waveType', 'sine');

    // Boolean variable
    const showGrid = useVar('showGrid', true);

    return (
        <Card>
            <CardHeader>
                <CardTitle>🎛️ Control Panel</CardTitle>
                <CardDescription>
                    All variable types: numbers, text, select, boolean
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Text Input */}
                <div className="space-y-2">
                    <Label>Title (text)</Label>
                    <Input
                        value={title}
                        onChange={(e) => setVar('title', e.target.value)}
                        placeholder="Enter a title..."
                    />
                </div>

                {/* Select Dropdown */}
                <div className="space-y-2">
                    <Label>Wave Type (select)</Label>
                    <Select
                        value={waveType}
                        onValueChange={(v) => setVar('waveType', v)}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select wave type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="sine">Sine</SelectItem>
                            <SelectItem value="cosine">Cosine</SelectItem>
                            <SelectItem value="square">Square</SelectItem>
                            <SelectItem value="sawtooth">Sawtooth</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Boolean Toggle */}
                <div className="flex items-center justify-between">
                    <Label>Show Grid (boolean)</Label>
                    <Switch
                        checked={showGrid}
                        onCheckedChange={(v) => setVar('showGrid', v)}
                    />
                </div>

                <hr className="my-4" />

                {/* Number Sliders */}
                <div className="space-y-2">
                    <div className="flex justify-between">
                        <Label>Amplitude (number)</Label>
                        <span className="text-sm text-muted-foreground font-mono">{amplitude.toFixed(1)}</span>
                    </div>
                    <Slider
                        min={0.1}
                        max={3}
                        step={0.1}
                        value={[amplitude]}
                        onValueChange={([v]) => setVar('amplitude', v)}
                    />
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between">
                        <Label>Frequency</Label>
                        <span className="text-sm text-muted-foreground font-mono">{frequency.toFixed(1)} Hz</span>
                    </div>
                    <Slider
                        min={0.1}
                        max={5}
                        step={0.1}
                        value={[frequency]}
                        onValueChange={([v]) => setVar('frequency', v)}
                    />
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between">
                        <Label>Phase</Label>
                        <span className="text-sm text-muted-foreground font-mono">{phase.toFixed(0)}°</span>
                    </div>
                    <Slider
                        min={0}
                        max={360}
                        step={5}
                        value={[phase]}
                        onValueChange={([v]) => setVar('phase', v)}
                    />
                </div>
            </CardContent>
        </Card>
    );
};

/**
 * Wave Visualization - Reads the shared variables
 */
const WaveVisualization = () => {
    const amplitude = useVar('amplitude', 1);
    const frequency = useVar('frequency', 1);
    const phase = useVar('phase', 0);
    const waveType = useVar('waveType', 'sine');
    const showGrid = useVar('showGrid', true);
    const title = useVar('title', 'Interactive Lesson');

    // Wave function based on type
    const waveFunction = (x: number): number => {
        const normalizedX = x + (phase * Math.PI) / 180;
        const type = String(waveType);
        switch (type) {
            case 'cosine':
                return Math.cos(frequency * normalizedX);
            case 'square':
                return Math.sign(Math.sin(frequency * normalizedX));
            case 'sawtooth':
                return 2 * ((frequency * normalizedX / (2 * Math.PI)) % 1) - 1;
            default: // sine
                return Math.sin(frequency * normalizedX);
        }
    };

    // Generate wave points
    const width = 320;
    const height = 160;
    const centerY = height / 2;
    const points: string[] = [];

    for (let x = 0; x <= width; x += 2) {
        const normalizedX = (x / width) * 4 * Math.PI;
        const y = centerY - amplitude * 40 * waveFunction(normalizedX);
        points.push(`${x},${y}`);
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">🌊 {title}</CardTitle>
                <CardDescription>
                    Type: {waveType} | y = {amplitude.toFixed(1)} × {waveType}({frequency.toFixed(1)}x + {phase.toFixed(0)}°)
                </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
                <svg width={width} height={height} className="bg-slate-50 dark:bg-slate-900 rounded-lg">
                    {/* Grid lines (controlled by showGrid boolean) */}
                    {showGrid && (
                        <>
                            <line x1="0" y1={centerY} x2={width} y2={centerY} stroke="#cbd5e1" strokeDasharray="4" />
                            <line x1={width / 4} y1="0" x2={width / 4} y2={height} stroke="#cbd5e1" strokeDasharray="2" strokeOpacity="0.5" />
                            <line x1={width / 2} y1="0" x2={width / 2} y2={height} stroke="#cbd5e1" strokeDasharray="2" strokeOpacity="0.5" />
                            <line x1={(3 * width) / 4} y1="0" x2={(3 * width) / 4} y2={height} stroke="#cbd5e1" strokeDasharray="2" strokeOpacity="0.5" />
                        </>
                    )}

                    {/* Wave */}
                    <polyline
                        fill="none"
                        stroke="url(#gradient)"
                        strokeWidth="3"
                        strokeLinecap="round"
                        points={points.join(' ')}
                    />

                    <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#3b82f6" />
                            <stop offset="50%" stopColor="#8b5cf6" />
                            <stop offset="100%" stopColor="#ec4899" />
                        </linearGradient>
                    </defs>
                </svg>
            </CardContent>
        </Card>
    );
};

/**
 * Variable Display - Shows all current values
 */
const VariableDisplay = () => {
    const amplitude = useVar('amplitude', 1);
    const frequency = useVar('frequency', 1);
    const phase = useVar('phase', 0);
    const title = useVar('title', 'Interactive Lesson');
    const waveType = useVar('waveType', 'sine');
    const showGrid = useVar('showGrid', true);

    return (
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50">
            <CardHeader className="pb-2">
                <CardTitle className="text-base">📊 All Variables</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between p-2 bg-white/60 dark:bg-black/20 rounded">
                        <span className="text-muted-foreground">title</span>
                        <span className="font-mono text-blue-600 truncate max-w-[150px]">"{title}"</span>
                    </div>
                    <div className="flex justify-between p-2 bg-white/60 dark:bg-black/20 rounded">
                        <span className="text-muted-foreground">waveType</span>
                        <span className="font-mono text-purple-600">"{waveType}"</span>
                    </div>
                    <div className="flex justify-between p-2 bg-white/60 dark:bg-black/20 rounded">
                        <span className="text-muted-foreground">showGrid</span>
                        <span className="font-mono text-green-600">{showGrid ? 'true' : 'false'}</span>
                    </div>
                    <div className="flex justify-between p-2 bg-white/60 dark:bg-black/20 rounded">
                        <span className="text-muted-foreground">amplitude</span>
                        <span className="font-mono text-orange-600">{amplitude.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between p-2 bg-white/60 dark:bg-black/20 rounded">
                        <span className="text-muted-foreground">frequency</span>
                        <span className="font-mono text-orange-600">{frequency.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between p-2 bg-white/60 dark:bg-black/20 rounded">
                        <span className="text-muted-foreground">phase</span>
                        <span className="font-mono text-orange-600">{phase.toFixed(0)}°</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

// ============================================
// EXPORTED SECTIONS
// ============================================

const DemoHeader = () => (
    <FullWidthLayout maxWidth="xl">
        <Block id="store-demo-header" padding="lg">
            <div className="text-center space-y-4">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                    🔗 Cross-Section Variable Demo
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    Demonstrates all variable types: <strong>numbers</strong> (sliders),
                    <strong> text</strong> (input), <strong>select</strong> (dropdown),
                    and <strong>boolean</strong> (toggle).
                </p>
                <div className="inline-flex items-center gap-2 text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-4 py-2 rounded-full">
                    <span>💡</span>
                    <span>All changes update instantly across sections!</span>
                </div>
            </div>
        </Block>
    </FullWidthLayout>
);

const DemoMain = () => (
    <SplitLayout ratio="1:1" gap="lg">
        <Block id="store-demo-controls" padding="md">
            <ControlPanel />
        </Block>
        <Block id="store-demo-viz" padding="md">
            <div className="space-y-4">
                <WaveVisualization />
                <VariableDisplay />
            </div>
        </Block>
    </SplitLayout>
);

/**
 * All demo sections
 */
export const storeDemoSections: ReactElement[] = [
    <DemoHeader key="store-demo-header" />,
    <DemoMain key="store-demo-main" />,
];

export default storeDemoSections;
