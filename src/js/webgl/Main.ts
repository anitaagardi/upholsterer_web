import { vec3, vec4, mat3, mat4 } from 'gl-matrix';
import { Scene2D } from './Scene2D';
import { Scene3D } from './Scene3D';
import { Subscription } from 'rxjs/Subscription';
import { fragmentShaderSource as colorFragmentShaderSource } from './shaders/color/fragment';
import { vertexShaderSource as colorVertexShaderSource } from './shaders/color/vertex';
import { fragmentShaderSource as textureFragmentShaderSource } from './shaders/texture/fragment';
import { vertexShaderSource as textureVertexShaderSource } from './shaders/texture/vertex';
import { Triangle } from './Triangle';
import { Scene } from './Scene';
import { Observable } from 'rxjs';

import * as Rx from 'rxjs/Rx';
import { Visitor } from './Visitor';
import { Component } from './Component';
import { MultiLineText } from './MultiLineText';
import { LineGrid } from './LineGrid';
import { TexturedGrid } from './TexturedGrid';
import { LocalResourceLoader } from './LocalResourceLoader';
import { ComponentList } from './ComponentList';
import { Box } from './Box';

interface ClickCallback {
	(x, y): void;
}
/*
	This class set the scenes (the 2d scene and the 3d scene)
	The class also handles mouse and key events
	The class contains the openGL settings
	The class contains the shader programs, the drawing logic of the elements of the scene
*/
export class Main implements Visitor {

	private canvas: HTMLCanvasElement;
	private gl: WebGL2RenderingContext;
	private scene: Scene;
	private sceneSubscription: Subscription;
	private colorShaderProgram;
	private colorProgramInfo;
	private textureShaderProgram;
	private textureProgramInfo;

	private dragged: boolean;
	private lastX: number;
	private lastY: number;
	private width: number;
	private height: number;

	private sceneDraggingEvent: Observable<any>;

