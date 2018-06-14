import { Component } from "./Component";
import { Visitor } from "./Visitor";

export class LineGrid implements Component {
    private vertices:number[];
    private colors:number[];

    constructor(vertices:number[], colors:number[]){
        this.vertices = vertices;
        this.colors = colors;
    }

    getVertices():number[] {
        return this.vertices;
    }

    getColors():number[] {
        return this.colors;
    }

    accept(v:Visitor) {
        v.drawLineGrid(this);
    }
}