import React, { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Sphere, Box, Torus, Icosahedron } from '@react-three/drei';
import * as THREE from 'three';

export const RotatingCube = ({ color = "#4F46E5", size = 1, speed = 1 }: { color?: string, size?: number, speed?: number }) => {
    const meshRef = useRef<THREE.Mesh>(null!);
    const [hovered, setHover] = useState(false);

    useFrame((state, delta) => {
        meshRef.current.rotation.x += delta * speed;
        meshRef.current.rotation.y += delta * speed * 0.5;
    });

    return (
        <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
            <mesh
                ref={meshRef}
                onPointerOver={() => setHover(true)}
                onPointerOut={() => setHover(false)}>
                <boxGeometry args={[size, size, size]} />
                <meshStandardMaterial color={hovered ? "#EC4899" : color} roughness={0.3} metalness={0.8} />
            </mesh>
        </Float>
    );
};

export const PulsingSphere = ({ color = "#10B981" }: { color?: string }) => {
    const [hovered, setHover] = useState(false);

    return (
        <Sphere args={[1, 32, 32]} scale={1.5} onPointerOver={() => setHover(true)} onPointerOut={() => setHover(false)}>
            <MeshDistortMaterial
                color={hovered ? "#3B82F6" : color}
                speed={2}
                distort={0.4}
                radius={1}
            />
        </Sphere>
    );
};

export const GeometricCollection = () => {
    return (
        <group>
            <Float position={[-2, 0, 0]} speed={1.5} rotationIntensity={1} floatIntensity={1}>
                <Icosahedron args={[0.8]} material-color="#F59E0B">
                    <meshStandardMaterial color="#F59E0B" wireframe />
                </Icosahedron>
            </Float>
            <Float position={[0, 0, 0]} speed={2} rotationIntensity={1.5} floatIntensity={1.5}>
                <Torus args={[0.6, 0.2, 16, 32]} material-color="#8B5CF6">
                    <meshStandardMaterial color="#8B5CF6" />
                </Torus>
            </Float>
            <Float position={[2, 0, 0]} speed={1} rotationIntensity={0.5} floatIntensity={1}>
                <Box args={[1, 1, 1]} material-color="#EC4899">
                    <meshStandardMaterial color="#EC4899" />
                </Box>
            </Float>
        </group>
    )
}

export const AtomicStructure = () => {
    const electrons = useMemo(() => Array.from({ length: 5 }).map((_, i) => ({
        speed: 1 + Math.random(),
        offset: Math.random() * Math.PI * 2,
        radius: 1.5 + Math.random() * 0.5,
        axis: new THREE.Vector3(Math.random(), Math.random(), Math.random()).normalize()
    })), []);

    return (
        <group>
            {/* Nucleus */}
            <Sphere args={[0.4, 32, 32]}>
                <meshStandardMaterial color="#EF4444" roughness={0.2} metalness={0.8} />
            </Sphere>
            <Sphere args={[0.4, 32, 32]} position={[0.3, 0.2, 0]}>
                <meshStandardMaterial color="#3B82F6" roughness={0.2} metalness={0.8} />
            </Sphere>
            <Sphere args={[0.4, 32, 32]} position={[-0.2, -0.3, 0.1]}>
                <meshStandardMaterial color="#F59E0B" roughness={0.2} metalness={0.8} />
            </Sphere>

            {/* Electrons */}
            {electrons.map((electron, i) => (
                <Electron key={i} {...electron} />
            ))}
        </group>
    );
};

const Electron = ({ speed, offset, radius, axis }: any) => {
    const ref = useRef<THREE.Mesh>(null!);
    useFrame(({ clock }) => {
        const t = clock.getElapsedTime() * speed + offset;
        ref.current.position.set(
            Math.cos(t) * radius,
            Math.sin(t) * radius * 0.5,
            Math.sin(t) * radius
        ).applyAxisAngle(axis, t * 0.2);
    });

    return (
        <Sphere ref={ref} args={[0.1, 16, 16]}>
            <meshBasicMaterial color="#06B6D4" />
            <pointLight intensity={1} distance={2} color="#06B6D4" />
        </Sphere>
    );
};
