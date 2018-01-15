import Serialization from "../utils/Serialization";
import BufferExtended from "../utils/BufferExtended";
import InterfaceTreeEdge from "./Interface-Tree-Edge"

var uniqueId = 0;


class InterfaceTreeNode {

    // parent : Node
    // value : data
    // edges : [ of Edges]

    constructor(parent, edges, value){

        if (edges === undefined) edges = [];
        if (value === undefined) value = null;

        this.id = uniqueId++;

        this.parent = parent;
        this.edges = edges;

        this.value = value;

    }

    isLeaf(){

        return this.value !== null
    }

    serializeData(){
        buffer.push(Serialization.serializeNumber2Bytes(this.value.length));
        buffer.push(this.value);
    }

    serializeNode(includeEdges){

        let buffer = [];

        this.serializeData();

        if (includeEdges) {

            buffer.push(Serialization.serializeNumber1Byte(this.edges.length));
            for (let i = 0; i < this.edges.length; i++) {


                buffer.push(this.edges[i].serializeEdge() )

            }

        }

        return Buffer.concat(buffer);
    }

    deserializeData(buffer, offset){

        let valueLength =  Serialization.deserializeNumber( BufferExtended.substr(buffer, offset, 1) );
        offset += 1;

        let value =  Serialization.deserializeNumber( BufferExtended.substr(buffer, offset, valueLength) );
        offset += valueLength;

        this.value = value;

        return offset;

    }

    deserializeNode(buffer, offset, includeEdges){

        offset = this.deserializeData(buffer);

        if (includeEdges){

            //1 byte
            let length = Serialization.deserializeNumber(buffer[offset]);

            for (let i=0; i<length; i++){

                let edge = new this.createNewEdge(null);
                edge.deserializeEdge(buffer, offset, this.createNewEdge);
                this.edges.push(edge);
            }

        }

        return offset;
    }

    createNewEdge(node){
        return new InterfaceTreeEdge(node);
    }

    createNewNode(){
        new this.constructor (this,[],null);
    }

}

export default InterfaceTreeNode;