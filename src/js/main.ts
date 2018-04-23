import { Main } from './webgl/Main';
import { Scene2D } from './webgl/Scene2D';
import { Scene3D } from './webgl/Scene3D';
import { Triangle } from './webgl/Triangle';
import { Square } from './webgl/Square';
import { Room } from './webgl/Room';


import { fragmentShaderSource } from './webgl/shaders/fragment';
import { vertexShaderSource } from './webgl/shaders/vertex';

import { vec3, vec4, mat3, mat4 } from 'gl-matrix';

let scene2D = new Scene2D(1000, 800, 45, 0.1, 100, -5, true);
let main = new Main('#glcanvas', vertexShaderSource, fragmentShaderSource);

let points: vec3[] = [];
let indexRemoveRoom = -1;

//let scene3D = new Scene3D(1000, 800, 45, 0.1, 100, -5.0,true);
//main.drawScene(scene2D);

//scene2D.lookAt(vec3.fromValues(0,10,-100), vec3.fromValues(0,0,1), vec3.fromValues(0,1,0));
///scene2D.lookAt(vec3.fromValues(0,0,0), vec3.fromValues(0,0,-1), vec3.fromValues(0,1,0));
main.setScene(scene2D);
main.drawScene();

let addNewRoomHTMLInput = (<HTMLInputElement>document.getElementById("addNewRoom"));
let removeRoomHTMLInput = (<HTMLInputElement>document.getElementById("removeRoom"));

addNewRoomHTMLInput.addEventListener("click", (event) => {
	event.preventDefault();
	console.log("addnewRoom");
	let roomUpperLeftX: number = parseInt((<HTMLInputElement>document.getElementById("roomUpperLeftX")).value);
	let roomUpperLeftY: number = parseInt((<HTMLInputElement>document.getElementById("roomUpperLeftY")).value);
	let roomWidth: number = parseInt((<HTMLInputElement>document.getElementById("roomWidth")).value);
	let roomHeight: number = parseInt((<HTMLInputElement>document.getElementById("roomHeight")).value);
	let roomName: string = (<HTMLInputElement>document.getElementById("roomName")).value;
	let roomBorder: number = Number((<HTMLInputElement>document.getElementById("roomBorder")).value);

	let roomWidthSquareM = roomWidth;
	let roomHeightSquareM = roomHeight;
	let roomUpperLeftXSquareM=roomUpperLeftX;
	let roomUpperLeftYSquareM=roomUpperLeftY;
	let roomBorderSquareM=roomBorder;
	//m2 beállítása
	
	roomWidth = roomWidth * 50-4*Math.sqrt(4*roomBorder*roomBorder)*50;//4 mert 2vel volt több meg az uppercoordinate is el van tolva 2-ve
	roomHeight = roomHeight* 50-4*Math.sqrt(4*roomBorder*roomBorder)*50;
	roomUpperLeftX=(roomUpperLeftX)*50+2*Math.sqrt(4*roomBorder*roomBorder)*50;
	roomUpperLeftY=(roomUpperLeftY)*50+2*Math.sqrt(4*roomBorder*roomBorder)*50;
	
	console.log((roomUpperLeftX + roomWidth));
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
		scene2D.convert2DPointTo3DWorld(roomUpperLeftX + roomWidth , roomUpperLeftY),
		scene2D.convert2DPointTo3DWorld(roomUpperLeftX, roomUpperLeftY + roomHeight),
		scene2D.convert2DPointTo3DWorld(roomUpperLeftX + roomWidth, roomUpperLeftY + roomHeight),
		vec4.fromValues(192, 192, 192, 1.0)
	);

	if (new Room(square, roomBorder, roomName, roomWidthSquareM * roomHeightSquareM).contains(scene2D.rooms) == -1) {
		//scene2D.rooms.push(new Room(square, 0.05));
		//console.log(roomBorder+1 +" border");
		console.log("ITTT NEW ROOM");
		scene2D.addRoom(new Room(square, roomBorder, roomName, roomWidthSquareM * roomHeightSquareM));
	}
	//scene2D.rooms.push(new Room(square, 0.05));

	//main.drawScene(scene2D);
});

removeRoomHTMLInput.addEventListener("click", (event) => {
	if (indexRemoveRoom != -1) {
		scene2D.removeRoom(scene2D.rooms[indexRemoveRoom]);
	}
});


main.subscribeClick((x, y) => {

	console.log(x + " " + y);

	let [p, d] = scene2D.getRayTo2DPoint(x, y);

	let result = false;


	for (let i = 0; i < scene2D.rooms.length; i++) {
		for (let j = 0; j < scene2D.rooms[i].squares.length; j++) {
			for (let k = 0; k < scene2D.rooms[i].squares[j].triangles.length; k++) {
				result = scene2D.rooms[i].squares[j].triangles[k].rayIntersectsTriangle(p, d, scene2D.modelViewMatrix);
				if (result) {
					indexRemoveRoom = i;
					removeRoomHTMLInput.disabled = false;
					break;
				}
			}
			if (result) {
				indexRemoveRoom = i;
				removeRoomHTMLInput.disabled = false;
				break;
			}
		}
		if (result) {
			indexRemoveRoom = i;
			removeRoomHTMLInput.disabled = false;
			break;
		} else {
			indexRemoveRoom = -1;
			removeRoomHTMLInput.disabled = true;
		}
	}
	//main.drawGrids();


	alert(result);
});

