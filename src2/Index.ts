import Cube, { CubeName, Pad } from './Cube';
import Game from './Game';

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
	name: 'Roccia',
	getExtraStepsBeforeMove(cubes, pads, gameData) {
		const lastCube = cubes.at(-1);
		if (lastCube?.name === 'Roccia') {
			console.log(`!!! Roccia's ability: grants 2 extra steps`);
			return 2;
		}
		return 0;
	},
};

const Brant: Cube = {
	name: 'Brant',
	getExtraStepsBeforeMove(cubes, pads, gameData) {
		const firstCube = cubes.at(0);
		if (firstCube?.name === 'Brant') {
			console.log(`!!! Brant's ability: grants 2 extra steps`);
			return 2;
		}
		return 0;
	},
};

const Cantarella: Cube = {
	name: 'Cantarella',
	onPassedBy(passedByStack, currentPad, gameData) {
		if (gameData.Cantarella?.isAbilityTrigged) return;
		const cubeIndex = currentPad.stack.findIndex(
			(cube) => cube.name === 'Cantarella'
		);

		if (cubeIndex < 0) throw "Can't find Cantarella in stack!";
		const [cantaCube] = currentPad.stack.splice(cubeIndex, 1);
		passedByStack.push(cantaCube);

		if (!gameData.Cantarella) {
			gameData.Cantarella = {};
		}

		console.log(
			`### Cantarella's ability: move together with ${
				passedByStack.at(0)?.name
			} [${passedByStack.map((c) => c.name).join(', ')}]`
		);

		gameData.Cantarella.isAbilityTrigged = 1;
	},
};

const Zani: Cube = {
	name: 'Zani',
	roll: () => (chance(0.5) ? 1 : 3),
	getExtraStepsBeforeMove(cubes, pads, gameData) {
		if (gameData.Zani?.nextTurnExtraSteps) {
			const { nextTurnExtraSteps } = gameData.Zani;
			gameData.Zani.nextTurnExtraSteps = 0;
			console.log(
				`!!! Zani's ability: grants ${nextTurnExtraSteps} extra steps`
			);
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
					`!!! Zani's ability: grants 2 extra steps in the next turn`
				);
				if (!gameData.Zani) {
					gameData.Zani = {};
				}
				gameData.Zani.nextTurnExtraSteps = 2;
			}
		}
	},
};

const Cartethyia: Cube = {
	name: 'Cartethyia',
	getExtraStepsBeforeMove(cubes, pads, gameData) {
		if (!gameData.Cartethyia?.isAbilityTrigged) return 0;
		// if (chance(0.6)) {
		console.log(`!!! Cartethyia's ability: grants 2 extra steps`);
		return 2;
		// }
		// return 0;
	},
	afterMove(cubes, pads, gameData) {
		if (gameData.Cartethyia?.isAbilityTrigged) return;

		const scores = getAllCubeScores(pads);
		if (
			chance(0.6) &&
			Object.keys(scores).every(
				(name) =>
					name !== 'Cartethyia' &&
					scores[name as CubeName] > scores['Cartethyia']
			)
		) {
			console.log(
				`### Cartethyia's ability triggered granting 2 extra steps for remaining turns`
			);
			gameData.Cartethyia = { isAbilityTrigged: 1 };
		}
	},
};

const Phoebe: Cube = {
	name: 'Phoebe',
	getExtraStepsBeforeMove(cubes, pads, gameData) {
		if (chance(0.5)) {
			console.log(`!!! Phoebe's ability: grants 1 extra step`);
			return 1;
		}
		return 0;
	},
};

const cubes = [Roccia, Brant, Cantarella, Zani, Cartethyia, Phoebe];

// const game = new Game({
// 	cubes,
// 	length: 24,
// });

// game.start();

function sim(n: number, top: number, isLogging: boolean = false) {
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

	let i = 0;
	while (i < n) {
		i += 1;
		const game = new Game({
			cubes,
			length: 24,
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
	}

	Object.keys(cubeData).forEach((name) => {
		log(`${name}: ${(100 * cubeData[name as CubeName]) / n}%`);
	});

	console.log = log;
}

sim(100, 4, true);
