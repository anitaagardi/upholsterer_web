import { Rectangle } from "./Rectangle";
import { vec3, vec4, mat3, mat4 } from 'gl-matrix';

export class Box {
    private faces:Rectangle[] = [];
    constructor(private height: number, private base: Rectangle, private color:vec4) {
        let leftLower = base.getLeftLower();
        let leftUpper = base.getLeftUpper();
        let rightLower = base.getRightLower();
        let rightUpper = base.getRightUpper();

        let front = new Rectangle(
            leftLower, rightLower,
            vec3.fromValues(leftLower[0], leftLower[1] + height, leftLower[2]),
            vec3.fromValues(rightLower[0], rightLower[1] + height, rightLower[2]),
            color
        );

        let back = new Rectangle(
            leftUpper, rightUpper,
            vec3.fromValues(leftUpper[0], leftUpper[1] + height, leftUpper[2]),
            vec3.fromValues(rightUpper[0], rightUpper[1] + height, rightUpper[2]),
            color
        );

        let left = new Rectangle(
            leftUpper, leftLower,
            vec3.fromValues(leftUpper[0], leftUpper[1] + height, leftUpper[2]),
            vec3.fromValues(leftLower[0], leftLower[1] + height, leftLower[2]),
            color
        );

        let right = new Rectangle(
            rightUpper, rightLower,
            vec3.fromValues(rightUpper[0], rightUpper[1] + height, rightUpper[2]),
            vec3.fromValues(rightLower[0], rightLower[1] + height, rightLower[2]),
            color
        )

        let top = new Rectangle(
            vec3.fromValues(leftLower[0], leftLower[1] + height, leftLower[2]),
            vec3.fromValues(rightLower[0], rightLower[1] + height, rightLower[2]),
            vec3.fromValues(leftUpper[0], leftUpper[1] + height, leftUpper[2]),
            vec3.fromValues(rightUpper[0], rightUpper[1] + height, rightUpper[2]),
            vec4.fromValues(0,0,0,1.0)
        );

        this.faces = [ ...this.faces, base, left, right, front, back, top];
    }

    getHeight(): number {
        return this.height;
    }
    setHeight(height: number) {
        this.height = height;
    }

    getBase():  Rectangle {
        return this.base;
    }
    setBase(base:  Rectangle) {
        this.base = base;
    }

    getFaces() {
        return this.faces;
    }

    /*getVerticesArray() {

    }

    getColorArray() {

    }*/
}