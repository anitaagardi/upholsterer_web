import { Main } from './webgl/Main';
import { Scene2D } from './webgl/Scene2D';
import { Scene3D } from './webgl/Scene3D';
import { Triangle } from './webgl/Triangle';
import { Square } from './webgl/Square';
import { Room } from './webgl/Room';

import { vec3, vec4, mat3, mat4 } from 'gl-matrix';

//let scene2D = new Scene2D(1000, 800, 45, 0.1, 100,-5,true);

let scene2D = new Scene2D(1000, 800, 45, 0.1, 100, -5, true);
let scene3D = new Scene3D(1000, 800, 45, 0.1, 100, 0, true);

let main = new Main('#glcanvas');

let points: vec3[] = [];
let indexRemoveRoom = -1;
let clickedX;
let clickedY;

//let scene3D = new Scene3D(1000, 800, 45, 0.1, 100, -5.0,true);
//main.drawScene(scene2D);

//scene2D.lookAt(vec3.fromValues(0,10,-100), vec3.fromValues(0,0,1), vec3.fromValues(0,1,0));
//scene2D.lookAt(vec3.fromValues(0,0,-49), vec3.fromValues(0,0,1), vec3.fromValues(0,1,0));
//scene2D.lookAt(vec3.fromValues(0,0,-60), vec3.fromValues(0,0,1), vec3.fromValues(0,1,0));
scene3D.lookAt(vec3.fromValues(0, 0, 0), vec3.fromValues(0, 0, -1), vec3.fromValues(0, 1, 0));
main.setScene(scene2D);
main.drawScene();

let select2D = (<HTMLInputElement>document.getElementById("2d"));
let select3D = (<HTMLInputElement>document.getElementById("3d"));

select2D.addEventListener("click", (event) => {
	main.setScene(scene2D);
	main.drawScene();
});

select3D.addEventListener("click", (event) => {
	main.setScene(scene3D);
	main.drawScene();
});


let addNewRoomHTMLInput = (<HTMLInputElement>document.getElementById("addNewRoom"));
let removeRoomHTMLInput = (<HTMLInputElement>document.getElementById("removeRoom"));
let addDoorHTMLInput = (<HTMLInputElement>document.getElementById("addDoor"));
let removeDoorHTMLInput = (<HTMLInputElement>document.getElementById("removeDoor"));

let addWindowHTMLInput = (<HTMLInputElement>document.getElementById("addWindow"));
let removeWindowHTMLInput = (<HTMLInputElement>document.getElementById("removeWindow"));
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
	let roomUpperLeftXSquareM = roomUpperLeftX;
	let roomUpperLeftYSquareM = roomUpperLeftY;
	let roomBorderSquareM = roomBorder;
	let roomMValues = [roomUpperLeftXSquareM, roomUpperLeftYSquareM, roomWidthSquareM, roomHeightSquareM, roomBorderSquareM];
	//m2 beállítása
	
	roomWidth = roomWidth * 50 - 4 * Math.sqrt(4 * roomBorder * roomBorder) * 50;//4 mert 2vel volt több meg az uppercoordinate is el van tolva 2-ve
	roomHeight = roomHeight * 50 - 4 * Math.sqrt(4 * roomBorder * roomBorder) * 50;
	roomUpperLeftX = (roomUpperLeftX) * 50 + 2 * Math.sqrt(4 * roomBorder * roomBorder) * 50;
	roomUpperLeftY = (roomUpperLeftY) * 50 + 2 * Math.sqrt(4 * roomBorder * roomBorder) * 50;

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
		scene2D.convert2DPointTo3DWorld(roomUpperLeftX + roomWidth, roomUpperLeftY),
		scene2D.convert2DPointTo3DWorld(roomUpperLeftX, roomUpperLeftY + roomHeight),
		scene2D.convert2DPointTo3DWorld(roomUpperLeftX + roomWidth, roomUpperLeftY + roomHeight),
		vec4.fromValues(192, 192, 192, 1.0)
	);
	let indexOfActualRoom = new Room(square, roomBorder, roomName, roomWidthSquareM, roomHeightSquareM, roomWidthSquareM * roomHeightSquareM, roomMValues).contains(scene2D.rooms);
	if (indexOfActualRoom == -1 && indexRemoveRoom == -1) {
		//scene2D.rooms.push(new Room(square, 0.05));
		//console.log(roomBorder+1 +" border");
		console.log("ITTT NEW ROOM");
		scene2D.addRoom(new Room(square, roomBorder, roomName, roomWidthSquareM, roomHeightSquareM, roomWidthSquareM * roomHeightSquareM, roomMValues));
	} else {
		//let isEqualRoom = new Room(square, roomBorder, roomName, roomWidthSquareM, roomHeightSquareM, roomWidthSquareM * roomHeightSquareM, roomMValues).equals(scene2D.rooms[indexRemoveRoom]);
		//console.log("equals? "+isEqualRoom);
		if (indexRemoveRoom != -1) {
			let removedRoom = new Room(scene2D.rooms[indexRemoveRoom].basicSquare, scene2D.rooms[indexRemoveRoom].roomBorder, scene2D.rooms[indexRemoveRoom].roomName + "", scene2D.rooms[indexRemoveRoom].width, scene2D.rooms[indexRemoveRoom].height, scene2D.rooms[indexRemoveRoom].squareMeter, scene2D.rooms[indexRemoveRoom].roomMValues);
			removedRoom.room_doors=scene2D.rooms[indexRemoveRoom].room_doors;
			removedRoom.room_windows=scene2D.rooms[indexRemoveRoom].room_windows;
			scene2D.removeRoom(indexRemoveRoom);
			let indexOfActualRoom2 = new Room(square, roomBorder, roomName, roomWidthSquareM, roomHeightSquareM, roomWidthSquareM * roomHeightSquareM, roomMValues).contains(scene2D.rooms);
			if (indexOfActualRoom2 == -1) {
				//scene2D.rooms.push(new Room(square, 0.05));
				//console.log(roomBorder+1 +" border");
				console.log("ITTT NEW ROOM");
				scene2D.addRoom(new Room(square, roomBorder, roomName, roomWidthSquareM, roomHeightSquareM, roomWidthSquareM * roomHeightSquareM, roomMValues));
			} else {
				//scene2D.addRoom(removedRoom);
				// EZT KELL MÓDOSÍTANI !!!   new Room(square, roomBorder, roomName, roomWidthSquareM, roomHeightSquareM, roomWidthSquareM * roomHeightSquareM, roomMValues).modifyAll(scene2D.rooms);
				scene2D.addRoom(removedRoom);
			}
		}
	}
	//scene2D.rooms.push(new Room(square, 0.05));
	(<HTMLInputElement>document.getElementById("roomUpperLeftX")).value = "";
	(<HTMLInputElement>document.getElementById("roomUpperLeftY")).value = "";
	(<HTMLInputElement>document.getElementById("roomWidth")).value = "";
	(<HTMLInputElement>document.getElementById("roomHeight")).value = "";
	(<HTMLInputElement>document.getElementById("roomName")).value = "";
	(<HTMLInputElement>document.getElementById("roomBorder")).value = "";
	indexRemoveRoom = -1;
	//main.drawScene(scene2D);
});

