import { Square } from './Square';
import { Triangle } from './Triangle';
import { vec3, vec4, mat3, mat4 } from 'gl-matrix';

export class Room {
	private basic_square: Square;
	private upper_square: Square;
	private lower_square: Square;
	private left_square: Square;
	private right_square: Square;
	private line_size: number;
	private m_squares: Square[] = [];
	private room_Name: string;
	private square_meter: number;
	private room_Height: number;
	private room_Width: number;
	private room_MValues: number[];
	private m_room_doors: Square[] = [];
	private m_room_windows: Square[] = [];
	constructor(square: Square, line_size: number, roomName: string, width: number, height: number, squareMeter: number, roomMValues: number[]) {
		this.basic_square = square;
		this.line_size = line_size;
		this.room_Name = roomName;
		this.square_meter = squareMeter;
		this.room_Height = height;
		this.room_Width = width;
		this.room_MValues = roomMValues;
		let v1 = vec3.fromValues(square.rightUpperCoordinate[0] + line_size, square.rightUpperCoordinate[1] + line_size, 0.0);
		let v2 = vec3.fromValues(square.rightUpperCoordinate[0] + line_size, square.rightUpperCoordinate[1], 0.0);
		let v3 = vec3.fromValues(square.leftUpperCoordinate[0] - line_size, square.leftUpperCoordinate[1] + line_size, 0.0);
		let v4 = vec3.fromValues(square.leftUpperCoordinate[0] - line_size, square.leftUpperCoordinate[1], 0.0);
		let v5 = vec4.fromValues(0.0, 0.0, 0.0, 1.0)


		this.upper_square = new Square();
		this.upper_square.createFromVec(v1, v2, v3, v4, v5);

		v1 = vec3.fromValues(square.rightLowerCoordinate[0] + line_size, square.rightLowerCoordinate[1], 0.0);
		v2 = vec3.fromValues(square.rightLowerCoordinate[0] + line_size, square.rightLowerCoordinate[1] - line_size, 0.0);
		v3 = vec3.fromValues(square.leftLowerCoordinate[0] - line_size, square.leftLowerCoordinate[1], 0.0);
		v4 = vec3.fromValues(square.leftLowerCoordinate[0] - line_size, square.leftLowerCoordinate[1] - line_size, 0.0);
		v5 = vec4.fromValues(0.0, 0.0, 0.0, 1.0)

		this.lower_square = new Square();
		this.lower_square.createFromVec(v1, v2, v3, v4, v5);


		v1 = vec3.fromValues(square.leftUpperCoordinate[0] - line_size, square.leftUpperCoordinate[1] + line_size, 0.0);
		v2 = vec3.fromValues(square.leftUpperCoordinate[0], square.leftUpperCoordinate[1] + line_size, 0.0);
		v3 = vec3.fromValues(square.leftLowerCoordinate[0], square.leftLowerCoordinate[1] - line_size, 0.0);
		v4 = vec3.fromValues(square.leftLowerCoordinate[0] - line_size, square.leftLowerCoordinate[1] - line_size, 0.0);
		v5 = vec4.fromValues(0.0, 0.0, 0.0, 1.0);

		this.left_square = new Square(
		);

		this.left_square.createFromVec(v1, v2, v3, v4, v5);

		v1 = vec3.fromValues(square.rightUpperCoordinate[0] + line_size, square.rightUpperCoordinate[1] + line_size, 0.0);
		v2 = vec3.fromValues(square.rightUpperCoordinate[0], square.rightUpperCoordinate[1] + line_size, 0.0);
		v3 = vec3.fromValues(square.rightLowerCoordinate[0], square.rightLowerCoordinate[1] - line_size, 0.0);
		v4 = vec3.fromValues(square.rightLowerCoordinate[0] + line_size, square.rightLowerCoordinate[1] - line_size, 0.0);
		v5 = vec4.fromValues(0.0, 0.0, 0.0, 1.0);

		this.right_square = new Square(
		);

		this.right_square.createFromVec(v1, v2, v3, v4, v5);
	}
	get squares(): Square[] {
		this.m_squares[0] = this.basic_square;
		this.m_squares[1] = this.upper_square;
		this.m_squares[2] = this.lower_square;
		this.m_squares[3] = this.left_square;
		this.m_squares[4] = this.right_square;


		return this.m_squares;
	}
	removeDoor(direction, size, beginX, beginY) {
		let begin;
		if (direction == "left" || direction == "right") {
			begin = beginY;
		} else {
			begin = beginX;
		}
		if (direction == "left") {
			//let x=(this.left_square[0]+this.left_square[1])/2.5;

			let s = new Square();
			let v1 = vec3.fromValues(this.basicSquare.leftUpperCoordinate[0] - this.line_size, begin, 0.0);
			let v2 = vec3.fromValues(this.basicSquare.leftUpperCoordinate[0], begin, 0.0);
			let v3 = vec3.fromValues(this.basicSquare.leftLowerCoordinate[0], begin + size, 0.0);
			let v4 = vec3.fromValues(this.basicSquare.leftLowerCoordinate[0] - this.line_size, begin + size, 0.0);
			let v5 = vec4.fromValues(220 / 255.0, 220 / 255.0, 220 / 255.0, 1.0);
			s.createFromVec(v1, v2, v3, v4, v5);
			let index = this.containsDoor(s);
			if (index != -1) {
				this.m_room_doors.splice(index, 1);
			}
		}
		if (direction == "right") {
			//let x=(this.right_square[0]+this.right_square[1])/2.5;
			let y = (this.right_square[2] + this.right_square[3]) / 2.5;
			let s = new Square();
			let v1 = vec3.fromValues(this.basicSquare.rightUpperCoordinate[0] + this.line_size, begin, 0.0);
			let v2 = vec3.fromValues(this.basicSquare.rightUpperCoordinate[0], begin, 0.0);
			let v3 = vec3.fromValues(this.basicSquare.rightLowerCoordinate[0], begin + size, 0.0);
			let v4 = vec3.fromValues(this.basicSquare.rightLowerCoordinate[0] + this.line_size, begin + size, 0.0);
			let v5 = vec4.fromValues(220 / 255.0, 220 / 255.0, 220 / 255.0, 1.0);
			s.createFromVec(v1, v2, v3, v4, v5);
			let index = this.containsDoor(s);
			if (index != -1) {
				this.m_room_doors.splice(index, 1);
			}
		}
		if (direction == "upper") {
			//let x = (this.upper_square[0] + this.upper_square[1]) / 2.5;
			//let y=(this.upper_square[2]+this.upper_square[3])/2.5;
			let s = new Square();
			let v1 = vec3.fromValues(begin, this.basicSquare.rightUpperCoordinate[1] + this.line_size, 0.0);
			let v2 = vec3.fromValues(begin, this.basicSquare.rightUpperCoordinate[1], 0.0);
			let v3 = vec3.fromValues(begin + size, this.basicSquare.leftUpperCoordinate[1] + this.line_size, 0.0);
			let v4 = vec3.fromValues(begin + size, this.basicSquare.leftUpperCoordinate[1], 0.0);
			let v5 = vec4.fromValues(220 / 255.0, 220 / 255.0, 220 / 255.0, 1.0);
			s.createFromVec(v1, v2, v3, v4, v5);
			let index = this.containsDoor(s);
			if (index != -1) {
				this.m_room_doors.splice(index, 1);
			}
		}
		if (direction == "lower") {
			//let x = (this.lower_square[0] + this.lower_square[1]) / 2.5;
			//let y=(this.lower_square[2]+this.lower_square[3])/2.5;
			let s = new Square();
			let v1 = vec3.fromValues(begin, this.basicSquare.rightLowerCoordinate[1], 0.0);
			let v2 = vec3.fromValues(begin, this.basicSquare.rightLowerCoordinate[1] - this.line_size, 0.0);
			let v3 = vec3.fromValues(begin + size, this.basicSquare.leftLowerCoordinate[1], 0.0);
			let v4 = vec3.fromValues(begin + size, this.basicSquare.leftLowerCoordinate[1] - this.line_size, 0.0);
			let v5 = vec4.fromValues(220 / 255.0, 220 / 255.0, 220 / 255.0, 1.0);
			s.createFromVec(v1, v2, v3, v4, v5);
			let index = this.containsDoor(s);
			if (index != -1) {
				this.m_room_doors.splice(index, 1);
			}

		}


	}

