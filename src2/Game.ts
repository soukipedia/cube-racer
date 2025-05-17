import Cube, { GameData, Pad } from "./Cube";

interface GameConfig {
  cubes: Cube[];
  length: number;
  startPads?: Pad[];
}

function shuffleArray<T>(array: T[]): T[] {
  const result = array.slice(); // create a shallow copy
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function rollDice() {
  return Math.floor(Math.random() * 3) + 1; // 1 to 3
}

export default class Game implements GameConfig {
  cubes: Cube[];
  length: number;
  pads: Pad[];
  data: GameData = {
    Roccia: { extraSteps: 0 },
    Brant: { extraSteps: 0 },
    Cantarella: { extraSteps: 0 },
    Zani: { extraSteps: 0 },
    Cartethyia: { extraSteps: 0 },
    Phoebe: { extraSteps: 0 },
  };
  isEnded: boolean = false;
  log: any;
  round = 0;

  constructor(config: GameConfig) {
    // Object.assign(this, config);
    this.length = config.length;
    this.cubes = [...config.cubes];
    this.pads = [...(config.startPads ?? [])];
  }

  start() {
    this.cubes.forEach((cube) => {
      cube.gameStart && cube.gameStart(this.cubes, this.pads, this.data);
    });

    while (!this.isEnded) {
      this.nextRound();
      this.logPads();
    }

    console.log("Game End!!!");
    console.log("data", this.data);
  }

  logPads() {
    console.log(
      `Pads`,
      this.pads.map((pad) => ({
        position: pad.position,
        stack: pad.stack.map((cube) => cube.name),
      })),
    );
  }

  logOrders(order: Cube[]) {
    console.log(`Orders [${order.map((c) => c.name).join(" > ")}]`);
  }

  logDices(diceRolls: { [key: string]: number }) {
    console.log(`Rolls`, diceRolls);
  }

  getPadAtPosition(position: number): Pad {
    let pad = this.pads.find((pad) => pad.position === position);
    if (!pad) {
      pad = { position, stack: [] };
      this.pads.push(pad);
    }
    return pad;
  }

  move(cube: Cube, startPad: Pad, endPad: Pad) {
    const cubeIndex = startPad.stack.findIndex((c) => c === cube);
    if (cubeIndex < 0) {
      throw "Start pad doesn't contain the cube need to be moved";
    }

    const movedCubes = startPad.stack.splice(cubeIndex);
    endPad.stack = [...endPad.stack, ...movedCubes];

    // Pass by
    this.pads.forEach((pad) => {
      if (startPad.position < pad.position && endPad.position > pad.position) {
        pad.stack.forEach((cube) => {
          cube.onPassedBy && cube.onPassedBy(endPad, pad, this.data);
        });
      }
    });

    console.log(
      `${movedCubes.map((c) => c.name).join(", ")} moved from pad[${
        startPad.position
      }] to pad[${endPad.position}]`,
    );
  }

  nextRound() {
    this.round += 1;
    console.log(`>>> Start round ${this.round}`);

    const turnOrders: Cube[] = shuffleArray(this.cubes);
    this.logOrders(turnOrders);

    // Roll dice
    const diceRolls: { [key: string]: number } = {};
    for (const cube of this.cubes) {
      diceRolls[cube.name] = (cube.roll ?? rollDice)();
    }
    this.logDices(diceRolls);

    this.cubes.forEach((cube) => {
      cube.roundStart && cube.roundStart(turnOrders, this.pads, this.data);
    });

    turnOrders.forEach((cube) => {
      console.log(`> ${cube.name}'s Turn`);
      const diceValue = diceRolls[cube.name];
      let currentPad = this.pads.find((pad) => pad.stack.includes(cube));
      if (!currentPad) {
        currentPad = {
          position: 0,
          stack: turnOrders.toReversed(),
        };
        this.pads = [currentPad];
      }

      const extraSteps = cube.getExtraStepsBeforeMove
        ? cube.getExtraStepsBeforeMove(turnOrders, this.pads, this.data)
        : 0;

      const totalSteps = diceValue + extraSteps;
      const nextPosition = currentPad.position + totalSteps;

      const nextPad = this.getPadAtPosition(nextPosition);
      this.move(cube, currentPad, nextPad);
      cube.afterMove && cube.afterMove(turnOrders, this.pads, this.data);
    });

    this.cubes.forEach((cube) => {
      cube.roundEnd && cube.roundEnd(turnOrders, this.pads, this.data);
    });

    this.pads = this.pads.filter((pad) => pad.stack.length);

    this.isEnded = this.pads.some((pad) => pad.position >= this.length);
  }
}
