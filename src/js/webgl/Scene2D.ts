import { vec3, vec4, mat3, mat4 } from 'gl-matrix';
import { Triangle } from './Triangle';
import { Square } from './Square';
import { Room } from './Room';
import { Scene } from './Scene';
import { Subject } from 'rxjs/Subject';
import { Component } from './Component';
import { MultiLineText } from './MultiLineText';
import { LineGrid } from './LineGrid';
import { Wall, Direction, Type } from './Wall';
import { WallGeometry } from './WallGeometry';
import { RoomGeometry } from './RoomGeometry';
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

	private gridWidth: number = 50;
	private gridHeight: number = 50;

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
	private walls: Wall[] = [];
	private vertexCount = 3;
	private roomSource = new Subject<any>();
	public roomSource$ = this.roomSource.asObservable();

	private wallGeometries: WallGeometry<Square>[] = [];
	private roomGeometries: RoomGeometry<Square>[] = [];
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


		//console.log(vec3.length(normalized) + " " + normalized[2]);

		//console.log(vec3.fromValues(normalized[0] * 5, normalized[1] * 5, normalized[2] * 5 + 5));
		return vec3.fromValues(Px * 5, Py * 5, (-1) * 5 + 5);
	}

	//convert 2d points to 3d world
	convert2DPointTo3DWorld2(winx: number, winy: number): vec3 {
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
	addRoom(room: Room, wall?: Wall) {
		let roomUpperLeftX = room.getRoomMValues()[0];
		let roomUpperLeftY = room.getRoomMValues()[1];

		let upWall = null, leftWall = null, rightWall = null, downWall = null;
		if (this.rooms.length == 0) {
			upWall = new Wall(Direction.UP, Type.OUTER, 0.08, room.getWidth(), roomUpperLeftX, roomUpperLeftY);
			upWall.addRoomWithOrientation(room, Direction.UP);

			leftWall = new Wall(Direction.LEFT, Type.OUTER, 0.08, room.getHeight(), roomUpperLeftX, roomUpperLeftY);
			leftWall.addRoomWithOrientation(room, Direction.LEFT);

			rightWall = new Wall(Direction.RIGHT, Type.OUTER, 0.08, room.getHeight(), roomUpperLeftX, roomUpperLeftY);
			rightWall.addRoomWithOrientation(room, Direction.RIGHT);

			downWall = new Wall(Direction.DOWN, Type.OUTER, 0.08, room.getWidth(), roomUpperLeftX, roomUpperLeftY);
			downWall.addRoomWithOrientation(room, Direction.DOWN);

			room.setWalls([upWall, rightWall, leftWall, downWall]);
		} else {
			let xs = [roomUpperLeftX, roomUpperLeftX + room.getWidth()];
			let ys = [roomUpperLeftY, roomUpperLeftY + room.getHeight()];

			let leftWalls: Wall[] = [];
			let rightWalls: Wall[] = [];
			let upWalls: Wall[] = [];
			let downWalls: Wall[] = [];

			for (let i = 0; i < this.rooms.length; i++) {
				let tempRoom = this.rooms[i];
				let tempRoomUpperLeftX = tempRoom.getRoomMValues()[0];
				let tempRoomUpperLeftY = tempRoom.getRoomMValues()[1];

				if (
					(roomUpperLeftX < tempRoomUpperLeftX && (tempRoomUpperLeftX < (roomUpperLeftX + room.getWidth())))
					|| (roomUpperLeftX < (tempRoomUpperLeftX + tempRoom.getWidth()) && ((tempRoomUpperLeftX + tempRoom.getWidth()) < (roomUpperLeftX + room.getWidth())))
					|| (tempRoomUpperLeftX < roomUpperLeftX && (roomUpperLeftX < (tempRoomUpperLeftX + tempRoom.getWidth())))
					|| (tempRoomUpperLeftX < (roomUpperLeftX + room.getWidth()) && ((roomUpperLeftX + room.getWidth()) < (tempRoomUpperLeftX + tempRoom.getWidth())))
					|| ((roomUpperLeftX == tempRoomUpperLeftX) && ((roomUpperLeftX + room.getWidth()) == (tempRoomUpperLeftX + tempRoom.getWidth())))
				) {
					//rooms, those downwall overlap this room (added) upwall
					if (roomUpperLeftY == (tempRoomUpperLeftY + tempRoom.getHeight())) {
						console.log("ATFEDES UP");
						let tempWall: Wall = null;
						for (let j = 0; j < tempRoom.getWalls().length; j++) {
							let tempWall = tempRoom.getWalls()[j];
							let findWall: boolean = false;
							for (let k = 0; k < tempWall.getRooms().length; k++) {
								//console.log("ITT " + (tempWall.getRooms()[k] == tempRoom) +" "+tempWall.getOrientations()[k]);
								if (tempWall.getRooms()[k] == tempRoom && tempWall.getOrientations()[k] == Direction.DOWN) {
									findWall = true;
									console.log(tempRoom.getRoomName());

									if (upWalls.indexOf(tempWall)==-1) {
										upWalls.push(tempWall);
									}

									xs = [...xs, tempWall.getUpperLeftX(), tempWall.getUpperLeftX() + tempWall.getLength()];
									break;
								}
							}

							if (findWall) {
								break;
							}
						}
					}

					//rooms, those upwall overlap this room (added) downwall
					else if ((roomUpperLeftY + room.getHeight() == tempRoomUpperLeftY)) {
						console.log("ATFEDES DOWN");
						let tempWall: Wall = null;
						for (let j = 0; j < tempRoom.getWalls().length; j++) {
							let tempWall = tempRoom.getWalls()[j];
							let findWall: boolean = false;
							for (let k = 0; k < tempWall.getRooms().length; k++) {
								console.log(tempWall.getRooms()[k] == tempRoom);
								if (tempWall.getRooms()[k] == tempRoom && tempWall.getOrientations()[k] == Direction.UP) {
									findWall = true;
									console.log(tempRoom.getRoomName());

									if (downWalls.indexOf(tempWall)==-1) {
										downWalls.push(tempWall);
									}

									xs = [...xs, tempWall.getUpperLeftX(), tempWall.getUpperLeftX() + tempWall.getLength()];
									break;
								}
							}

							if (findWall) {
								break;
							}
						}
					}

				}

				if (
					(roomUpperLeftY < tempRoomUpperLeftY && (tempRoomUpperLeftY < (roomUpperLeftY + room.getHeight())))
					|| (roomUpperLeftY < (tempRoomUpperLeftY + tempRoom.getHeight()) && ((tempRoomUpperLeftY + tempRoom.getHeight()) < (roomUpperLeftY + room.getHeight())))
					|| (tempRoomUpperLeftY < roomUpperLeftY && (roomUpperLeftY < (tempRoomUpperLeftY + tempRoom.getHeight())))
					|| (tempRoomUpperLeftY < (roomUpperLeftY + room.getHeight()) && ((roomUpperLeftY + room.getHeight()) < (tempRoomUpperLeftY + tempRoom.getHeight())))
					|| ((roomUpperLeftY == tempRoomUpperLeftY) && ((roomUpperLeftY + room.getHeight()) == (tempRoomUpperLeftY + tempRoom.getHeight())))
				) {
					//rooms, those leftwall overlap this room (added) rightwall
					if (((roomUpperLeftX + room.getWidth()) == tempRoomUpperLeftX)) {
						//ys = [...ys, tempRoomUpperLeftY, tempRoomUpperLeftY + tempRoom.getHeight()];
						console.log("ATFEDES RIGHT");
						let tempWall: Wall = null;
						for (let j = 0; j < tempRoom.getWalls().length; j++) {
							let tempWall = tempRoom.getWalls()[j];
							let findWall: boolean = false;
							for (let k = 0; k < tempWall.getRooms().length; k++) {
								if (tempWall.getRooms()[k] == tempRoom && tempWall.getOrientations()[k] == Direction.LEFT) {
									findWall = true;

									console.log(tempRoom.getRoomName());

									if (rightWalls.indexOf(tempWall)==-1) {
										rightWalls.push(tempWall);
									}

									ys = [...ys, tempWall.getUpperLeftY(), tempWall.getUpperLeftY() + tempWall.getLength()];
									break;
								}
							}

							if (findWall) {
								break;
							}
						}
						
						//rooms, those rightwall overlap this room (added) leftwall
					} else if (roomUpperLeftX == (tempRoomUpperLeftX + tempRoom.getWidth())) {
						//ys = [...ys, tempRoomUpperLeftY, tempRoomUpperLeftY + tempRoom.getHeight()];
						console.log("ATFEDES LEFT");
						for (let j = 0; j < tempRoom.getWalls().length; j++) {
							let tempWall = tempRoom.getWalls()[j];
							let findWall: boolean = false;
							for (let k = 0; k < tempWall.getRooms().length; k++) {
								if (tempWall.getRooms()[k] == tempRoom && tempWall.getOrientations()[k] == Direction.RIGHT) {
									findWall = true;

									console.log(tempRoom.getRoomName());

									//tempWall.addRoomWithOrientation(room, Direction.LEFT);
									//leftWall = tempWall;

									if (leftWalls.indexOf(tempWall)==-1) {
										leftWalls.push(tempWall);
									}

									ys = [...ys, tempWall.getUpperLeftY(), tempWall.getUpperLeftY() + tempWall.getLength()];
									break;
								}
							}

							if (findWall) {
								break;
							}
						}
		
					}

				}
			}

			console.log(xs);
			console.log(ys);
			let minX = Math.min(...xs);
			let maxX = Math.max(...xs);

			let minY = Math.min(...ys);
			let maxY = Math.max(...ys);

			downWall = new Wall(Direction.DOWN, Type.OUTER, 0.08, room.getWidth(), roomUpperLeftX, roomUpperLeftY);
			//downWall.addRoomWithOrientation(room, Direction.DOWN);
			if (downWalls.length > 0) {
				for (let i = 0; i < downWalls.length; i++) {
					for (let j = 0; j < downWalls[i].getRooms().length; j++) {
						downWall.addRoomWithOrientation(downWalls[i].getRooms()[j], downWalls[i].getOrientations()[j]);
					}
				}

				downWall.setUpperLeftX(minX);
				downWall.setLength(maxX - minX);

				let findRoom = false;

				for (let i = 0; i < downWall.getRooms().length; i++) {
					for (let j = 0; j < downWall.getRooms()[i].getWalls().length; j++) {
						for(let k=0; k <  downWall.getRooms()[i].getWalls()[j].getRooms().length; k++) {
							let tempRoom =  downWall.getRooms()[i].getWalls()[j].getRooms()[k];
							let tempDirection = downWall.getRooms()[i].getWalls()[j].getOrientations()[k];
					
							if(tempRoom==downWall.getRooms()[i]&&tempDirection==downWall.getOrientations()[i]) {
								tempRoom.setWall(j, downWall);
								console.log("ITT");
								break;
							}

						}

					}
				}

				downWall.addRoomWithOrientation(room,Direction.DOWN);

			} else {
				downWall.addRoomWithOrientation(room, Direction.DOWN);
			}

			upWall = new Wall(Direction.UP, Type.OUTER, 0.08, room.getWidth(), roomUpperLeftX, roomUpperLeftY);
			
			if (upWalls.length > 0) {
				for (let i = 0; i < upWalls.length; i++) {
					for (let j = 0; j < upWalls[i].getRooms().length; j++) {
						upWall.addRoomWithOrientation(upWalls[i].getRooms()[j], upWalls[i].getOrientations()[j]);
					}
				}

				upWall.setUpperLeftX(minX);
				upWall.setLength(maxX - minX);

				for (let i = 0; i < upWall.getRooms().length; i++) {
					for (let j = 0; j < upWall.getRooms()[i].getWalls().length; j++) {
						for(let k=0; k <  upWall.getRooms()[i].getWalls()[j].getRooms().length; k++) {
							let tempRoom =  upWall.getRooms()[i].getWalls()[j].getRooms()[k];
							let tempDirection = upWall.getRooms()[i].getWalls()[j].getOrientations()[k];
					
							if(tempRoom==upWall.getRooms()[i]&&tempDirection==upWall.getOrientations()[i]) {
								tempRoom.setWall(j, upWall);
								break;
							}
						}
					}
				}

				upWall.addRoomWithOrientation(room,Direction.UP);

			} else {
				upWall.addRoomWithOrientation(room, Direction.UP);
			}

			leftWall = new Wall(Direction.LEFT, Type.OUTER, 0.08, room.getHeight(), roomUpperLeftX, roomUpperLeftY);
			if (leftWalls.length > 0) {
				for (let i = 0; i < leftWalls.length; i++) {
					for (let j = 0; j < leftWalls[i].getRooms().length; j++) {
						leftWall.addRoomWithOrientation(leftWalls[i].getRooms()[j], leftWalls[i].getOrientations()[j]);
					}
				}

				leftWall.setUpperLeftY(minY);
				leftWall.setLength(maxY - minY);

				for (let i = 0; i < leftWall.getRooms().length; i++) {
					for (let j = 0; j < leftWall.getRooms()[i].getWalls().length; j++) {
						for(let k=0; k <  leftWall.getRooms()[i].getWalls()[j].getRooms().length; k++) {
							let tempRoom =  leftWall.getRooms()[i].getWalls()[j].getRooms()[k];
							let tempDirection = leftWall.getRooms()[i].getWalls()[j].getOrientations()[k];
					
							if(tempRoom==leftWall.getRooms()[i]&&tempDirection==leftWall.getOrientations()[i]) {
								tempRoom.setWall(j, leftWall);
								break;
							}
						}
					}
				}

				leftWall.addRoomWithOrientation(room, Direction.LEFT);

			} else {
				leftWall.addRoomWithOrientation(room, Direction.LEFT);
			}

			rightWall = new Wall(Direction.RIGHT, Type.OUTER, 0.08, room.getHeight(), roomUpperLeftX, roomUpperLeftY);
			if (rightWalls.length > 0) {
				for (let i = 0; i < rightWalls.length; i++) {
					for (let j = 0; j < rightWalls[i].getRooms().length; j++) {
						rightWall.addRoomWithOrientation(rightWalls[i].getRooms()[j], rightWalls[i].getOrientations()[j]);
					}
				}

				rightWall.setUpperLeftY(minY);
				rightWall.setLength(maxY - minY);

				for (let i = 0; i < rightWall.getRooms().length; i++) {
					for (let j = 0; j < rightWall.getRooms()[i].getWalls().length; j++) {
						for(let k=0; k <  rightWall.getRooms()[i].getWalls()[j].getRooms().length; k++) {
							let tempRoom =  rightWall.getRooms()[i].getWalls()[j].getRooms()[k];
							let tempDirection = rightWall.getRooms()[i].getWalls()[j].getOrientations()[k];
					
							if(tempRoom==rightWall.getRooms()[i]&&tempDirection==rightWall.getOrientations()[i]) {
								tempRoom.setWall(j, rightWall);
								break;
							}
						}
					}
				}

				rightWall.addRoomWithOrientation(room, Direction.RIGHT);

			} else {
				rightWall.addRoomWithOrientation(room, Direction.RIGHT);
			}

	

			if (!leftWall) {
				leftWall = new Wall(Direction.LEFT, Type.OUTER, 0.08, room.getHeight(), roomUpperLeftX, roomUpperLeftY);
				leftWall.addRoomWithOrientation(room, Direction.LEFT);
			}
			if (!rightWall) {
				rightWall = new Wall(Direction.RIGHT, Type.OUTER, 0.08, room.getHeight(), roomUpperLeftX, roomUpperLeftY);
				rightWall.addRoomWithOrientation(room, Direction.RIGHT);
			}
			if (!upWall) {
				upWall = new Wall(Direction.UP, Type.OUTER, 0.08, room.getWidth(), roomUpperLeftX, roomUpperLeftY);
				upWall.addRoomWithOrientation(room, Direction.UP);
			}
			if (!downWall) {
				downWall = new Wall(Direction.DOWN, Type.OUTER, 0.08, room.getWidth(), roomUpperLeftX, roomUpperLeftY);
				downWall.addRoomWithOrientation(room, Direction.DOWN);
			}

			room.setWalls([upWall, rightWall, leftWall, downWall]);
		}

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

	getWallGeometries(): WallGeometry<Square>[] {
		return this.wallGeometries;
	}

	getDrawingRooms(): Component[] {
		let components: Component[] = [];
		this.roomGeometries = [];
		this.wallGeometries = [];
		
		let wallSize = 0.05;

		for (let i = 0; i < this.rooms.length; i++) {
			let room = this.rooms[i];
			//the calculation of the properties of the room in square meter
			//the calculation of the room width to square meter
			let roomBorder = room.getRoomMValues()[4];
			let roomUpperLeftX = room.getRoomMValues()[0];
			let roomUpperLeftY = room.getRoomMValues()[1];
			let roomWidth = room.getWidth() * this.gridWidth;
			//the calculation of the room height to square meter
			let roomHeight = room.getHeight() * this.gridHeight;
			//the upper left x coordinate of the room
			roomUpperLeftX = (roomUpperLeftX) * this.gridWidth;
			//the upper right y coordinate of the room
			roomUpperLeftY = (roomUpperLeftY) * this.gridHeight;

			let v1 = this.convert2DPointTo3DWorld(roomUpperLeftX, roomUpperLeftY);
			let v2 = this.convert2DPointTo3DWorld(roomUpperLeftX + roomWidth, roomUpperLeftY);
			let v3 = this.convert2DPointTo3DWorld(roomUpperLeftX, roomUpperLeftY + roomHeight);
			let v4 = this.convert2DPointTo3DWorld(roomUpperLeftX + roomWidth, roomUpperLeftY + roomHeight);

			let square = new Square();
			square.createFromVec(
				vec3.fromValues(v1[0]+wallSize, v1[1]-wallSize, v1[2]),
				vec3.fromValues(v2[0], v2[1]-wallSize, v2[2]),
				vec3.fromValues(v3[0]+wallSize, v3[1], v3[2]),
				vec3.fromValues(v4[0], v4[1], v4[2]),
				vec4.fromValues(192, 192, 192, 1.0)
			);


			this.squares.push(square);

			components = [...components, ...square.getTriangles()];

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

				console.log(wallIsDrawed);

				if (!wallIsDrawed) {

					if (wall.getType() == Type.OUTER) {
						lineSize = 0.05;
					} else {
						lineSize = 0.05;
					}

					let v1, v2, v3, v4, v5;
					let wallSquare = new Square();
					let wallGeometry: WallGeometry<Square>;

					let wallOrientation: Direction;

					for (let k = 0; k < wall.getRooms().length; k++) {
						if (wall.getRooms()[k] == room) {
							wallOrientation = wall.getOrientations()[k];
							break;
						}
					}

					console.log(wallOrientation);

					if (wallOrientation == Direction.UP) {
						let roomUpperLeftX = room.getRoomMValues()[0];
						let roomUpperLeftY = room.getRoomMValues()[1];

						let wallWidth = wall.getLength() * this.gridWidth; 

						let wallUpperLeftX = (wall.getUpperLeftX()) * this.gridWidth;
						//the upper right y coordinate of the room
						let wallUpperLeftY = (roomUpperLeftY) * this.gridHeight;

						let point1 = this.convert2DPointTo3DWorld(wallUpperLeftX, wallUpperLeftY);
						let point2 = this.convert2DPointTo3DWorld(wallUpperLeftX + wallWidth, wallUpperLeftY);
					
						v1 = vec3.fromValues(point2[0], point2[1], 0.0);
						v2 = vec3.fromValues(point2[0], point2[1] - lineSize, 0.0);
						v3 = vec3.fromValues(point1[0] + lineSize, point1[1], 0.0);
						v4 = vec3.fromValues(point1[0] + lineSize, point1[1] - lineSize, 0.0);
						v5 = vec4.fromValues(0.0, 0.0, 0.0, 1.0);
						wallSquare.createFromVec(v1, v2, v3, v4, v5);
					} else if (wallOrientation == Direction.DOWN) {

						let roomUpperLeftX = room.getRoomMValues()[0];
						let roomUpperLeftY = room.getRoomMValues()[1];

						let wallWidth = wall.getLength() * this.gridWidth;

						let wallUpperLeftX = (wall.getUpperLeftX()) * this.gridWidth;
						//the upper right y coordinate of the room
						let wallUpperLeftY = (roomUpperLeftY + room.getHeight()) * this.gridHeight;

						let point1 = this.convert2DPointTo3DWorld(wallUpperLeftX, wallUpperLeftY);
						let point2 = this.convert2DPointTo3DWorld(wallUpperLeftX + wallWidth, wallUpperLeftY);

						v1 = vec3.fromValues(point2[0], point1[1], 0.0);
						v2 = vec3.fromValues(point2[0], point1[1] - lineSize, 0.0);
						v3 = vec3.fromValues(point1[0] + lineSize, point1[1], 0.0);
						v4 = vec3.fromValues(point1[0] + lineSize, point1[1] - lineSize, 0.0);
						v5 = vec4.fromValues(0.0, 0.0, 0.0, 1.0);

						wallSquare.createFromVec(v1, v2, v3, v4, v5);

					} else if (wallOrientation == Direction.LEFT) {
						let roomUpperLeftX = room.getRoomMValues()[0];
						let roomUpperLeftY = room.getRoomMValues()[1];

						let wallHeight = wall.getLength() * this.gridWidth;

						let wallUpperLeftX = (roomUpperLeftX) * this.gridWidth;
						//the upper right y coordinate of the room
						let wallUpperLeftY = (wall.getUpperLeftY()) * this.gridHeight;

						let point1 = this.convert2DPointTo3DWorld(wallUpperLeftX, wallUpperLeftY);
						let point2 = this.convert2DPointTo3DWorld(wallUpperLeftX, wallUpperLeftY + wallHeight);

						v1 = vec3.fromValues(point1[0] + lineSize, point1[1], 0.0);
						v2 = vec3.fromValues(point1[0], point1[1], 0.0);
						v3 = vec3.fromValues(point2[0], point2[1] - lineSize, 0.0);
						v4 = vec3.fromValues(point2[0] + lineSize, point2[1] - lineSize, 0.0);

						v5 = vec4.fromValues(0.0, 0.0, 0.0, 1.0);

						wallSquare.createFromVec(v1, v2, v3, v4, v5);
					} else if (wallOrientation == Direction.RIGHT) {
						let roomUpperLeftX = room.getRoomMValues()[0];
						let roomUpperLeftY = room.getRoomMValues()[1];

						let wallHeight = wall.getLength() * this.gridWidth;

						let wallUpperLeftX = (roomUpperLeftX + room.getWidth()) * this.gridWidth;
						
						let wallUpperLeftY = (wall.getUpperLeftY()) * this.gridHeight;
						let point1 = this.convert2DPointTo3DWorld(wallUpperLeftX, wallUpperLeftY);
						let point2 = this.convert2DPointTo3DWorld(wallUpperLeftX, wallUpperLeftY + wallHeight);

						v1 = vec3.fromValues(point1[0], point1[1], 0.0);
						v2 = vec3.fromValues(point1[0] + lineSize, point1[1], 0.0);
						v3 = vec3.fromValues(point2[0], point2[1] - lineSize, 0.0);
						v4 = vec3.fromValues(point2[0] + lineSize, point2[1] - lineSize, 0.0);

						v5 = vec4.fromValues(0.0, 0.0, 0.0, 1.0);

						wallSquare.createFromVec(v1, v2, v3, v4, v5);
					}

					wallGeometry = new WallGeometry(wall, wallSquare);
					components = [...components, ...wallSquare.getTriangles()];
					this.wallGeometries.push(wallGeometry);

				}
				console.log(this.wallGeometries.length);
			
			}

			this.roomGeometries.push(new RoomGeometry(room, square));

			//door
			for (let j = 0; j < this.rooms[i].getRoomDoors().length; j++) {
				for (let k = 0; k < this.rooms[i].getRoomDoors()[j].getTriangles().length; k++) {

				}
				components = [...components, ...this.rooms[i].getRoomDoors()[j].getTriangles()];
			}

			//window
			for (let j = 0; j < this.rooms[i].getRoomWindows().length; j++) {
				for (let k = 0; k < this.rooms[i].getRoomWindows()[j].getTriangles().length; k++) {

				}
				components = [...components, ...this.rooms[i].getRoomWindows()[j].getTriangles()];
			}
			//text
			let screenPointFrom = this.convert3DPointToScreen(
				vec4.fromValues(
					this.rooms[i].getSquares()[0].getLeftUpperCoordinate()[0],
					this.rooms[i].getSquares()[0].getLeftUpperCoordinate()[1],
					this.rooms[i].getSquares()[0].getLeftUpperCoordinate()[2],
					1.0)
			);
			let screenPointTo = this.convert3DPointToScreen(
				vec4.fromValues(
					this.rooms[i].getSquares()[0].getRightLowerCoordinate()[0],
					this.rooms[i].getSquares()[0].getRightLowerCoordinate()[1],
					this.rooms[i].getSquares()[0].getRightLowerCoordinate()[2],
					1.0)
			);

			let lines = [];
			let xCoords = [];
			let yCoords = [];
			lines.push(this.rooms[i].getRoomName() + "");
			lines.push(this.rooms[i].getSquareMeter() + " m2 ");

			xCoords.push((screenPointFrom[0] + screenPointTo[0]) / 2);
			xCoords.push((screenPointFrom[0] + screenPointTo[0]) / 2);

			yCoords.push(((screenPointFrom[1] + screenPointTo[1]) / 2) - 6);
			yCoords.push(((screenPointFrom[1] + screenPointTo[1]) / 2) + 6);

			let multiLineText: MultiLineText = new MultiLineText(lines, xCoords, yCoords);

			components = [...components, multiLineText];

		}
		return components;
	}

	isGrid(): boolean {
		return this.grid;
	}
	setGrid(grid: boolean) {
		this.grid = grid;
	}
	//this method creates the gid 
	//one grid piece means one square meter
	getGrid(): LineGrid[] {
		let colors = [];
		let vertices = [];
		let color = [0, 0, 0, 0.3];
		for (var i = 0; i < 2000; i = i + 50) {
			colors = colors.concat(color);
			let v = this.convert2DPointTo3DWorld(i, 0);
			vertices = vertices.concat([v[0], v[1], v[2]]);
			v = this.convert2DPointTo3DWorld(i, 800);
			vertices = vertices.concat([v[0], v[1], v[2]]);
			colors = colors.concat(color);
			colors = colors.concat(color);
			v = this.convert2DPointTo3DWorld(0, i);
			vertices = vertices.concat([v[0], v[1], v[2]]);
			v = this.convert2DPointTo3DWorld(1000, i);
			vertices = vertices.concat([v[0], v[1], v[2]]);
			colors = colors.concat(color);
		}
		//return [vertices, colors];

		return [new LineGrid(vertices, colors)];
	}
}