	removeWindow(direction, size, beginX, beginY) {
		let begin;
		if (direction == "left" || direction == "right") {
			begin = beginY;
		} else {
			begin = beginX;
		}
		if (direction == "left") {
			//let x=(this.left_square[0]+this.left_square[1])/2.5;

			let s = new Square();
			let v1 = vec3.fromValues(this.basicSquare.leftUpperCoordinate[0] - this.line_size, begin, 0.0);
			let v2 = vec3.fromValues(this.basicSquare.leftUpperCoordinate[0], begin, 0.0);
			let v3 = vec3.fromValues(this.basicSquare.leftLowerCoordinate[0], begin + size, 0.0);
			let v4 = vec3.fromValues(this.basicSquare.leftLowerCoordinate[0] - this.line_size, begin + size, 0.0);
			let v5 = vec4.fromValues(152 / 255.0, 152 / 255.0, 152 / 255.0, 1.0);
			s.createFromVec(v1, v2, v3, v4, v5);
			let index = this.containsWindow(s);
			if (index != -1) {
				this.m_room_windows.splice(index, 1);
			}
		}
		if (direction == "right") {
			//let x=(this.right_square[0]+this.right_square[1])/2.5;
			let y = (this.right_square[2] + this.right_square[3]) / 2.5;
			let s = new Square();
			let v1 = vec3.fromValues(this.basicSquare.rightUpperCoordinate[0] + this.line_size, begin, 0.0);
			let v2 = vec3.fromValues(this.basicSquare.rightUpperCoordinate[0], begin, 0.0);
			let v3 = vec3.fromValues(this.basicSquare.rightLowerCoordinate[0], begin + size, 0.0);
			let v4 = vec3.fromValues(this.basicSquare.rightLowerCoordinate[0] + this.line_size, begin + size, 0.0);
			let v5 = vec4.fromValues(152 / 255.0, 152 / 255.0, 152 / 255.0, 1.0);
			s.createFromVec(v1, v2, v3, v4, v5);
			let index = this.containsWindow(s);
			if (index != -1) {
				this.m_room_windows.splice(index, 1);
			}
		}
		if (direction == "upper") {
			//let x = (this.upper_square[0] + this.upper_square[1]) / 2.5;
			//let y=(this.upper_square[2]+this.upper_square[3])/2.5;
			let s = new Square();
			let v1 = vec3.fromValues(begin, this.basicSquare.rightUpperCoordinate[1] + this.line_size, 0.0);
			let v2 = vec3.fromValues(begin, this.basicSquare.rightUpperCoordinate[1], 0.0);
			let v3 = vec3.fromValues(begin + size, this.basicSquare.leftUpperCoordinate[1] + this.line_size, 0.0);
			let v4 = vec3.fromValues(begin + size, this.basicSquare.leftUpperCoordinate[1], 0.0);
			let v5 = vec4.fromValues(152 / 255.0, 152 / 255.0, 152 / 255.0, 1.0);
			s.createFromVec(v1, v2, v3, v4, v5);
			let index = this.containsWindow(s);
			if (index != -1) {
				this.m_room_windows.splice(index, 1);
			}
		}
		if (direction == "lower") {
			//let x = (this.lower_square[0] + this.lower_square[1]) / 2.5;
			//let y=(this.lower_square[2]+this.lower_square[3])/2.5;
			let s = new Square();
			let v1 = vec3.fromValues(begin, this.basicSquare.rightLowerCoordinate[1], 0.0);
			let v2 = vec3.fromValues(begin, this.basicSquare.rightLowerCoordinate[1] - this.line_size, 0.0);
			let v3 = vec3.fromValues(begin + size, this.basicSquare.leftLowerCoordinate[1], 0.0);
			let v4 = vec3.fromValues(begin + size, this.basicSquare.leftLowerCoordinate[1] - this.line_size, 0.0);
			let v5 = vec4.fromValues(152 / 255.0, 152 / 255.0, 152 / 255.0, 1.0);
			s.createFromVec(v1, v2, v3, v4, v5);
			let index = this.containsWindow(s);
			if (index != -1) {
				this.m_room_windows.splice(index, 1);
			}

		}


	}


