import Cube from './Cube';

function rollDice() {
	return Math.floor(Math.random() * 3) + 1; // 1 to 3
}

function shuffle(array: any[]) {
	let currentIndex = array.length;

	// While there remain elements to shuffle...
	while (currentIndex != 0) {
		// Pick a remaining element...
		let randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex--;

		// And swap it with the current element.
		[array[currentIndex], array[randomIndex]] = [
			array[randomIndex],
			array[currentIndex],
		];
	}
}

function move(cube: Cube, startPad: Pad, endPad: Pad) {
	const cubeIndex = startPad.cubes.findIndex((c) => c === cube);
	if (cubeIndex < 0) {
		throw "Start pad doesn't contain the cube need to be moved";
	}

	const movedCubes = startPad.cubes.splice(cubeIndex);

	console.log(
		`${movedCubes.map((c) => c.name).join(', ')} moved from pad[${
			startPad.position
		}] to pad[${endPad.position}]`
	);

	endPad.cubes = [...endPad.cubes, ...movedCubes];
}

class Pad {
	position: number;
	cubes: Cube[];
	constructor(position: number, cubes: Cube[]) {
		this.position = position;
		this.cubes = cubes;
	}
}

export default class Game {
	cubes: Cube[];
	currentTurn = 0;
	pads: Pad[] = [];
	constructor(cubes: Cube[]) {
		this.cubes = cubes;
	}

	start(length = 24) {
		if (
			this.cubes.some((cube) =>
				this.cubes.some(
					(otherCube) => otherCube !== cube && otherCube.name === cube.name
				)
			)
		) {
			throw '2 Cubes with the same name.';
		}

		while (true) {
			if (this.nextTurn(length)) break;
		}
	}

	getPadAtPosition(position: number): Pad {
		let pad = this.pads.find((pad) => pad.position === position);
		if (!pad) {
			pad = new Pad(position, []);
			this.pads.push(pad);
		}
		return pad;
	}

	nextTurn(length: number) {
		// console.log('>>> nextTurn', [...this.pads]);
		this.currentTurn += 1;
		let isEnd = false;
		console.log(`Turn ${this.currentTurn}`);

		const diceRolls: { [key: string]: number } = {};
		for (const cube of this.cubes) {
			diceRolls[cube.name] = (cube.roll ?? rollDice)();
		}

		console.log('>>> diceRolls', diceRolls);

		// const sortedCubes = this.cubes
		// 	.slice()
		// 	.sort(
		// 		(a, b) =>
		// 			diceRolls[b.name] - diceRolls[a.name] || a.name.localeCompare(b.name)
		// 	);

		shuffle(this.cubes);
		const sortedCubes = this.cubes;

		sortedCubes.forEach((cube) => {
			if (cube.afterSort) cube.afterSort(sortedCubes, this.pads);
		});

		sortedCubes.forEach((cube) => {
			if (isEnd) return;
			const diceRolled = diceRolls[cube.name];
			const currentPad =
				this.pads.find((pad) => pad.cubes.includes(cube)) ?? new Pad(0, [cube]);
			const extraSteps = cube.getExtraSteps(
				currentPad.cubes,
				diceRolls,
				sortedCubes
			);
			const totalSteps = diceRolled + extraSteps;

			const nextPosition = currentPad.position + totalSteps;
			const nextPad = this.getPadAtPosition(nextPosition);

			move(cube, currentPad, nextPad);
			if (nextPad.position >= length) {
				isEnd = true;
			}
		});

		this.pads = this.pads.filter((pad) => pad.cubes.length);
		console.log('END >>>', [
			...this.pads.map((pad) => ({
				position: pad.position,
				cubes: [...pad.cubes.map((c) => c.name)],
			})),
		]);

		return isEnd;
	}
}
