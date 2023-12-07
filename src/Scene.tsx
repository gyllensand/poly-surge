import { Center, OrbitControls } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { RefObject, useCallback, useEffect } from "react";
import { createNoise2D } from "simplex-noise";
import {
  COLORS,
  DARK_BG_COLORS,
  Type,
  ColorMode,
  Direction,
  LIGHT_BG_COLORS,
  Theme,
  DARK_COLORS,
  LIGHT_COLORS,
} from "./constants";
import {
  pickRandom,
  pickRandomDecimalFromInterval,
  pickRandomIntFromInterval,
  pickRandomBoolean,
  getSizeByAspect,
  interpolateColors,
} from "./utils";
import Line from "./Line";
import { useSprings } from "@react-spring/three";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import { KernelSize } from "postprocessing";

export const rotation = pickRandom([0, Math.PI / 2]);
export const density = pickRandomDecimalFromInterval(0.1, 0.3, 2);
export const type = pickRandom([Type.BackToBack, Type.Facing, Type.Winding]);
export const colorMode = pickRandom([
  ColorMode.Plain,
  ColorMode.PlainDiff,
  ColorMode.Separated,
  ColorMode.Gradient,
  ColorMode.EveryOther,
]);
const colorTheme = pickRandom([
  Theme.Dark,
  Theme.Dark,
  Theme.Dark,
  Theme.Dark,
  Theme.Dark,
  Theme.Light,
]);
const clonedLineLengths = pickRandomBoolean();
const clonedLineCount = pickRandomBoolean();
const clonedSimplex = pickRandomBoolean();
const bgColor = pickRandom(
  colorTheme === Theme.Dark ? DARK_BG_COLORS : LIGHT_BG_COLORS
);

const getLeftGroupPos = () => {
  switch (type) {
    case Type.Facing:
      return -pickRandomDecimalFromInterval(10, 12);

    case Type.Winding:
      return pickRandomDecimalFromInterval(3, 6);

    default:
      return -pickRandomDecimalFromInterval(0.2, 2);
  }
};

const leftGroupPos = getLeftGroupPos();

export const leftLineCount = pickRandomIntFromInterval(40, 12 / density);
export const leftLineLength = pickRandomDecimalFromInterval(1, 4, 3);

export const rightLineCount = clonedLineCount
  ? leftLineCount
  : pickRandomIntFromInterval(40, 12 / density);
export const rightLineLength = clonedLineLengths
  ? leftLineLength
  : pickRandomDecimalFromInterval(1, 4, 3);

export const lineDepth = pickRandom([
  0.01,
  0.01,
  0.01,
  pickRandomDecimalFromInterval(0.01, 0.05),
]);

console.log("TYPE", Type[type]);
console.log("COLOR MODE", ColorMode[colorMode]);
console.log("LEFT GROUP POSITION", leftGroupPos);
console.log("CLONED LINE LENGTHS", clonedLineLengths);
console.log("CLONED LINE COUNT", clonedLineCount);

const primaryColor = pickRandom(
  colorTheme === Theme.Dark ? DARK_COLORS : LIGHT_COLORS
);
const secondaryColor = pickRandom(
  colorTheme === Theme.Dark ? DARK_COLORS : LIGHT_COLORS
);
const colorSeparator = pickRandomIntFromInterval(
  0,
  (leftLineCount + rightLineCount) / 2
);

const colorGradient = interpolateColors(
  primaryColor,
  secondaryColor,
  leftLineCount > rightLineCount ? leftLineCount : rightLineCount
);

const getColor = (
  index: number,
  direction: Direction,
  primColor: string,
  seconColor: string,
  gradient: string[]
) => {
  switch (colorMode) {
    case ColorMode.PlainDiff:
      if (direction === Direction.Left) {
        return primColor;
      } else {
        return seconColor;
      }

    case ColorMode.Separated:
      if (index < colorSeparator) {
        return primColor;
      } else {
        return seconColor;
      }

    case ColorMode.Gradient:
      return gradient[index];

    case ColorMode.EveryOther:
      if (index % 2 === 0) {
        return primColor;
      } else {
        return seconColor;
      }

    default:
      return primColor;
  }
};

const getLines = (
  direction: Direction,
  count: number,
  lineLength: number,
  simplex: (x: number, y: number) => number
) => {
  return new Array(count).fill(null).map((o, i) => {
    const index = i === 0 ? 0.5 : i;

    return {
      length:
        type === Type.BackToBack
          ? Math.abs(
              lineLength +
                3 * simplex(index / 20, 0) +
                0.2 * simplex(index / 10, 0) +
                0.1 * simplex(index / 8, 0)
            )
          : lineLength +
            3 * simplex(index / 20, 0) +
            0.2 * simplex(index / 10, 0) +
            0.1 * simplex(index / 8, 0),
      color: getColor(
        i,
        direction,
        primaryColor,
        secondaryColor,
        colorGradient
      ),
    };
  });
};

