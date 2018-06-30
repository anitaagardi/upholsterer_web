import { Room } from "./Room";

export enum Direction {
    LEFT,
    UP,
    RIGHT,
    DOWN
};

export enum Type {
   INNER,
   OUTER
};

export class Wall {
    //wall orientation with respect to room
    private orientation:Direction;

    private type:Type;

    //wall width in meters
    private width: number;
    private length: number;

    //in meters
    private upperLeftX: number;
    private upperLeftY: number;

    /*private angle:number;
    private nextWall:Wall;*/

    private rooms:Room[] = [];
    private orientations:Direction[] = [];

    constructor(orientation:Direction,type:Type, width:number, length:number, upperLeftX:number, upperLeftY:number) {
        this.orientation = orientation;
        this.type = type;
        this.width = width;
        this.length = length;

        this.upperLeftX = upperLeftX;
        this.upperLeftY = upperLeftY;
    }

    getUpperLeftX(): number {
        return this.upperLeftX;
    }

    getUpperLeftY(): number {
        return this.upperLeftY;
    }

    setUpperLeftX(upperLeftX) {
        this.upperLeftX = upperLeftX;
    }

    setUpperLeftY(upperLeftY) {
        this.upperLeftY = upperLeftY;
    }

    addRoom(room:Room) {
        this.rooms.push(room);
    }

    addRoomWithOrientation(room:Room, orientation:Direction) {
        this.rooms.push(room);
        this.orientations.push(orientation);
    }

    getOrientations():Direction[] {
        return this.orientations;
    }

    getRooms():Room[] {
        return this.rooms;
    }

    getOrientation():Direction {
        return this.orientation;
    }

    getType():Type {
        return this.type;
    }

    getLength():number {
        return this.length;
    }

    setLength(length:number) {
        this.length = length;
    }

    setType(type:Type) {
        this.type = type;
    }

    setOrientation(orientation:Direction) {
        this.orientation = orientation;
    }
};