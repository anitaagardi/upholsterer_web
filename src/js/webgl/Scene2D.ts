import { vec3, vec4, mat3, mat4 } from 'gl-matrix';
import { Triangle } from './Triangle';
import { Square } from './Square';
import { Room } from './Room';

import { Scene } from './Scene';

import { Subject }  from 'rxjs/Subject';

export class Scene2D implements Scene {

	private m_projectionMatrix: mat4;
	private m_modelViewMatrix: mat4;
	private m_width;
	private m_height;
	private m_fieldOfViewDegree;
	private m_aspectRatio;
	private grid: boolean;
	private m_positions = [
		0.5, 0.5, 0.0,
		-0.5, 0.5, 0.0,
		0.5, -0.5, 0.0
	];


	private m_triangles: Triangle[] = [];
	private m_squares: Square[] = [];
	private m_rooms: Room[] = [];
	private m_vertexCount = 3;

	private roomSource = new Subject<any>();
	public roomSource$ = this.roomSource.asObservable();

	constructor(width, height, fieldOfViewDegree, zNear, zFar, translateZ, grid) {

		this.m_projectionMatrix = mat4.create();
		this.grid = grid;
		this.m_width = width;
		this.m_height = height;
		this.m_fieldOfViewDegree = fieldOfViewDegree;

		let fieldOfViewRadian = fieldOfViewDegree * Math.PI / 180;
		let aspect = width / height;

		this.m_aspectRatio = aspect;

		mat4.perspective(this.m_projectionMatrix,
			fieldOfViewRadian,
			aspect,
			zNear,
			zFar);

		this.m_modelViewMatrix = mat4.create();

		mat4.translate(this.m_modelViewMatrix,
			this.m_modelViewMatrix,
			[0.0, 0.0, translateZ]);

	}


	convert3DPointToScreen(point: vec4):number[] {

		let multipliedMatrix = mat4.create();
		mat4.multiply(multipliedMatrix, this.m_projectionMatrix, this.m_modelViewMatrix);

		//Matrix4 viewProjectionMatrix = projectionMatrix * viewMatrix;

		let screenPoint = vec4.create();
		vec4.transformMat4(screenPoint, point, multipliedMatrix);

		console.log(screenPoint);
		//point3D = viewProjectionMatrix.multiply(point3D);

		let winX = Math.round((((screenPoint[0] / screenPoint[3]) + 1) / 2.0) *
			this.m_width);

		let winY = Math.round(((1 - screenPoint[1] / screenPoint[3]) / 2.0) *
			this.m_height);

		//console.log("Vissza " + winX + " " + winY);

		return [winX, winY];

		//return new Point2D(winX, winY);
	}

	convert2DPointTo3DWorld(winx: number, winy: number): vec3 {

		/*let projectionInverse= mat4.create();
	   let multipliedMatrix = mat4.create();
	   mat4.multiply(multipliedMatrix,this.m_modelViewMatrix,this.m_projectionMatrix);
	   mat4.invert(projectionInverse, multipliedMatrix);*/

		/*
		let winz=0;
		let x = 2.0 * winx / this.m_width - 1;
		let y = - 2.0 * winy / this.m_height + 1;
		let z = 2*winz-1;
	    
		let projectionInverse= mat4.create();
		mat4.invert(projectionInverse, this.m_projectionMatrix);
	    
		let point3D = vec4.create();
		let pointWorldA = vec4.create();
	  	
		vec4.set(point3D,x,y,z,1.0);
		vec4.transformMat4(pointWorldA,point3D,projectionInverse);
	    
		pointWorldA[0] = pointWorldA[0]*(z/pointWorldA[3]);
		pointWorldA[1] = pointWorldA[1]*(z/pointWorldA[3]);
		pointWorldA[2] = pointWorldA[2]*(z/pointWorldA[3]);
		pointWorldA[3]= 1.0;
	    
		console.log("VegeA");
		console.log(pointWorldA);
	    
		winz=1;
		z = 2*winz-1;
	    
		point3D = vec4.create();
		let pointWorldB = vec4.create();
	  	
		vec4.set(point3D,x,y,z,1.0);
		vec4.transformMat4(pointWorldB,point3D,projectionInverse);
	    
		pointWorldB[0] = pointWorldB[0]*(z/pointWorldB[3]);
		pointWorldB[1] = pointWorldB[1]*(z/pointWorldB[3]);
		pointWorldB[2] = pointWorldB[2]*(z/pointWorldB[3]);
		pointWorldB[3]= 1.0;
	    
		console.log("VegeB");
		console.log(pointWorldB);
  	
		let rayDirection = vec3.create();
		vec3.subtract(rayDirection,vec3.fromValues(pointWorldB[0],  pointWorldB[1],  pointWorldB[2]), 
		vec3.fromValues(pointWorldA[0],  pointWorldA[1],  pointWorldA[2]));
	  	
		let normalizedRayDirection = vec3.create()
	  	
		vec3.normalize(normalizedRayDirection, rayDirection);  
	    
		return vec3.fromValues(normalizedRayDirection[0]*5, normalizedRayDirection[1]*5, 0);
	    
		*/

		let imageAspectRatio = this.m_width / this.m_height; // width > height 
		let Px = (2 * ((winx + 0.5) / this.m_width) - 1) * Math.tan(this.m_fieldOfViewDegree / 2 * Math.PI / 180) * this.m_aspectRatio;
		let Py = (1 - 2 * ((winy + 0.5) / this.m_height)) * Math.tan(this.m_fieldOfViewDegree / 2 * Math.PI / 180);

		//return vec3.fromValues(Px*5, Py*5,0);

		//console.log((Px*5) + " " + (Px*5) + " ");

		let rayOrigin = vec3.fromValues(0, 0, 0);

		/*let rayDirection = vec3.create();
		vec3.subtract(rayDirection, vec3.fromValues(Px, Py, -1), rayOrigin);

		console.log(Math.sqrt(Px * Px + Py * Py + 1));

		let normalizedRayDirection = vec3.create()

		vec3.normalize(normalizedRayDirection, rayDirection);

		//return vec3.fromValues(Px*5, Py*5, 0);
		console.log(Math.sqrt(normalizedRayDirection[0] * normalizedRayDirection[0] +
			normalizedRayDirection[1] * normalizedRayDirection[1] + normalizedRayDirection[2] * normalizedRayDirection[2]));

		//world-be vagyunk, a modellre vissza kell alakítani
		return vec3.fromValues(normalizedRayDirection[0] * 5, normalizedRayDirection[1] * 5, (normalizedRayDirection[2] * 5) + 5);
		*/

		return vec3.fromValues(Px * 5, Py * 5, (-1) * 5 + 5);

	}

