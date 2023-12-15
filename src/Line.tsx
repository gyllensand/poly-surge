import { useFrame } from "@react-three/fiber";
import { a, SpringValue } from "@react-spring/three";
import { useRef } from "react";
import { Mesh, Color } from "three";
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
  color,
  length,
}: {
  direction: Direction;
  index: number;
  length: SpringValue<number>;
  color: SpringValue<string>;
}) => {
  const groupRef = useRef<Mesh>(null);
  const initialLength = useRef(length.get());
  const initialHeight = useRef(getLength(length.get(), direction));
  const initialPosition = useRef(getPositionX(length.get(), direction));

  useFrame(() => {
    if (!groupRef.current) {
      return;
    }

    groupRef.current.position.set(
      getPositionX(length.get(), direction),
      index * density,
      0
    );

    groupRef.current.scale.set(
      1,
      getLength(length.get(), direction) /
        getLength(initialLength.current, direction),
      1
    );

    // @ts-ignore
    groupRef.current.material.color = new Color(color.get());
  });

  return (
    <a.mesh
      ref={groupRef}
      rotation={[Math.PI / 2, 0, Math.PI / 2]}
      position={[initialPosition.current, index * density, 0]}
    >
      <boxGeometry
        args={[lineDepth, initialHeight.current, 0.03, 1, 1]}
      />
      <meshBasicMaterial transparent />
    </a.mesh>
  );
};

export default Line;
