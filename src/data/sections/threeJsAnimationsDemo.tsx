import { ThreeCanvas, RotatingCube, PulsingSphere, GeometricCollection, AtomicStructure, ThreeCoordinateSystem } from "@/components/atoms";

export const threeJsAnimationsDemoSection = {
    id: "threejs-animations-demo",
    title: "Three.js 3D Visualizations",
    content: (
        <div className="space-y-12">
            <div className="prose dark:prose-invert max-w-none">
                <h1 className="text-4xl font-bold text-foreground">
                    Interactive 3D Visualizations
                </h1>
                <p className="text-lg text-muted-foreground">
                    Immersive 3D experiences to demonstrate complex spatial relationships and physics using Three.js and React Three Fiber.
                </p>
            </div>

            <div className="space-y-6">
                <h2 className="text-2xl font-semibold">Basic Geometries</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <h3 className="text-lg font-medium">Rotating Cube</h3>
                        <p className="text-sm text-muted-foreground">Interactive floating cube (hover to change color)</p>
                        <ThreeCanvas height={300}>
                            <RotatingCube size={1.5} color="#4F46E5" />
                        </ThreeCanvas>
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-lg font-medium">Pulsing Sphere</h3>
                        <p className="text-sm text-muted-foreground">Distorted mesh material simulating organic motion</p>
                        <ThreeCanvas height={300}>
                            <PulsingSphere color="#10B981" />
                        </ThreeCanvas>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                <h2 className="text-2xl font-semibold">3D Coordinate System</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <h3 className="text-lg font-medium">Standard Axes</h3>
                        <p className="text-sm text-muted-foreground">X (Red), Y (Green), and Z (Blue) axes with labels</p>
                        <ThreeCanvas height={300} cameraPosition={[5, 5, 5]}>
                            <ThreeCoordinateSystem size={4} showGrid={false} />
                        </ThreeCanvas>
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-lg font-medium">With Reference Grid</h3>
                        <p className="text-sm text-muted-foreground">Including an infinite grid for spatial reference</p>
                        <ThreeCanvas height={300} cameraPosition={[6, 4, 6]}>
                            <ThreeCoordinateSystem size={4} showGrid={true} gridSize={12} />
                        </ThreeCanvas>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                <h2 className="text-2xl font-semibold">Complex Scenes</h2>
                <div className="grid grid-cols-1 gap-6">
                    <div className="space-y-2">
                        <h3 className="text-lg font-medium">Atomic Structure Simulation</h3>
                        <p className="text-sm text-muted-foreground">Simulated electron orbits around a nucleus</p>
                        <ThreeCanvas height={400} cameraPosition={[0, 0, 8]} autoRotate>
                            <AtomicStructure />
                        </ThreeCanvas>
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-lg font-medium">Geometric Composition</h3>
                        <p className="text-sm text-muted-foreground">Collection of floating shapes with different materials</p>
                        <ThreeCanvas height={350}>
                            <GeometricCollection />
                        </ThreeCanvas>
                    </div>
                </div>
            </div>
        </div>
    ),
};
