import { Component } from "./Component";
import { Visitor } from "./Visitor";

import { vec3, vec4, mat3, mat4 } from 'gl-matrix';
import { ResourceLoader } from "./ResourceLoader";

export class TexturedGrid extends Component {
    private vertices: vec3[];
    private vertexIndices: number[];
    private textureCoordinates: number[][];
    /*texture scalar for repeating texture*/
    private scalar: number;
    private texture: WebGLTexture;
    private images: Array<HTMLImageElement>;
    private imagePathes: string[];


    constructor(vertices: vec3[], vertexIndices: number[], scalar: number, imagePathes: string[]) {
        super();
        this.vertices = vertices;
        this.vertexIndices = vertexIndices;

        this.textureCoordinates = [
            [scalar, scalar],
            [scalar, 0.0],
            [0.0, 0.0],
            [0, scalar]
        ];

        this.imagePathes = imagePathes;
    }

    //the vertices of the triangle fitting opengl input format
    getVerticesArray() {
        return [
            this.vertices[0][0], this.vertices[0][1], this.vertices[0][2],
            this.vertices[1][0], this.vertices[1][1], this.vertices[1][2],
            this.vertices[2][0], this.vertices[2][1], this.vertices[2][2],
            this.vertices[3][0], this.vertices[3][1], this.vertices[3][2],
        ];
    }

    getTextureCoordinatesArray() {
        return [
            this.textureCoordinates[0][0], this.textureCoordinates[0][1],
            this.textureCoordinates[1][0], this.textureCoordinates[1][1],
            this.textureCoordinates[2][0], this.textureCoordinates[2][1],
            this.textureCoordinates[3][0], this.textureCoordinates[3][1]
        ];
    }

    getVertexIndices() {
        return this.vertexIndices;
    }

    getTexture(): WebGLTexture {
        return this.texture;
    }

    setTexture(texture: WebGLTexture) {
        this.texture = texture;
    }

    accept(v: Visitor) {
        v.drawTexturedGrid(this);
    }

    getImages() {
        return this.images;
    }

    loadResource(resourceLoader: ResourceLoader): Promise<HTMLImageElement[]> {
        return new Promise<HTMLImageElement[]>((resolve) => {
            resourceLoader.loadImages(this.imagePathes).then((images: HTMLImageElement[]) => {
                this.images = [...images] as HTMLImageElement[];
               /* resourceLoader.loadObj("models/cube.obj").then((text) => {
                    console.log(text);
                    resolve();
                });
               */
              resolve();
            });
        });
    }
}