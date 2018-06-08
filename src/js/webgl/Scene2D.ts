import { vec3, vec4, mat3, mat4 } from 'gl-matrix';
import { Triangle } from './Triangle';
import { Square } from './Square';
import { Room } from './Room';
import { Scene } from './Scene';
import { Subject } from 'rxjs/Subject';
export class Scene2D implements Scene {
	//the projection matrix of the scene
	private projectionMatrix: mat4;
	//the modelview matrix of the scene
	private modelViewMatrix: mat4;
	//the width of the scene
	private width;
	//the height of the scene
	private height;
	private fieldOfViewDegree;
	private aspectRatio;
	private grid: boolean;
	private positions = [
		0.5, 0.5, 0.0,
		-0.5, 0.5, 0.0,
		0.5, -0.5, 0.0
	];
	//the rooms and other components of the rooms (doors, borders, windows) consist of sqares and the sqares consits of two triangles
	private triangles: Triangle[] = [];
	//the rooms and other components of the rooms (doors, borders, windows) consist of sqares 
	private squares: Square[] = [];
	//this contains the actual room lists of the scene. we can add new rooms and we can remove existing rooms from the scene dynamically
	private rooms: Room[] = [];
	private vertexCount = 3;
	private roomSource = new Subject<any>();
	public roomSource$ = this.roomSource.asObservable();
	//initialize the scene
	constructor(width, height, fieldOfViewDegree, zNear, zFar, translateZ, grid) {
		this.projectionMatrix = mat4.create();
		this.grid = grid;
		this.width = width;
		this.height = height;
		this.fieldOfViewDegree = fieldOfViewDegree;
		let fieldOfViewRadian = fieldOfViewDegree * Math.PI / 180;
		let aspect = width / height;
		this.aspectRatio = aspect;
		mat4.perspective(this.projectionMatrix,
			fieldOfViewRadian,
			aspect,
			zNear,
			zFar);
		this.modelViewMatrix = mat4.create();
		mat4.translate(this.modelViewMatrix,
			this.modelViewMatrix,
			[0.0, 0.0, translateZ]);
	}
	//convert 3d point to screen
	convert3DPointToScreen(point: vec4): number[] {
		let multipliedMatrix = mat4.create();
		mat4.multiply(multipliedMatrix, this.projectionMatrix, this.modelViewMatrix);
		let screenPoint = vec4.create();
		vec4.transformMat4(screenPoint, point, multipliedMatrix);
		let winX = Math.round((((screenPoint[0] / screenPoint[3]) + 1) / 2.0) *
			this.width);
		let winY = Math.round(((1 - screenPoint[1] / screenPoint[3]) / 2.0) *
			this.height);
		return [winX, winY];
	}
	//convert 2d points to 3d world
	convert2DPointTo3DWorld(winx: number, winy: number): vec3 {
		let imageAspectRatio = this.width / this.height; // width > height 
		let Px = (2 * ((winx + 0.5) / this.width) - 1) * Math.tan(this.fieldOfViewDegree / 2 * Math.PI / 180) * this.aspectRatio;
		let Py = (1 - 2 * ((winy + 0.5) / this.height)) * Math.tan(this.fieldOfViewDegree / 2 * Math.PI / 180);
		let rayOrigin = vec3.fromValues(0, 0, 0);
		return vec3.fromValues(Px * 5, Py * 5, (-1) * 5 + 5);
	}
	getRayTo2DPoint(x, y): vec3[] {
		let imageAspectRatio = this.width / this.height;
		let Px = (2 * ((x + 0.5) / this.width) - 1) * Math.tan(this.fieldOfViewDegree / 2 * Math.PI / 180) * this.aspectRatio;
		let Py = (1 - 2 * ((y + 0.5) / this.height)) * Math.tan(this.fieldOfViewDegree / 2 * Math.PI / 180);
		let modelViewInverse = mat4.create();
		mat4.invert(modelViewInverse, this.modelViewMatrix);
		let rayPWorld = vec4.create();
		let rayOrigin = vec3.fromValues(0, 0, 0);
		let rayDirection = vec3.create();
		vec3.subtract(rayDirection, vec3.fromValues(Px, Py, -1), rayOrigin);
		let normalizedRayDirection = vec3.create()
		vec3.normalize(normalizedRayDirection, rayDirection);
		return [rayOrigin, normalizedRayDirection];
	}
	//add room. we can add room to the scene dynamically
	addRoom(room: Room) {
		this.rooms.push(room);
		this.roomSource.next();
	}
	//remove room. we can remove room from the scene dynamically
	removeRoom(indexRemoveRoom: number) {
		let index = indexRemoveRoom;
		this.rooms.splice(indexRemoveRoom, 1);
		this.roomSource.next();
	}
	
	getProjectionMatrix(): mat4 {
		return this.projectionMatrix;
	}
	
	getModelViewMatrix(): mat4 {
		return this.modelViewMatrix;
	}
	getPositions(): number[] {
		return this.positions;
	}
	getVertexCount(): number {
		return this.vertexCount;
	}
	getTriangles(): Triangle[] {
		return this.triangles;
	}
	getSquares(): Square[] {
		return this.squares;
	}
	getRooms(): Room[] {
		return this.rooms;
	}
	isGrid(): boolean {
		return this.grid;
	}
	setGrid(grid: boolean) {
		this.grid = grid;
	}
	//this method creates the gid 
	//one grid piece means one square meter
	getGrid(): any {
		var colors = [];
		var vertices = [];
		for (var i = 0; i < 2000; i = i + 50) {
			colors = colors.concat([0, 0, 0, 1.0]);
			let v = this.convert2DPointTo3DWorld(i, 0);
			vertices = vertices.concat([v[0], v[1], v[2]]);
			v = this.convert2DPointTo3DWorld(i, 800);
			vertices = vertices.concat([v[0], v[1], v[2]]);
			colors = colors.concat([0, 0, 0, 1.0]);
			colors = colors.concat([0, 0, 0, 1.0]);
			v = this.convert2DPointTo3DWorld(0, i);
			vertices = vertices.concat([v[0], v[1], v[2]]);
			v = this.convert2DPointTo3DWorld(1000, i);
			vertices = vertices.concat([v[0], v[1], v[2]]);
			colors = colors.concat([0, 0, 0, 1.0]);
		}
		return [vertices, colors];
	}
}