import { Suspense, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import Scene from "./Scene";
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

export const PLUCKS: Sample[] = [
  {
    index: 0,
    sampler: new Sampler({
      urls: {
        1: `pluck-d7.mp3`,
      },
      baseUrl,
    }),
  },
  {
    index: 1,
    sampler: new Sampler({
      urls: {
        1: `pluck-a7.mp3`,
      },
      baseUrl,
    }),
  },
  {
    index: 2,
    sampler: new Sampler({
      urls: {
        1: `pluck-b7.mp3`,
      },
      baseUrl,
    }),
  },
  {
    index: 3,
    sampler: new Sampler({
      urls: {
        1: `pluck-cs8.mp3`,
      },
      baseUrl,
    }),
  },
  {
    index: 4,
    sampler: new Sampler({
      urls: {
        1: `pluck-d8.mp3`,
      },
      baseUrl,
    }),
  },
  {
    index: 5,
    sampler: new Sampler({
      urls: {
        1: `pluck-e7.mp3`,
      },
      baseUrl,
    }),
  },
  {
    index: 6,
    sampler: new Sampler({
      urls: {
        1: `pluck-fs7.mp3`,
      },
      baseUrl,
    }),
  },
  {
    index: 7,
    sampler: new Sampler({
      urls: {
        1: `pluck-g7.mp3`,
      },
      baseUrl,
    }),
  },
];

export const MELODY: Sample[] = [
  {
    index: 0,
    sampler: new Sampler({
      urls: {
        1: `melody-11.mp3`,
      },
      baseUrl,
    }),
  },
  {
    index: 1,
    sampler: new Sampler({
      urls: {
        1: `melody-12.mp3`,
      },
      baseUrl,
    }),
  },
  {
    index: 2,
    sampler: new Sampler({
      urls: {
        1: `melody-13.mp3`,
      },
      baseUrl,
    }),
  },
  {
    index: 3,
    sampler: new Sampler({
      urls: {
        1: `melody-14.mp3`,
      },
      baseUrl,
    }),
  },
  {
    index: 4,
    sampler: new Sampler({
      urls: {
        1: `melody-21.mp3`,
      },
      baseUrl,
    }),
  },
  {
    index: 5,
    sampler: new Sampler({
      urls: {
        1: `melody-22.mp3`,
      },
      baseUrl,
    }),
  },
  {
    index: 6,
    sampler: new Sampler({
      urls: {
        1: `melody-23.mp3`,
      },
      baseUrl,
    }),
  },
  {
    index: 7,
    sampler: new Sampler({
      urls: {
        1: `melody-24.mp3`,
      },
      baseUrl,
    }),
  },
  {
    index: 8,
    sampler: new Sampler({
      urls: {
        1: `melody-31.mp3`,
      },
      baseUrl,
    }),
  },
  {
    index: 9,
    sampler: new Sampler({
      urls: {
        1: `melody-32.mp3`,
      },
      baseUrl,
    }),
  },
  {
    index: 10,
    sampler: new Sampler({
      urls: {
        1: `melody-33.mp3`,
      },
      baseUrl,
    }),
  },
  {
    index: 11,
    sampler: new Sampler({
      urls: {
        1: `melody-34.mp3`,
      },
      baseUrl,
    }),
  },
  {
    index: 12,
    sampler: new Sampler({
      urls: {
        1: `melody-41.mp3`,
      },
      baseUrl,
    }),
  },
  {
    index: 13,
    sampler: new Sampler({
      urls: {
        1: `melody-42.mp3`,
      },
      baseUrl,
    }),
  },
  {
    index: 14,
    sampler: new Sampler({
      urls: {
        1: `melody-43.mp3`,
      },
      baseUrl,
    }),
  },
  {
    index: 15,
    sampler: new Sampler({
      urls: {
        1: `melody-44.mp3`,
      },
      baseUrl,
    }),
  },
];

export const BASS: Sample[] = [
  {
    index: 0,
    sampler: new Sampler({
      urls: {
        1: `bass-11.mp3`,
      },
      baseUrl,
    }),
  },
  {
    index: 1,
    sampler: new Sampler({
      urls: {
        1: `bass-12.mp3`,
      },
      baseUrl,
    }),
  },
  {
    index: 2,
    sampler: new Sampler({
      urls: {
        1: `bass-13.mp3`,
      },
      baseUrl,
    }),
  },
  {
    index: 3,
    sampler: new Sampler({
      urls: {
        1: `bass-14.mp3`,
      },
      baseUrl,
    }),
  },
  {
    index: 4,
    sampler: new Sampler({
      urls: {
        1: `bass-21.mp3`,
      },
      baseUrl,
    }),
  },
  {
    index: 5,
    sampler: new Sampler({
      urls: {
        1: `bass-22.mp3`,
      },
      baseUrl,
    }),
  },
  {
    index: 6,
    sampler: new Sampler({
      urls: {
        1: `bass-23.mp3`,
      },
      baseUrl,
    }),
  },
  {
    index: 7,
    sampler: new Sampler({
      urls: {
        1: `bass-24.mp3`,
      },
      baseUrl,
    }),
  },
  {
    index: 8,
    sampler: new Sampler({
      urls: {
        1: `bass-31.mp3`,
      },
      baseUrl,
    }),
  },
  {
    index: 9,
    sampler: new Sampler({
      urls: {
        1: `bass-32.mp3`,
      },
      baseUrl,
    }),
  },
  {
    index: 10,
    sampler: new Sampler({
      urls: {
        1: `bass-33.mp3`,
      },
      baseUrl,
    }),
  },
  {
    index: 11,
    sampler: new Sampler({
      urls: {
        1: `bass-34.mp3`,
      },
      baseUrl,
    }),
  },
  {
    index: 12,
    sampler: new Sampler({
      urls: {
        1: `bass-41.mp3`,
      },
      baseUrl,
    }),
  },
  {
    index: 13,
    sampler: new Sampler({
      urls: {
        1: `bass-42.mp3`,
      },
      baseUrl,
    }),
  },
  {
    index: 14,
    sampler: new Sampler({
      urls: {
        1: `bass-43.mp3`,
      },
      baseUrl,
    }),
  },
  {
    index: 15,
    sampler: new Sampler({
      urls: {
        1: `bass-44.mp3`,
      },
      baseUrl,
    }),
  },
];

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