	constructor(htmlCanvasElementId: string) {
		this.canvas = document.querySelector(htmlCanvasElementId);

		let canvasParentRect = this.canvas.getBoundingClientRect();
		this.width = canvasParentRect.width;
		this.height = canvasParentRect.height;

		this.gl = this.canvas.getContext('webgl2') as WebGL2RenderingContext;
		if (!this.gl) {
			alert('Unable to initialize WebGL. Your browser or machine may not support it.');
			return;
		}
		this.colorShaderProgram = this.initShaderProgram(colorVertexShaderSource, colorFragmentShaderSource);
		this.colorProgramInfo = {
			program: this.colorShaderProgram,
			attribLocations: {
				vertexPosition: this.gl.getAttribLocation(this.colorShaderProgram, 'aVertexPosition'),
				vertexColor: this.gl.getAttribLocation(this.colorShaderProgram, 'aVertexColor')
			},
			uniformLocations: {
				projectionMatrix: this.gl.getUniformLocation(this.colorShaderProgram, 'uProjectionMatrix'),
				modelViewMatrix: this.gl.getUniformLocation(this.colorShaderProgram, 'uModelViewMatrix')
			},
		};
		this.textureShaderProgram = this.initShaderProgram(textureVertexShaderSource, textureFragmentShaderSource);
		this.textureProgramInfo = {
			program: this.textureShaderProgram,
			attribLocations: {
				vertexPosition: this.gl.getAttribLocation(this.textureShaderProgram, 'aVertexPosition'),
				textureCoord: this.gl.getAttribLocation(this.textureShaderProgram, 'aTextureCoord'),
			},
			uniformLocations: {
				projectionMatrix: this.gl.getUniformLocation(this.textureShaderProgram, 'uProjectionMatrix'),
				modelViewMatrix: this.gl.getUniformLocation(this.textureShaderProgram, 'uModelViewMatrix'),
				uSampler: this.gl.getUniformLocation(this.textureShaderProgram, 'uSampler'),
			},
		};

		let
			mousedown = Rx.Observable.fromEvent(this.canvas, 'mousedown'),
			mousemove = Rx.Observable.fromEvent(document, 'mousemove'),
			mouseup = Rx.Observable.fromEvent(document, 'mouseup');

		//Detect mouse down; 
		//While down, listen for mouse move and mouse up;
		//When mouse up: stop listening for moves and ups.
		this.sceneDraggingEvent = mousedown.flatMap((md: any) => {
			// Capture mouse down offset position
			md.preventDefault();

			this.lastX = md.clientX;
			this.lastY = md.clientY;

			// B1. Track mouse position differentials using mousemove until we hear a mouseup
			return mousemove.map((mm: any) => {
				mm.preventDefault();

				//chrome simultaneously mousemove and click issue
				if (!this.dragged && (mm.clientX !== this.lastX || mm.clientY !== this.lastY)) {
					this.dragged = true;
				}

				if (this.dragged) {
					let prevX = this.lastX;
					let prevY = this.lastY;

					this.lastX = mm.clientX;
					this.lastY = mm.clientY;

					return {
						prevPos: {
							x: prevX,
							y: prevY
						},
						currentPos: {
							x: mm.clientX,
							y: mm.clientY
						}
					};
				} else {
					return { prevPos: null, currentPos: null };
				}
				// C. stop the drag when mousup
			}).takeUntil(mouseup);
		});

		// Subscribe to mousemove's mousedrag stream:
		// B2. Update draggable's position from the mousedrag stream of events
		/*mousedrag.subscribe((pos: any) => {

			if (pos) {
				//console.log("FRONT");
				let xoffset = pos.x - this.lastX;
				let yoffset = this.lastY - pos.y;

				//console.log(xoffset + " " + yoffset);
				this.lastX = pos.x;
				this.lastY = pos.y;

				let sensitivity = 0.05;
				xoffset *= sensitivity;
				yoffset *= sensitivity;

				this.yaw += xoffset;
				this.pitch += yoffset;

				//console.log(this.yaw + " " + this.pitch);

				if (this.pitch > 89.0) {
					this.pitch = 89.0;
				}
				if (this.pitch < -89.0) {
					this.pitch = -89.0;

				}

				let yawRadian = this.yaw * Math.PI / 180.0;
				let pitchRadian = this.pitch * Math.PI / 180.0;


				let front = vec3.fromValues(Math.cos(yawRadian) * Math.cos(pitchRadian),
					Math.sin(pitchRadian), Math.sin(yawRadian) * Math.cos(pitchRadian));



				//console.log(front);
				this.scene.lookAt(vec3.fromValues(0, 0, 0), front, vec3.fromValues(0, 1, 0));
				this.drawScene(this.scene);
		
			}

		});*/

		mouseup.subscribe((event) => {
			this.dragged = false;
		})

	}

	getWidth():number {
		return this.width;
	}

