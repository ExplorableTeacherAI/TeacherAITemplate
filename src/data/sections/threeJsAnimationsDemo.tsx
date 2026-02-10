import { ThreeCanvas, RotatingCube, PulsingSphere, GeometricCollection, AtomicStructure, ThreeCoordinateSystem } from "@/components/atoms";
import { FullWidthLayout, GridLayout, SplitLayout } from "@/components/layouts";
import { Block } from "@/components/templates";

export const threeJsAnimationsDemo = [
    // Header
    <FullWidthLayout key="threejs-header" maxWidth="xl">
        <Block id="threejs-header">
            <div className="prose dark:prose-invert max-w-none">
                <h1 className="text-4xl font-bold text-foreground">
                    Interactive 3D Visualizations
                </h1>
                <p className="text-lg text-muted-foreground">
                    Immersive 3D experiences to demonstrate complex spatial relationships and physics using Three.js and React Three Fiber.
                </p>
            </div>
        </Block>
    </FullWidthLayout>,

    // Basic Geometries Section
    <FullWidthLayout key="basic-geo-header" maxWidth="xl">
        <Block id="basic-geo-header">
            <h2 className="text-2xl font-semibold">Basic Geometries</h2>
        </Block>
    </FullWidthLayout>,

    <GridLayout key="basic-geo-grid" columns={2} gap="lg">
        <Block id="geo-cube">
            <div className="space-y-2">
                <h3 className="text-lg font-medium">Rotating Cube</h3>
                <p className="text-sm text-muted-foreground">Interactive floating cube (hover to change color)</p>
                <div className="rounded-lg overflow-hidden bg-background">
                    <ThreeCanvas height={300}>
                        <RotatingCube size={1.5} color="#4F46E5" />
                    </ThreeCanvas>
                </div>
            </div>
        </Block>
        <Block id="geo-sphere">
            <div className="space-y-2">
                <h3 className="text-lg font-medium">Pulsing Sphere</h3>
                <p className="text-sm text-muted-foreground">Distorted mesh material simulating organic motion</p>
                <div className="rounded-lg overflow-hidden bg-background">
                    <ThreeCanvas height={300}>
                        <PulsingSphere color="#10B981" />
                    </ThreeCanvas>
                </div>
            </div>
        </Block>
    </GridLayout>,

    // 3D Coordinate System Section
    <FullWidthLayout key="3d-coord-header" maxWidth="xl">
        <Block id="3d-coord-header">
            <h2 className="text-2xl font-semibold">3D Coordinate System</h2>
        </Block>
    </FullWidthLayout>,

    <GridLayout key="3d-coord-grid" columns={2} gap="lg">
        <Block id="coord-basic">
            <div className="space-y-2">
                <h3 className="text-lg font-medium">Standard Axes</h3>
                <p className="text-sm text-muted-foreground">X (Red), Y (Green), and Z (Blue) axes with labels</p>
                <div className="rounded-lg overflow-hidden bg-background">
                    <ThreeCanvas height={300} cameraPosition={[5, 5, 5]}>
                        <ThreeCoordinateSystem size={4} showGrid={false} />
                    </ThreeCanvas>
                </div>
            </div>
        </Block>
        <Block id="coord-grid">
            <div className="space-y-2">
                <h3 className="text-lg font-medium">With Reference Grid</h3>
                <p className="text-sm text-muted-foreground">Including an infinite grid for spatial reference</p>
                <div className="rounded-lg overflow-hidden bg-background">
                    <ThreeCanvas height={300} cameraPosition={[6, 4, 6]}>
                        <ThreeCoordinateSystem size={4} showGrid={true} gridSize={12} />
                    </ThreeCanvas>
                </div>
            </div>
        </Block>
    </GridLayout>,

    // Complex Scenes Section
    <FullWidthLayout key="complex-scenes-header" maxWidth="xl">
        <Block id="complex-scenes-header">
            <h2 className="text-2xl font-semibold">Complex Scenes</h2>
        </Block>
    </FullWidthLayout>,

    <SplitLayout key="complex-scenes-split" ratio="1:1" gap="lg">
        <Block id="scene-atomic">
            <div className="space-y-2">
                <h3 className="text-lg font-medium">Atomic Structure Simulation</h3>
                <p className="text-sm text-muted-foreground">Simulated electron orbits around a nucleus</p>
                <div className="rounded-lg overflow-hidden bg-background">
                    <ThreeCanvas height={400} cameraPosition={[0, 0, 8]} autoRotate>
                        <AtomicStructure />
                    </ThreeCanvas>
                </div>
            </div>
        </Block>
        <Block id="scene-geometric">
            <div className="space-y-2">
                <h3 className="text-lg font-medium">Geometric Composition</h3>
                <p className="text-sm text-muted-foreground">Collection of floating shapes with different materials</p>
                <div className="rounded-lg overflow-hidden bg-background">
                    <ThreeCanvas height={400}>
                        <GeometricCollection />
                    </ThreeCanvas>
                </div>
            </div>
        </Block>
    </SplitLayout>
];

