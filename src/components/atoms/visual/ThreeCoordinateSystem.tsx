import React from 'react';
import { Text, Grid } from '@react-three/drei';
import { Cylinder, Cone } from '@react-three/drei';

interface ThreeCoordinateSystemProps {
    size?: number;
    axisRadius?: number;
    showGrid?: boolean;
    showLabels?: boolean;
    gridSize?: number;
}

export const ThreeCoordinateSystem: React.FC<ThreeCoordinateSystemProps> = ({
    size = 5,
    axisRadius = 0.05,
    showGrid = true,
    showLabels = true,
    gridSize = 10
}) => {
    const arrowHeight = size * 0.1;
    const cylinderHeight = size - arrowHeight;
    const cylinderOffset = cylinderHeight / 2;
    const arrowOffset = cylinderHeight + arrowHeight / 2;

    // Axis Colors
    const xColor = "#EF4444"; // Red
    const yColor = "#10B981"; // Green (using emerald for better visibility)
    const zColor = "#3B82F6"; // Blue

    return (
        <group>
            {/* Grid */}
            {showGrid && (
                <Grid
                    position={[0, -0.01, 0]}
                    args={[gridSize, gridSize]}
                    cellSize={1}
                    sectionSize={5}
                    sectionColor="#9ca3af"
                    cellColor="#e5e7eb"
                    fadeDistance={20}
                    infiniteGrid
                />
            )}

            {/* X Axis - Red */}
            <group rotation={[0, 0, -Math.PI / 2]} position={[cylinderOffset, 0, 0]}>
                <Cylinder args={[axisRadius, axisRadius, cylinderHeight, 16]}>
                    <meshStandardMaterial color={xColor} />
                </Cylinder>
            </group>
            <group rotation={[0, 0, -Math.PI / 2]} position={[arrowOffset, 0, 0]}>
                <Cone args={[axisRadius * 2.5, arrowHeight, 16]}>
                    <meshStandardMaterial color={xColor} />
                </Cone>
            </group>
            {showLabels && (
                <Text
                    position={[size + 0.5, 0, 0]}
                    fontSize={0.5}
                    color={xColor}
                    anchorX="center"
                    anchorY="middle"
                >
                    X
                </Text>
            )}

            {/* Y Axis - Green */}
            <group position={[0, cylinderOffset, 0]}>
                <Cylinder args={[axisRadius, axisRadius, cylinderHeight, 16]}>
                    <meshStandardMaterial color={yColor} />
                </Cylinder>
            </group>
            <group position={[0, arrowOffset, 0]}>
                <Cone args={[axisRadius * 2.5, arrowHeight, 16]}>
                    <meshStandardMaterial color={yColor} />
                </Cone>
            </group>
            {showLabels && (
                <Text
                    position={[0, size + 0.5, 0]}
                    fontSize={0.5}
                    color={yColor}
                    anchorX="center"
                    anchorY="middle"
                >
                    Y
                </Text>
            )}

            {/* Z Axis - Blue */}
            <group rotation={[Math.PI / 2, 0, 0]} position={[0, 0, cylinderOffset]}>
                <Cylinder args={[axisRadius, axisRadius, cylinderHeight, 16]}>
                    <meshStandardMaterial color={zColor} />
                </Cylinder>
            </group>
            <group rotation={[Math.PI / 2, 0, 0]} position={[0, 0, arrowOffset]}>
                <Cone args={[axisRadius * 2.5, arrowHeight, 16]}>
                    <meshStandardMaterial color={zColor} />
                </Cone>
            </group>
            {showLabels && (
                <Text
                    position={[0, 0, size + 0.5]}
                    fontSize={0.5}
                    color={zColor}
                    anchorX="center"
                    anchorY="middle"
                >
                    Z
                </Text>
            )}

            {/* Origin Sphere */}
            <mesh>
                <sphereGeometry args={[axisRadius * 2, 16, 16]} />
                <meshStandardMaterial color="#6B7280" />
            </mesh>
        </group>
    );
};
