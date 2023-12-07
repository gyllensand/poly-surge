import { useFrame } from "@react-three/fiber";
import { SpringValue } from "@react-spring/three";
import { useRef } from "react";
import { Mesh } from "three";
import { density, leftLineLength, lineDepth, type } from "./Scene";
import { Direction, Type } from "./constants";

const getPositionX = (length: number, direction: Direction) => {
  switch (type) {
    case Type.BackToBack:
      return direction === Direction.Left ? -(length / 2) : length / 2;

    case Type.Winding:
      return direction === Direction.Left ? length / 2 : length / 2;

    default:
      return direction === Direction.Left ? length / 2 : -(length / 2);
  }
};

const getLength = (length: number, direction: Direction) => {
  switch (type) {
    case Type.Winding:
      return direction === Direction.Left ? leftLineLength - length : length;

    default:
      return length;
  }
};

const Line = ({
  index,
  direction,
  data,
  height,
  length,
}: {
  direction: Direction;
  index: number;
  length: SpringValue<number>;
  height: number;
  data: {
    length: number;
    color: string;
  };
}) => {
  const groupRef = useRef<Mesh>(null);
  const initialLength = useRef(length.get());

  useFrame(() => {
    groupRef.current!.position.set(
      getPositionX(length.get(), direction),
      index * density,
      0
    );

    groupRef.current!.scale.set(
      1,
      getLength(length.get(), direction) /
        getLength(initialLength.current, direction),
      1
    );
  });

  return (
    <mesh
      ref={groupRef}
      rotation={[Math.PI / 2, 0, Math.PI / 2]}
      position={[getPositionX(length.get(), direction), index * density, 0]}
    >
      <boxGeometry
        args={[lineDepth, getLength(length.get(), direction), 0.03, 1, 1]}
      />
      <meshBasicMaterial color={data.color} transparent />
    </mesh>
  );
};

export default Line;
