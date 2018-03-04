main();

document.getElementById("glCanvas").addEventListener("click", function( event ) {
    clickCanvas(event);
}, false);

function clickCanvas(event) {
	console.log(event);
	let canvas = document.querySelector('#glcanvas');
	let point = get2DPointsInCanvas(canvas,event);
	
	
	let x = 2.0 * point.x / canvas.width - 1;
    let y = - 2.0 * point.y / canvas.height + 1;
	

	let multipliedMatrix = mat4.create();
    mat4.multiply(multipliedMatrix,modelViewMatrix,projectionMatrix);	
	
	let viewProjectionInverse= mat4.create();
	mat4.invert(viewProjectionInverse, multipliedMatrix);
	
	let point3D = vec4.create();
	let pointWorld = vec4.create();
	
    vec4.set(point3D,x,y,1.0,1.0);
	vec4.transformMat4(pointWorld,point3D,viewProjectionInverse);
	
	posw = 1.0/pointWorld[3];
	
	console.log((pointWorld[0]) + "  " + (pointWorld[1]));
	
}

function get2DPointsInCanvas(canvas, event) {
  var rect = canvas.getBoundingClientRect();
  return {
          x: event.clientX - rect.left,
          y: event.clientY - rect.top
  };
}

function main() {
  const canvas = document.querySelector('#glcanvas');
  const gl = canvas.getContext('webgl');

  if (!gl) {
    alert('Unable to initialize WebGL. Your browser or machine may not support it.');
    return;
  }

  const vsSource = `
    attribute vec4 aVertexPosition;
    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;
    void main() {
      gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
    }
  `;

  const fsSource = `
    void main() {
      gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
    }
  `;


  const shaderProgram = initShaderProgram(gl, vsSource, fsSource);

  const programInfo = {
    program: shaderProgram,
    attribLocations: {
      vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
    },
    uniformLocations: {
      projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
      modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
    },
  };

  const buffers = initBuffers(gl);

  drawScene(gl, programInfo, buffers);
}


function initBuffers(gl) {

  const positionBuffer = gl.createBuffer();

 
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  const positions = [
     1.0,  1.0,
    -1.0,  1.0,
     1.0, -1.0,
    -1.0, -1.0,
  ];

 
  gl.bufferData(gl.ARRAY_BUFFER,
                new Float32Array(positions),
                gl.STATIC_DRAW);

  return {
    position: positionBuffer,
  };
}

function drawScene(gl, programInfo, buffers) {
  gl.clearColor(0.0, 0.0, 0.0, 1.0);  
  gl.clearDepth(1.0);              
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);


  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  const fieldOfView = 45 * Math.PI / 180;  
  const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
  const zNear = 0.1;
  const zFar = 100.0;

  projectionMatrix = mat4.create();
 
  mat4.perspective(projectionMatrix,
                   fieldOfView,
                   aspect,
                   zNear,
                   zFar);

  
  modelViewMatrix = mat4.create();


  mat4.translate(modelViewMatrix,    
                 modelViewMatrix,   
                 [-0.0, 0.0, -6.0]);

  {
    const numComponents = 2;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
    gl.vertexAttribPointer(
        programInfo.attribLocations.vertexPosition,
        numComponents,
        type,
        normalize,
        stride,
        offset);
    gl.enableVertexAttribArray(
        programInfo.attribLocations.vertexPosition);
  }



  gl.useProgram(programInfo.program);


  gl.uniformMatrix4fv(
      programInfo.uniformLocations.projectionMatrix,
      false,
      projectionMatrix);
  gl.uniformMatrix4fv(
      programInfo.uniformLocations.modelViewMatrix,
      false,
      modelViewMatrix);

  {
    const offset = 0;
    const vertexCount = 4;
    gl.drawArrays(gl.TRIANGLE_STRIP, offset, vertexCount);
  }
}


function initShaderProgram(gl, vsSource, fsSource) {
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);



  const shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);


  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
    return null;
  }

  return shaderProgram;
}


function loadShader(gl, type, source) {
  const shader = gl.createShader(type);


  gl.shaderSource(shader, source);


  gl.compileShader(shader);


  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}