	addDoor(direction, size, beginX, beginY) {
		let begin;
		if (direction == "left" || direction == "right") {
			begin = beginY;
		} else {
			begin = beginX;
		}
		if (direction == "left") {
			//let x=(this.left_square[0]+this.left_square[1])/2.5;

			let s = new Square();
			let v1 = vec3.fromValues(this.basicSquare.leftUpperCoordinate[0] - this.line_size, begin, 0.0);
			let v2 = vec3.fromValues(this.basicSquare.leftUpperCoordinate[0], begin, 0.0);
			let v3 = vec3.fromValues(this.basicSquare.leftLowerCoordinate[0], begin + size, 0.0);
			let v4 = vec3.fromValues(this.basicSquare.leftLowerCoordinate[0] - this.line_size, begin + size, 0.0);
			let v5 = vec4.fromValues(220 / 255.0, 220 / 255.0, 220 / 255.0, 1.0);
			s.createFromVec(v1, v2, v3, v4, v5);
			if (this.containsDoor(s) == -1&&this.containsWindow(s)==-1) {
				this.m_room_doors.push(s);
			}
		}
		if (direction == "right") {
			//let x=(this.right_square[0]+this.right_square[1])/2.5;
			let y = (this.right_square[2] + this.right_square[3]) / 2.5;
			let s = new Square();
			let v1 = vec3.fromValues(this.basicSquare.rightUpperCoordinate[0] + this.line_size, begin, 0.0);
			let v2 = vec3.fromValues(this.basicSquare.rightUpperCoordinate[0], begin, 0.0);
			let v3 = vec3.fromValues(this.basicSquare.rightLowerCoordinate[0], begin + size, 0.0);
			let v4 = vec3.fromValues(this.basicSquare.rightLowerCoordinate[0] + this.line_size, begin + size, 0.0);
			let v5 = vec4.fromValues(220 / 255.0, 220 / 255.0, 220 / 255.0, 1.0);
			s.createFromVec(v1, v2, v3, v4, v5);
			if (this.containsDoor(s) == -1&&this.containsWindow(s)==-1) {
				this.m_room_doors.push(s);
			}
		}
		if (direction == "upper") {
			//let x = (this.upper_square[0] + this.upper_square[1]) / 2.5;
			//let y=(this.upper_square[2]+this.upper_square[3])/2.5;
			let s = new Square();
			let v1 = vec3.fromValues(begin, this.basicSquare.rightUpperCoordinate[1] + this.line_size, 0.0);
			let v2 = vec3.fromValues(begin, this.basicSquare.rightUpperCoordinate[1], 0.0);
			let v3 = vec3.fromValues(begin + size, this.basicSquare.leftUpperCoordinate[1] + this.line_size, 0.0);
			let v4 = vec3.fromValues(begin + size, this.basicSquare.leftUpperCoordinate[1], 0.0);
			let v5 = vec4.fromValues(220 / 255.0, 220 / 255.0, 220 / 255.0, 1.0);
			s.createFromVec(v1, v2, v3, v4, v5);
			if (this.containsDoor(s) == -1&&this.containsWindow(s)==-1) {
				this.m_room_doors.push(s);
			}
		}
		if (direction == "lower") {
			//let x = (this.lower_square[0] + this.lower_square[1]) / 2.5;
			//let y=(this.lower_square[2]+this.lower_square[3])/2.5;
			let s = new Square();
			let v1 = vec3.fromValues(begin, this.basicSquare.rightLowerCoordinate[1], 0.0);
			let v2 = vec3.fromValues(begin, this.basicSquare.rightLowerCoordinate[1] - this.line_size, 0.0);
			let v3 = vec3.fromValues(begin + size, this.basicSquare.leftLowerCoordinate[1], 0.0);
			let v4 = vec3.fromValues(begin + size, this.basicSquare.leftLowerCoordinate[1] - this.line_size, 0.0);
			let v5 = vec4.fromValues(220 / 255.0, 220 / 255.0, 220 / 255.0, 1.0);
			s.createFromVec(v1, v2, v3, v4, v5);
			if (this.containsDoor(s) == -1&&this.containsWindow(s)==-1) {
				this.m_room_doors.push(s);
			}

		}

	}

