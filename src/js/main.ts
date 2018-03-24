import { Main } from './webgl/Main';
import { Scene2D } from './webgl/Scene2D';
import { Triangle } from './webgl/Triangle';
import { Square } from './webgl/Square';
import { Room } from './webgl/Room';


import { fragmentShaderSource } from './webgl/shaders/fragment';
import { vertexShaderSource } from './webgl/shaders/vertex';

import { vec3, vec4, mat3, mat4 } from 'gl-matrix';

let scene2D = new Scene2D(1000, 800, 45, 0.1, 100, -5.0,true);
let main = new Main('#glcanvas', vertexShaderSource, fragmentShaderSource);

let points: vec3[] = [];

main.drawScene(scene2D);

let addNewRoomHTMLInput = (<HTMLInputElement>document.getElementById("addNewRoom"));

addNewRoomHTMLInput.addEventListener("click", (event) => {
	console.log("addnewRoom");
	let roomUpperLeftX: number = parseInt((<HTMLInputElement>document.getElementById("roomUpperLeftX")).value);
	let roomUpperLeftY: number =  parseInt((<HTMLInputElement>document.getElementById("roomUpperLeftY")).value);
	let roomWidth: number =  parseInt((<HTMLInputElement>document.getElementById("roomWidth")).value);
	let roomHeight: number =  parseInt((<HTMLInputElement>document.getElementById("roomHeight")).value);

	console.log((roomUpperLeftX +roomWidth));
    console.log((roomUpperLeftY + roomHeight));
	
    /*
	let t = new Triangle(
		scene2D.convert2DPointTo3DWorld(roomUpperLeftX, roomUpperLeftY),
		scene2D.convert2DPointTo3DWorld(roomUpperLeftX +roomWidth, roomUpperLeftY),
		scene2D.convert2DPointTo3DWorld(roomUpperLeftX +roomWidth, roomUpperLeftY + roomHeight),
		vec4.fromValues(1.0, 1.0, 1.0, 1.0),
	);

	scene2D.addTriangle(t);


	t = new Triangle(
		scene2D.convert2DPointTo3DWorld(roomUpperLeftX +roomWidth, roomUpperLeftY + roomHeight),
		scene2D.convert2DPointTo3DWorld(roomUpperLeftX, roomUpperLeftY + roomHeight),
		scene2D.convert2DPointTo3DWorld(roomUpperLeftX, roomUpperLeftY),
		vec4.fromValues(1.0, 1.0, 1.0, 1.0),
	);

	scene2D.addTriangle(t);
	*/
	
	let square = new Square();
    
	/*square.createFromPixel([ vec3.fromValues(roomUpperLeftX, roomUpperLeftY,0), 
		scene2D.convert2DPointTo3DWorld(roomUpperLeftX, roomUpperLeftY)
	  ],
	  [vec3.fromValues(roomUpperLeftX +roomWidth, roomUpperLeftY,0),
		  scene2D.convert2DPointTo3DWorld(roomUpperLeftX +roomWidth, roomUpperLeftY)
	  ],
	  [vec3.fromValues(roomUpperLeftX, roomUpperLeftY + roomHeight,0),
		  scene2D.convert2DPointTo3DWorld(roomUpperLeftX, roomUpperLeftY + roomHeight)
	  ],
	  [vec3.fromValues(roomUpperLeftX + roomWidth, roomUpperLeftY + roomHeight,0),
		  scene2D.convert2DPointTo3DWorld(roomUpperLeftX +roomWidth, roomUpperLeftY + roomHeight)
	  ],
	  vec4.fromValues(192, 192, 192, 1.0)
	);	*/
	
	square.createFromVec( 
		scene2D.convert2DPointTo3DWorld(roomUpperLeftX, roomUpperLeftY),
		scene2D.convert2DPointTo3DWorld(roomUpperLeftX +roomWidth, roomUpperLeftY),
		scene2D.convert2DPointTo3DWorld(roomUpperLeftX, roomUpperLeftY + roomHeight),
        scene2D.convert2DPointTo3DWorld(roomUpperLeftX +roomWidth, roomUpperLeftY + roomHeight),
	    vec4.fromValues(192, 192, 192, 1.0)
	);
	
	if(!(new Room(square, 0.05).contains(scene2D.rooms))){
		scene2D.rooms.push(new Room(square, 0.05));
	}
	//scene2D.rooms.push(new Room(square, 0.05));

	main.drawScene(scene2D);
});


main.subscribeClick((x, y) => {
	console.log(x + " " + y);

	let point = scene2D.convert2DPointTo3DWorld(x, y);

	if (points.length < 3) {
		points.push(point);
	}

	if (points.length == 3) {

		let t = new Triangle(
			points[0],
			points[1],
			points[2],
			vec4.fromValues(1.0, 1.0, 1.0, 1.0),
		);

		scene2D.addTriangle(t);

		main.drawScene(scene2D);
	}

	let [p, d] = scene2D.getRayTo2DPoint(x, y);

	let result = false;

	for (let i = 0; i < scene2D.rooms.length; i++) {
		for (let j = 0; j < scene2D.rooms[i].squares.length; j++) {
			for (let k = 0; k < scene2D.rooms[i].squares[j].triangles.length; k++) {
				result = scene2D.rooms[i].squares[j].triangles[k].rayIntersectsTriangle(p, d, scene2D.modelViewMatrix);
				if (result) {
					break;
				}
			}
			if (result) {
				break;
			}
		}
		if (result) {
			break;
		}
	}
	//main.drawGrids();

	//alert(result);
});

