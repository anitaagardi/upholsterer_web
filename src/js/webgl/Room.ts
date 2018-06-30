import { Square } from './Square';
import { Triangle } from './Triangle';
import { vec3, vec4, mat3, mat4 } from 'gl-matrix';
import { Wall } from './Wall';
/*
The room consist of the basic room  and the border of the room.
The basic room consits of one Square.
The border consists of four sqare. The upper the lower the right and the left square.
The border has also line size (this means the border size - so the width of the border)
The squares consist of two triangles.

The user must give the width, height of the room, and the upper coordinates (x and y components), the size of the border, and the name of the room.
The user can also add doors to the room. The door consists of one sqare.
Other components calculated by the algorithm.

*/
export class Room {
	//the basic room
	private basicSquare: Square;
	//the border of the room
	//the upper border
	private upperSquare: Square;
	//the lower border
	private lowerSquare: Square;
	//the left border
	private leftSquare: Square;
	//the right border
	private rightSquare: Square;
	//the size of the border
	private lineSize: number;
	private squares: Square[] = [];
	//the name of the room - it can be seen also in the browser
	private roomName: string;
	//the sqare meter of the room - it can be seen also in the browser and it is calculated by the width and height of the room
	private squareMeter: number;
	//the height of the room
	private roomHeight: number;
	//the width of the room
	private roomWidth: number;
	private roomMValues: number[];
	//the doors of the room
	private roomDoors: Square[] = [];
	//the windows of the room
	private roomWindows: Square[] = [];
	
	private walls:Wall[] = [];
	