declare const $fx: any;

const leftSimplex = createNoise2D($fx.rand);
const leftLines = getLines(
  Direction.Left,
  leftLineCount,
  leftLineLength,
  leftSimplex
);

const rightSimplex = createNoise2D($fx.rand);
const rightLines = getLines(
  Direction.Right,
  rightLineCount,
  rightLineLength,
  clonedSimplex ? leftSimplex : rightSimplex
);

$fx.features({});

const Scene = ({ canvasRef }: { canvasRef: RefObject<HTMLCanvasElement> }) => {
  const { aspect } = useThree((state) => ({
    aspect: state.viewport.aspect,
  }));

  const [leftLineSprings, setLeftLineSprings] = useSprings(
    leftLineCount,
    (i) => ({
      lineLength: leftLines[i].length,
      color: leftLines[i].color,
    })
  );

  const [rightLineSprings, setRightLineSprings] = useSprings(
    rightLineCount,
    (i) => ({
      lineLength: rightLines[i].length,
      color: rightLines[i].color,
    })
  );

  const onPointerDown = useCallback(
    async (e: PointerEvent) => {
      const newLeftSimplex = createNoise2D();
      const newLeftLines = getLines(
        Direction.Left,
        leftLineCount,
        leftLineLength,
        newLeftSimplex
      );
      const newRightSimplex = createNoise2D();
      const newRightLines = getLines(
        Direction.Right,
        rightLineCount,
        rightLineLength,
        clonedLineLengths && clonedLineCount ? newLeftSimplex : newRightSimplex
      );

      const newPrimaryColor = pickRandom(
        colorTheme === Theme.Dark ? DARK_COLORS : LIGHT_COLORS,
        Math.random
      );
      const newSecondaryColor = pickRandom(
        colorTheme === Theme.Dark ? DARK_COLORS : LIGHT_COLORS,
        Math.random
      );
      const newColorGradient = interpolateColors(
        newPrimaryColor,
        newSecondaryColor,
        leftLineCount > rightLineCount ? leftLineCount : rightLineCount
      );

      const reversed = pickRandom([false, true], Math.random);

      setLeftLineSprings.start((i) => ({
        lineLength: newLeftLines[i].length,
        color: getColor(
          i,
          Direction.Left,
          newPrimaryColor,
          newSecondaryColor,
          newColorGradient
        ),
        delay: reversed ? leftLineCount * 10 - i * 10 : i * 10,
        config: { mass: 1, tension: 200, friction: 25 },
      }));
      setRightLineSprings.start((i) => ({
        lineLength: newRightLines[i].length,
        color: getColor(
          i,
          Direction.Right,
          newPrimaryColor,
          newSecondaryColor,
          newColorGradient
        ),
        delay: reversed ? rightLineCount * 10 - i * 10 : i * 10,
        config: { mass: 1, tension: 200, friction: 25 },
      }));
    },
    [setLeftLineSprings, setRightLineSprings]
  );

  const onPointerUp = useCallback(() => {}, []);

  useEffect(() => {
    const ref = canvasRef?.current;

    if (!ref) {
      return;
    }

    ref.addEventListener("pointerdown", onPointerDown);
    ref.addEventListener("pointerup", onPointerUp);

    return () => {
      ref.removeEventListener("pointerdown", onPointerDown);
      ref.removeEventListener("pointerup", onPointerUp);
    };
  }, [onPointerUp, onPointerDown, canvasRef]);

  return (
    <>
      <color attach="background" args={[bgColor]} />
      <OrbitControls enabled={true} />
      <ambientLight />
      <Center
        rotation={[0, 0, rotation]}
        scale={[
          getSizeByAspect(1, aspect),
          getSizeByAspect(1, aspect),
          getSizeByAspect(1, aspect),
        ]}
      >
        <group position={[leftGroupPos, 0, 0]}>
          {leftLines.map((o, i) => (
            <Line
              key={i}
              index={i}
              length={leftLineSprings[i].lineLength}
              color={leftLineSprings[i].color}
              direction={Direction.Left}
            />
          ))}
        </group>
        <group>
          {rightLines.map((o, i) => (
            <Line
              key={i}
              index={i}
              length={rightLineSprings[i].lineLength}
              color={rightLineSprings[i].color}
              direction={Direction.Right}
            />
          ))}
        </group>
      </Center>
      {/* <EffectComposer>
        <Bloom
          kernelSize={KernelSize.HUGE}
          luminanceThreshold={0}
          luminanceSmoothing={0.4}
          intensity={0.6}
        />
      </EffectComposer> */}
    </>
  );
};

export default Scene;
