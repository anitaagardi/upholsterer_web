import { Main } from './webgl/Main';
import { Scene2D } from './webgl/Scene2D';
<<<<<<< HEAD
import { Triangle } from './webgl/Triangle';
=======
>>>>>>> 6c1a00ae7387bab65bea897bc23b866c253d3965

import { fragmentShaderSource } from './webgl/shaders/fragment';
import { vertexShaderSource } from './webgl/shaders/vertex';

<<<<<<< HEAD
import { vec3, vec4, mat3, mat4 } from 'gl-matrix';

let scene2D = new Scene2D(640, 480, 45, 0.1,100,-5.0);
let main = new Main('#glcanvas',vertexShaderSource, fragmentShaderSource);

main.drawScene(scene2D);

main.subscribeClick( (x,y)=>{
	//console.log(x+" "+y);
	let [p,d] = scene2D.getRayTo2DPoint(x,y);
	
	let result = false;
	
	for(let i=0; i<scene2D.triangles.length; i++) {
		result=scene2D.triangles[i].rayIntersectsTriangle(p,d, scene2D.modelViewMatrix);
		if(result) {
			break;
		}
	}
	
	alert(result);
});

let triangle = new Triangle(
            vec3.fromValues(0.5, 0.5,0.0),
			vec3.fromValues(-0.5,0.5,0.0),
			vec3.fromValues( 0.5, -0.5,0.0)
			);
			
=======

let scene2D = new Scene2D(640, 480, 45, 0.1,100,-5.0);
let main = new Main('#glcanvas',vertexShaderSource, fragmentShaderSource);
main.drawScene(scene2D);
>>>>>>> 6c1a00ae7387bab65bea897bc23b866c253d3965
