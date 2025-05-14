type CubeConfig = {
	getExtraSteps?: (
		stack: Cube[],
		rollDice: { [key: string]: number },
		sortedCubes: Cube[]
	) => number;
	roll?: () => number;
	move?: (cube: Cube, startPad: Pad, endPad: Pad) => void;
	afterSort?: (sortedCubes: Cube[], pads: Pad[]) => void;
};

class Pad {
	position: number;
	cubes: Cube[];
	constructor(position: number, cubes: Cube[]) {
		this.position = position;
		this.cubes = cubes;
	}
}

export default class Cube {
	name: string;
	getExtraSteps: (
		stack: Cube[],
		rollDice: { [key: string]: number },
		sortedCubes: Cube[]
	) => number;
	roll?: () => number;
	move?: (cube: Cube, startPad: Pad, endPad: Pad) => void;
	afterSort?: (sortedCubes: Cube[], pads: Pad[]) => void;

	constructor(name: string, config?: CubeConfig) {
		this.name = name;
		this.getExtraSteps = config?.getExtraSteps
			? config?.getExtraSteps
			: () => 0;
		this.roll = config?.roll;
		this.move = config?.move;
	}
}