	getRayTo2DPoint(x, y): vec3[] {

		//let fov = 45;
		let imageAspectRatio = this.m_width / this.m_height; // width > height 
		let Px = (2 * ((x + 0.5) / this.m_width) - 1) * Math.tan(this.m_fieldOfViewDegree / 2 * Math.PI / 180) * this.m_aspectRatio;
		let Py = (1 - 2 * ((y + 0.5) / this.m_height)) * Math.tan(this.m_fieldOfViewDegree / 2 * Math.PI / 180);

		//TODO: ha lesz kamera konfigolva 3D-ben, akkor itt lesz camera->world visszaszorzás

		let modelViewInverse = mat4.create();
		mat4.invert(modelViewInverse, this.m_modelViewMatrix);

		let rayPWorld = vec4.create();

		console.log(Px + " " + Py);

		//TODO: w-vel osztás megvizsgálás

		//kamera kezdőpozíciója
		//let rayOrigin = vec3.fromValues(modelViewInverse[3].x,modelViewInverse[3].y,modelViewInverse[3].z);
		//console.log(modelViewInverse);

		//TODO:  modelViewInverse utolsó oszlopából kérjük le
		let rayOrigin = vec3.fromValues(0, 0, 0);

		console.log(rayOrigin);

		let rayDirection = vec3.create();
		vec3.subtract(rayDirection, vec3.fromValues(Px, Py, -1), rayOrigin);

		let normalizedRayDirection = vec3.create()

		vec3.normalize(normalizedRayDirection, rayDirection);

		return [rayOrigin, normalizedRayDirection];
	}
	
	addRoom(room: Room) {
		this.m_rooms.push(room);
		this.roomSource.next();
	}

	get projectionMatrix(): mat4 {
		return this.m_projectionMatrix;
	}

	get modelViewMatrix(): mat4 {
		return this.m_modelViewMatrix;
	}

	get positions(): number[] {
		return this.m_positions;
	}

	get vertexCount(): number {
		return this.m_vertexCount;
	}

	get triangles(): Triangle[] {
		return this.m_triangles;
	}
	get squares(): Square[] {
		return this.m_squares;
	}

	get rooms(): Room[] {
		return this.m_rooms;
	}

	get isGrid(): boolean {
		return this.grid;
	}
	set setGrid(grid: boolean) {
		this.grid = grid;
	}

	getGrid():any {
		var colors = [];
		var vertices = [];
		for (var i = 0; i < 2000; i = i + 50) {
			//függőleges
			colors = colors.concat([0, 0, 0, 1.0]);



			let v = this.convert2DPointTo3DWorld(i, 0);
			vertices = vertices.concat([v[0], v[1], v[2]]);

			v = this.convert2DPointTo3DWorld(i, 800);
			vertices = vertices.concat([v[0], v[1], v[2]]);
			//vízszintes
			colors = colors.concat([0, 0, 0, 1.0]);


			colors = colors.concat([0, 0, 0, 1.0]);
			v = this.convert2DPointTo3DWorld(0, i);
			vertices = vertices.concat([v[0], v[1], v[2]]);

			v = this.convert2DPointTo3DWorld(1000, i);
			vertices = vertices.concat([v[0], v[1], v[2]]);

			colors = colors.concat([0, 0, 0, 1.0]);
		}

		return [ vertices, colors ];
	}

}