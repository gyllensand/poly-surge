import { Suspense, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import Scene, { density } from "./Scene";
import { Sampler } from "tone";

console.log(
  "%c * Computer Emotions * ",
  "color: #d80fe7; font-size: 14px; background-color: #000000;"
);

console.log(
  "%c http://www.computeremotions.com ",
  "font-size: 12px; background-color: #000000;"
);

const baseUrl = `${process.env.PUBLIC_URL}/audio/`;

export interface Sample {
  index: number;
  sampler: Sampler;
}

const App = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  return (
    <Canvas
      ref={canvasRef}
      camera={{ position: [0, 0, 15], fov: 50 }}
      // camera={{ position: [0, 0, density * 150], fov: 50 }}
      dpr={window.devicePixelRatio}
    >
      <Suspense fallback={null}>
        <Scene canvasRef={canvasRef} />
      </Suspense>
    </Canvas>
  );
};

export default App;
