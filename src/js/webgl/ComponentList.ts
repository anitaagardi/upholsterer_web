import { Component } from "./Component";
import { ResourceLoader } from "./ResourceLoader";

export class ComponentList {
    constructor(private components:Component[]) {

    }

    getComponents() {
        return this.components;
    }

    loadResourceForComponents(resourceLoader:ResourceLoader) {
        return Promise.all(this.components.map(component=>component.loadResource(resourceLoader)));
    }
}