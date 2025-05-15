type CubeConfig = {
	getExtraSteps?: (
		stack: Cube[],
		rollDice: { [key: string]: number },
		sortedCubes: Cube[]
	) => number;
	roll?: () => number;
	// move?: (cube: Cube, startPad: Pad, endPad: Pad) => void;
	afterSort?: (sortedCubes: Cube[], pads: Pad[]) => void;
	onStack?: (stack: Cube[]) => void;
};

class Pad {
	position: number;
	cubes: Cube[];
	constructor(position: number, cubes: Cube[]) {
		this.position = position;
		this.cubes = cubes;
	}
}

export default class Cube implements CubeConfig {
	name: string;
	getExtraSteps?: (
		stack: Cube[],
		rollDice: { [key: string]: number },
		sortedCubes: Cube[]
	) => number;
	roll?: () => number;
	// move?: (cube: Cube, startPad: Pad, endPad: Pad) => void;
	afterSort?: (sortedCubes: Cube[], pads: Pad[]) => void;
	onStack?: (stack: Cube[]) => void;

	constructor(name: string, config?: CubeConfig) {
		this.name = name;
		Object.assign(this, config);
	}
}
