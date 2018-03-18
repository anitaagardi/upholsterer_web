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
	constructor(square: Square, line_size: number) {
		this.basic_square = square;
		this.line_size = line_size;

		let v1=vec3.fromValues(square.rightUpperCoordinate[0] + line_size, square.rightUpperCoordinate[1] + line_size, 0.0);
		let v2=vec3.fromValues(square.rightUpperCoordinate[0] + line_size, square.rightUpperCoordinate[1], 0.0);
		let v3=vec3.fromValues(square.leftUpperCoordinate[0] - line_size, square.leftUpperCoordinate[1] + line_size, 0.0);
		let v4=vec3.fromValues(square.leftUpperCoordinate[0] - line_size, square.leftUpperCoordinate[1], 0.0);
		let v5=vec4.fromValues(0.0, 0.0, 0.0, 1.0)

		
		this.upper_square = new Square();
        this.upper_square.createFromVec(v1,v2,v3,v4,v5);

		v1=vec3.fromValues(square.rightLowerCoordinate[0] + line_size, square.rightLowerCoordinate[1], 0.0);
		v2=vec3.fromValues(square.rightLowerCoordinate[0] + line_size, square.rightLowerCoordinate[1] - line_size, 0.0);
		v3=vec3.fromValues(square.leftLowerCoordinate[0] - line_size, square.leftLowerCoordinate[1], 0.0);
		v4=vec3.fromValues(square.leftLowerCoordinate[0] - line_size, square.leftLowerCoordinate[1] - line_size, 0.0);
		v5=vec4.fromValues(0.0, 0.0, 0.0, 1.0)

		this.lower_square = new Square();
		this.lower_square.createFromVec(v1,v2,v3,v4,v5);

		
		v1=vec3.fromValues(square.leftUpperCoordinate[0] - line_size, square.leftUpperCoordinate[1] + line_size, 0.0);
		v2=vec3.fromValues(square.leftUpperCoordinate[0], square.leftUpperCoordinate[1] + line_size, 0.0);
		v3=vec3.fromValues(square.leftLowerCoordinate[0], square.leftLowerCoordinate[1] - line_size, 0.0);
		v4=vec3.fromValues(square.leftLowerCoordinate[0] - line_size, square.leftLowerCoordinate[1] - line_size, 0.0);
		v5=vec4.fromValues(0.0, 0.0, 0.0, 1.0);

		this.left_square = new Square(
		);

		this.left_square.createFromVec(v1,v2,v3,v4,v5);

		v1=vec3.fromValues(square.rightUpperCoordinate[0] + line_size, square.rightUpperCoordinate[1] + line_size, 0.0);
		v2=vec3.fromValues(square.rightUpperCoordinate[0], square.rightUpperCoordinate[1] + line_size, 0.0);
		v3=vec3.fromValues(square.rightLowerCoordinate[0], square.rightLowerCoordinate[1] - line_size, 0.0);
		v4=vec3.fromValues(square.rightLowerCoordinate[0] + line_size, square.rightLowerCoordinate[1] - line_size, 0.0);
		v5=vec4.fromValues(0.0, 0.0, 0.0, 1.0);

		this.right_square = new Square(
		);

		this.right_square.createFromVec(v1,v2,v3,v4,v5);
	}
	get squares(): Square[] {
		this.m_squares[0] = this.basic_square;
		this.m_squares[1] = this.upper_square;
		this.m_squares[2] = this.lower_square;
		this.m_squares[3] = this.left_square;
		this.m_squares[4] = this.right_square;
		return this.m_squares;
	}



}