import { Component } from "./Component";
import { Visitor } from "./Visitor";

export class TexturedGrid implements Component{
    accept(v:Visitor) {
        v.drawTexturedGrid(this);
    }
}