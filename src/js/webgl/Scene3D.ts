import { vec3, vec4, mat3, mat4 } from 'gl-matrix';
import { Triangle } from './Triangle';
import { Square } from './Square';
import { Room } from './Room';
import { Scene } from './Scene';
import { Camera } from './Camera';

import { Subject } from 'rxjs/Subject';
export class Scene3D implements Scene {
	//the projection matrix of the 3d scene
	private projectionMatrix: mat4;
	//the modelview matrix of the 3d scence
	private modelViewMatrix: mat4;
	//the view matrix of the 3d scene
	private viewMatrix: mat4;

	private camera:Camera;

	//the width of the 3d scene
	private width;
	//the height of the 3d scene
	private height;
	private fieldOfViewDegree;
	private fieldOfViewRadian;
	private aspectRatio;
	private zNear;
	private zFar;
	private grid: boolean;
	private positions = [
		0.5, 0.5, 0.0,
		-0.5, 0.5, 0.0,
		0.5, -0.5, 0.0
	];
	//the room (border, door, window) consists sqaures, the sqaures consits triangles
	private triangles: Triangle[] = [];
	//the room  (border, door, window) consists of squares
	private squares: Square[] = [];
	//the rooms of the 3d scene 
	//the user can dynamically add and remove (or modify) rooms
	private rooms: Room[] = [];
	private vertexCount = 3;
	private roomSource = new Subject<any>();
	public roomSource$ = this.roomSource.asObservable();

	private translateZ;

	//the initializaton
	constructor(width, height, fieldOfViewDegree, zNear, zFar, translateZ, grid) {
		this.translateZ = translateZ;

		this.projectionMatrix = mat4.create();
		this.grid = grid;
		this.width = width;
		this.height = height;
		this.fieldOfViewDegree = fieldOfViewDegree;
		this.zNear = zNear;
		this.zFar = zFar;
		let fieldOfViewRadian = fieldOfViewDegree * Math.PI / 180;
		this.fieldOfViewRadian = fieldOfViewRadian;
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
	/*lookAt(eye: vec3, center: vec3, up: vec3) {

		this.modelViewMatrix = mat4.create();

		mat4.translate(this.modelViewMatrix,
			this.modelViewMatrix,
			[0.0, 0.0, this.translateZ]);

		let cameraMatrix = mat4.create();
		mat4.lookAt(cameraMatrix, eye, center, up);

		this.viewMatrix = mat4.create();
		mat4.invert(this.viewMatrix, cameraMatrix);

		mat4.multiply(this.modelViewMatrix, this.viewMatrix, this.modelViewMatrix);
	}*/
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
	convert2DPointTo3DWorld(winx: number, winy: number): vec3 {
		let imageAspectRatio = this.width / this.height;
		let pX = (2 * ((winx + 0.5) / this.width) - 1) * Math.tan(this.fieldOfViewDegree / 2 * Math.PI / 180) * this.aspectRatio;
		let pY = (1 - 2 * ((winy + 0.5) / this.height)) * Math.tan(this.fieldOfViewDegree / 2 * Math.PI / 180);
		let rayOrigin = vec3.fromValues(0, 0, 0);
		return vec3.fromValues(pX * 5, pY * 5, (-1) * 5 + 5);
	}
	getRayTo2DPoint(x, y): vec3[] {
		let imageAspectRatio = this.width / this.height;
		let pX = (2 * ((x + 0.5) / this.width) - 1) * Math.tan(this.fieldOfViewDegree / 2 * Math.PI / 180) * this.aspectRatio;
		let pY = (1 - 2 * ((y + 0.5) / this.height)) * Math.tan(this.fieldOfViewDegree / 2 * Math.PI / 180);
		let modelViewInverse = mat4.create();
		mat4.invert(modelViewInverse, this.modelViewMatrix);
		let rayPWorld = vec4.create();
		let rayOrigin = vec3.fromValues(0, 0, 0);
		let rayDirection = vec3.create();
		vec3.subtract(rayDirection, vec3.fromValues(pX, pY, -1), rayOrigin);
		let normalizedRayDirection = vec3.create()
		vec3.normalize(normalizedRayDirection, rayDirection);
		return [rayOrigin, normalizedRayDirection];
	}
	//we can add dynamically rooms to the scene
	addRoom(room: Room) {
		this.rooms.push(room);
		this.roomSource.next();
	}
	getProjectionMatrix(): mat4 {
		return this.projectionMatrix;
	}
	getModelViewMatrix(): mat4 {
		this.modelViewMatrix = mat4.create();
		mat4.translate(this.modelViewMatrix,
			this.modelViewMatrix,
			[0.0, 0.0, this.translateZ]);

		this.camera.lookAt();
		//console.log(this.camera.getViewMatrix());
		mat4.multiply(this.modelViewMatrix, this.camera.getViewMatrix(), this.modelViewMatrix);
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
	getCamera():Camera {
		return this.camera;
	}
	setCamera(camera:Camera) {
		this.camera = camera;
	}
	isGrid(): boolean {
		return this.grid;
	}
	setGrid(grid: boolean) {
		this.grid = grid;
	}
	//the getter of the grid
	//the grid shows the unit. one piece of the grid means one cubic meter
	getGrid(): any {
		let frustumHeight = 2.0 * this.zFar * Math.tan(this.fieldOfViewRadian * 0.5);
		let frustumWidth = frustumHeight * this.aspectRatio;
		let p = vec3.fromValues(0, 0, 0);
		let d = vec3.fromValues(0, 0, -1);
		let up = vec3.fromValues(0, 1, 0);
		let right = vec3.fromValues(1, 0, 0);
		let fc = vec3.create();
		vec3.scale(d, d, this.zFar);
		vec3.add(fc, p, d);
		vec3.scale(up, up, frustumHeight / 2);
		vec3.scale(right, right, frustumWidth / 2);
		let diff = vec3.create();
		vec3.subtract(diff, fc, up);
		let fbl = vec3.create();
		vec3.subtract(fbl, diff, right);
		let fbr = vec3.create();
		vec3.add(fbr, diff, right);
		frustumHeight = 2.0 * this.zNear * Math.tan(this.fieldOfViewRadian * 0.5);
		frustumWidth = frustumHeight * this.aspectRatio;
		p = vec3.fromValues(0, 0, 0);
		d = vec3.fromValues(0, 0, -1);
		up = vec3.fromValues(0, 1, 0);
		right = vec3.fromValues(1, 0, 0);
		let nc = vec3.create();
		vec3.scale(d, d, this.zNear);
		vec3.add(nc, p, d);
		vec3.scale(up, up, frustumHeight / 2);
		vec3.scale(right, right, frustumWidth / 2);
		diff = vec3.create();
		vec3.subtract(diff, nc, up);
		let nbl = vec3.create();
		vec3.subtract(nbl, diff, right);
		let nbr = vec3.create();
		vec3.add(nbr, diff, right);
		var colors = [];
		var vertices = [];
		vertices = [
			fbl[0], nbl[1], fbl[2],
			fbl[0], nbl[1], nbl[2],
			fbr[0], nbl[1], nbr[2],
			fbr[0], nbl[1], fbr[2],
		];
		return [vertices, colors];
	}
	removeRoom(indexRemoveRoom: number) {
	}
	getDrawingRooms() {
		
	}
}