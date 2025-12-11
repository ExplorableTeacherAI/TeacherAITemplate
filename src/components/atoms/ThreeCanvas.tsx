import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera, ContactShadows } from '@react-three/drei';

interface ThreeCanvasProps {
    children: React.ReactNode;
    height?: number | string;
    className?: string;
    cameraPosition?: [number, number, number];
    showControls?: boolean;
    shadows?: boolean;
    autoRotate?: boolean;
}

export const ThreeCanvas: React.FC<ThreeCanvasProps> = ({
    children,
    height = 400,
    className = "",
    cameraPosition = [0, 0, 5],
    showControls = true,
    shadows = true,
    autoRotate = false
}) => {
    return (
        <div style={{ height, width: '100%', borderRadius: '0.5rem', overflow: 'hidden' }} className={className}>
            <Canvas shadows dpr={[1, 2]}>
                <PerspectiveCamera makeDefault position={cameraPosition} fov={50} />
                <Suspense fallback={null}>
                    <ambientLight intensity={0.5} />
                    <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} shadow-mapSize={[512, 512]} castShadow />
                    {children}
                    <Environment preset="city" />
                    {shadows && (
                        <ContactShadows
                            rotation-x={Math.PI / 2}
                            position={[0, -1.5, 0]}
                            opacity={0.4}
                            width={10}
                            height={10}
                            blur={1.5}
                            far={0.8}
                        />
                    )}
                </Suspense>
                {showControls && <OrbitControls autoRotate={autoRotate} makeDefault />}
            </Canvas>
        </div>
    );
};
