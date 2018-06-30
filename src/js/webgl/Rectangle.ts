import { Triangle } from './Triangle';
import { vec3, vec4, mat3, mat4 } from 'gl-matrix';

export class Rectangle {
    private triangles: Triangle[] = [];
	//we can describe the square with the right upper, the right lower, the left upper and the left lower coordinate
	private rightUpper: vec3;
	private rightLower: vec3;
	private leftUpper: vec3;
	private leftLower: vec3;
	private squareColor: vec4;

    constructor(leftLower:vec3, rightLower:vec3, leftUpper:vec3, rightUpper:vec3, squareColor: vec4) {
        this.leftLower = leftLower;
        this.rightLower = rightLower;
        this.rightUpper = rightUpper;
        this.leftUpper = leftUpper;
        this.squareColor = squareColor;

        this.triangles = [
			new Triangle(
                this.leftLower,
                this.rightLower,
                this.rightUpper,
                this.squareColor

			),
			new Triangle(
				this.leftLower,
				this.leftUpper,
				this.rightUpper,
				this.squareColor
			)
		]
    }

    getRightUpper(): vec3 {
        return this.rightUpper;
    }
	getRightLower(): vec3 {
        return this.rightLower;
    }

	getLeftUpper(): vec3 {
        return this.leftUpper;
    }
    
    getLeftLower(): vec3 {
        return this.leftLower;
    }
    
    getSquareColor(): vec4 {
        return this.squareColor;
    }

    getTriangles():Triangle[] {
        return this.triangles;
    }

}