	addWindow(direction, size, beginX, beginY) {
		let begin;
		if (direction == "left" || direction == "right") {
			begin = beginY;
		} else {
			begin = beginX;
		}
		if (direction == "left") {
			//let x=(this.left_square[0]+this.left_square[1])/2.5;

			let s = new Square();
			let v1 = vec3.fromValues(this.basicSquare.leftUpperCoordinate[0] - this.line_size, begin, 0.0);
			let v2 = vec3.fromValues(this.basicSquare.leftUpperCoordinate[0], begin, 0.0);
			let v3 = vec3.fromValues(this.basicSquare.leftLowerCoordinate[0], begin + size, 0.0);
			let v4 = vec3.fromValues(this.basicSquare.leftLowerCoordinate[0] - this.line_size, begin + size, 0.0);
			let v5 = vec4.fromValues(152 / 255.0, 152 / 255.0, 152 / 255.0, 1.0);
			s.createFromVec(v1, v2, v3, v4, v5);
			if (this.containsDoor(s) == -1&&this.containsWindow(s)==-1) {
				this.m_room_windows.push(s);
			}
		}
		if (direction == "right") {
			//let x=(this.right_square[0]+this.right_square[1])/2.5;
			let y = (this.right_square[2] + this.right_square[3]) / 2.5;
			let s = new Square();
			let v1 = vec3.fromValues(this.basicSquare.rightUpperCoordinate[0] + this.line_size, begin, 0.0);
			let v2 = vec3.fromValues(this.basicSquare.rightUpperCoordinate[0], begin, 0.0);
			let v3 = vec3.fromValues(this.basicSquare.rightLowerCoordinate[0], begin + size, 0.0);
			let v4 = vec3.fromValues(this.basicSquare.rightLowerCoordinate[0] + this.line_size, begin + size, 0.0);
			let v5 = vec4.fromValues(152 / 255.0, 152 / 255.0, 152 / 255.0, 1.0);
			s.createFromVec(v1, v2, v3, v4, v5);
			if (this.containsDoor(s) == -1&&this.containsWindow(s)==-1) {
				this.m_room_windows.push(s);
			}
		}
		if (direction == "upper") {
			//let x = (this.upper_square[0] + this.upper_square[1]) / 2.5;
			//let y=(this.upper_square[2]+this.upper_square[3])/2.5;
			let s = new Square();
			let v1 = vec3.fromValues(begin, this.basicSquare.rightUpperCoordinate[1] + this.line_size, 0.0);
			let v2 = vec3.fromValues(begin, this.basicSquare.rightUpperCoordinate[1], 0.0);
			let v3 = vec3.fromValues(begin + size, this.basicSquare.leftUpperCoordinate[1] + this.line_size, 0.0);
			let v4 = vec3.fromValues(begin + size, this.basicSquare.leftUpperCoordinate[1], 0.0);
			let v5 = vec4.fromValues(152 / 255.0, 152 / 255.0, 152 / 255.0, 1.0);
			s.createFromVec(v1, v2, v3, v4, v5);
			if (this.containsDoor(s) == -1&&this.containsWindow(s)==-1) {
				this.m_room_windows.push(s);
			}
		}
		if (direction == "lower") {
			//let x = (this.lower_square[0] + this.lower_square[1]) / 2.5;
			//let y=(this.lower_square[2]+this.lower_square[3])/2.5;
			let s = new Square();
			let v1 = vec3.fromValues(begin, this.basicSquare.rightLowerCoordinate[1], 0.0);
			let v2 = vec3.fromValues(begin, this.basicSquare.rightLowerCoordinate[1] - this.line_size, 0.0);
			let v3 = vec3.fromValues(begin + size, this.basicSquare.leftLowerCoordinate[1], 0.0);
			let v4 = vec3.fromValues(begin + size, this.basicSquare.leftLowerCoordinate[1] - this.line_size, 0.0);
			let v5 = vec4.fromValues(152 / 255.0, 152 / 255.0, 152 / 255.0, 1.0);
			s.createFromVec(v1, v2, v3, v4, v5);
			if (this.containsDoor(s) == -1&&this.containsWindow(s)==-1) {
				this.m_room_windows.push(s);
			}

		}

	}

