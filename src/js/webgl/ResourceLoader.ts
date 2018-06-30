export interface ResourceLoader {
    loadImages(paths:string[]):Promise<any[]>;

    loadObj(path:string):Promise<any>;
};