removeRoomHTMLInput.addEventListener("click", (event) => {
	event.preventDefault();
	if (indexRemoveRoom != -1) {
		scene2D.removeRoom(indexRemoveRoom);
		(<HTMLInputElement>document.getElementById("roomUpperLeftX")).value = "";
		(<HTMLInputElement>document.getElementById("roomUpperLeftY")).value = "";
		(<HTMLInputElement>document.getElementById("roomWidth")).value = "";
		(<HTMLInputElement>document.getElementById("roomHeight")).value = "";
		(<HTMLInputElement>document.getElementById("roomName")).value = "";
		(<HTMLInputElement>document.getElementById("roomBorder")).value = "";
	}
});
removeDoorHTMLInput.addEventListener("click", (event) => {
	event.preventDefault();
	if(indexRemoveRoom!=-1){
		let direction = (<HTMLInputElement>document.getElementById("doorOptions")).value;
		scene2D.rooms[indexRemoveRoom].removeDoor(direction,0.1,clickedX,clickedY);
		main.drawScene(scene2D);
	}
});
addDoorHTMLInput.addEventListener("click", (event) => {
	event.preventDefault();

	if (indexRemoveRoom != -1) {
		let direction = (<HTMLInputElement>document.getElementById("doorOptions")).value;
		scene2D.rooms[indexRemoveRoom].addDoor(direction,0.1,clickedX,clickedY);
		main.drawScene(scene2D);
	}
	
});

removeWindowHTMLInput.addEventListener("click", (event) => {
	event.preventDefault();
	if(indexRemoveRoom!=-1){
		let direction = (<HTMLInputElement>document.getElementById("doorOptions")).value;
		scene2D.rooms[indexRemoveRoom].removeWindow(direction,0.1,clickedX,clickedY);
		main.drawScene(scene2D);
	}
});
addWindowHTMLInput.addEventListener("click", (event) => {
	event.preventDefault();

	if (indexRemoveRoom != -1) {
		let direction = (<HTMLInputElement>document.getElementById("doorOptions")).value;
		scene2D.rooms[indexRemoveRoom].addWindow(direction,0.1,clickedX,clickedY);
		main.drawScene(scene2D);
	}
	
});

main.subscribeClick((x, y) => {

	console.log(x + " " + y);
	
	let [p, d] = scene2D.getRayTo2DPoint(x, y);
	let clickedPoint = scene2D.convert2DPointTo3DWorld(x,y)
	clickedX=clickedPoint[0];
	clickedY=clickedPoint[1];
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
	if (indexRemoveRoom != -1) {
		(<HTMLInputElement>document.getElementById("roomUpperLeftX")).value = scene2D.rooms[indexRemoveRoom].roomMValues[0] + "";
		(<HTMLInputElement>document.getElementById("roomUpperLeftY")).value = scene2D.rooms[indexRemoveRoom].roomMValues[1] + "";
		(<HTMLInputElement>document.getElementById("roomWidth")).value = scene2D.rooms[indexRemoveRoom].roomMValues[2] + "";
		(<HTMLInputElement>document.getElementById("roomHeight")).value = scene2D.rooms[indexRemoveRoom].roomMValues[3] + "";
		(<HTMLInputElement>document.getElementById("roomName")).value = scene2D.rooms[indexRemoveRoom].roomName + "";
		(<HTMLInputElement>document.getElementById("roomBorder")).value = scene2D.rooms[indexRemoveRoom].roomMValues[4] + "";
	}

	alert(result);
});

