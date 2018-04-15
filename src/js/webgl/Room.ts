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
	constructor(square: Square, line_size: number,roomName:string) {
		this.basic_square = square;
		this.line_size = line_size;
		this.room_Name=roomName;
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
	get roomName():String{
		return this.room_Name;
	}
	contains(m_rooms: Room[]): boolean {
		console.log()

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
			if( !(this.squares[2].leftLowerCoordinate[0] >  m_rooms[i].squares[1].rightUpperCoordinate[0]
				||  this.squares[1].rightUpperCoordinate[0] <  m_rooms[i].squares[2].leftLowerCoordinate[0]
				||  this.squares[2].leftLowerCoordinate[1] >  m_rooms[i].squares[1].rightUpperCoordinate[1]
				||  this.squares[1].rightUpperCoordinate[1] < m_rooms[i].squares[2].leftLowerCoordinate[1])) {

					return true;
				} else if(
				 !(	m_rooms[i].squares[2].leftLowerCoordinate[0] >  this.squares[1].rightUpperCoordinate[0]
				||  m_rooms[i].squares[1].rightUpperCoordinate[0] <  this.squares[2].leftLowerCoordinate[0]
				||  m_rooms[i].squares[2].leftLowerCoordinate[1] >  this.squares[1].rightUpperCoordinate[1]
				||  m_rooms[i].squares[1].rightUpperCoordinate[1] < this.squares[2].leftLowerCoordinate[1]

				)) {
					return true;
				}
			
		}
		return false;
	}
}