	//the constructor initialize the basic square, the line size, the width and height of the room, the sqaremeter,  and other values
	constructor(square: Square, lineSize: number, roomName: string, width: number, height: number, squareMeter: number, roomMValues: number[]) {
		this.basicSquare = square;
		this.lineSize = lineSize;
		this.roomName = roomName;
		this.squareMeter = squareMeter;
		this.roomHeight = height;
		this.roomWidth = width;
		this.roomMValues = roomMValues;
		/*
		let v1 = vec3.fromValues(square.getRightUpperCoordinate()[0] + lineSize, square.getRightUpperCoordinate()[1] + lineSize, 0.0);
		let v2 = vec3.fromValues(square.getRightUpperCoordinate()[0] + lineSize, square.getRightUpperCoordinate()[1], 0.0);
		let v3 = vec3.fromValues(square.getLeftUpperCoordinate()[0] - lineSize, square.getLeftUpperCoordinate()[1] + lineSize, 0.0);
		let v4 = vec3.fromValues(square.getLeftUpperCoordinate()[0] - lineSize, square.getLeftUpperCoordinate()[1], 0.0);
		let v5 = vec4.fromValues(0.0, 0.0, 0.0, 1.0);
		this.upperSquare = new Square();
		this.upperSquare.createFromVec(v1, v2, v3, v4, v5);
		v1 = vec3.fromValues(square.getRightLowerCoordinate()[0] + lineSize, square.getRightLowerCoordinate()[1], 0.0);
		v2 = vec3.fromValues(square.getRightLowerCoordinate()[0] + lineSize, square.getRightLowerCoordinate()[1] - lineSize, 0.0);
		v3 = vec3.fromValues(square.getLeftLowerCoordinate()[0] - lineSize, square.getLeftLowerCoordinate()[1], 0.0);
		v4 = vec3.fromValues(square.getLeftLowerCoordinate()[0] - lineSize, square.getLeftLowerCoordinate()[1] - lineSize, 0.0);
		v5 = vec4.fromValues(0.0, 0.0, 0.0, 1.0)
		this.lowerSquare = new Square();
		this.lowerSquare.createFromVec(v1, v2, v3, v4, v5);
		v1 = vec3.fromValues(square.getLeftUpperCoordinate()[0] - lineSize, square.getLeftUpperCoordinate()[1] + lineSize, 0.0);
		v2 = vec3.fromValues(square.getLeftUpperCoordinate()[0], square.getLeftUpperCoordinate()[1] + lineSize, 0.0);
		v3 = vec3.fromValues(square.getLeftLowerCoordinate()[0], square.getLeftLowerCoordinate()[1] - lineSize, 0.0);
		v4 = vec3.fromValues(square.getLeftLowerCoordinate()[0] - lineSize, square.getLeftLowerCoordinate()[1] - lineSize, 0.0);
		v5 = vec4.fromValues(0.0, 0.0, 0.0, 1.0);
		this.leftSquare = new Square();
		this.leftSquare.createFromVec(v1, v2, v3, v4, v5);
		v1 = vec3.fromValues(square.getRightUpperCoordinate()[0] + lineSize, square.getRightUpperCoordinate()[1] + lineSize, 0.0);
		v2 = vec3.fromValues(square.getRightUpperCoordinate()[0], square.getRightUpperCoordinate()[1] + lineSize, 0.0);
		v3 = vec3.fromValues(square.getRightLowerCoordinate()[0], square.getRightLowerCoordinate()[1] - lineSize, 0.0);
		v4 = vec3.fromValues(square.getRightLowerCoordinate()[0] + lineSize, square.getRightLowerCoordinate()[1] - lineSize, 0.0);
		v5 = vec4.fromValues(0.0, 0.0, 0.0, 1.0);
		this.rightSquare = new Square();
		this.rightSquare.createFromVec(v1, v2, v3, v4, v5);
		*/
	}
	//this method returns to the basic room and the compoments of the border
	getSquares(): Square[] {
		this.squares[0] = this.basicSquare;
		this.squares[1] = this.upperSquare;
		this.squares[2] = this.lowerSquare;
		this.squares[3] = this.leftSquare;
		this.squares[4] = this.rightSquare;
		return this.squares;
	}
	//this method removes one door (the user can add and remove door dynamically to the room)
	removeDoor(direction, size, beginX, beginY) {
		let begin;
		if (direction == "left" || direction == "right") {
			begin = beginY;
		} else {
			begin = beginX;
		}
		if (direction == "left") {
			let s = new Square();
			let v1 = vec3.fromValues(this.getBasicSquare().getLeftUpperCoordinate()[0] - this.lineSize, begin, 0.0);
			let v2 = vec3.fromValues(this.getBasicSquare().getLeftUpperCoordinate()[0], begin, 0.0);
			let v3 = vec3.fromValues(this.getBasicSquare().getLeftLowerCoordinate()[0], begin + size, 0.0);
			let v4 = vec3.fromValues(this.getBasicSquare().getLeftLowerCoordinate()[0] - this.lineSize, begin + size, 0.0);
			let v5 = vec4.fromValues(220 / 255.0, 220 / 255.0, 220 / 255.0, 1.0);
			s.createFromVec(v1, v2, v3, v4, v5);
			let index = this.containsDoor(s);
			if (index != -1) {
				this.roomDoors.splice(index, 1);
			}
		}
		if (direction == "right") {
			let y = (this.rightSquare[2] + this.rightSquare[3]) / 2.5;
			let s = new Square();
			let v1 = vec3.fromValues(this.getBasicSquare().getRightUpperCoordinate()[0] + this.lineSize, begin, 0.0);
			let v2 = vec3.fromValues(this.getBasicSquare().getRightUpperCoordinate()[0], begin, 0.0);
			let v3 = vec3.fromValues(this.getBasicSquare().getRightLowerCoordinate()[0], begin + size, 0.0);
			let v4 = vec3.fromValues(this.getBasicSquare().getRightLowerCoordinate()[0] + this.lineSize, begin + size, 0.0);
			let v5 = vec4.fromValues(220 / 255.0, 220 / 255.0, 220 / 255.0, 1.0);
			s.createFromVec(v1, v2, v3, v4, v5);
			let index = this.containsDoor(s);
			if (index != -1) {
				this.roomDoors.splice(index, 1);
			}
		}
		if (direction == "upper") {
			let s = new Square();
			let v1 = vec3.fromValues(begin, this.getBasicSquare().getRightUpperCoordinate()[1] + this.lineSize, 0.0);
			let v2 = vec3.fromValues(begin, this.getBasicSquare().getRightUpperCoordinate()[1], 0.0);
			let v3 = vec3.fromValues(begin + size, this.getBasicSquare().getLeftUpperCoordinate()[1] + this.lineSize, 0.0);
			let v4 = vec3.fromValues(begin + size, this.getBasicSquare().getLeftUpperCoordinate()[1], 0.0);
			let v5 = vec4.fromValues(220 / 255.0, 220 / 255.0, 220 / 255.0, 1.0);
			s.createFromVec(v1, v2, v3, v4, v5);
			let index = this.containsDoor(s);
			if (index != -1) {
				this.roomDoors.splice(index, 1);
			}
		}
		if (direction == "lower") {
			let s = new Square();
			let v1 = vec3.fromValues(begin, this.getBasicSquare().getRightLowerCoordinate()[1], 0.0);
			let v2 = vec3.fromValues(begin, this.getBasicSquare().getRightLowerCoordinate()[1] - this.lineSize, 0.0);
			let v3 = vec3.fromValues(begin + size, this.getBasicSquare().getLeftLowerCoordinate()[1], 0.0);
			let v4 = vec3.fromValues(begin + size, this.getBasicSquare().getLeftLowerCoordinate()[1] - this.lineSize, 0.0);
			let v5 = vec4.fromValues(220 / 255.0, 220 / 255.0, 220 / 255.0, 1.0);
			s.createFromVec(v1, v2, v3, v4, v5);
			let index = this.containsDoor(s);
			if (index != -1) {
				this.roomDoors.splice(index, 1);
			}
		}
	}
	//removes one door from the room (the user can dynamically add and delete doors to room)
	removeWindow(direction, size, beginX, beginY) {
		let begin;
		if (direction == "left" || direction == "right") {
			begin = beginY;
		} else {
			begin = beginX;
		}
		if (direction == "left") {
			let s = new Square();
			let v1 = vec3.fromValues(this.getBasicSquare().getLeftUpperCoordinate()[0] - this.lineSize, begin, 0.0);
			let v2 = vec3.fromValues(this.getBasicSquare().getLeftUpperCoordinate()[0], begin, 0.0);
			let v3 = vec3.fromValues(this.getBasicSquare().getLeftLowerCoordinate()[0], begin + size, 0.0);
			let v4 = vec3.fromValues(this.getBasicSquare().getLeftLowerCoordinate()[0] - this.lineSize, begin + size, 0.0);
			let v5 = vec4.fromValues(152 / 255.0, 152 / 255.0, 152 / 255.0, 1.0);
			s.createFromVec(v1, v2, v3, v4, v5);
			let index = this.containsWindow(s);
			if (index != -1) {
				this.roomWindows.splice(index, 1);
			}
		}
		if (direction == "right") {
			let y = (this.rightSquare[2] + this.rightSquare[3]) / 2.5;
			let s = new Square();
			let v1 = vec3.fromValues(this.getBasicSquare().getRightUpperCoordinate()[0] + this.lineSize, begin, 0.0);
			let v2 = vec3.fromValues(this.getBasicSquare().getRightUpperCoordinate()[0], begin, 0.0);
			let v3 = vec3.fromValues(this.getBasicSquare().getRightLowerCoordinate()[0], begin + size, 0.0);
			let v4 = vec3.fromValues(this.getBasicSquare().getRightLowerCoordinate()[0] + this.lineSize, begin + size, 0.0);
			let v5 = vec4.fromValues(152 / 255.0, 152 / 255.0, 152 / 255.0, 1.0);
			s.createFromVec(v1, v2, v3, v4, v5);
			let index = this.containsWindow(s);
			if (index != -1) {
				this.roomWindows.splice(index, 1);
			}
		}
		if (direction == "upper") {
			let s = new Square();
			let v1 = vec3.fromValues(begin, this.getBasicSquare().getRightUpperCoordinate()[1] + this.lineSize, 0.0);
			let v2 = vec3.fromValues(begin, this.getBasicSquare().getRightUpperCoordinate()[1], 0.0);
			let v3 = vec3.fromValues(begin + size, this.getBasicSquare().getLeftUpperCoordinate()[1] + this.lineSize, 0.0);
			let v4 = vec3.fromValues(begin + size, this.getBasicSquare().getLeftUpperCoordinate()[1], 0.0);
			let v5 = vec4.fromValues(152 / 255.0, 152 / 255.0, 152 / 255.0, 1.0);
			s.createFromVec(v1, v2, v3, v4, v5);
			let index = this.containsWindow(s);
			if (index != -1) {
				this.roomWindows.splice(index, 1);
			}
		}
		if (direction == "lower") {
			let s = new Square();
			let v1 = vec3.fromValues(begin, this.getBasicSquare().getRightLowerCoordinate()[1], 0.0);
			let v2 = vec3.fromValues(begin, this.getBasicSquare().getRightLowerCoordinate()[1] - this.lineSize, 0.0);
			let v3 = vec3.fromValues(begin + size, this.getBasicSquare().getLeftLowerCoordinate()[1], 0.0);
			let v4 = vec3.fromValues(begin + size, this.getBasicSquare().getLeftLowerCoordinate()[1] - this.lineSize, 0.0);
			let v5 = vec4.fromValues(152 / 255.0, 152 / 255.0, 152 / 255.0, 1.0);
			s.createFromVec(v1, v2, v3, v4, v5);
			let index = this.containsWindow(s);
			if (index != -1) {
				this.roomWindows.splice(index, 1);
			}
		}
	}
	//add one door to the room (the user can dynamically add and delete doors to the room)
	addDoor(direction, size, beginX, beginY) {
		let begin;
		if (direction == "left" || direction == "right") {
			begin = beginY;
		} else {
			begin = beginX;
		}
		if (direction == "left") {
			let s = new Square();
			let v1 = vec3.fromValues(this.getBasicSquare().getLeftUpperCoordinate()[0] - this.lineSize, begin, 0.0);
			let v2 = vec3.fromValues(this.getBasicSquare().getLeftUpperCoordinate()[0], begin, 0.0);
			let v3 = vec3.fromValues(this.getBasicSquare().getLeftLowerCoordinate()[0], begin + size, 0.0);
			let v4 = vec3.fromValues(this.getBasicSquare().getLeftLowerCoordinate()[0] - this.lineSize, begin + size, 0.0);
			let v5 = vec4.fromValues(220 / 255.0, 220 / 255.0, 220 / 255.0, 1.0);
			s.createFromVec(v1, v2, v3, v4, v5);
			if (this.containsDoor(s) == -1 && this.containsWindow(s) == -1) {
				this.roomDoors.push(s);
			}
		}
		if (direction == "right") {
			let y = (this.rightSquare[2] + this.rightSquare[3]) / 2.5;
			let s = new Square();
			let v1 = vec3.fromValues(this.getBasicSquare().getRightUpperCoordinate()[0] + this.lineSize, begin, 0.0);
			let v2 = vec3.fromValues(this.getBasicSquare().getRightUpperCoordinate()[0], begin, 0.0);
			let v3 = vec3.fromValues(this.getBasicSquare().getRightLowerCoordinate()[0], begin + size, 0.0);
			let v4 = vec3.fromValues(this.getBasicSquare().getRightLowerCoordinate()[0] + this.lineSize, begin + size, 0.0);
			let v5 = vec4.fromValues(220 / 255.0, 220 / 255.0, 220 / 255.0, 1.0);
			s.createFromVec(v1, v2, v3, v4, v5);
			if (this.containsDoor(s) == -1 && this.containsWindow(s) == -1) {
				this.roomDoors.push(s);
			}
		}
		if (direction == "upper") {
			let s = new Square();
			let v1 = vec3.fromValues(begin, this.getBasicSquare().getRightUpperCoordinate()[1] + this.lineSize, 0.0);
			let v2 = vec3.fromValues(begin, this.getBasicSquare().getRightUpperCoordinate()[1], 0.0);
			let v3 = vec3.fromValues(begin + size, this.getBasicSquare().getLeftUpperCoordinate()[1] + this.lineSize, 0.0);
			let v4 = vec3.fromValues(begin + size, this.getBasicSquare().getLeftUpperCoordinate()[1], 0.0);
			let v5 = vec4.fromValues(220 / 255.0, 220 / 255.0, 220 / 255.0, 1.0);
			s.createFromVec(v1, v2, v3, v4, v5);
			if (this.containsDoor(s) == -1 && this.containsWindow(s) == -1) {
				this.roomDoors.push(s);
			}
		}
		if (direction == "lower") {
			let s = new Square();
			let v1 = vec3.fromValues(begin, this.getBasicSquare().getRightLowerCoordinate()[1], 0.0);
			let v2 = vec3.fromValues(begin, this.getBasicSquare().getRightLowerCoordinate()[1] - this.lineSize, 0.0);
			let v3 = vec3.fromValues(begin + size, this.getBasicSquare().getLeftLowerCoordinate()[1], 0.0);
			let v4 = vec3.fromValues(begin + size, this.getBasicSquare().getLeftLowerCoordinate()[1] - this.lineSize, 0.0);
			let v5 = vec4.fromValues(220 / 255.0, 220 / 255.0, 220 / 255.0, 1.0);
			s.createFromVec(v1, v2, v3, v4, v5);
			if (this.containsDoor(s) == -1 && this.containsWindow(s) == -1) {
				this.roomDoors.push(s);
			}
		}
	}
	//add one window to the room (the user can dynamically add and remove doors to the room)
	addWindow(direction, size, beginX, beginY) {
		let begin;
		if (direction == "left" || direction == "right") {
			begin = beginY;
		} else {
			begin = beginX;
		}
		if (direction == "left") {
			let s = new Square();
			let v1 = vec3.fromValues(this.getBasicSquare().getLeftUpperCoordinate()[0] - this.lineSize, begin, 0.0);
			let v2 = vec3.fromValues(this.getBasicSquare().getLeftUpperCoordinate()[0], begin, 0.0);
			let v3 = vec3.fromValues(this.getBasicSquare().getLeftLowerCoordinate()[0], begin + size, 0.0);
			let v4 = vec3.fromValues(this.getBasicSquare().getLeftLowerCoordinate()[0] - this.lineSize, begin + size, 0.0);
			let v5 = vec4.fromValues(152 / 255.0, 152 / 255.0, 152 / 255.0, 1.0);
			s.createFromVec(v1, v2, v3, v4, v5);
			if (this.containsDoor(s) == -1 && this.containsWindow(s) == -1) {
				this.roomWindows.push(s);
			}
		}
		if (direction == "right") {
			let y = (this.rightSquare[2] + this.rightSquare[3]) / 2.5;
			let s = new Square();
			let v1 = vec3.fromValues(this.getBasicSquare().getRightUpperCoordinate()[0] + this.lineSize, begin, 0.0);
			let v2 = vec3.fromValues(this.getBasicSquare().getRightUpperCoordinate()[0], begin, 0.0);
			let v3 = vec3.fromValues(this.getBasicSquare().getRightLowerCoordinate()[0], begin + size, 0.0);
			let v4 = vec3.fromValues(this.getBasicSquare().getRightLowerCoordinate()[0] + this.lineSize, begin + size, 0.0);
			let v5 = vec4.fromValues(152 / 255.0, 152 / 255.0, 152 / 255.0, 1.0);
			s.createFromVec(v1, v2, v3, v4, v5);
			if (this.containsDoor(s) == -1 && this.containsWindow(s) == -1) {
				this.roomWindows.push(s);
			}
		}
		if (direction == "upper") {
			let s = new Square();
			let v1 = vec3.fromValues(begin, this.getBasicSquare().getRightUpperCoordinate()[1] + this.lineSize, 0.0);
			let v2 = vec3.fromValues(begin, this.getBasicSquare().getRightUpperCoordinate()[1], 0.0);
			let v3 = vec3.fromValues(begin + size, this.getBasicSquare().getLeftUpperCoordinate()[1] + this.lineSize, 0.0);
			let v4 = vec3.fromValues(begin + size, this.getBasicSquare().getLeftUpperCoordinate()[1], 0.0);
			let v5 = vec4.fromValues(152 / 255.0, 152 / 255.0, 152 / 255.0, 1.0);
			s.createFromVec(v1, v2, v3, v4, v5);
			if (this.containsDoor(s) == -1 && this.containsWindow(s) == -1) {
				this.roomWindows.push(s);
			}
		}
		if (direction == "lower") {
			let s = new Square();
			let v1 = vec3.fromValues(begin, this.getBasicSquare().getRightLowerCoordinate()[1], 0.0);
			let v2 = vec3.fromValues(begin, this.getBasicSquare().getRightLowerCoordinate()[1] - this.lineSize, 0.0);
			let v3 = vec3.fromValues(begin + size, this.getBasicSquare().getLeftLowerCoordinate()[1], 0.0);
			let v4 = vec3.fromValues(begin + size, this.getBasicSquare().getLeftLowerCoordinate()[1] - this.lineSize, 0.0);
			let v5 = vec4.fromValues(152 / 255.0, 152 / 255.0, 152 / 255.0, 1.0);
			s.createFromVec(v1, v2, v3, v4, v5);
			if (this.containsDoor(s) == -1 && this.containsWindow(s) == -1) {
				this.roomWindows.push(s);
			}
		}
	}
	//if the room contains the door (the argument of the method) return the index, else returns -1
	containsDoor(door: Square): number {
		for (let i = 0; i < this.roomDoors.length; i++) {
			if (!(door.getLeftLowerCoordinate()[0] > this.roomDoors[i].getRightUpperCoordinate()[0]
				|| door.getRightUpperCoordinate()[0] < this.roomDoors[i].getLeftLowerCoordinate()[0]
				|| door.getLeftLowerCoordinate()[1] > this.roomDoors[i].getRightUpperCoordinate()[1]
				|| door.getRightUpperCoordinate()[1] < this.roomDoors[i].getLeftLowerCoordinate()[1])) {
				//if we found the door than returns to the index
				return i;
			} else if (
				!(this.roomDoors[i].getLeftLowerCoordinate()[0] > door.getRightUpperCoordinate()[0]
					|| this.roomDoors[i].getRightUpperCoordinate()[0] < door.getLeftLowerCoordinate()[0]
					|| this.roomDoors[i].getLeftLowerCoordinate()[1] > door.getRightUpperCoordinate()[1]
					|| this.roomDoors[i].getRightUpperCoordinate()[1] < door.getLeftLowerCoordinate()[1]
				)) {
				//if we found the door than returns to the index
				return i;
			}
		}
		//if we did not found the door than returns -1
		return -1;
	}
	//if the room contains the window (the argument of the method) return the index else return -1
	containsWindow(window: Square): number {
		for (let i = 0; i < this.roomWindows.length; i++) {
			if (!(window.getLeftLowerCoordinate()[0] > this.roomWindows[i].getRightUpperCoordinate()[0]
				|| window.getRightUpperCoordinate()[0] < this.roomWindows[i].getLeftLowerCoordinate()[0]
				|| window.getLeftLowerCoordinate()[1] > this.roomWindows[i].getRightUpperCoordinate()[1]
				|| window.getRightUpperCoordinate()[1] < this.roomWindows[i].getLeftLowerCoordinate()[1])) {
				//if we found the window the returns to the index
				return i;
			} else if (
				!(this.roomWindows[i].getLeftLowerCoordinate()[0] > window.getRightUpperCoordinate()[0]
					|| this.roomWindows[i].getRightUpperCoordinate()[0] < window.getLeftLowerCoordinate()[0]
					|| this.roomWindows[i].getLeftLowerCoordinate()[1] > window.getRightUpperCoordinate()[1]
					|| this.roomWindows[i].getRightUpperCoordinate()[1] < window.getLeftLowerCoordinate()[1]
				)) {
				//if we found the window the returns to the index
				return i;
			}
		}
		//if we did not find the window returns -1
		return -1;
	}
	//returns the doors of the room
	getRoomDoors(): Square[] {
		return this.roomDoors;
	}
	//returns the window of the room
	getRoomWindows(): Square[] {
		return this.roomWindows;
	}
	setRoomDoors(roomDors: Square[]) {
		this.roomDoors = roomDors;
	}
	setRoomWindows(roomWindows: Square[]) {
		this.roomWindows = roomWindows;
	}
	//returns the name of the room
	getRoomName(): String {
		return this.roomName;
	}
	//returns the sqare meter of the room
	getSquareMeter(): number {
		return this.squareMeter;
	}
	//returns the width of the room
	getWidth(): number {
		return this.roomWidth;
	}
	//returns the height of the room
	getHeight(): number {
		return this.roomHeight;
	}
	//returns the border of the room
	getRoomBorder(): number {
		return this.lineSize;
	}
	//returns some settings of the room
	getRoomMValues(): number[] {
		return this.roomMValues;
	}
	//returns the basic of the room
	getBasicSquare(): Square {
		return this.basicSquare;
	}
	getLineSize():number{
		return this.lineSize;
	}

