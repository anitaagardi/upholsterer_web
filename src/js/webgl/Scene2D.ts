import { vec3, vec4, mat3, mat4 } from 'gl-matrix';

export class Scene2D {
	
  private m_projectionMatrix:mat4;
  private m_modelViewMatrix:mat4;
  private m_width;
  private m_height;
  private m_fieldOfViewDegree;

  private m_positions = [
		 0.5,  0.5,0.0,
		-0.5,  0.5,0.0,
		 0.5, -0.5,0.0
  ];
  
  private m_vertexCount = 3;
  
  constructor(width, height, fieldOfViewDegree, zNear, zFar, translateZ) {
	  this.m_projectionMatrix = mat4.create();
	  
	  this.m_width = width;
	  this.m_height = height;
	  this.m_fieldOfViewDegree = fieldOfViewDegree;
	  
	  let fieldOfViewRadian = fieldOfViewDegree * Math.PI / 180;
	  let aspect = width/height;
	 
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
  
}