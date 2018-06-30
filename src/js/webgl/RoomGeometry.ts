import { Square } from "./Square";
import { Room } from "./Room";

export class RoomGeometry<T> {
    constructor(private room:Room,private square:T) {
        
    }
    getRoom():Room {
        return this.room;
    }
    getSquare():T{
        return this.square;
    }
}