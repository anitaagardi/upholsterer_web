import { ResourceLoader } from "./ResourceLoader";

import 'whatwg-fetch';

export class LocalResourceLoader implements ResourceLoader {
    loadObj(path: string): Promise<string> {
        return new Promise<string>((resolve) => {
            var myRequest = new Request(path);
            fetch(myRequest)
            .then(response=>response.text()) 
            .then((text)=>{
                    resolve(text);
                });
            });
    }

    loadImages(paths: string[]): Promise<HTMLImageElement[]> {
        return Promise.all(paths.map(this.checkImage));
    }

    //private loadImg = (...paths) => Promise.all(paths.map(this.checkImage));

    private checkImage = path =>
        new Promise<HTMLImageElement>(resolve => {
            const img = new Image();
            /*img.onload = () => resolve({ path, status: 'ok' });
            img.onerror = () => resolve({ path, status: 'error' });*/
            img.onload = () => resolve(img);
            img.onerror = () => resolve(null);
            img.src = path;
        });
}