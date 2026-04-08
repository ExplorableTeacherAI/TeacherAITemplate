import { type ReactElement, useEffect, useState } from "react";
import { Block } from "@/components/templates";
import { StackLayout } from "@/components/layouts";
import {
    EditableH1,
    EditableH2,
    EditableH3,
    EditableH4,
    EditableParagraph,
    InlineFormula,
    SimulationPanel,
} from "@/components/atoms";
import { useVar } from "@/stores";
import { getExampleVariableInfo } from "../exampleVariables";

function numDef(varName: string) {
    const def = getExampleVariableInfo(varName);
    return {
        min: def?.min ?? 0,
        max: def?.max ?? 10,
        step: def?.step ?? 1,
        unit: def?.unit,
        color: def?.color,
        label: def?.label ?? varName,
    };
}

function useAnimatedTime(isRunning: boolean, speed = 1) {
    const [time, setTime] = useState(0);

    useEffect(() => {
        if (!isRunning) return;
        let frameId = 0;
        let last = performance.now();

        const tick = (now: number) => {
            const dt = (now - last) / 1000;
            last = now;
            setTime((prev) => prev + dt * speed);
            frameId = requestAnimationFrame(tick);
        };

        frameId = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(frameId);
    }, [isRunning, speed]);

    return time;
}

function WaveInterferenceViz() {
    const a1 = useVar("waveAmplitude1", 1) as number;
    const f1 = useVar("waveFrequency1", 1) as number;
    const a2 = useVar("waveAmplitude2", 1) as number;
    const f2 = useVar("waveFrequency2", 1.5) as number;
    const showSum = useVar("waveShowSum", true) as boolean;
    const running = useVar("waveRunning", false) as boolean;
    const time = useAnimatedTime(running, 1.5);

    const width = 720;
    const height = 300;
    const centerY = height / 2;

    const wavePoints = (amp: number, freq: number) => {
        const points: string[] = [];
        for (let x = 0; x <= width; x += 3) {
            const t = (x / width) * Math.PI * 6;
            const y = centerY - amp * 42 * Math.sin(freq * t + time);
            points.push(`${x},${y}`);
        }
        return points;
    };

    const sumPoints = () => {
        const points: string[] = [];
        for (let x = 0; x <= width; x += 3) {
            const t = (x / width) * Math.PI * 6;
            const y1 = a1 * Math.sin(f1 * t + time);
            const y2 = a2 * Math.sin(f2 * t - time * 1.2);
            const y = centerY - (y1 + y2) * 32;
            points.push(`${x},${y}`);
        }
        return points;
    };

    return (
        <div className="w-full h-full p-3 bg-background">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full rounded-md bg-card border border-border/50">
                <line x1={0} y1={centerY} x2={width} y2={centerY} stroke="#64748b" strokeWidth="1" strokeDasharray="4 4" />
                <polyline points={wavePoints(a1, f1).join(" ")} fill="none" stroke="#3b82f6" strokeWidth="2" />
                <polyline points={wavePoints(a2, f2).join(" ")} fill="none" stroke="#ef4444" strokeWidth="2" opacity="0.9" />
                {showSum && (
                    <polyline
                        points={sumPoints().join(" ")}
                        fill="none"
                        stroke="#22c55e"
                        strokeWidth="3"
                        strokeLinecap="round"
                    />
                )}
            </svg>
        </div>
    );
}

function TrigTransformViz() {
    const amp = useVar("trigAmplitude", 1) as number;
    const freq = useVar("trigFrequency", 1) as number;
    const phase = useVar("trigPhase", 0) as number;
    const showRef = useVar("trigShowReference", true) as boolean;
    const running = useVar("trigRunning", false) as boolean;
    const time = useAnimatedTime(running, 1.2);

    const width = 720;
    const height = 300;
    const centerY = height / 2;

    const wavePoints = (a: number, w: number, p: number) => {
        const points: string[] = [];
        for (let x = 0; x <= width; x += 3) {
            const t = (x / width) * Math.PI * 4;
            const y = centerY - a * 48 * Math.sin(w * t + p);
            points.push(`${x},${y}`);
        }
        return points;
    };

    const phaseRad = (phase * Math.PI) / 180;
    const animatedPhase = phaseRad + time;

    return (
        <div className="w-full h-full p-3 bg-background">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full rounded-md bg-card border border-border/50">
                <line x1={0} y1={centerY} x2={width} y2={centerY} stroke="#64748b" strokeWidth="1" strokeDasharray="4 4" />
                {showRef && (
                    <polyline
                        points={wavePoints(1, 1, 0).join(" ")}
                        fill="none"
                        stroke="#94a3b8"
                        strokeWidth="1.5"
                        strokeDasharray="6 4"
                    />
                )}
                <polyline
                    points={wavePoints(amp, freq, animatedPhase).join(" ")}
                    fill="none"
                    stroke="#8b5cf6"
                    strokeWidth="3"
                    strokeLinecap="round"
                />
            </svg>
        </div>
    );
}

