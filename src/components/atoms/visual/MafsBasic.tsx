import { Mafs, Coordinates, Plot } from "mafs";

export function MafsBasic() {
    return (
        <div
            className="w-full overflow-hidden rounded-xl"
        >
            <Mafs height={400} viewBox={{ x: [-5, 5], y: [-5, 5] }}>
                <Coordinates.Cartesian />
                <Plot.OfX y={(x) => Math.sin(x)} color="#3b82f6" weight={3} />
            </Mafs>
        </div>
    );
}
