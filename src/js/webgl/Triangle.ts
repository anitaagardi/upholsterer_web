import { vec3, vec4, mat3, mat4 } from 'gl-matrix';
/*
The triangle is the atomic unit.
The rooms, doors, windows consits of squares, and the squares consits of triangles.
*/
export class Triangle {
	//the vertices of the triangle
	private vertices: vec3[] = [];
	//the color of the triangle
	private color: vec4;
	//the initialization of the triangle
	//the three point and the color
	//the color is important also, the room, door and the window has different colors
	constructor(v0: vec3, v1: vec3, v2: vec3, color: vec4) {
		this.vertices = [...this.vertices, v0, v1, v2];
		this.color = color;
	}
	//modelViewMatrix: to world
	rayIntersectsTriangle(p: vec3, d: vec3, modelViewMatrix: mat4): boolean {
		const epsilon = 0.00001;
		let v0 = this.vertices[0];
		let v1 = this.vertices[1];
		let v2 = this.vertices[2];
		let temp_v0 = vec4.create();
		vec4.transformMat4(temp_v0, vec4.fromValues(v0[0], v0[1], v0[2], 1.0), modelViewMatrix);
		let temp_v1 = vec4.create();;
		vec4.transformMat4(temp_v1, vec4.fromValues(v1[0], v1[1], v1[2], 1.0), modelViewMatrix);
		let temp_v2 = vec4.create();;
		vec4.transformMat4(temp_v2, vec4.fromValues(v2[0], v2[1], v2[2], 1.0), modelViewMatrix);
		v0 = vec3.fromValues(temp_v0[0], temp_v0[1], temp_v0[2]);
		v1 = vec3.fromValues(temp_v1[0], temp_v1[1], temp_v1[2]);
		v2 = vec3.fromValues(temp_v2[0], temp_v2[1], temp_v2[2]);
		let e1 = vec3.create();
		let e2 = vec3.create();
		vec3.subtract(e1, v1, v0);
		vec3.subtract(e2, v2, v0);
		let h = vec3.create();
		vec3.cross(h, d, e2);
		let a = vec3.dot(e1, h);
		if (a > -epsilon && a < epsilon)
			return false;
		let f = 1 / a;
		let s = vec3.create();
		vec3.subtract(s, p, v0);
		let u = f * vec3.dot(s, h);
		if (u < 0.0 || u > 1.0)
			return false;
		let q = vec3.create();
		vec3.cross(q, s, e1);
		let v = f * vec3.dot(d, q);
		if (v < 0.0 || (u + v) > 1.0)
			return false;
		// at this stage we can compute t to find out where
		// the intersection point is on the line
		let t = f * vec3.dot(e2, q);
		if (t > epsilon) // ray intersection
			return true;
		else // this means that there is a line intersection
			// but not a ray intersection
			return false;
	}
	//the vertices of the triangle
	getVerticesArray() {
		return [
			this.vertices[0][0], this.vertices[0][1], this.vertices[0][2],
			this.vertices[1][0], this.vertices[1][1], this.vertices[1][2],
			this.vertices[2][0], this.vertices[2][1], this.vertices[2][2]
		];
	}
	//the color of the triangle
	getColorArray() {
		return [
			this.color[0], this.color[1], this.color[2], this.color[3],
			this.color[0], this.color[1], this.color[2], this.color[3],
			this.color[0], this.color[1], this.color[2], this.color[3]
		];
	}
}