	getWalls():Wall[] {
		return this.walls;
	}

	setWalls(walls:Wall[]) {
		this.walls = walls;
	}

	setWall(index:number, wall:Wall) {
		this.walls[index]=wall;
	}

	equals(anotherRoom: Room): boolean {
		if (anotherRoom.getRoomName() == this.getRoomName() && anotherRoom.getSquares()[0] == this.getSquares()[0] && anotherRoom.getSquares()[1] == this.getSquares()[1] && anotherRoom.getSquares()[2] == this.getSquares()[2] && anotherRoom.getSquares()[3] == this.getSquares()[3] && anotherRoom.getSquares()[4] == this.getSquares()[4] && anotherRoom.getLineSize() == this.lineSize && anotherRoom.getWidth() == this.getWidth() && anotherRoom.getHeight() == this.getHeight() && anotherRoom.getSquareMeter() == this.getSquareMeter()) {
			return true;
		} else {
			return false;
		}
	}
	//if the room contains another room (the argument of the method) returns the index, else returns -1
	//this method is good if we want to create new rooms
	//if any room contains the room (which we want to create) than we cannot create the room
	contains(rooms: Room[]): number {

		/*for (var i = 0; i < rooms.length; i++) {
			if (!(this.getSquares()[2].getLeftLowerCoordinate()[0] > rooms[i].getSquares()[1].getRightUpperCoordinate()[0]
				|| this.getSquares()[1].getRightUpperCoordinate()[0] < rooms[i].getSquares()[2].getLeftLowerCoordinate()[0]
				|| this.getSquares()[2].getLeftLowerCoordinate()[1] > rooms[i].getSquares()[1].getRightUpperCoordinate()[1]
				|| this.getSquares()[1].getRightUpperCoordinate()[1] < rooms[i].getSquares()[2].getLeftLowerCoordinate()[1])) {
				//if the room contains another existing room returns the index of the existing room 
				return i;
			} else if (
				!(rooms[i].getSquares()[2].getLeftLowerCoordinate()[0] > this.getSquares()[1].getRightUpperCoordinate()[0]
					|| rooms[i].getSquares()[1].getRightUpperCoordinate()[0] < this.getSquares()[2].getLeftLowerCoordinate()[0]
					|| rooms[i].getSquares()[2].getLeftLowerCoordinate()[1] > this.getSquares()[1].getRightUpperCoordinate()[1]
					|| rooms[i].getSquares()[1].getRightUpperCoordinate()[1] < this.getSquares()[2].getLeftLowerCoordinate()[1]
				)) {
				//if the room contains another existing room returns the index of the existing room 
				return i;
			}
		}*/
		//if the room does not contain another existing room returns -1 
		return -1;
	}
	//we can modify a room (the components of the room)
	modifyAll(rooms: Room[]) {
		for (var i = 0; i < rooms.length; i++) {
			let isContains = false;
			if (!(this.getSquares()[2].getLeftLowerCoordinate()[0] > rooms[i].getSquares()[1].getRightUpperCoordinate()[0]
				|| this.getSquares()[1].getRightUpperCoordinate()[0] < rooms[i].getSquares()[2].getLeftLowerCoordinate()[0]
				|| this.getSquares()[2].getLeftLowerCoordinate()[1] > rooms[i].getSquares()[1].getRightUpperCoordinate()[1]
				|| this.getSquares()[1].getRightUpperCoordinate()[1] < rooms[i].getSquares()[2].getLeftLowerCoordinate()[1])) {
				//if the room (the argument of the method) contains another room, so if the room exists
				isContains = true;
			} else if (
				!(rooms[i].getSquares()[2].getLeftLowerCoordinate()[0] > this.getSquares()[1].getRightUpperCoordinate()[0]
					|| rooms[i].getSquares()[1].getRightUpperCoordinate()[0] < this.getSquares()[2].getLeftLowerCoordinate()[0]
					|| rooms[i].getSquares()[2].getLeftLowerCoordinate()[1] > this.getSquares()[1].getRightUpperCoordinate()[1]
					|| rooms[i].getSquares()[1].getRightUpperCoordinate()[1] < this.getSquares()[2].getLeftLowerCoordinate()[1]
				)) {
				//if the room (the argument of the method) contains another room, so if the room exists
				isContains = true;
			}
			if (isContains) {
				let count = 0;
				if (this.getSquares()[0].getLeftLowerCoordinate()[0] < rooms[i].getSquares()[0].getRightUpperCoordinate()[0] && this.getSquares()[0].getLeftLowerCoordinate()[1] < rooms[i].getSquares()[0].getRightUpperCoordinate()[1]) {
					rooms[i].getSquares()[0].getRightUpperCoordinate()[0] = this.getSquares()[0].getLeftLowerCoordinate()[0];
					rooms[i].getSquares()[0].getRightUpperCoordinate()[1] = this.getSquares()[0].getLeftLowerCoordinate()[1];
					count++;
				}
				if (this.getSquares()[0].getRightUpperCoordinate()[0] > rooms[i].getSquares()[0].getLeftLowerCoordinate()[0] && this.getSquares()[0].getRightUpperCoordinate()[1] > rooms[i].getSquares()[0].getLeftLowerCoordinate()[1]) {
					rooms[i].getSquares()[0].getLeftLowerCoordinate()[0] = this.getSquares()[0].getRightUpperCoordinate()[0];
					rooms[i].getSquares()[0].getLeftLowerCoordinate()[1] = this.getSquares()[0].getRightUpperCoordinate()[1];
					count++;
				}
				if (this.getSquares()[0].getLeftUpperCoordinate()[0] > rooms[i].getSquares()[0].getRightLowerCoordinate()[0] && this.getSquares()[0].getLeftUpperCoordinate()[1] > rooms[i].getSquares()[0].getRightLowerCoordinate()[1]) {
					rooms[i].getSquares()[0].getRightLowerCoordinate()[0] = this.getSquares()[0].getLeftUpperCoordinate()[0];
					rooms[i].getSquares()[0].getRightLowerCoordinate()[1] = this.getSquares()[0].getLeftUpperCoordinate()[1];
					count++;
				}
				if (this.getSquares()[0].getRightLowerCoordinate()[0] < rooms[i].getSquares()[0].getLeftUpperCoordinate()[0] && this.getSquares()[0].getRightLowerCoordinate()[1] < rooms[i].getSquares()[0].getLeftUpperCoordinate()[1]) {
					rooms[i].getSquares()[0].getLeftUpperCoordinate()[0] = this.getSquares()[0].getRightLowerCoordinate()[0];
					rooms[i].getSquares()[0].getLeftUpperCoordinate()[1] = this.getSquares()[0].getRightLowerCoordinate()[1];
					count++;
				}
				if (count != 4) {
					rooms[i] = new Room(rooms[i].getSquares()[0], rooms[i].getLineSize(), rooms[i].getRoomName() + "", rooms[i].getWidth(), rooms[i].getHeight(), rooms[i].getSquareMeter(), rooms[i].getRoomMValues());
				} if (count == 4) {
					rooms.splice(i, 1);
				}
			}
		}
		rooms.push(this);
	}

}