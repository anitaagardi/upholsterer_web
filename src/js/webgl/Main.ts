import { Scene2D } from './Scene2D';

interface ClickCallback {
	(x,y):void;
}

export class Main {

    private canvas:HTMLCanvasElement;
	private gl:WebGL2RenderingContext;

	private shaderProgram;
	
	private programInfo;
	
	constructor(htmlCanvasElementId:string, vertexShaderSource:string, 
	        fragmentShaderSource:string) {
		
		this.canvas = document.querySelector(htmlCanvasElementId);
	    this.gl = this.canvas.getContext('webgl2');

		if (!this.gl) {
			alert('Unable to initialize WebGL. Your browser or machine may not support it.');
			return;
		}
		
		this.initShaderProgram(vertexShaderSource, fragmentShaderSource);
		
		this.programInfo = {
			program: this.shaderProgram,
			attribLocations: {
			  vertexPosition: this.gl.getAttribLocation(this.shaderProgram, 'aVertexPosition'),
			},
			uniformLocations: {
			  projectionMatrix: this.gl.getUniformLocation(this.shaderProgram, 'uProjectionMatrix'),
			  modelViewMatrix: this.gl.getUniformLocation(this.shaderProgram, 'uModelViewMatrix'),
			},
	    };
				
	}
	
	initBuffers(positions) {

	  const positionBuffer = this.gl.createBuffer();

	 
	  this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer);

	  this.gl.bufferData(this.gl.ARRAY_BUFFER,
					new Float32Array(positions),
					this.gl.STATIC_DRAW);

	  return {
		position: positionBuffer,
	  };
	}

	drawScene(scene:Scene2D) {
	  this.gl.clearColor(0.0, 0.0, 0.0, 1.0);  
	  this.gl.clearDepth(1.0);              
	  this.gl.enable(this.gl.DEPTH_TEST);
	  this.gl.depthFunc(this.gl.LEQUAL);


	  this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

	  for(let i=0; i<scene.triangles.length; i++) {

		  let buffers = this.initBuffers(scene.triangles[i].getVerticesArray());

		  {
			const numComponents = 3;
			const type = this.gl.FLOAT;
			const normalize = false;
			const stride = 0;
			const offset = 0;
			
			this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffers.position);
			this.gl.vertexAttribPointer(
				this.programInfo.attribLocations.vertexPosition,
				numComponents,
				type,
				normalize,
				stride,
				offset);
			this.gl.enableVertexAttribArray(
				this.programInfo.attribLocations.vertexPosition);
		  }


		  this.gl.useProgram(this.programInfo.program);

		  this.gl.uniformMatrix4fv(
			  this.programInfo.uniformLocations.projectionMatrix,
			  false,
			  scene.projectionMatrix);
		  this.gl.uniformMatrix4fv(
			  this.programInfo.uniformLocations.modelViewMatrix,
			  false,
			  scene.modelViewMatrix);

		  {
			const offset = 0;
			let vertexCount = scene.vertexCount;
			this.gl.drawArrays(this.gl.TRIANGLES, offset, vertexCount);
		  }
	
	}
  }


	initShaderProgram(vsSource:string, fsSource:string):void {
	  const vertexShader = this.loadShader(this.gl.VERTEX_SHADER, vsSource);
	  const fragmentShader = this.loadShader(this.gl.FRAGMENT_SHADER, fsSource);

	  this.shaderProgram = this.gl.createProgram();
	  this.gl.attachShader(this.shaderProgram, vertexShader);
	  this.gl.attachShader(this.shaderProgram, fragmentShader);
	  this.gl.linkProgram(this.shaderProgram);


	  if (!this.gl.getProgramParameter(this.shaderProgram, this.gl.LINK_STATUS)) {
		alert('Unable to initialize the shader program: ' + 
		     this.gl.getProgramInfoLog(this.shaderProgram));
		return null;
	  }

	}

	loadShader(type, source):any {
	  const shader = this.gl.createShader(type);


	  this.gl.shaderSource(shader, source);
	  this.gl.compileShader(shader);


	  if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
		alert('An error occurred compiling the shaders: ' + this.gl.getShaderInfoLog(shader));
		this.gl.deleteShader(shader);
		return null;
	  }

	  return shader;
	}

	subscribeClick(clickCallback: ClickCallback):void {
		this.canvas.addEventListener("click", ( event ) => {
			 var rect = this.canvas.getBoundingClientRect();
			 let x = event.clientX - rect.left;
			 let y = event.clientY - rect.top;
			 
			 clickCallback(x,y);
		}, false);
	}

}