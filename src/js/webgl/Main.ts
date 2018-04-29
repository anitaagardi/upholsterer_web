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

	setScene = (scene: Scene) => {
		if (this.scene) {
			this.sceneSubscription.unsubscribe();
		}
		this.scene = scene;
		this.sceneSubscription = this.scene.roomSource$.subscribe(
			() => {
				console.log("Itt");
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
		/*const pixel = new Uint8Array([0, 0, 255, 255]);  // opaque blue
		this.gl.texImage2D(this.gl.TEXTURE_2D, level, internalFormat,
			width, height, border, srcFormat, srcType,
			pixel);*/

		//const image = new Image();
		//image.onload = () => {
		console.log("BEtolt");
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
			//this.gl.texParameterf(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAX_LEVEL, 16);
			this.gl.generateMipmap(this.gl.TEXTURE_2D);
			//this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.REPEAT);
			//this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.REPEAT);

		} else {
			// No, it's not a power of 2. Turn of mips and set
			// wrapping to clamp to edge
			this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.REPEAT);
			this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.REPEAT);
			this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
		}
		//};
		//image.src = url;

		return texture;
	}

	isPowerOf2 = (value) => {
		return (value & (value - 1)) == 0;
	}

	//TODO: szín legyen opcionális
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

			//TODO: new color
			//this.gl.clearColor(0, 0, 255, 0.3);
			this.gl.clearColor(1, 1, 1, 0.9);
			//this.gl.clearColor(247 / 255, 244 / 255, 244 / 255, 0.9);
			this.gl.clearDepth(1.0);
			this.gl.enable(this.gl.DEPTH_TEST);
			this.gl.depthFunc(this.gl.LEQUAL);


			this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
			/*var colors = [];
			var vertices = [];
			for (var i = 0; i < 2000; i = i + 50) {
				//függőleges
				colors = colors.concat([0, 0, 0, 0.0]);
	
	
	
				let v = scene.convert2DPointTo3DWorld(i, 0);
				vertices = vertices.concat([v[0], v[1], v[2]]);
	
				v = scene.convert2DPointTo3DWorld(i, 800);
				vertices = vertices.concat([v[0], v[1], v[2]]);
				//vízszintes
				colors = colors.concat([0, 0, 0, 0.0]);
	
	
	
				v = scene.convert2DPointTo3DWorld(0, i);
				vertices = vertices.concat([v[0], v[1], v[2]]);
	
				v = scene.convert2DPointTo3DWorld(1000, i);
				vertices = vertices.concat([v[0], v[1], v[2]]);
	
	
			}*/

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

					console.log(buffers);

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

					/*{
						const numComponents = 4;
						const type = this.gl.FLOAT;
						const normalize = false;
						const stride = 0;
						const offset = 0;
						this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffers.color);
						this.gl.vertexAttribPointer(
							this.programInfo.attribLocations.vertexColor,
							numComponents,
							type,
							normalize,
							stride,
							offset);
						this.gl.enableVertexAttribArray(
							this.programInfo.attribLocations.vertexColor);
					}*/

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

					//TODO: useProgram-t nem biztos, hogy mindig meg kellene hívni
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
						scene.projectionMatrix);
					this.gl.uniformMatrix4fv(
						this.textureProgramInfo.uniformLocations.modelViewMatrix,
						false,
						scene.modelViewMatrix);


					//this.gl.drawArrays(this.gl.LINES, 0, grid[1].length / 4);

					//this.gl.drawArrays(this.gl.LINES, 0, grid[0].length/3);
					//this.gl.drawArrays(this.gl.TRIANGLES, 0 , 3);

					//this.gl.drawArrays(this.gl.TRIANGLES, 0 , 3);

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

						// Bind index buffer object
						//this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, buffers.index);
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

					//TODO: useProgram-t nem biztos, hogy mindig meg kellene hívni
					this.gl.useProgram(this.colorProgramInfo.program);

					this.gl.uniformMatrix4fv(
						this.colorProgramInfo.uniformLocations.projectionMatrix,
						false,
						scene.projectionMatrix);
					this.gl.uniformMatrix4fv(
						this.colorProgramInfo.uniformLocations.modelViewMatrix,
						false,
						scene.modelViewMatrix);

					this.gl.drawArrays(this.gl.LINES, 0, grid[1].length / 4);
				}

				if (scene instanceof Scene2D) {
					let textCanvas: HTMLCanvasElement = document.getElementById("text") as HTMLCanvasElement;

					// make a 2D context for it
					var ctx = textCanvas.getContext("2d");

					ctx.font = "15px Arial";
					ctx.textAlign = 'center';
					ctx.textBaseline = 'top';

					console.log("Meret " + ctx.canvas.width + " " + ctx.canvas.height);
					ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);


					for (let i = 0; i < scene.rooms.length; i++) {

						let screenPointFrom = scene.convert3DPointToScreen(
							vec4.fromValues(scene.rooms[i].squares[0].leftUpperCoordinate[0], scene.rooms[i].squares[0].leftUpperCoordinate[1]
								, scene.rooms[i].squares[0].leftUpperCoordinate[2], 1.0));

						let screenPointTo = scene.convert3DPointToScreen(
							vec4.fromValues(scene.rooms[i].squares[0].rightLowerCoordinate[0], scene.rooms[i].squares[0].rightLowerCoordinate[1]
								, scene.rooms[i].squares[0].rightLowerCoordinate[2], 1.0));
						console.log("E " + screenPointFrom[0] + " " + screenPointFrom[1]);
						//ctx.font = (10 * scene.rooms[i].height) + "px Arial";
						ctx.font = 12 + "px Arial";
						ctx.fillText(scene.rooms[i].roomName + "", (screenPointFrom[0] + screenPointTo[0]) / 2, ((screenPointFrom[1] + screenPointTo[1]) / 2) - 6);

						ctx.fillText(scene.rooms[i].squareMeter + " m2 ", (screenPointFrom[0] + screenPointTo[0]) / 2, ((screenPointFrom[1] + screenPointTo[1]) / 2) + 6);


						//falak
						for (let j = 0; j < scene.rooms[i].squares.length; j++) {
							for (let k = 0; k < scene.rooms[i].squares[j].triangles.length; k++) {

								let buffers = this.initBuffers(scene.rooms[i].squares[j].triangles[k].getVerticesArray(), scene.rooms[i].squares[j].triangles[k].getColorArray());

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
									scene.projectionMatrix);
								this.gl.uniformMatrix4fv(
									this.colorProgramInfo.uniformLocations.modelViewMatrix,
									false,
									scene.modelViewMatrix);

								{
									const offset = 0;
									let vertexCount = scene.vertexCount;
									this.gl.drawArrays(this.gl.TRIANGLES, offset, vertexCount);
								}

							}
						}

						//ajtó
						for (let j = 0; j < scene.rooms[i].room_doors.length; j++) {
							for (let k = 0; k < scene.rooms[i].room_doors[j].triangles.length; k++) {

								let buffers = this.initBuffers(scene.rooms[i].room_doors[j].triangles[k].getVerticesArray(), scene.rooms[i].room_doors[j].triangles[k].getColorArray());

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
									scene.projectionMatrix);
								this.gl.uniformMatrix4fv(
									this.colorProgramInfo.uniformLocations.modelViewMatrix,
									false,
									scene.modelViewMatrix);

								{
									const offset = 0;
									let vertexCount = 4;
									this.gl.drawArrays(this.gl.TRIANGLES, offset, 3);
								}

							}
						}
						//ablak
						for (let j = 0; j < scene.rooms[i].room_windows.length; j++) {
							for (let k = 0; k < scene.rooms[i].room_windows[j].triangles.length; k++) {

								let buffers = this.initBuffers(scene.rooms[i].room_windows[j].triangles[k].getVerticesArray(), scene.rooms[i].room_windows[j].triangles[k].getColorArray());

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
									scene.projectionMatrix);
								this.gl.uniformMatrix4fv(
									this.colorProgramInfo.uniformLocations.modelViewMatrix,
									false,
									scene.modelViewMatrix);

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
		/*

		// look up the text canvas.
		let textCanvas: HTMLCanvasElement = document.getElementById("text") as HTMLCanvasElement;

		// make a 2D context for it
		var ctx = textCanvas.getContext("2d");

		ctx.font = "15px Arial";
		ctx.textAlign = 'center';
		ctx.textBaseline = 'top';

		console.log("Meret " + ctx.canvas.width + " " + ctx.canvas.height);
		ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);


		for (let i = 0; i < scene.rooms.length; i++) {

			let screenPointFrom = scene.convert3DPointToScreen(
				vec4.fromValues(scene.rooms[i].squares[0].leftUpperCoordinate[0], scene.rooms[i].squares[0].leftUpperCoordinate[1]
					, scene.rooms[i].squares[0].leftUpperCoordinate[2], 1.0));

			let screenPointTo = scene.convert3DPointToScreen(
				vec4.fromValues(scene.rooms[i].squares[0].rightLowerCoordinate[0], scene.rooms[i].squares[0].rightLowerCoordinate[1]
					, scene.rooms[i].squares[0].rightLowerCoordinate[2], 1.0));
			console.log("E " + screenPointFrom[0] + " " + screenPointFrom[1]);
			ctx.font = (10*scene.rooms[i].height)+"px Arial";
			
			ctx.fillText(scene.rooms[i].roomName + "", (screenPointFrom[0] + screenPointTo[0]) / 2, (screenPointFrom[1] + screenPointTo[1]) /2.4);
			
			ctx.fillText(scene.rooms[i].squareMeter+" m2 ",(screenPointFrom[0] + screenPointTo[0]) / 2, (screenPointFrom[1] + screenPointTo[1]) / 1.70);

			for (let j = 0; j < scene.rooms[i].squares.length; j++) {
				for (let k = 0; k < scene.rooms[i].squares[j].triangles.length; k++) {

					let buffers = this.initBuffers(scene.rooms[i].squares[j].triangles[k].getVerticesArray(), scene.rooms[i].squares[j].triangles[k].getColorArray());

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

					{
						const numComponents = 4;
						const type = this.gl.FLOAT;
						const normalize = false;
						const stride = 0;
						const offset = 0;
						this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffers.color);
						this.gl.vertexAttribPointer(
							this.programInfo.attribLocations.vertexColor,
							numComponents,
							type,
							normalize,
							stride,
							offset);
						this.gl.enableVertexAttribArray(
							this.programInfo.attribLocations.vertexColor);
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
		}

		for (let k = 0; k < scene.triangles.length; k++) {

			let buffers = this.initBuffers(scene.triangles[k].getVerticesArray(), scene.triangles[k].getColorArray());

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

			{
				const numComponents = 4;
				const type = this.gl.FLOAT;
				const normalize = false;
				const stride = 0;
				const offset = 0;
				this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffers.color);
				this.gl.vertexAttribPointer(
					this.programInfo.attribLocations.vertexColor,
					numComponents,
					type,
					normalize,
					stride,
					offset);
				this.gl.enableVertexAttribArray(
					this.programInfo.attribLocations.vertexColor);
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

			//rács rajzolás

		}

		*/

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

	/*
	drawGrids() {
		var vertices = [
			-0.7, -0.1, 0,
			-0.3, 0.6, 0,
			-0.3, -0.3, 0,
			0.2, 0.6, 0,
			0.3, -0.3, 0,
			0.7, 0.6, 0
		]
		const positionBuffer = this.gl.createBuffer();

		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer);

		// Get the attribute location
		var coord = this.gl.getAttribLocation(this.shaderProgram, "coordinates");

		// Point an attribute to the currently bound VBO
		this.gl.vertexAttribPointer(coord, 3, this.gl.FLOAT, false, 0, 0);

		// Enable the attribute
		this.gl.enableVertexAttribArray(coord);

	

		// Clear the canvas
		//this.gl.clearColor(0.5, 0.5, 0.5, 0.9);
		this.gl.clearColor(247/255, 244/255, 244/255, 0.9);
		// Enable the depth test
		this.gl.enable(this.gl.DEPTH_TEST);

		// Clear the color and depth buffer
		this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

		// Set the view port
		this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);

		// Draw the triangle
		this.gl.drawArrays(this.gl.LINES, 0, 6);
	}
     */
}