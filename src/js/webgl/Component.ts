import { Visitor } from './Visitor';
import { ResourceLoader } from './ResourceLoader';

export abstract class Component {
    abstract accept(v:Visitor);
    
    loadResource(resourceLoader:ResourceLoader):Promise<any[]> {
        return new Promise<any[]>((resolve)=>{
            resolve(null);
        })
    }
}