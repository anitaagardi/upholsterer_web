import { vec3, vec4, mat3, mat4 } from 'gl-matrix';
import { Triangle } from './Triangle';
import { Room } from './Room';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
/*
The interface of the Scene-s. There are two scenes, the scene2d (for 2d) and the scene3d (for 3d).
These scene-s implements this interface
*/
export interface Scene {
    //converts 3D points to the screen 
    convert3DPointToScreen(point: vec4): number[];
    //converts 2d points to the screen
    convert2DPointTo3DWorld(winx: number, winy: number): vec3;
    lookAt?(eye: vec3, center: vec3, up: vec3);
    getRayTo2DPoint(x, y): vec3[];
    //we can add rooms to the scene
    addRoom(room: Room);
    //we can remove room from the scene
    removeRoom(indexRemoveRoom: number);
    //returns the grid
    //the grid means the unit, one grid peace is one square meter
    getGrid(): any;
    roomSource$: Observable<any>;
    //returns the projectionmatrix
    getProjectionMatrix(): mat4;
    //returns the modelview matrix
    getModelViewMatrix(): mat4;
    //returns the actual list of the rooms
    getRooms(): Room[];
    //returns the actual list of the triangles
    //the rooms consists of triangles (because of the basic room and the border, door, window)
    getTriangles(): Triangle[];
    getVertexCount(): number;

    getDrawingRooms():any;
}