	containsDoor(door: Square): number {
		for (let i = 0; i < this.m_room_doors.length; i++) {
			if (!(door.leftLowerCoordinate[0] > this.m_room_doors[i].rightUpperCoordinate[0]
				|| door.rightUpperCoordinate[0] < this.m_room_doors[i].leftLowerCoordinate[0]
				|| door.leftLowerCoordinate[1] > this.m_room_doors[i].rightUpperCoordinate[1]
				|| door.rightUpperCoordinate[1] < this.m_room_doors[i].leftLowerCoordinate[1])) {
				console.log("contains door " + i);
				return i;
			} else if (
				!(this.m_room_doors[i].leftLowerCoordinate[0] > door.rightUpperCoordinate[0]
					|| this.m_room_doors[i].rightUpperCoordinate[0] < door.leftLowerCoordinate[0]
					|| this.m_room_doors[i].leftLowerCoordinate[1] > door.rightUpperCoordinate[1]
					|| this.m_room_doors[i].rightUpperCoordinate[1] < door.leftLowerCoordinate[1]

				)) {
				console.log("contains door " + i);
				return i;

			}

		}
		console.log("contains door " + (-1));
		return -1;
	}
	containsWindow(window: Square): number {
		for (let i = 0; i < this.m_room_windows.length; i++) {
			if (!(window.leftLowerCoordinate[0] > this.m_room_windows[i].rightUpperCoordinate[0]
				|| window.rightUpperCoordinate[0] < this.m_room_windows[i].leftLowerCoordinate[0]
				|| window.leftLowerCoordinate[1] > this.m_room_windows[i].rightUpperCoordinate[1]
				|| window.rightUpperCoordinate[1] < this.m_room_windows[i].leftLowerCoordinate[1])) {
				console.log("contains window " + i);
				return i;
			} else if (
				!(this.m_room_windows[i].leftLowerCoordinate[0] > window.rightUpperCoordinate[0]
					|| this.m_room_windows[i].rightUpperCoordinate[0] < window.leftLowerCoordinate[0]
					|| this.m_room_windows[i].leftLowerCoordinate[1] > window.rightUpperCoordinate[1]
					|| this.m_room_windows[i].rightUpperCoordinate[1] < window.leftLowerCoordinate[1]

				)) {
				console.log("contains window " + i);
				return i;

			}

		}
		console.log("contains window " + (-1));
		return -1;
	}
	get room_doors(): Square[] {
		return this.m_room_doors;
	}
	get room_windows(): Square[] {
		return this.m_room_windows;
	}
	set room_doors(roomDors:Square[]){
		this.m_room_doors=roomDors;
	}
	set room_windows(roomWindows:Square[]){
		this.m_room_windows=roomWindows;
	}
	get roomName(): String {
		return this.room_Name;
	}
	get squareMeter(): number {
		return this.square_meter;
	}
	get width(): number {
		return this.room_Width;
	}
	get height(): number {
		return this.room_Height;
	}
	get roomBorder(): number {
		return this.line_size;
	}
	get roomMValues(): number[] {
		return this.room_MValues;
	}
	get basicSquare(): Square {
		return this.basic_square;
	}
	equals(anotherRoom: Room): boolean {

		if (anotherRoom.roomName == this.room_Name && anotherRoom.squares[0] == this.squares[0] && anotherRoom.squares[1] == this.squares[1] && anotherRoom.squares[2] == this.squares[2] && anotherRoom.squares[3] == this.squares[3] && anotherRoom.squares[4] == this.squares[4] && anotherRoom.line_size == this.line_size && anotherRoom.width == this.width && anotherRoom.height == this.height && anotherRoom.square_meter == this.square_meter) {
			return true;
		} else {
			return false;
		}

	}
	contains(m_rooms: Room[]): number {
		console.log("CONTAINSBE VAN");

		/*for(var i=0;i<m_rooms.length;i++){
			var count=0;
			var widthThis=Math.abs(this.squares[1].leftUpperCoordinate[0]-this.squares[1].rightUpperCoordinate[0]);
			var widthActual=Math.abs(m_rooms[i].squares[1].leftUpperCoordinate[0]-m_rooms[i].squares[1].rightUpperCoordinate[0]);
			var comparableNumberWidth=Math.abs(this.squares[1].leftUpperCoordinate[0]-m_rooms[i].squares[1].rightUpperCoordinate[0]);
			if(widthThis+widthActual>comparableNumberWidth){
				count=count+1;
			}
			var heightThis=Math.abs(this.squares[3].rightUpperCoordinate[1]-this.squares[3].rightLowerCoordinate[1]);
			var heightActual=Math.abs(m_rooms[i].squares[3].rightUpperCoordinate[1]-m_rooms[i].squares[3].rightLowerCoordinate[1]);
			var comparableNumberHeight=Math.abs(this.squares[3].rightUpperCoordinate[1]-this.squares[3].rightLowerCoordinate[1]);
			if(heightThis+widthActual>comparableNumberWidth){
				count=count+1;
			}
			if(count>1){
				return true;
			}
			
		}
		return false;
		*/

		for (var i = 0; i < m_rooms.length; i++) {
			if (!(this.squares[2].leftLowerCoordinate[0] > m_rooms[i].squares[1].rightUpperCoordinate[0]
				|| this.squares[1].rightUpperCoordinate[0] < m_rooms[i].squares[2].leftLowerCoordinate[0]
				|| this.squares[2].leftLowerCoordinate[1] > m_rooms[i].squares[1].rightUpperCoordinate[1]
				|| this.squares[1].rightUpperCoordinate[1] < m_rooms[i].squares[2].leftLowerCoordinate[1])) {

				return i;
			} else if (
				!(m_rooms[i].squares[2].leftLowerCoordinate[0] > this.squares[1].rightUpperCoordinate[0]
					|| m_rooms[i].squares[1].rightUpperCoordinate[0] < this.squares[2].leftLowerCoordinate[0]
					|| m_rooms[i].squares[2].leftLowerCoordinate[1] > this.squares[1].rightUpperCoordinate[1]
					|| m_rooms[i].squares[1].rightUpperCoordinate[1] < this.squares[2].leftLowerCoordinate[1]

				)) {
				return i;
			}

		}
		return -1;
	}
	modifyAll(m_rooms: Room[]) {
		for (var i = 0; i < m_rooms.length; i++) {
			let isContains = false;
			if (!(this.squares[2].leftLowerCoordinate[0] > m_rooms[i].squares[1].rightUpperCoordinate[0]
				|| this.squares[1].rightUpperCoordinate[0] < m_rooms[i].squares[2].leftLowerCoordinate[0]
				|| this.squares[2].leftLowerCoordinate[1] > m_rooms[i].squares[1].rightUpperCoordinate[1]
				|| this.squares[1].rightUpperCoordinate[1] < m_rooms[i].squares[2].leftLowerCoordinate[1])) {
				isContains = true;

			} else if (
				!(m_rooms[i].squares[2].leftLowerCoordinate[0] > this.squares[1].rightUpperCoordinate[0]
					|| m_rooms[i].squares[1].rightUpperCoordinate[0] < this.squares[2].leftLowerCoordinate[0]
					|| m_rooms[i].squares[2].leftLowerCoordinate[1] > this.squares[1].rightUpperCoordinate[1]
					|| m_rooms[i].squares[1].rightUpperCoordinate[1] < this.squares[2].leftLowerCoordinate[1]

				)) {
				isContains = true;
			}
			if (isContains) {
				/*let count=0;
				if(m_rooms[i].squares[1].rightUpperCoordinate[0]<this.squares[2].leftLowerCoordinate[0]){
					m_rooms[i].squares[1].rightUpperCoordinate[0]=this.squares[2].leftLowerCoordinate[0];
					count++;
				}
				if(m_rooms[i].squares[2].leftLowerCoordinate[0]>this.squares[1].rightUpperCoordinate[0]){
					m_rooms[i].squares[2].leftLowerCoordinate[0]=this.squares[1].rightUpperCoordinate[0];
					count++;
				}
				if( m_rooms[i].squares[1].rightUpperCoordinate[1]<this.squares[2].leftLowerCoordinate[1]){
					m_rooms[i].squares[1].rightUpperCoordinate[1]=this.squares[2].leftLowerCoordinate[1];
					count++;
				}
				if(m_rooms[i].squares[2].leftLowerCoordinate[1]>this.squares[1].rightUpperCoordinate[1]){
					m_rooms[i].squares[2].leftLowerCoordinate[1]=this.squares[1].rightUpperCoordinate[1];
					count++;
				}
				if(m_rooms[i].squares[2].leftLowerCoordinate[0]<this.squares[1].rightUpperCoordinate[0]){
					m_rooms[i].squares[2].leftLowerCoordinate[0]=this.squares[1].rightUpperCoordinate[0];
					count++;
				}
				if(m_rooms[i].squares[1].rightUpperCoordinate[0] > this.squares[2].leftLowerCoordinate[0]){
					m_rooms[i].squares[1].rightUpperCoordinate[0] = this.squares[2].leftLowerCoordinate[0];
					count++;
				}
				if(m_rooms[i].squares[2].leftLowerCoordinate[1] < this.squares[1].rightUpperCoordinate[1]){
					m_rooms[i].squares[2].leftLowerCoordinate[1] = this.squares[1].rightUpperCoordinate[1];
					count++;
				}
				if( m_rooms[i].squares[1].rightUpperCoordinate[1] > this.squares[2].leftLowerCoordinate[1]){
					m_rooms[i].squares[1].rightUpperCoordinate[1] = this.squares[2].leftLowerCoordinate[1];
					count++;
				}
				//basic square-t is megnézni

				if(count==8){
					//kitoroljuk ha teljesen benne van
					m_rooms.splice(i,1);
				}*/


				let count = 0;
				if (this.squares[0].leftLowerCoordinate[0] < m_rooms[i].squares[0].rightUpperCoordinate[0] && this.squares[0].leftLowerCoordinate[1] < m_rooms[i].squares[0].rightUpperCoordinate[1]) {
					m_rooms[i].squares[0].rightUpperCoordinate[0] = this.squares[0].leftLowerCoordinate[0];
					m_rooms[i].squares[0].rightUpperCoordinate[1] = this.squares[0].leftLowerCoordinate[1];
					count++;
				}
				if (this.squares[0].rightUpperCoordinate[0] > m_rooms[i].squares[0].leftLowerCoordinate[0] && this.squares[0].rightUpperCoordinate[1] > m_rooms[i].squares[0].leftLowerCoordinate[1]) {
					m_rooms[i].squares[0].leftLowerCoordinate[0] = this.squares[0].rightUpperCoordinate[0];
					m_rooms[i].squares[0].leftLowerCoordinate[1] = this.squares[0].rightUpperCoordinate[1];
					count++;
				}
				if (this.squares[0].leftUpperCoordinate[0] > m_rooms[i].squares[0].rightLowerCoordinate[0] && this.squares[0].leftUpperCoordinate[1] > m_rooms[i].squares[0].rightLowerCoordinate[1]) {
					m_rooms[i].squares[0].rightLowerCoordinate[0] = this.squares[0].leftUpperCoordinate[0];
					m_rooms[i].squares[0].rightLowerCoordinate[1] = this.squares[0].leftUpperCoordinate[1];
					count++;
				}
				if (this.squares[0].rightLowerCoordinate[0] < m_rooms[i].squares[0].leftUpperCoordinate[0] && this.squares[0].rightLowerCoordinate[1] < m_rooms[i].squares[0].leftUpperCoordinate[1]) {
					m_rooms[i].squares[0].leftUpperCoordinate[0] = this.squares[0].rightLowerCoordinate[0];
					m_rooms[i].squares[0].leftUpperCoordinate[1] = this.squares[0].rightLowerCoordinate[1];
					count++;
				}
				if (count != 4) {
					m_rooms[i] = new Room(m_rooms[i].squares[0], m_rooms[i].line_size, m_rooms[i].roomName + "", m_rooms[i].width, m_rooms[i].height, m_rooms[i].square_meter, m_rooms[i].room_MValues);
				} if (count == 4) {
					m_rooms.splice(i, 1);
				}



			}

		}
		m_rooms.push(this);

	}
}