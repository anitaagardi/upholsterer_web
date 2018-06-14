import { Room } from './Room';

export class RoomForm {
	/*let addNewRoomHTMLInput = (<HTMLInputElement>document.getElementById("addNewRoom"));
	let removeRoomHTMLInput = (<HTMLInputElement>document.getElementById("removeRoom"));
	let addDoorHTMLInput = (<HTMLInputElement>document.getElementById("addDoor"));
	let removeDoorHTMLInput = (<HTMLInputElement>document.getElementById("removeDoor"));
	let addWindowHTMLInput = (<HTMLInputElement>document.getElementById("addWindow"));
	let removeWindowHTMLInput = (<HTMLInputElement>document.getElementById("removeWindow"));
	let textureHTMLInput = (<HTMLInputElement>document.getElementById("texture"));*/

	/*(<HTMLInputElement>document.getElementById("roomUpperLeftX")).value = "";
		(<HTMLInputElement>document.getElementById("roomUpperLeftY")).value = "";
		(<HTMLInputElement>document.getElementById("roomWidth")).value = "";
		(<HTMLInputElement>document.getElementById("roomHeight")).value = "";
		(<HTMLInputElement>document.getElementById("roomName")).value = "";
		(<HTMLInputElement>document.getElementById("roomBorder")).value = "";*/

	private addNewRoomHTMLInput: HTMLInputElement;
	private removeRoomHTMLInput: HTMLInputElement;
	private addDoorHTMLInput: HTMLInputElement;
	private removeDoorHTMLInput: HTMLInputElement;
	private addWindowHTMLInput: HTMLInputElement;
	private removeWindowHTMLInput: HTMLInputElement;
	private textureHTMLInput: HTMLInputElement;

	private roomUpperLeftX: HTMLInputElement;
	private roomUpperLeftY: HTMLInputElement;
	private roomWidth: HTMLInputElement;
	private roomHeight: HTMLInputElement;
	private roomName: HTMLInputElement;
	private roomBorder: HTMLInputElement;

	private roomForm: HTMLFormElement;

	private room: Room;

	constructor() {
		this.addNewRoomHTMLInput = (<HTMLInputElement>document.getElementById("addNewRoom"));
		this.removeRoomHTMLInput = (<HTMLInputElement>document.getElementById("removeRoom"));
		this.addDoorHTMLInput = (<HTMLInputElement>document.getElementById("addDoor"));
		this.removeDoorHTMLInput = (<HTMLInputElement>document.getElementById("removeDoor"));
		this.addWindowHTMLInput = (<HTMLInputElement>document.getElementById("addWindow"));
		this.removeWindowHTMLInput = (<HTMLInputElement>document.getElementById("removeWindow"));
		this.textureHTMLInput = (<HTMLInputElement>document.getElementById("texture"));

		this.roomUpperLeftX = (<HTMLInputElement>document.getElementById("roomUpperLeftX"));
		this.roomUpperLeftY = (<HTMLInputElement>document.getElementById("roomUpperLeftY"));
		this.roomWidth = (<HTMLInputElement>document.getElementById("roomWidth"));
		this.roomHeight = (<HTMLInputElement>document.getElementById("roomHeight"));
		this.roomName = (<HTMLInputElement>document.getElementById("roomName"));
		this.roomBorder = (<HTMLInputElement>document.getElementById("roomBorder"));
	}

	reset() {
		this.roomForm.reset();
	}

	setRoom(room: Room) {

	}

	getRoom() {
		let roomUpperLeftX: number = parseInt(this.roomUpperLeftX.value);
		//the y component of the left upper coordinate of the room
		let roomUpperLeftY: number = parseInt(this.roomUpperLeftY.value);
		//the width of the room
		let roomWidth: number =parseInt(this.roomWidth.value);
		//the height of the room
		let roomHeight: number = parseInt(this.roomHeight.value);
		//the name of the room
		let roomName: string = this.roomName.value;
		//the border of the room
		let roomBorder: number = Number(this.roomBorder.value);
	}
};