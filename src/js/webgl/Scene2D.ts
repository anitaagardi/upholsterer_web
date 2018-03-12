import { vec3, vec4, mat3, mat4 } from 'gl-matrix';
<<<<<<< HEAD
import { Triangle } from './Triangle';
=======
>>>>>>> 6c1a00ae7387bab65bea897bc23b866c253d3965

export class Scene2D {
	
  private m_projectionMatrix:mat4;
  private m_modelViewMatrix:mat4;
  private m_width;
  private m_height;
  private m_fieldOfViewDegree;
<<<<<<< HEAD
  private m_aspectRatio;
=======
>>>>>>> 6c1a00ae7387bab65bea897bc23b866c253d3965

  private m_positions = [
		 0.5,  0.5,0.0,
		-0.5,  0.5,0.0,
		 0.5, -0.5,0.0
  ];
  
<<<<<<< HEAD
  
  private m_triangles:Triangle[] = [];
  
  private m_vertexCount = 3;
  
  constructor(width, height, fieldOfViewDegree, zNear, zFar, translateZ) {
	  
	  this.m_triangles.push ( new Triangle(
            vec3.fromValues(0.5, 0.5,0.0),
			vec3.fromValues(-0.5,0.5,0.0),
			vec3.fromValues( 0.5, -0.5,0.0)
	       ) );
		   
	  this.m_triangles.push ( new Triangle(
            vec3.fromValues(2.5, 0.5,0.0),
			vec3.fromValues(1.5,0.5,0.0),
			vec3.fromValues( 2.5, -0.5,0.0)
	       ) );
	  
	  this.m_triangles.push ( new Triangle(
            vec3.fromValues(-4, -2.5,0.0),
			vec3.fromValues(-2,-2.5,0.0),
			vec3.fromValues( -4, 2.5,0.0)
	       ) );
	  
=======
  private m_vertexCount = 3;
  
  constructor(width, height, fieldOfViewDegree, zNear, zFar, translateZ) {
>>>>>>> 6c1a00ae7387bab65bea897bc23b866c253d3965
	  this.m_projectionMatrix = mat4.create();
	  
	  this.m_width = width;
	  this.m_height = height;
	  this.m_fieldOfViewDegree = fieldOfViewDegree;
	  
	  let fieldOfViewRadian = fieldOfViewDegree * Math.PI / 180;
	  let aspect = width/height;
<<<<<<< HEAD
	  
	  this.m_aspectRatio = aspect;
=======
>>>>>>> 6c1a00ae7387bab65bea897bc23b866c253d3965
	 
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
  
<<<<<<< HEAD
  getRayTo2DPoint(x,y):vec3[] {
	 
		//let fov = 45;
		let imageAspectRatio = this.m_width / this.m_height; // width > height 
		let Px = (2 * ((x + 0.5) / this.m_width) - 1) * Math.tan(this.m_fieldOfViewDegree / 2 * Math.PI / 180) * this.m_aspectRatio; 
		let Py = (1 - 2 * ((y + 0.5) / this.m_height)) * Math.tan(this.m_fieldOfViewDegree/ 2 * Math.PI / 180); 
		
		//TODO: ha lesz kamera konfigolva 3D-ben, akkor itt lesz camera->world visszaszorzás
		
		let modelViewInverse= mat4.create();
		mat4.invert(modelViewInverse, this.m_modelViewMatrix);
		
		let rayPWorld = vec4.create();
		
		console.log(Px + " " + Py);
		
		//TODO: w-vel osztás megvizsgálás
		
		//kamera kezdőpozíciója
		//let rayOrigin = vec3.fromValues(modelViewInverse[3].x,modelViewInverse[3].y,modelViewInverse[3].z);
	    //console.log(modelViewInverse);
	  
	    //TODO:  modelViewInverse utolsó oszlopából kérjük le
	    let rayOrigin = vec3.fromValues(0,0,0);
	  
	    console.log(rayOrigin);
	   
		let rayDirection = vec3.create();
		vec3.subtract(rayDirection,vec3.fromValues(Px, Py, -1), rayOrigin);
		
		let normalizedRayDirection = vec3.create()
		
		vec3.normalize(normalizedRayDirection, rayDirection);  
		
		return [ rayOrigin, normalizedRayDirection ]; 
  }
  
=======
>>>>>>> 6c1a00ae7387bab65bea897bc23b866c253d3965
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
  
<<<<<<< HEAD
  get triangles():Triangle[] {
	    return this.m_triangles;
  }
  
=======
>>>>>>> 6c1a00ae7387bab65bea897bc23b866c253d3965
}