export type CubeName =
  | "Roccia"
  | "Brant"
  | "Cantarella"
  | "Zani"
  | "Cartethyia"
  | "Phoebe";

export type GameData = {
  [cube in CubeName]: {
    [key: string]: number;
    extraSteps: number;
  };
};

export interface Pad {
  stack: Cube[];
  position: number;
}

interface CubeMethod {
  (cubes: Cube[], pads: Pad[], gameData: GameData): void;
}

interface CubeConfig {
  name: CubeName;
  gameStart?: CubeMethod;
  roundStart?: CubeMethod;
  getExtraStepsBeforeMove?: (
    cubes: Cube[],
    pads: Pad[],
    gameData: GameData,
  ) => number;
  roundEnd?: CubeMethod;
  onPassedBy?: (targetPad: Pad, currentPad: Pad, gameData: GameData) => void;
  afterMove?: CubeMethod;
  roll?: () => number;
}

export default class Cube implements CubeConfig {
  name: CubeName;
  gameStart?: CubeMethod;
  roundStart?: CubeMethod;
  getExtraStepsBeforeMove?: (
    cubes: Cube[],
    pads: Pad[],
    gameData: GameData,
  ) => number;
  roundEnd?: CubeMethod;
  onPassedBy?: (targetPad: Pad, currentPad: Pad, gameData: GameData) => void;
  afterMove?: CubeMethod;
  roll?: () => number;

  constructor(config: CubeConfig) {
    this.name = config.name;
    Object.assign(this, config);
  }
}
