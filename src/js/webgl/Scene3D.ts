import { vec3, vec4, mat3, mat4 } from 'gl-matrix';
import { Triangle } from './Triangle';
import { Square } from './Square';
import { Room } from './Room';
import { Scene } from './Scene';
import { Camera } from './Camera';

import { Subject } from 'rxjs/Subject';
import { TexturedGrid } from './TexturedGrid';
import { Component } from './Component';
import { Frustum } from './Frustum';
import { WallGeometry } from './WallGeometry';
import { RoomGeometry } from './RoomGeometry';
import { Box } from './Box';
import { Rectangle } from './Rectangle';
import { Direction, Type } from './Wall';
export class Scene3D implements Scene {
	//the projection matrix of the 3d scene
	private projectionMatrix: mat4;
	//the modelview matrix of the 3d scence
	private modelViewMatrix: mat4;
	//the view matrix of the 3d scene
	private viewMatrix: mat4;

	private camera: Camera;

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

	//actual grid resolutions
	private gridResolution: number = 2048;
	private gridWidth: number;
	private gridHeight: number;

	private gridBeginX: number;
	private gridBeginZ: number;

	private frustum: Frustum;

	private wallGeometries: WallGeometry<Rectangle>[] = [];
	private roomGeometries: RoomGeometry<Rectangle>[] = [];

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

		this.calculateFrustum();

		this.gridWidth = Math.abs((this.frustum.getFarBottomRight()[0] - this.frustum.getFarBottomLeft()[0]) / this.gridResolution);
		this.gridHeight = Math.abs((this.frustum.getFarBottomRight()[2] - this.frustum.getNearBottomRight()[2]) / this.gridResolution);

		
		let gridCount = (Math.ceil(Math.abs(this.frustum.getNearBottomLeft()[0] - this.frustum.getFarBottomLeft()[0]) / this.gridWidth));
		this.gridBeginX = this.frustum.getFarBottomLeft()[0] + gridCount * this.gridWidth - + this.gridWidth / 2;

