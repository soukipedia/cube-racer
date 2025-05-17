import Cube, { CubeName, GameData, Pad } from "./Cube";
import Game from "./Game";

function chance(probability: number) {
  return Math.random() < probability;
}

function getAllCubeScores(pads: Pad[]): { [cube in CubeName]: number } {
  const result = {
    Roccia: 0,
    Brant: 0,
    Cantarella: 0,
    Zani: 0,
    Cartethyia: 0,
    Phoebe: 0,
  };
  pads.forEach((pad) => {
    pad.stack.forEach((cubeInStack, indexInStack) => {
      result[cubeInStack.name] = pad.position + indexInStack * 0.1;
    });
  });
  return result;
}

const Roccia: Cube = {
  name: "Roccia",
  getExtraStepsBeforeMove(cubes, pads, gameData) {
    const lastCube = cubes.at(-1);
    if (lastCube?.name === this.name) {
      console.log(`!!! Roccia's ability: grants 2 extra steps`);
      gameData[this.name].extraSteps = 2;
      return 2;
    }
    return 0;
  },
};

const Brant: Cube = {
  name: "Brant",
  getExtraStepsBeforeMove(cubes, pads, gameData) {
    const firstCube = cubes.at(0);
    if (firstCube?.name === this.name) {
      console.log(`!!! Brant's ability: grants 2 extra steps`);
      gameData[this.name].extraSteps = 2;
      return 2;
    }
    return 0;
  },
};

const Cantarella: Cube = {
  name: "Cantarella",
  onPassedBy(targetPad, currentPad, gameData) {
    if (gameData.Cantarella.abilityTriggered) return;
    const cubeIndex = currentPad.stack.findIndex(
      (cube) => cube.name === this.name,
    );

    if (cubeIndex < 0) throw "Can't find Cantarella in stack!";
    const [cantaCube] = currentPad.stack.splice(cubeIndex, 1);
    targetPad.stack.unshift(cantaCube);

    console.log(
      `### Cantarella's ability: move together with ${
        targetPad.stack.at(1)?.name
      } [${targetPad.stack.map((c) => c.name).join(", ")}]`,
    );

    gameData[this.name].extraSteps += targetPad.position - currentPad.position;
    gameData[this.name].abilityTriggered = 1;
  },
};

const Zani: Cube = {
  name: "Zani",
  roll: () => (chance(0.5) ? 1 : 3),
  getExtraStepsBeforeMove(cubes, pads, gameData) {
    if (gameData[this.name].nextTurnExtraSteps) {
      const { nextTurnExtraSteps } = gameData.Zani;
      gameData[this.name].nextTurnExtraSteps = 0;
      console.log(
        `!!! Zani's ability: grants ${nextTurnExtraSteps} extra steps`,
      );
      gameData[this.name].extraSteps += nextTurnExtraSteps;
      return nextTurnExtraSteps;
    }
    return 0;
  },
  roundEnd(cubes, pads, gameData) {
    const zaniPad = pads.find((pad) => pad.stack.includes(this));
    if (!zaniPad) throw "Can't find Zani's current pad";
    if (zaniPad.stack.at(-1) !== this) {
      if (chance(0.4)) {
        console.log(
          `!!! Zani's ability: grants 2 extra steps in the next turn`,
        );
        gameData[this.name].nextTurnExtraSteps = 2;
        gameData[this.name].abilityTriggered =
          (gameData[this.name].abilityTriggered ?? 0) + 1;
      }
    }
  },
};

const Cartethyia: Cube = {
  name: "Cartethyia",
  getExtraStepsBeforeMove(cubes, pads, gameData) {
    if (!gameData[this.name].abilityTriggered) return 0;
    console.log(`!!! Cartethyia's ability: grants 2 extra steps`);
    gameData[this.name].extraSteps += 2;
    return 2;
  },
  afterMove(cubes, pads, gameData) {
    if (gameData[this.name].abilityTriggered) return;

    const scores = getAllCubeScores(pads);
    if (
      chance(0.6) &&
      Object.keys(scores).every(
        (name) =>
          scores[name as CubeName] === 0 ||
          scores[name as CubeName] >= scores[this.name],
      )
    ) {
      console.log(
        `### Cartethyia's ability triggered granting 2 extra steps for remaining turns`,
      );
      gameData[this.name].abilityTriggered = 1;
    }
  },
};

