import { vec3 } from 'gl-matrix';

export class Frustum {
    private nearBottomLeft:vec3;
    private nearBottomRight:vec3;
    private farBottomLeft:vec3;
    private farBottomRight: vec3;

    constructor() {

    }

    getNearBottomLeft():vec3 {
        return this.nearBottomLeft;
    }

    getNearBottomRight():vec3 {
        return this.nearBottomRight;
    }

    getFarBottomLeft():vec3 {
        return this.farBottomLeft;
    }

    getFarBottomRight():vec3 {
        return this.farBottomRight;
    }

    setNearBottomLeft(nearBottomLeft:vec3):void {
        this.nearBottomLeft = nearBottomLeft;
    }

    setNearBottomRight(nearBottomRight:vec3):void {
        this.nearBottomRight = nearBottomRight;
    }

    setFarBottomLeft(farBottomLeft:vec3):void {
        this.farBottomLeft = farBottomLeft;
    }

    setFarBottomRight(farBottomRight:vec3):void {
        this.farBottomRight = farBottomRight;
    }
}