		let z = this.frustum.getNearBottomLeft()[2];
		this.gridBeginZ = z - this.gridHeight * 0.5;
	}
	
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
		////console.log(this.camera.getViewMatrix());
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
	setRooms(rooms: Room[]) {
		this.rooms = rooms;
	}
	getCamera(): Camera {
		return this.camera;
	}
	setCamera(camera: Camera) {
		this.camera = camera;
	}
	isGrid(): boolean {
		return this.grid;
	}
	setGrid(grid: boolean) {
		this.grid = grid;
	}
	getFrustum(): Frustum {
		return this.frustum;
	}
	calculateFrustum(): void {
		let frustum: Frustum = new Frustum();

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

		frustum.setFarBottomLeft(fbl);
		frustum.setFarBottomRight(fbr);
		frustum.setNearBottomLeft(nbl);
		frustum.setNearBottomRight(nbr);

		this.frustum = frustum;
		//return frustum;
	}

	//the getter of the grid
	//the grid shows the unit. one piece of the grid means one cubic meter
	getGrid(): TexturedGrid[] {
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
		return [
			new TexturedGrid(
				[vec3.fromValues(fbl[0], nbl[1], fbl[2]),
				vec3.fromValues(fbl[0], nbl[1], nbl[2]),
				vec3.fromValues(fbr[0], nbl[1], nbr[2]),
				vec3.fromValues(fbr[0], nbl[1], fbr[2])],
				[0, 1, 2, 0, 2, 3],
				this.gridResolution,
				["grid2.jpg"]

			), new TexturedGrid(
				[vec3.fromValues(fbl[0], nbl[1], -fbl[2]),
				vec3.fromValues(fbl[0], nbl[1], nbl[2]),
				vec3.fromValues(fbr[0], nbl[1], nbr[2]),
				vec3.fromValues(fbr[0], nbl[1], -fbr[2])],
				[0, 1, 2, 0, 2, 3],
				this.gridResolution,
				["grid2.jpg"]

			)]

		//return [vertices, colors];
	}
	removeRoom(indexRemoveRoom: number) {

	}
	getDrawingRooms(): Component[] {
		let y = this.frustum.getNearBottomLeft()[1];
		let z = this.frustum.getNearBottomLeft()[2];
	
		let newGridBeginX = this.gridBeginX - 15 * this.gridWidth;
		let newGridBeginZ = this.gridBeginZ - 20 * this.gridHeight;

		let components: Component[] = [];
		this.roomGeometries = [];
		this.wallGeometries = [];

		let wallSize = 0.05;

		for (let i = 0; i < this.rooms.length; i++) {
			let room = this.rooms[i];
			//the calculation of the properties of the room in square meter
			//the calculation of the room width to square meter
			//let roomBorder = room.getRoomMValues()[4];
			let roomUpperLeftX = room.getRoomMValues()[0];
			let roomUpperLeftY = room.getRoomMValues()[1];
			let roomWidth = room.getWidth() * this.gridWidth;

			let roomHeight = room.getHeight() * this.gridHeight;

			roomUpperLeftX = newGridBeginX + (roomUpperLeftX) * this.gridWidth;
			roomUpperLeftY = newGridBeginZ + (roomUpperLeftY) * this.gridHeight;

			let roomArea = new Rectangle(
				vec3.fromValues(roomUpperLeftX, y + 0.00001, roomUpperLeftY + roomHeight),
				vec3.fromValues(roomUpperLeftX + roomWidth, y + 0.00001, roomUpperLeftY + roomHeight),
				vec3.fromValues(roomUpperLeftX, y + 0.00001, roomUpperLeftY),
				vec3.fromValues(roomUpperLeftX + roomWidth, y + 0.00001, roomUpperLeftY),
				vec4.fromValues(192, 192, 192, 1.0)
			);

			for (let j = 0; j < room.getWalls().length; j++) {
				let wall = room.getWalls()[j];
				let lineSize;
				let connectedRoomSquare;

				//check room connected with this wall already drawn
				let wallIsDrawed: boolean = false;


				for (let k = 0; k < this.wallGeometries.length; k++) {
					if (this.wallGeometries[k].getWall() == wall) {
						wallIsDrawed = true;
						break;
					}
				}

	
				if (!wallIsDrawed) {

					if (wall.getType() == Type.OUTER) {
						//lineSize = 0.05;
						wallSize = this.gridWidth*0.5;
					} else {
						wallSize = this.gridWidth*0.5;
					}

					let v1, v2, v3, v4, v5;
					
					let wallGeometry: WallGeometry<Rectangle>;

					let wallOrientation: Direction;

					for (let k = 0; k < wall.getRooms().length; k++) {
						if (wall.getRooms()[k] == room) {
							wallOrientation = wall.getOrientations()[k];
							break;
						}
					}

					let box:Box = null;
					if (wallOrientation == Direction.UP) {
						let roomUpperLeftX = room.getRoomMValues()[0];
						let roomUpperLeftY = room.getRoomMValues()[1];

						let wallWidth = wall.getLength() * this.gridWidth;

						let wallUpperLeftX = newGridBeginX + (wall.getUpperLeftX()) * this.gridWidth;
						//the upper right y coordinate of the room
						let wallUpperLeftZ = newGridBeginZ + (roomUpperLeftY) * this.gridHeight;

						let wallRectangle = new Rectangle(
							vec3.fromValues(wallUpperLeftX + wallSize,  y + 0.00001, wallUpperLeftZ+wallSize),
							vec3.fromValues(wallUpperLeftX + wallWidth ,  y + 0.00001, wallUpperLeftZ+wallSize),
							vec3.fromValues(wallUpperLeftX + wallSize,  y + 0.00001, wallUpperLeftZ),
							vec3.fromValues(wallUpperLeftX + wallWidth ,  y + 0.00001, wallUpperLeftZ),
							vec4.fromValues(0.0, 0.0, 0.0, 1.0)
						);

						wallGeometry = new WallGeometry(wall, wallRectangle);
						box = new Box(this.gridHeight*2, wallRectangle,vec4.fromValues(192/255, 192/255, 192/255, 1.0));
						/*for(let k=0; k<box.getFaces().length; k++) {
							components = [...components, ...box.getFaces()[k].getTriangles()];	
						}*/
						//components = [...components, ...wallRectangle.getTriangles()];
						components = [...components, box];
						this.wallGeometries.push(wallGeometry);
						
					} else if (wallOrientation == Direction.DOWN) {

						let roomUpperLeftX = room.getRoomMValues()[0];
						let roomUpperLeftY = room.getRoomMValues()[1];

						let wallWidth = wall.getLength() * this.gridWidth;


						let wallUpperLeftX = newGridBeginX + (wall.getUpperLeftX()) * this.gridWidth;
						let wallUpperLeftZ = newGridBeginZ + (roomUpperLeftY + room.getHeight()) * this.gridHeight;

						let wallRectangle = new Rectangle(
							vec3.fromValues(wallUpperLeftX + wallSize,  y + 0.00001, wallUpperLeftZ+wallSize),
							vec3.fromValues(wallUpperLeftX + wallWidth ,  y + 0.00001, wallUpperLeftZ+wallSize),
							vec3.fromValues(wallUpperLeftX + wallSize,  y + 0.00001, wallUpperLeftZ),
							vec3.fromValues(wallUpperLeftX + wallWidth ,  y + 0.00001, wallUpperLeftZ),
							vec4.fromValues(0.0, 0.0, 0.0, 1.0)
						);

						wallGeometry = new WallGeometry(wall, wallRectangle);
						
						let box = new Box(this.gridHeight*2, wallRectangle,vec4.fromValues(192/255, 192/255, 192/255, 1.0));
						/*for(let k=0; k<box.getFaces().length; k++) {
							components = [...components, ...box.getFaces()[k].getTriangles()];	
						}*/
						components = [...components, box];
						this.wallGeometries.push(wallGeometry);
						

					} else if (wallOrientation == Direction.LEFT) {
						let roomUpperLeftX = room.getRoomMValues()[0];
						let roomUpperLeftY = room.getRoomMValues()[1];

						//let wallHeight = wall.getLength() * this.gridWidth;
						let wallHeight = wall.getLength() * this.gridHeight;

						let wallUpperLeftX = newGridBeginX + (roomUpperLeftX) * this.gridWidth;
						//the upper right y coordinate of the room
						let wallUpperLeftZ = newGridBeginZ + (wall.getUpperLeftY()) * this.gridHeight;

						let wallRectangle = new Rectangle(
							vec3.fromValues(wallUpperLeftX,  y + 0.00001, wallUpperLeftZ+wallHeight+wallSize),
							vec3.fromValues(wallUpperLeftX + wallSize ,  y + 0.00001, wallUpperLeftZ+wallHeight+wallSize),
							vec3.fromValues(wallUpperLeftX,  y + 0.00001, wallUpperLeftZ),
							vec3.fromValues(wallUpperLeftX + wallSize ,  y + 0.00001, wallUpperLeftZ),
							vec4.fromValues(0.0, 0.0, 0.0, 1.0)
						);

						wallGeometry = new WallGeometry(wall, wallRectangle);
						
						let box = new Box(this.gridHeight*2, wallRectangle,vec4.fromValues(192/255, 192/255, 192/255, 1.0));
						/*for(let k=0; k<box.getFaces().length; k++) {
							components = [...components, ...box.getFaces()[k].getTriangles()];	
						}*/
						components = [...components, box];
						this.wallGeometries.push(wallGeometry);
						
					} else if (wallOrientation == Direction.RIGHT) {
						let roomUpperLeftX = room.getRoomMValues()[0];
						let roomUpperLeftY = room.getRoomMValues()[1];

						let wallHeight = wall.getLength() * this.gridHeight;

						let wallUpperLeftX = newGridBeginX + (roomUpperLeftX + room.getWidth()) * this.gridWidth;

						let wallUpperLeftZ = newGridBeginZ + (wall.getUpperLeftY()) * this.gridHeight;

						
						let wallRectangle = new Rectangle(
							vec3.fromValues(wallUpperLeftX,  y + 0.00001, wallUpperLeftZ+wallHeight+wallSize),
							vec3.fromValues(wallUpperLeftX + wallSize ,  y + 0.00001, wallUpperLeftZ+wallHeight+wallSize),
							vec3.fromValues(wallUpperLeftX,  y + 0.00001, wallUpperLeftZ),
							vec3.fromValues(wallUpperLeftX + wallSize ,  y + 0.00001, wallUpperLeftZ),
							vec4.fromValues(0.0, 0.0, 0.0, 1.0)
						);

						wallGeometry = new WallGeometry(wall, wallRectangle);
						//components = [...components, ...wallRectangle.getTriangles()];
						let box = new Box(this.gridHeight*2, wallRectangle,vec4.fromValues(192/255, 192/255, 192/255, 1.0));
						/*for(let k=0; k<box.getFaces().length; k++) {
							components = [...components, ...box.getFaces()[k].getTriangles()];	
						}*/
						components = [...components, box];
						this.wallGeometries.push(wallGeometry);

					}
				}
		
			}

			//components = [...components, ...roomArea.getTriangles()];
		}

		return components;
	}
}