const waveAmp1 = numDef("waveAmplitude1");
const waveFreq1 = numDef("waveFrequency1");
const waveAmp2 = numDef("waveAmplitude2");
const waveFreq2 = numDef("waveFrequency2");

const trigAmp = numDef("trigAmplitude");
const trigFreq = numDef("trigFrequency");
const trigPhase = numDef("trigPhase");

export const simulationDemoBlocks: ReactElement[] = [
    <StackLayout key="layout-simulation-title" maxWidth="xl">
        <Block id="simulation-title" padding="md">
            <EditableH3 id="h3-simulation-title" blockId="simulation-title">
                Interactive Mathematics Simulations
            </EditableH3>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-simulation-intro" maxWidth="xl">
        <Block id="simulation-intro" padding="sm">
            <EditableParagraph id="para-simulation-intro" blockId="simulation-intro">
                Mathematical functions come alive when you can interact with their parameters directly. As you explore the simulations below, notice how changes in amplitude, frequency, and phase reshape familiar curves like <InlineFormula latex="y = A\sin(\omega x + \phi)" colorMap={{}} />.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-simulation-wave-h2" maxWidth="xl">
        <Block id="simulation-wave-h2" padding="sm">
            <EditableH4 id="h4-simulation-wave" blockId="simulation-wave-h2">
                Wave Superposition
            </EditableH4>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-simulation-wave" maxWidth="xl">
        <Block id="simulation-wave" padding="sm" hasVisualization>
            <SimulationPanel
                title="Controls"
                controlsPosition="right"
                controlsWidth="sm"
                height={300}
                controls={[
                    {
                        type: "slider",
                        varName: "waveAmplitude1",
                        label: waveAmp1.label,
                        min: waveAmp1.min,
                        max: waveAmp1.max,
                        step: waveAmp1.step,
                        unit: waveAmp1.unit,
                        color: waveAmp1.color,
                    },
                    {
                        type: "slider",
                        varName: "waveFrequency1",
                        label: waveFreq1.label,
                        min: waveFreq1.min,
                        max: waveFreq1.max,
                        step: waveFreq1.step,
                        unit: waveFreq1.unit,
                        color: waveFreq1.color,
                    },
                    {
                        type: "slider",
                        varName: "waveAmplitude2",
                        label: waveAmp2.label,
                        min: waveAmp2.min,
                        max: waveAmp2.max,
                        step: waveAmp2.step,
                        unit: waveAmp2.unit,
                        color: waveAmp2.color,
                    },
                    {
                        type: "slider",
                        varName: "waveFrequency2",
                        label: waveFreq2.label,
                        min: waveFreq2.min,
                        max: waveFreq2.max,
                        step: waveFreq2.step,
                        unit: waveFreq2.unit,
                        color: waveFreq2.color,
                    },
                    {
                        type: "toggle",
                        varName: "waveShowSum",
                        label: "Show Sum",
                    },
                    {
                        type: "button-group",
                        label: "Animation",
                        buttons: [
                            { type: "button", varName: "waveRunning", value: true, label: "Play", icon: "play" },
                            { type: "button", varName: "waveRunning", value: false, label: "Stop", icon: "pause" },
                        ],
                    },
                ]}
            >
                <WaveInterferenceViz />
            </SimulationPanel>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-simulation-trig-h2" maxWidth="xl">
        <Block id="simulation-trig-h2" padding="sm">
            <EditableH4 id="h4-simulation-trig" blockId="simulation-trig-h2">
                Trigonometric Transformations
            </EditableH4>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-simulation-trig" maxWidth="xl">
        <Block id="simulation-trig" padding="sm" hasVisualization>
            <SimulationPanel
                title="Controls"
                controlsPosition="right"
                controlsWidth="sm"
                height={300}
                controls={[
                    {
                        type: "slider",
                        varName: "trigAmplitude",
                        label: trigAmp.label,
                        min: trigAmp.min,
                        max: trigAmp.max,
                        step: trigAmp.step,
                        unit: trigAmp.unit,
                        color: trigAmp.color,
                    },
                    {
                        type: "slider",
                        varName: "trigFrequency",
                        label: trigFreq.label,
                        min: trigFreq.min,
                        max: trigFreq.max,
                        step: trigFreq.step,
                        unit: trigFreq.unit,
                        color: trigFreq.color,
                    },
                    {
                        type: "slider",
                        varName: "trigPhase",
                        label: trigPhase.label,
                        min: trigPhase.min,
                        max: trigPhase.max,
                        step: trigPhase.step,
                        unit: trigPhase.unit,
                        color: trigPhase.color,
                    },
                    {
                        type: "toggle",
                        varName: "trigShowReference",
                        label: "Show Reference",
                    },
                    {
                        type: "button-group",
                        label: "Animation",
                        buttons: [
                            { type: "button", varName: "trigRunning", value: true, label: "Play", icon: "play" },
                            { type: "button", varName: "trigRunning", value: false, label: "Stop", icon: "pause" },
                        ],
                    },
                ]}
            >
                <TrigTransformViz />
            </SimulationPanel>
        </Block>
    </StackLayout>,


];
