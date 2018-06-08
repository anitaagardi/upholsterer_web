import { vec3, vec4, mat3, mat4 } from 'gl-matrix';
import { Scene2D } from './Scene2D';
import { Scene3D } from './Scene3D';
import { Subscription } from 'rxjs/Subscription';
import { fragmentShaderSource as colorFragmentShaderSource } from './shaders/color/fragment';
import { vertexShaderSource as colorVertexShaderSource } from './shaders/color/vertex';
import { fragmentShaderSource as textureFragmentShaderSource } from './shaders/texture/fragment';
import { vertexShaderSource as textureVertexShaderSource } from './shaders/texture/vertex';
import { Scene } from './Scene';
interface ClickCallback {
	(x, y): void;
}
/*
	This class set the scenes (the 2d scene and the 3d scene)
	The class also handles mouse and key events
	The class contains the openGL settings
	The class contains the shader programs, the drawing logic of the elements of the scene
*/
export class Main {

	private canvas: HTMLCanvasElement;
	private gl: WebGL2RenderingContext;
	private scene: Scene;
	private sceneSubscription: Subscription;
	private colorShaderProgram;
	private colorProgramInfo;
	private textureShaderProgram;
	private textureProgramInfo;
	constructor(htmlCanvasElementId: string) {
		this.canvas = document.querySelector(htmlCanvasElementId);
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
		let textCanvas: HTMLCanvasElement = document.getElementById("text") as HTMLCanvasElement;
		// make a 2D context for it
		let ctx = textCanvas.getContext("2d");
		ctx.clearRect(0, 0, textCanvas.width, textCanvas.height);
		const image = new Image();
		image.onload = () => {
			if (!scene) {
				scene = this.scene;
			}
			this.gl.clearColor(1, 1, 1, 0.9);
			this.gl.clearDepth(1.0);
			this.gl.enable(this.gl.DEPTH_TEST);
			this.gl.depthFunc(this.gl.LEQUAL);
			this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
			let grid = scene.getGrid();
			if (grid) {
				if (scene instanceof Scene3D) {
					let vecs = grid[0];
					let buffers = this.initBuffersTexture(vecs, [
						2048.0, 2048.0,
						2048.0, 0.0,
						0.0, 0.0,
						0, 2048.0
					], [0, 1, 2, 0, 2, 3]);
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
						scene.getProjectionMatrix());
					this.gl.uniformMatrix4fv(
						this.textureProgramInfo.uniformLocations.modelViewMatrix,
						false,
						scene.getModelViewMatrix());
					this.gl.drawElements(this.gl.TRIANGLES, 6, this.gl.UNSIGNED_SHORT, 0);
				} else {
					let buffers = this.initBuffers(grid[0], grid[1])
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
						scene.getProjectionMatrix());
					this.gl.uniformMatrix4fv(
						this.colorProgramInfo.uniformLocations.modelViewMatrix,
						false,
						scene.getModelViewMatrix());
					this.gl.drawArrays(this.gl.LINES, 0, grid[1].length / 4);
				}
				if (scene instanceof Scene2D) {
					let textCanvas: HTMLCanvasElement = document.getElementById("text") as HTMLCanvasElement;
					var ctx = textCanvas.getContext("2d");
					ctx.font = "15px Arial";
					ctx.textAlign = 'center';
					ctx.textBaseline = 'top';
					ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
					for (let i = 0; i < scene.getRooms().length; i++) {
						let screenPointFrom = scene.convert3DPointToScreen(
							vec4.fromValues(scene.getRooms()[i].getSquares()[0].getLeftUpperCoordinate()[0], scene.getRooms()[i].getSquares()[0].getLeftUpperCoordinate()[1]
								, scene.getRooms()[i].getSquares()[0].getLeftUpperCoordinate()[2], 1.0));
						let screenPointTo = scene.convert3DPointToScreen(
							vec4.fromValues(scene.getRooms()[i].getSquares()[0].getRightLowerCoordinate()[0], scene.getRooms()[i].getSquares()[0].getRightLowerCoordinate()[1]
								, scene.getRooms()[i].getSquares()[0].getRightLowerCoordinate()[2], 1.0));
						ctx.font = 12 + "px Arial";
						ctx.fillText(scene.getRooms()[i].getRoomName() + "", (screenPointFrom[0] + screenPointTo[0]) / 2, ((screenPointFrom[1] + screenPointTo[1]) / 2) - 6);
						ctx.fillText(scene.getRooms()[i].getSquareMeter() + " m2 ", (screenPointFrom[0] + screenPointTo[0]) / 2, ((screenPointFrom[1] + screenPointTo[1]) / 2) + 6);
						//falak
						for (let j = 0; j < scene.getRooms()[i].getSquares().length; j++) {
							for (let k = 0; k < scene.getRooms()[i].getSquares()[j].getTriangles().length; k++) {
								let buffers = this.initBuffers(scene.getRooms()[i].getSquares()[j].getTriangles()[k].getVerticesArray(), scene.getRooms()[i].getSquares()[j].getTriangles()[k].getColorArray());
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
									scene.getProjectionMatrix());
								this.gl.uniformMatrix4fv(
									this.colorProgramInfo.uniformLocations.modelViewMatrix,
									false,
									scene.getModelViewMatrix());
								{
									const offset = 0;
									let vertexCount = scene.getVertexCount();
									this.gl.drawArrays(this.gl.TRIANGLES, offset, vertexCount);
								}
							}
						}
						//ajtó
						for (let j = 0; j < scene.getRooms()[i].getRoomDoors().length; j++) {
							for (let k = 0; k < scene.getRooms()[i].getRoomDoors()[j].getTriangles().length; k++) {
								let buffers = this.initBuffers(scene.getRooms()[i].getRoomDoors()[j].getTriangles()[k].getVerticesArray(), scene.getRooms()[i].getRoomDoors()[j].getTriangles()[k].getColorArray());
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
									scene.getProjectionMatrix());
								this.gl.uniformMatrix4fv(
									this.colorProgramInfo.uniformLocations.modelViewMatrix,
									false,
									scene.getModelViewMatrix());
								{
									const offset = 0;
									let vertexCount = 4;
									this.gl.drawArrays(this.gl.TRIANGLES, offset, 3);
								}
							}
						}
						//ablak
						for (let j = 0; j < scene.getRooms()[i].getRoomWindows().length; j++) {
							for (let k = 0; k < scene.getRooms()[i].getRoomWindows()[j].getTriangles().length; k++) {
								let buffers = this.initBuffers(scene.getRooms()[i].getRoomWindows()[j].getTriangles()[k].getVerticesArray(), scene.getRooms()[i].getRoomWindows()[j].getTriangles()[k].getColorArray());
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
									scene.getProjectionMatrix());
								this.gl.uniformMatrix4fv(
									this.colorProgramInfo.uniformLocations.modelViewMatrix,
									false,
									scene.getModelViewMatrix());
								{
									const offset = 0;
									let vertexCount = 4;
									this.gl.drawArrays(this.gl.TRIANGLES, offset, 3);
								}
							}
						}
					}
				}
			}
		};
		image.src = "grid.jpg";
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
			var rect = this.canvas.getBoundingClientRect();
			let x = event.clientX - rect.left;
			let y = event.clientY - rect.top;
			clickCallback(x, y);
		}, false);
	}
	texture2D(textureOptions, indexRoom, scene?: Scene) {
	}
}