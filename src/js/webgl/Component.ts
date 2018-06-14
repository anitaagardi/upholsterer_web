import { Visitor } from './Visitor';

export interface Component {
    accept(v:Visitor);
}