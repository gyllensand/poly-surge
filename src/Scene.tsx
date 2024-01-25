import { Center, OrbitControls } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import {
  MutableRefObject,
  RefObject,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { createNoise2D } from "simplex-noise";
import {
  DARK_BG_COLORS,
  Type,
  ColorMode,
  Direction,
  LIGHT_BG_COLORS,
  Theme,
  DARK_COLORS,
  LIGHT_COLORS,
  SCALES,
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
import { start } from "tone";
import { BASS, MELODY, PLUCKS, Sample } from "./App";
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

const longestLine =
  leftLineCount >= rightLineCount
    ? { direction: Direction.Left, count: leftLineCount }
    : { direction: Direction.Right, count: rightLineCount };

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
  longestLine.count
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
  simplex: (x: number, y: number) => number,
  rndFunction = $fx.rand
) => {
  const defaultLength = pickRandom(
    [...new Array(9).fill(null).map(() => true), false],
    rndFunction
  );

  return new Array(count).fill(null).map((o, i) => {
    const index = i === 0 ? 0.5 : i;

    const simplexLength =
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
          0.1 * simplex(index / 8, 0);

    return {
      length: defaultLength
        ? simplexLength
        : pickRandomDecimalFromInterval(1, 4, 3, rndFunction),
      opacity: Math.abs(
        0.9091 * simplex(index / 20, 0) +
          0.0606 * simplex(index / 10, 0) +
          0.0303 * simplex(index / 8, 0)
      ),
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

$fx.features({
  type,
  colorMode,
  primaryColor,
  secondaryColor,
  bgColor,
});

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

const dummyAudioArray = new Array(longestLine.count)
  .fill(null)
  .map(() => ({ value: Math.random() }));

$fx.features({});

const Scene = ({ canvasRef }: { canvasRef: RefObject<HTMLCanvasElement> }) => {
  const { aspect } = useThree((state) => ({
    aspect: state.viewport.aspect,
  }));

  const toneInitialized = useRef(false);
  const lastPlayedScale = useRef<number>();

  const [leftLineSprings, setLeftLineSprings] = useSprings(
    leftLineCount,
    (i) => ({
      lineLength: leftLines[i].length,
      color: leftLines[i].color,
      opacity: leftLines[i].opacity,
    })
  );

  const [rightLineSprings, setRightLineSprings] = useSprings(
    rightLineCount,
    (i) => ({
      lineLength: rightLines[i].length,
      color: rightLines[i].color,
      opacity: rightLines[i].opacity,
    })
  );

  // eslint-disable-next-line
  const [audioSprings, setAudioSprings] = useSprings(
    dummyAudioArray.length,
    (i) => ({ value: dummyAudioArray[i].value })
  );

  useEffect(() => {
    PLUCKS.forEach((hit) => {
      hit.sampler.toDestination();
    });
    MELODY.forEach((hit) => {
      hit.sampler.toDestination();
    });
    BASS.forEach((hit) => {
      hit.sampler.toDestination();
    });
  }, []);

  const currentLinePluckIndex = useRef(0);
  const currentScalePluckIndex = useRef(0);
  const currentLineMelodyIndex = useRef(0);
  const currentScaleMelodyIndex = useRef(0);
  const currentLineBassIndex = useRef(0);
  const currentScaleBassIndex = useRef(0);

  const triggerHits = useCallback(
    (
      currentLineIndex: MutableRefObject<number>,
      currentScaleIndex: MutableRefObject<number>,
      audioArray: Sample[],
      currentScale: {
        index: number;
        bass: number[];
        sequence: number[];
      },
      stepFreq: number
    ) => {
      currentLineIndex.current++;

      if (
        currentLineIndex.current % stepFreq !== 0 &&
        currentLineIndex.current !== 1
      ) {
        return;
      }

      if (currentScaleIndex.current > currentScale.sequence.length - 1) {
        currentScaleIndex.current = 1;
      }

      audioArray[
        currentScale.sequence[currentScaleIndex.current]
      ].sampler.triggerAttack("C#-1");

      currentScaleIndex.current++;
    },
    []
  );

  const triggerClick = useCallback(() => {
    const newLeftSimplex = createNoise2D();
    const newLeftLines = getLines(
      Direction.Left,
      leftLineCount,
      leftLineLength,
      newLeftSimplex,
      Math.random
    );
    const newRightSimplex = createNoise2D();
    const newRightLines = getLines(
      Direction.Right,
      rightLineCount,
      rightLineLength,
      clonedLineLengths && clonedLineCount ? newLeftSimplex : newRightSimplex,
      Math.random
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
      longestLine.count
    );

    const reversed = pickRandom([false, true], Math.random);

    setLeftLineSprings.start((i) => ({
      lineLength: newLeftLines[i].length,
      opacity: newLeftLines[i].opacity,
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
      opacity: newRightLines[i].opacity,
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

    const availableScales = SCALES.filter(
      ({ index }) => index !== lastPlayedScale.current
    );
    const currentScale = pickRandom(availableScales, Math.random);
    lastPlayedScale.current = currentScale.index;

    currentLinePluckIndex.current = 0;
    currentScalePluckIndex.current = 0;
    currentLineMelodyIndex.current = 0;
    currentScaleMelodyIndex.current = 0;
    currentLineBassIndex.current = 0;
    currentScaleBassIndex.current = 0;

    const triggerMelody = pickRandom([true, false], Math.random);
    const triggerBass = pickRandom([true, false], Math.random);

    setAudioSprings.stop().start((i) => ({
      value: Math.random(),
      delay: reversed ? longestLine.count * 10 - i * 10 : i * 10,
      config: { mass: 1, tension: 200, friction: 25 },
      onStart: () => {
        triggerHits(
          currentLinePluckIndex,
          currentScalePluckIndex,
          PLUCKS,
          currentScale,
          10
        );

        if (triggerMelody) {
          triggerHits(
            currentLineMelodyIndex,
            currentScaleMelodyIndex,
            MELODY,
            { ...currentScale, sequence: currentScale.melody },
            40
          );
        }

        if (triggerBass) {
          triggerHits(
            currentLineBassIndex,
            currentScaleBassIndex,
            BASS,
            { ...currentScale, sequence: currentScale.bass },
            40
          );
        }
      },
    }));
  }, [setLeftLineSprings, setRightLineSprings, setAudioSprings, triggerHits]);

  const onPointerDown = useCallback(
    async (e: PointerEvent) => {
      e.preventDefault();

      if (!toneInitialized.current) {
        await start();
        toneInitialized.current = true;
        setTimeout(() => {
          triggerClick();
        }, 100);
        return;
      }

      triggerClick();
    },
    [triggerClick]
  );

  useEffect(() => {
    const ref = canvasRef?.current;

    if (!ref) {
      return;
    }

    ref.addEventListener("pointerdown", onPointerDown);

    return () => {
      ref.removeEventListener("pointerdown", onPointerDown);
    };
  }, [onPointerDown, canvasRef]);

  return (
    <>
      <color attach="background" args={[bgColor]} />
      <OrbitControls enabled={false} />
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
              {...leftLineSprings[i]}
              direction={Direction.Left}
            />
          ))}
        </group>
        <group>
          {rightLines.map((o, i) => (
            <Line
              key={i}
              index={i}
              {...rightLineSprings[i]}
              direction={Direction.Right}
            />
          ))}
        </group>
      </Center>
      <EffectComposer>
        <Bloom
          kernelSize={KernelSize.MEDIUM}
          luminanceThreshold={0}
          luminanceSmoothing={0.5}
          intensity={0.5}
        />
      </EffectComposer>
    </>
  );
};

export default Scene;
