import { vec3, vec4, mat3, mat4 } from 'gl-matrix';

export class Camera {
  private eye: vec3;
  private center: vec3;
  private up: vec3;
  private viewMatrix: mat4;
  private yaw:number;
  private pitch:number;
  private cameraSpeed = 0.05;

  constructor(eye: vec3, center: vec3, up: vec3) {
    this.eye = eye;
    this.center = center;
    this.up = up;
  }

  setCameraSpeed(cameraSpeed:number) {
    this.cameraSpeed = cameraSpeed;
  }

  lookAt() {
    let cameraMatrix = mat4.create();
    mat4.lookAt(cameraMatrix, this.eye, this.center, this.up);

    //this.viewMatrix = mat4.create();
    //mat4.invert(this.viewMatrix, cameraMatrix);

    this.viewMatrix = cameraMatrix;
  }
  
  rotate(yaw:number, pitch:number) {
    let yawRadian = yaw * Math.PI / 180.0;
		let pitchRadian = pitch * Math.PI / 180.0;

		let front = vec3.fromValues(Math.cos(yawRadian) * Math.cos(pitchRadian),
      Math.sin(pitchRadian), Math.sin(yawRadian) * Math.cos(pitchRadian));
      
    vec3.add(this.center, this.eye, front);
  }

  //translate camera vertical
  pedestal(distance) {
    //variable for camera axis, store calculated camera axis
    let n=vec3.create();
    let u=vec3.create();
    let v=vec3.create();

    vec3.subtract(n, this.eye, this.center);  // n = eye - center
    vec3.normalize(n,n);
  
    vec3.cross(u, this.up, n);
    vec3.normalize(u,u);
  
    vec3.cross(v, n, u);
    vec3.normalize(v,v);
    
    // Calculate direction vector: Scale the v axis to the desired distance to move up/down
    vec3.scale(v, v, distance);

    // Adding the direction vector to both the eye and center positions
    vec3.add(this.eye, this.eye, v);
    vec3.add(this.center, this.center, v);
  }

  getViewMatrix(): mat4 {
    return this.viewMatrix;
  }
}