	getHeight():number {
		return this.height;
	}
	//subscribe to an event
	//if we add anything to the scene, this method redraw
	setScene = (scene: Scene) => {
		if (this.scene) {
			this.sceneSubscription.unsubscribe();
		}
		this.scene = scene;
		this.sceneSubscription = this.scene.roomSource$.subscribe(
			() => {
				this.drawScene();
			}
		)
	};
	//
	// Initialize a texture and load an image.
	// When the image finished loading copy it into the texture.
	//
	loadTexture = (image: HTMLImageElement) => {
		const texture = this.gl.createTexture();
		this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
		// Because images have to be download over the internet
		// they might take a moment until they are ready.
		// Until then put a single pixel in the texture so we can
		// use it immediately. When the image has finished downloading
		// we'll update the texture with the contents of the image.
		const level = 0;
		const internalFormat = this.gl.RGBA;
		const width = 1;
		const height = 1;
		const border = 0;
		const srcFormat = this.gl.RGBA;
		const srcType = this.gl.UNSIGNED_BYTE;

		/*const pixel = new Uint8Array([0, 0, 255, 255]);

		this.gl.texImage2D(this.gl.TEXTURE_2D, level, internalFormat,
			width, height, border, srcFormat, srcType,
			pixel);

		const image = new Image();
		image.onload = () => {*/

		this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
		this.gl.texImage2D(this.gl.TEXTURE_2D, level, internalFormat,
			srcFormat, srcType, image);
		// WebGL1 has different requirements for power of 2 images
		// vs non power of 2 images so check if the image is a
		// power of 2 in both dimensions.
		if (this.isPowerOf2(image.width) && this.isPowerOf2(image.height)) {
			// Yes, it's a power of 2. Generate mips.
			this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.REPEAT);
			this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.REPEAT);
			this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR_MIPMAP_LINEAR);
			this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
			this.gl.generateMipmap(this.gl.TEXTURE_2D);
		} else {
			// No, it's not a power of 2. Turn of mips and set
			// wrapping to clamp to edge
			this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.REPEAT);
			this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.REPEAT);
			this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
		}

		/*};
		image.src = "grid2.jpg";*/
		return texture;
	}
	isPowerOf2 = (value) => {
		return (value & (value - 1)) == 0;
	}
	initBuffers(positions, colors) {
		const positionBuffer = this.gl.createBuffer();
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer);
		this.gl.bufferData(this.gl.ARRAY_BUFFER,
			new Float32Array(positions),
			this.gl.STATIC_DRAW);
		const colorBuffer = this.gl.createBuffer();
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, colorBuffer);
		this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(colors), this.gl.STATIC_DRAW);
		return {
			position: positionBuffer,
			color: colorBuffer
		};
	}
	initBuffersTexture(positions, textureCoords, indices) {
		const positionBuffer = this.gl.createBuffer();
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer);
		this.gl.bufferData(this.gl.ARRAY_BUFFER,
			new Float32Array(positions),
			this.gl.STATIC_DRAW);
		const textureCoordBuffer = this.gl.createBuffer();
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, textureCoordBuffer);
		this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(textureCoords),
			this.gl.STATIC_DRAW);
		// Create an empty buffer object to store Index buffer
		var indexBuffer = this.gl.createBuffer();
		// Bind appropriate array buffer to it
		this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
		// Pass the vertex data to the buffer
		this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), this.gl.STATIC_DRAW);
		return {
			position: positionBuffer,
			textureCoord: textureCoordBuffer,
			index: indexBuffer,
		};
	}
	drawScene(scene?: Scene) {
		/*let textCanvas: HTMLCanvasElement = document.getElementById("text") as HTMLCanvasElement;
		let ctx = textCanvas.getContext("2d");
		ctx.clearRect(0, 0, textCanvas.width, textCanvas.height);*/
		/*const image = new Image();
		image.onload = () => {*/

		if (!scene) {
			scene = this.scene;
		}

		let grids: Component[] = scene.getGrid();
		let gridList = new ComponentList(grids);
		gridList.loadResourceForComponents(new LocalResourceLoader()).then(() => {
			if (grids) {

				this.gl.clearColor(1, 1, 1, 0.9);
				this.gl.clearDepth(1.0);
				this.gl.enable(this.gl.DEPTH_TEST);
				this.gl.depthFunc(this.gl.LEQUAL);
				this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

				grids.forEach(grid => grid.accept(this));

				//	if (scene instanceof Scene2D) {
				/*let textCanvas: HTMLCanvasElement = document.getElementById("text") as HTMLCanvasElement;
				let ctx = textCanvas.getContext("2d");
				ctx.font = "15px Arial";
				ctx.textAlign = 'center';
				ctx.textBaseline = 'top';
				ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);*/

				//}

				/*let component: Component[] = this.scene.getDrawingRooms();
				for (let i = 0; i < component.length; i++) {
					component[i].accept(this);
				}*/
			}

		});
		/*};
		image.src = "grid2.jpg";*/
	}

	drawMultiLineText(multiLineText: MultiLineText) {
		/*let textCanvas: HTMLCanvasElement = document.getElementById("text") as HTMLCanvasElement;
		var ctx = textCanvas.getContext("2d");
		ctx.font = 12 + "px Arial";
		for (let i = 0; i < multiLineText.getLines().length; i++) {
			ctx.fillText(multiLineText.getLines()[i], multiLineText.getX()[i], multiLineText.getY()[i]);
		}*/
	}

	drawLineGrid(lineGrid: LineGrid) {
		let buffers = this.initBuffers(lineGrid.getVertices(), lineGrid.getColors());
		{
			const numComponents = 3;
			const type = this.gl.FLOAT;
			const normalize = false;
			const stride = 0;
			const offset = 0;
			this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffers.position);
			this.gl.vertexAttribPointer(
				this.colorProgramInfo.attribLocations.vertexPosition,
				numComponents,
				type,
				normalize,
				stride,
				offset);
			this.gl.enableVertexAttribArray(
				this.colorProgramInfo.attribLocations.vertexPosition);
		}
		{
			const numComponents = 4;
			const type = this.gl.FLOAT;
			const normalize = false;
			const stride = 0;
			const offset = 0;
			this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffers.color);
			this.gl.vertexAttribPointer(
				this.colorProgramInfo.attribLocations.vertexColor,
				numComponents,
				type,
				normalize,
				stride,
				offset);
			this.gl.enableVertexAttribArray(
				this.colorProgramInfo.attribLocations.vertexColor);
		}
		this.gl.useProgram(this.colorProgramInfo.program);
		this.gl.uniformMatrix4fv(
			this.colorProgramInfo.uniformLocations.projectionMatrix,
			false,
			this.scene.getProjectionMatrix());
		this.gl.uniformMatrix4fv(
			this.colorProgramInfo.uniformLocations.modelViewMatrix,
			false,
			this.scene.getModelViewMatrix());
		this.gl.drawArrays(this.gl.LINES, 0, lineGrid.getColors().length / 4);
	}

	drawTexturedGrid(texturedGrid: TexturedGrid) {
		/*let scalar = 2048;*/
		/*let buffers = this.initBuffersTexture(vecs, [
			scalar, scalar,
			scalar, 0.0,
			0.0, 0.0,
			0, scalar
		], [0, 1, 2, 0, 2, 3]);*/

		let buffers = this.initBuffersTexture(texturedGrid.getVerticesArray(),
			texturedGrid.getTextureCoordinatesArray(), texturedGrid.getVertexIndices());

		let image = texturedGrid.getImages()[0];

		const texture = this.loadTexture(image);
		{
			const numComponents = 3;
			const type = this.gl.FLOAT;
			const normalize = false;
			const stride = 0;
			const offset = 0;
			this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffers.position);
			// Bind index buffer object
			this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, buffers.index);
			this.gl.vertexAttribPointer(
				this.textureProgramInfo.attribLocations.vertexPosition,
				numComponents,
				type,
				normalize,
				stride,
				offset);
			this.gl.enableVertexAttribArray(
				this.textureProgramInfo.attribLocations.vertexPosition);
		}
		// tell webgl how to pull out the texture coordinates from buffer
		{
			const num = 2; // every coordinate composed of 2 values
			const type = this.gl.FLOAT; // the data in the buffer is 32 bit float
			const normalize = false; // don't normalize
			const stride = 0; // how many bytes to get from one set to the next
			const offset = 0; // how many bytes inside the buffer to start from
			this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffers.textureCoord);
			this.gl.vertexAttribPointer(this.textureProgramInfo.attribLocations.textureCoord, num, type, normalize, stride, offset);
			this.gl.enableVertexAttribArray(this.textureProgramInfo.attribLocations.textureCoord);
		}
		this.gl.useProgram(this.textureProgramInfo.program);
		// Tell WebGL we want to affect texture unit 0
		this.gl.activeTexture(this.gl.TEXTURE0);
		// Bind the texture to texture unit 0
		this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
		// Tell the shader we bound the texture to texture unit 0
		this.gl.uniform1i(this.textureProgramInfo.uniformLocations.uSampler, 0);
		this.gl.uniformMatrix4fv(
			this.textureProgramInfo.uniformLocations.projectionMatrix,
			false,
			this.scene.getProjectionMatrix());
		this.gl.uniformMatrix4fv(
			this.textureProgramInfo.uniformLocations.modelViewMatrix,
			false,
			this.scene.getModelViewMatrix());
		this.gl.drawElements(this.gl.TRIANGLES, 6, this.gl.UNSIGNED_SHORT, 0);
	};

	drawTriangle(triangle: Triangle) {
		//console.log("HAROMSZOG");
		//console.log(triangle.getVerticesArray());
		let buffers = this.initBuffers(triangle.getVerticesArray(), triangle.getColorArray());
		{
			const numComponents = 3;
			const type = this.gl.FLOAT;
			const normalize = false;
			const stride = 0;
			const offset = 0;
			this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffers.position);
			this.gl.vertexAttribPointer(
				this.colorProgramInfo.attribLocations.vertexPosition,
				numComponents,
				type,
				normalize,
				stride,
				offset);
			this.gl.enableVertexAttribArray(
				this.colorProgramInfo.attribLocations.vertexPosition);
		}
		{
			const numComponents = 4;
			const type = this.gl.FLOAT;
			const normalize = false;
			const stride = 0;
			const offset = 0;
			this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffers.color);
			this.gl.vertexAttribPointer(
				this.colorProgramInfo.attribLocations.vertexColor,
				numComponents,
				type,
				normalize,
				stride,
				offset);
			this.gl.enableVertexAttribArray(
				this.colorProgramInfo.attribLocations.vertexColor);
		}
		this.gl.useProgram(this.colorProgramInfo.program);
		this.gl.uniformMatrix4fv(
			this.colorProgramInfo.uniformLocations.projectionMatrix,
			false,
			this.scene.getProjectionMatrix());
		this.gl.uniformMatrix4fv(
			this.colorProgramInfo.uniformLocations.modelViewMatrix,
			false,
			this.scene.getModelViewMatrix());
		{
			const offset = 0;
			let vertexCount = 4;
			this.gl.drawArrays(this.gl.TRIANGLES, offset, 3);
		}
	}

	drawBox(box: Box) {
		let verticesArray = box.getVerticesArray();
		let buffers = this.initBuffers(verticesArray, box.getColorArray());
		{
			const numComponents = 3;
			const type = this.gl.FLOAT;
			const normalize = false;
			const stride = 0;
			const offset = 0;
			this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffers.position);
			this.gl.vertexAttribPointer(
				this.colorProgramInfo.attribLocations.vertexPosition,
				numComponents,
				type,
				normalize,
				stride,
				offset);
			this.gl.enableVertexAttribArray(
				this.colorProgramInfo.attribLocations.vertexPosition);
		}
		{
			const numComponents = 4;
			const type = this.gl.FLOAT;
			const normalize = false;
			const stride = 0;
			const offset = 0;
			this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffers.color);
			this.gl.vertexAttribPointer(
				this.colorProgramInfo.attribLocations.vertexColor,
				numComponents,
				type,
				normalize,
				stride,
				offset);
			this.gl.enableVertexAttribArray(
				this.colorProgramInfo.attribLocations.vertexColor);
		}
		this.gl.useProgram(this.colorProgramInfo.program);
		this.gl.uniformMatrix4fv(
			this.colorProgramInfo.uniformLocations.projectionMatrix,
			false,
			this.scene.getProjectionMatrix());
		this.gl.uniformMatrix4fv(
			this.colorProgramInfo.uniformLocations.modelViewMatrix,
			false,
			this.scene.getModelViewMatrix());
		{
			const offset = 0;
			this.gl.drawArrays(this.gl.TRIANGLES, offset, verticesArray.length / 3);
		}
	}

	initShaderProgram(vsSource: string, fsSource: string): any {
		const vertexShader = this.loadShader(this.gl.VERTEX_SHADER, vsSource);
		const fragmentShader = this.loadShader(this.gl.FRAGMENT_SHADER, fsSource);
		let shaderProgram = this.gl.createProgram();
		this.gl.attachShader(shaderProgram, vertexShader);
		this.gl.attachShader(shaderProgram, fragmentShader);
		this.gl.linkProgram(shaderProgram);
		if (!this.gl.getProgramParameter(shaderProgram, this.gl.LINK_STATUS)) {
			alert('Unable to initialize the shader program: ' +
				this.gl.getProgramInfoLog(shaderProgram));
			return null;
		}
		return shaderProgram;
	}
	loadShader(type, source): any {
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
	subscribeClick(clickCallback: ClickCallback): void {
		this.canvas.addEventListener("click", (event) => {
			let borderLeft = 10;
			let borderTop = 10;
			//console.log(borderLeft + " " + borderTop);
			var rect = this.canvas.getBoundingClientRect();
			let x = event.clientX - rect.left - borderLeft;
			let y = event.clientY - rect.top - borderTop;
			clickCallback(x, y);
		}, false);
	}

	texture2D(textureOptions, indexRoom, scene?: Scene) {
	}

	onDragging() {
		return this.sceneDraggingEvent;
	}
}