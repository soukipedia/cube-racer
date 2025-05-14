import Cube from './Cube';
import Game from './Game';

function chance(probability: number) {
	return Math.random() < probability;
}

const SK = new Cube('Shorekeeper', {
	roll: () => Math.floor(Math.random() * 2) + 2,
});

const Carlotta = new Cube('Carlotta', {
	getExtraSteps: (_, diceRolls) => {
		const rolledValue = diceRolls['Carlotta'];
		return chance(0.28) ? rolledValue : 0;
	},
});

const Calcharo = new Cube('Calcharo', {
	getExtraSteps: (_, __, sortedCubes) => {
		if (sortedCubes.at(-1)?.name === 'Calcharo') return 3;
		return 0;
	},
});

const Camellya = new Cube('Camellya', {
	move(cube, startPad, endPad) {
		const cubeIndex = startPad.cubes.findIndex((c) => c === cube);
		if (cubeIndex < 0) {
			throw "Start pad doesn't contain the cube need to be moved";
		}

		let extraSteps = 0;
		if (chance(0.5)) {
			extraSteps += startPad.cubes.length - 1;
			console.log(`>>> Camellya ability grants ${extraSteps} steps`);
		}
		const movedCubes = extraSteps
			? startPad.cubes.splice(cubeIndex, cubeIndex + 1)
			: startPad.cubes.splice(cubeIndex);

		console.log(
			`${movedCubes.map((c) => c.name).join(', ')} moved from pad[${
				startPad.position
			}] to pad[${endPad.position}]`
		);

		endPad.cubes = [...endPad.cubes, ...movedCubes];
	},
});

const Changli = new Cube('Changli', {
	afterSort(sortedCubes, pads) {
		const currentPad = pads.find((pad) =>
			pad.cubes.some((cube) => cube.name === 'Changli')
		);
		if (!currentPad) return;
		if (
			chance(0.65) &&
			currentPad.cubes.findIndex((cube) => cube.name === 'Changli') > 0
		) {
			const orderIndex = sortedCubes.findIndex(
				(cube) => cube.name === 'Changli'
			);
			const [changliCube] = sortedCubes.splice(orderIndex, 1);
			sortedCubes.push(changliCube);

			console.log(
				`Changli change turn order to [${sortedCubes
					.map((c) => c.name)
					.join(', ')}]`
			);
		}
	},
});

const Jinhsi = new Cube('Jinhsi', {
	afterSort(_, pads) {
		const currentPad = pads.find((pad) =>
			pad.cubes.some((cube) => cube.name === 'Jinhsi')
		);
		if (!currentPad) return;
		if (
			chance(0.4) &&
			currentPad.cubes.findIndex((cube) => cube.name === 'Jinhsi') <
				currentPad.cubes.length - 1
		) {
			const padIndex = currentPad.cubes.findIndex(
				(cube) => cube.name === 'Jinhsi'
			);
			const [changliCube] = currentPad.cubes.splice(padIndex, 1);
			currentPad.cubes.push(changliCube);

			console.log(
				`Jinhsi change current stack to [${currentPad.cubes
					.map((c) => c.name)
					.join(', ')}]`
			);
		}
	},
});

// const chars = [Carlotta, Calcharo];
const chars = [SK, Carlotta, Calcharo, Camellya, Changli, Jinhsi];

const game = new Game([...chars]);
game.start(24);

function sim(n: number, turns: number) {
	const log = console.log;
	console.log = () => {};

	const data: any = {};
	let i = 0;
	while (i <= n) {
		i += 1;
		const game = new Game([...chars]);
		game.start(turns);

		chars.forEach((cube) => {
			data[cube.name] =
				(data[cube.name] ?? 0) +
				game.pads.find((pad) => pad.cubes.some((c) => c.name === cube.name))
					?.position;
		});
	}

	Object.keys(data).forEach((name) => {
		const cubeData = data[name];
		log(`${name}: ${cubeData / n}`);
	});

	console.log = log;
}

function simTop(n: number, length: number, top: number) {
	const log = console.log;
	console.log = () => {};

	const data: any = {};
	let i = 0;
	while (i < n) {
		i += 1;
		const game = new Game([...chars]);
		game.start(length);

		// chars.forEach((cube) => {
		// 	data[cube.name] =
		// 		(data[cube.name] ?? 0) +
		// 		game.pads.find((pad) => pad.cubes.some((c) => c.name === cube.name))
		// 			?.position;
		// });

		const end: { cube: string; position: number; index: number }[] = [];
		game.pads.forEach((pad) => {
			const { cubes, position } = pad;
			cubes.forEach((cube, index) => {
				end.push({ cube: cube.name, position, index });
			});
		});

		const sorted = end.sort(
			(a, b) => b.position + b.index / 10 - a.position - a.index / 10
		);

		const topArr = sorted.splice(0, top);
		topArr.forEach((i) => {
			data[i.cube] = (data[i.cube] ?? 0) + 1;
		});
	}

	Object.keys(data).forEach((name) => {
		const cubeData = data[name];
		log(`${name}: ${cubeData / n}`);
	});

	console.log = log;
}

// sim(100000, 10);
// simTop(1000000, 24, 1);