const Phoebe: Cube = {
  name: "Phoebe",
  getExtraStepsBeforeMove(cubes, pads, gameData) {
    if (chance(0.5)) {
      console.log(`!!! Phoebe's ability: grants 1 extra step`);
      gameData[this.name].extraSteps += 1;
      return 1;
    }
    return 0;
  },
};

// const game = new Game({
// 	cubes,
// 	length: 24,
// });

// game.start();

function sim(
  cubes: Cube[],
  n: number,
  top: number,
  pads?: Pad[],
  isLogging: boolean = false,
) {
  const log = console.log;
  if (!isLogging) {
    console.log = () => {};
  }

  const cubeData: { [cube in CubeName]: number } = {
    Roccia: 0,
    Brant: 0,
    Cantarella: 0,
    Zani: 0,
    Cartethyia: 0,
    Phoebe: 0,
  };

  const analytics: GameData = {
    Roccia: { extraSteps: 0 },
    Brant: { extraSteps: 0 },
    Cantarella: { extraSteps: 0, abilityTriggered: 0 },
    Zani: { extraSteps: 0 },
    Cartethyia: { extraSteps: 0, abilityTriggered: 0 },
    Phoebe: { extraSteps: 0 },
  };

  let i = 0;
  while (i < n) {
    i += 1;
    const game = new Game({
      cubes,
      length: 24,
      startPads: pads,
    });
    game.start();
    const scores = getAllCubeScores(game.pads);
    const names = Object.keys(scores) as CubeName[];
    names.sort((a, b) => scores[b] - scores[a]);

    names.forEach((name, index) => {
      if (index <= top - 1) {
        cubeData[name] += 1;
      }
    });

    // log(
    // 	`>>> Score:\n${names
    // 		.map((name) => `\t${name}: ${scores[name]}`)
    // 		.join('\n')}`
    // );

    cubes.forEach((cube) => {
      const data = analytics[cube.name];

      data.extraSteps += game.data[cube.name].extraSteps;
      data.score = (data.score ?? 0) + scores[cube.name];

      data.extraStepsPerRun =
        (data.extraStepsPerRun ?? 0) +
        game.data[cube.name].extraSteps * (1 / n);

      data.extraStepsPerScore = data.extraSteps / data.score;

      data.abilityTriggered =
        (data.abilityTriggered ?? 0) +
        (game.data[cube.name].abilityTriggered ?? 0);
    });
  }

  log(analytics);
  log(`In ${n} simulations`);
  cubes.forEach((cube) => {
    if (analytics[cube.name].abilityTriggered) {
      log(
        `\t${cube.name}'s ability triggered ${analytics[cube.name].abilityTriggered} times`,
      );
    }
    if (analytics[cube.name].extraSteps) {
      log(
        `\t${cube.name}'s ability grants ${analytics[cube.name].extraStepsPerRun} extra steps per match, (${analytics[cube.name].extraStepsPerScore * 100}%)`,
      );
    }
  });

  log(`Top ${top} rate:`);
  Object.keys(cubeData).forEach((name) => {
    log(`\t${name}: ${(100 * cubeData[name as CubeName]) / n}%`);
  });

  console.log = log;
}

// const cubes = [Roccia, Brant, Cantarella, Zani, Cartethyia, Phoebe];
const cubes = [Roccia, Brant, Cantarella, Zani, Cartethyia, Phoebe];

const seaPads: Pad[] = [
  {
    position: 0,
    stack: [Brant],
  },
  {
    position: -1,
    stack: [Phoebe, Zani],
  },
  {
    position: -2,
    stack: [Roccia, Cartethyia],
  },
  {
    position: -3,
    stack: [Cantarella],
  },
];

// sim(100, 4, true);
sim(cubes, 1000000, 1, seaPads);
// sim(cubes, 1, 1, true);

// sim(1000, 1, true);
