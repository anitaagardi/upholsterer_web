import { Triangle } from './Triangle';
import { vec3, vec4, mat3, mat4 } from 'gl-matrix';
/*
The square is the element of the room, window, door and the border.
The square consits of two triangles.
*/
export class Square {
	//the square consits of two triangle
	private triangles: Triangle[] = [];
	//we can describe the square with the right upper, the right lower, the left upper and the left lower coordinate
	private rightUpper: vec3;
	private rightLower: vec3;
	private leftUpper: vec3;
	private leftLower: vec3;
	private squareColor: vec4;
	//we can initialize the square with three point and the color (color is important because different color has the room, window, door)
	createFromVec(v_0: vec3, v_1: vec3, v_2: vec3, v_3: vec3, color: vec4) {
		this.squareColor = color;
		let biggest, smallest;
		//search the biggest coordinate
		if (v_0[0] >= v_1[0] && v_0[0] >= v_2[0] && v_0[0] >= v_3[0]) {
			if (v_0[1] >= v_1[1] && v_0[1] >= v_2[1] && v_0[1] >= v_3[1]) {
				this.rightUpper = v_0;
				biggest = 0;
			}
		}
		if (v_1[0] >= v_0[0] && v_1[0] >= v_2[0] && v_1[0] >= v_3[0]) {
			if (v_1[1] >= v_0[1] && v_1[1] >= v_2[1] && v_1[1] >= v_3[1]) {
				this.rightUpper = v_1;
				biggest = 1;
			}
		}
		if (v_2[0] >= v_0[0] && v_2[0] >= v_1[0] && v_2[0] >= v_3[0]) {
			if (v_2[1] >= v_0[1] && v_2[1] >= v_1[1] && v_2[1] >= v_3[1]) {
				this.rightUpper = v_2;
				biggest = 2;
			}
		}
		if (v_3[0] >= v_0[0] && v_3[0] >= v_1[0] && v_3[0] >= v_2[0]) {
			if (v_3[1] >= v_0[1] && v_3[1] >= v_1[1] && v_3[1] >= v_2[1]) {
				this.rightUpper = v_3;
				biggest = 3;
			}
		}
		//search for the smallest
		if (v_0[0] <= v_1[0] && v_0[0] <= v_2[0] && v_0[0] <= v_3[0]) {
			if (v_0[1] <= v_1[1] && v_0[1] <= v_2[1] && v_0[1] <= v_3[1]) {
				this.leftLower = v_0;
				smallest = 0;
			}
		}
		if (v_1[0] <= v_0[0] && v_1[0] <= v_2[0] && v_1[0] <= v_3[0]) {
			if (v_1[1] <= v_0[1] && v_1[1] <= v_2[1] && v_1[1] <= v_3[1]) {
				this.leftLower = v_1;
				smallest = 1;
			}
		}
		if (v_2[0] <= v_0[0] && v_2[0] <= v_1[0] && v_2[0] <= v_3[0]) {
			if (v_2[1] <= v_0[1] && v_2[1] <= v_1[1] && v_2[1] <= v_3[1]) {
				this.leftLower = v_2;
				smallest = 2;
			}
		}
		if (v_3[0] <= v_0[0] && v_3[0] <= v_1[0] && v_3[0] <= v_2[0]) {
			if (v_3[1] <= v_0[1] && v_3[1] <= v_1[1] && v_3[1] <= v_2[1]) {
				this.leftLower = v_3;
				smallest = 3;
			}
		}
		//initialization of the right lower, the right upper, the left lower and the left upper coordinate
		for (let i = 0; i < 4; i++) {
			if (smallest != i && biggest != i) {
				if (i == 0 && v_0[1] == this.leftLower[1])
					this.rightLower = v_0;
				if (i == 1 && v_1[1] == this.leftLower[1])
					this.rightLower = v_1;
				if (i == 2 && v_2[1] == this.leftLower[1])
					this.rightLower = v_2;
				if (i == 3 && v_3[1] == this.leftLower[1])
					this.rightLower = v_3;
				if (i == 0 && v_0[1] == this.rightUpper[1])
					this.leftUpper = v_0;
				if (i == 1 && v_1[1] == this.rightUpper[1])
					this.leftUpper = v_1;
				if (i == 2 && v_2[1] == this.rightUpper[1])
					this.leftUpper = v_2;
				if (i == 3 && v_3[1] == this.rightUpper[1])
					this.leftUpper = v_3;
			}
		}
		this.triangles = [new Triangle(this.rightUpper, this.rightLower, this.leftUpper, this.squareColor), new Triangle(this.rightLower, this.leftLower, this.leftUpper, this.squareColor)];
	}
	//initialization from pixel, with the points and the color (color is important. the door, room window , border has different colors)
	createFromPixel(v_0: vec3[], v_1: vec3[], v_2: vec3[], v_3: vec3[], color: vec4) {
		this.squareColor = color;
		let biggest, smallest;
		let rightUpper: vec3[];
		let rightLower: vec3[];
		let leftUpper: vec3[];
		let leftLower: vec3[];
		//search the biggest coordinate
		if (v_0[0][0] >= v_1[0][0] && v_0[0][0] >= v_2[0][0] && v_0[0][0] >= v_3[0][0]) {
			if (v_0[0][1] >= v_1[0][1] && v_0[0][1] >= v_2[0][1] && v_0[0][1] >= v_3[0][1]) {
				rightUpper = v_0;
				biggest = 0;
			}
		}
		if (v_1[0][0] >= v_0[0][0] && v_1[0][0] >= v_2[0][0] && v_1[0][0] >= v_3[0][0]) {
			if (v_1[0][1] >= v_0[0][1] && v_1[0][1] >= v_2[0][1] && v_1[0][1] >= v_3[0][1]) {
				rightUpper = v_1;
				biggest = 1;
			}
		}
		if (v_2[0][0] >= v_0[0][0] && v_2[0][0] >= v_1[0][0] && v_2[0][0] >= v_3[0][0]) {
			if (v_2[0][1] >= v_0[0][1] && v_2[0][1] >= v_1[0][1] && v_2[0][1] >= v_3[0][1]) {
				rightUpper = v_2;
				biggest = 2;
			}
		}
		if (v_3[0][0] >= v_0[0][0] && v_3[0][0] >= v_1[0][0] && v_3[0][0] >= v_2[0][0]) {
			if (v_3[0][1] >= v_0[0][1] && v_3[0][1] >= v_1[0][1] && v_3[0][1] >= v_2[0][1]) {
				rightUpper = v_3;
				biggest = 3;
			}
		}
		//search for the smallest
		if (v_0[0][0] <= v_1[0][0] && v_0[0][0] <= v_2[0][0] && v_0[0][0] <= v_3[0][0]) {
			if (v_0[0][1] <= v_1[0][1] && v_0[0][1] <= v_2[0][1] && v_0[0][1] <= v_3[0][1]) {
				leftLower = v_0;
				smallest = 0;
			}
		}
		if (v_1[0][0] <= v_0[0][0] && v_1[0][0] <= v_2[0][0] && v_1[0][0] <= v_3[0][0]) {
			if (v_1[0][1] <= v_0[0][1] && v_1[0][1] <= v_2[0][1] && v_1[0][1] <= v_3[0][1]) {
				leftLower = v_1;
				smallest = 1;
			}
		}
		if (v_2[0][0] <= v_0[0][0] && v_2[0][0] <= v_1[0][0] && v_2[0][0] <= v_3[0][0]) {
			if (v_2[0][1] <= v_0[0][1] && v_2[0][1] <= v_1[0][1] && v_2[0][1] <= v_3[0][1]) {
				leftLower = v_2;
				smallest = 2;
			}
		}
		if (v_3[0][0] <= v_0[0][0] && v_3[0][0] <= v_1[0][0] && v_3[0][0] <= v_2[0][0]) {
			if (v_3[0][1] <= v_0[0][1] && v_3[0][1] <= v_1[0][1] && v_3[0][1] <= v_2[0][1]) {
				leftLower = v_3;
				smallest = 3;
			}
		}
		//initialization of the right lower, right upper, left lower, left upper coordinate of the square
		for (let i = 0; i < 4; i++) {
			if (smallest != i && biggest != i) {
				if (i == 0 && v_0[0][1] == leftLower[0][1])
					rightLower = v_0;
				if (i == 1 && v_1[0][1] == leftLower[0][1])
					rightLower = v_1;
				if (i == 2 && v_2[0][1] == leftLower[0][1])
					rightLower = v_2;
				if (i == 3 && v_3[0][1] == leftLower[0][1])
					rightLower = v_3;
				if (i == 0 && v_0[0][1] == rightUpper[0][1])
					leftUpper = v_0;
				if (i == 1 && v_1[0][1] == rightUpper[0][1])
					leftUpper = v_1;
				if (i == 2 && v_2[0][1] == rightUpper[0][1])
					leftUpper = v_2;
				if (i == 3 && v_3[0][1] == rightUpper[0][1])
					leftUpper = v_3;
			}
		}
		this.rightUpper = rightUpper[1];
		this.rightLower = rightLower[1];
		this.leftUpper = leftUpper[1];
		this.leftLower = leftLower[1];
		//the creation of the triangles with the right upper, right lower, left upper and the left lower coordinate
		this.triangles = [new Triangle(this.rightUpper, this.rightLower, this.leftUpper, this.squareColor), new Triangle(this.rightLower, this.leftLower, this.leftUpper, this.squareColor)];
	}
	rayIntersectsSquare(p: vec3, d: vec3, modelViewMatrix: mat4): boolean {
		return this.triangles[0].rayIntersectsTriangle(p, d, modelViewMatrix) || this.triangles[1].rayIntersectsTriangle(p, d, modelViewMatrix);
	}
	getTriangles(): Triangle[] {
		return this.triangles;
	}
	getRightUpperCoordinate(): vec3 {
		return this.rightUpper;
	}
	getLeftUpperCoordinate(): vec3 {
		return this.leftUpper;
	}
	getLeftLowerCoordinate(): vec3 {
		return this.leftLower;
	}
	getRightLowerCoordinate(): vec3 {
		return this.rightLower;
	}
}
