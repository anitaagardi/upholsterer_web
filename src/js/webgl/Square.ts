import {Triangle} from './Triangle';
import { vec3, vec4, mat3, mat4 } from 'gl-matrix';

export class Square {
	
	 private m_triangles:Triangle[] = [];
	 private rightUpper:vec3;
	 private rightLower:vec3;
	 private leftUpper:vec3;
	 private leftLower:vec3;
	 private squareColor:vec4;
	/*constructor(triangle1:Triangle,triangle2:Triangle){
		this.m_triangles=[triangle1,triangle2];

	}*/
	constructor(v_0:vec3, v_1:vec3, v_2:vec3, v_3:vec3,color:vec4) {
	this.squareColor=color;
	let biggest, smallest;
	//search the biggest coordinate
		if(v_0[0]>=v_1[0]&&v_0[0]>=v_2[0]&&v_0[0]>=v_3[0]){
			if(v_0[1]>=v_1[1]&&v_0[1]>=v_2[1]&&v_0[1]>=v_3[1]){
				this.rightUpper=v_0;
				biggest=0;
			}
		}
		if(v_1[0]>=v_0[0]&&v_1[0]>=v_2[0]&&v_1[0]>=v_3[0]){
			if(v_1[1]>=v_0[1]&&v_1[1]>=v_2[1]&&v_1[1]>=v_3[1]){
				this.rightUpper=v_1;
				biggest=1;
			}
		}
		if(v_2[0]>=v_0[0]&&v_2[0]>=v_1[0]&&v_2[0]>=v_3[0]){
			if(v_2[1]>=v_0[1]&&v_2[1]>=v_1[1]&&v_2[1]>=v_3[1]){
				this.rightUpper=v_2;
				biggest=2;
			}
		}
		if(v_3[0]>=v_0[0]&&v_3[0]>=v_1[0]&&v_3[0]>=v_2[0]){
			if(v_3[1]>=v_0[1]&&v_3[1]>=v_1[1]&&v_3[1]>=v_2[1]){
				this.rightUpper=v_3;
				biggest=3;
			}
		}
		
		//search for the smallest
		
		if(v_0[0]<=v_1[0]&&v_0[0]<=v_2[0]&&v_0[0]<=v_3[0]){
			if(v_0[1]<=v_1[1]&&v_0[1]<=v_2[1]&&v_0[1]<=v_3[1]){
				this.leftLower=v_0;
				smallest=0;
			}
		}
		if(v_1[0]<=v_0[0]&&v_1[0]<=v_2[0]&&v_1[0]<=v_3[0]){
			if(v_1[1]<=v_0[1]&&v_1[1]<=v_2[1]&&v_1[1]<=v_3[1]){
				this.leftLower=v_1;
				smallest=1;
			}
		}
		if(v_2[0]<=v_0[0]&&v_2[0]<=v_1[0]&&v_2[0]<=v_3[0]){
			if(v_2[1]<=v_0[1]&&v_2[1]<=v_1[1]&&v_2[1]<=v_3[1]){
				this.leftLower=v_2;
				smallest=2;
			}
		}
		if(v_3[0]<=v_0[0]&&v_3[0]<=v_1[0]&&v_3[0]<=v_2[0]){
			if(v_3[1]<=v_0[1]&&v_3[1]<=v_1[1]&&v_3[1]<=v_2[1]){
				this.leftLower=v_3;
				smallest=3;
			}
		}
		for(let i=0;i<4;i++){
			if(smallest!=i&&biggest!=i){
				
					if(i==0&&v_0[1]==this.leftLower[1])
						this.rightLower=v_0;
					if(i==1&&v_1[1]==this.leftLower[1])
						this.rightLower=v_1;
					if(i==2&&v_2[1]==this.leftLower[1])
						this.rightLower=v_2;
					if(i==3&&v_3[1]==this.leftLower[1])
						this.rightLower=v_3;
				
					if(i==0&&v_0[1]==this.rightUpper[1])
						this.leftUpper=v_0;
					if(i==1&&v_1[1]==this.rightUpper[1])
						this.leftUpper=v_1;
					if(i==2&&v_2[1]==this.rightUpper[1])
						this.leftUpper=v_2;
					if(i==3&&v_3[1]==this.rightUpper[1])
						this.leftUpper=v_3;
				}
			
			}
		
		
		console.log(biggest+' '+smallest);
		console.log(v_0[0]+' '+v_0[1]);
		this.m_triangles=[new Triangle(this.rightUpper,this.rightLower,this.leftUpper,this.squareColor),new Triangle(this.rightLower,this.leftLower,this.leftUpper,this.squareColor)];
	}
	rayIntersectsSquare(p:vec3, d:vec3, modelViewMatrix:mat4):boolean{
		return this.m_triangles[0].rayIntersectsTriangle(p,d,modelViewMatrix)||this.triangles[1].rayIntersectsTriangle(p,d,modelViewMatrix);
	}
  get triangles():Triangle[] {
	    return this.m_triangles;
  }
  get rightUpperCoordinate():vec3{
		return this.rightUpper;
  }
  get leftUpperCoordinate():vec3{
		return this.leftUpper;
  }
  get leftLowerCoordinate():vec3{
		return this.leftLower;
  }
  get rightLowerCoordinate():vec3{
		return this.rightLower;
  }
  
	


}
