import { Main } from './webgl/Main';
import { Scene2D } from './webgl/Scene2D';

import { fragmentShaderSource } from './webgl/shaders/fragment';
import { vertexShaderSource } from './webgl/shaders/vertex';


let scene2D = new Scene2D(640, 480, 45, 0.1,100,-5.0);
let main = new Main('#glcanvas',vertexShaderSource, fragmentShaderSource);
main.drawScene(scene2D);