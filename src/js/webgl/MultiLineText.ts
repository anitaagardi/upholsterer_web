import { Component } from './Component';
import { Visitor } from './Visitor';

export class MultiLineText extends Component{
    private lines:string[];
    private x:number[];
    private y:number[];

    constructor(lines:string[], x:number[], y:number[]) {
        super();
        
        this.lines = [...lines];
        this.x = x;
        this.y = y;
    }

    accept(v:Visitor) {
       v.drawMultiLineText(this); 
    }


    getX():number[] {
        return this.x;
    }

    getY():number[] {
        return this.y;
    }

    getLines():string[] {
        return [...this.lines];
    }
}