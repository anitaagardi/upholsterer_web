import { vec3, vec4, mat3, mat4 } from 'gl-matrix';

import { Triangle } from './Triangle';
import { Room } from './Room';

import { Subject }  from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';

export interface Scene {
    convert3DPointToScreen(point: vec4):number[];
    convert2DPointTo3DWorld(winx: number, winy: number): vec3;
    lookAt?(eye:vec3, center:vec3, up:vec3);
    getRayTo2DPoint(x, y): vec3[];
    addRoom(room: Room);
    removeRoom(indexRemoveRoom:number);
    getGrid():any;
    roomSource$:Observable<any>;
    projectionMatrix: mat4;
    modelViewMatrix: mat4;
    rooms:Room[];
    triangles:Triangle[];
    vertexCount:number;
}