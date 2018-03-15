import { Main } from './webgl/Main';
import { Scene2D } from './webgl/Scene2D';
import { Triangle } from './webgl/Triangle';


import { fragmentShaderSource } from './webgl/shaders/fragment';
import { vertexShaderSource } from './webgl/shaders/vertex';

import { vec3, vec4, mat3, mat4 } from 'gl-matrix';

let scene2D = new Scene2D(1000, 800, 45, 0.1,100,-5.0);
let main = new Main('#glcanvas',vertexShaderSource, fragmentShaderSource);

main.drawScene(scene2D);

main.subscribeClick( (x,y)=>{
	//console.log(x+" "+y);
	let [p,d] = scene2D.getRayTo2DPoint(x,y);
	
	let result = false;
	
	for(let i=0;i<scene2D.rooms.length;i++){
		for(let j=0; j<scene2D.rooms[i].squares.length; j++) {
			for(let k=0;k<scene2D.rooms[i].squares[j].triangles.length;k++){
			result=scene2D.rooms[i].squares[j].triangles[k].rayIntersectsTriangle(p,d, scene2D.modelViewMatrix);
			if(result) {
				break;
			}
		  }
		  if(result) {
				break;
			}
		}
		if(result) {
				break;
			}
	}
	
	alert(result);
});

let triangle = new Triangle(
            vec3.fromValues(0.5, 0.5,0.0),
			vec3.fromValues(-0.5,0.5,0.0),
			vec3.fromValues( 0.5, -0.5,0.0),
			vec4.fromValues(0.0, 0.0,0.0,1.0)
			);
