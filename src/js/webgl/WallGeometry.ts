import { Wall } from "./Wall";
import { Square } from "./Square";
import { Triangle } from "./Triangle";

export class WallGeometry<T> {
    private triangle:Triangle;
    constructor(private wall:Wall,private square:T) {
        
    }
    getWall():Wall {
        return this.wall;
    }
    getSquare():T {
        return this.square;
    }

    getTriangle():Triangle {
        return this.triangle;
    }

    setTriangle(triangle:Triangle) {
        this.triangle = triangle;
    }
}