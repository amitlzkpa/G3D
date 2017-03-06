




//-----------------------------------------------------------------------------



var debug = true;
// var debug = false;



//-----------------------------------------------------------------------------



function calcInterp(valA, valB, off) {
    return valA + ((valB-valA) * off);
}



//-----------------------------------------------------------------------------



function getLine(start, end, lineColor) {
    var material = new THREE.LineBasicMaterial({
        color: lineColor
    });
    var geometry = new THREE.Geometry();
    geometry.vertices.push(start, end);
    var line = new THREE.Line( geometry, material );
    return line;
}


function getSphereMesh(radius, wSegs, hSegs, color) {
    var geometry = new THREE.SphereGeometry(radius, wSegs, hSegs);
    var material = new THREE.MeshBasicMaterial({color: color});
    var sphere = new THREE.Mesh(geometry, material);
    return sphere;
}


function getBoxMesh(width, height, depth, color) {
    var geometry = new THREE.BoxGeometry(width, height, depth);
    var material = new THREE.MeshBasicMaterial( {color: color} );
    var cube = new THREE.Mesh( geometry, material );
    return cube;
}



//-----------------------------------------------------------------------------
//-----------------------------------------------------------------------------



function readNodeId(textDataForNodeID) {
    return textDataForNodeID;
}



function readNodeData(textDataForNodeData) {
    return textDataForNodeData;
}




class Node {


    constructor() {
        this.rawData = null;
        this.id = null;
        this.name = null;
        this.data = null;
        this.neighbours = null;
        this.mesh = null;
    }


    attachData(textDataForNode) {
        this.rawData = textDataForNode;
        this.id = readNodeId(textDataForNode["id"]);
        this.name = textDataForNode["name"];
        this.data = readNodeData(textDataForNode["data"]);
        this.neighbours = textDataForNode["neighbours"];
        this.mesh = getSphereMesh(0.5, 0.5, 0.5, 0xff0000);
        return this;
    }


    clone() {
        var n = new Node();
        n.rawData = this.rawData;
        n.id = this.getId();
        n.name = this.getName();
        n.data = this.getData();
        n.neighbours = this.getNeighbours();
        n.mesh = this.getMesh();
        return n;
    }


    getId() {
        return this.id;
    }


    getName() {
        return this.name;
    }


    getData() {
        return this.data;
    }


    getNeighbours() {
        return this.neighbours;
    }


    setNeighbours(neightbourArray) {
        this.neighbours = neightbourArray;
    }


    getMesh() {
        return this.mesh;
    }


    getPosition() {
        return this.mesh.position;
    }


    equals(otherNode) {
        return this.id == otherNode.getId();
    }

    
}







//---------------------------------------------------------




// "name" = "name";
// "id" = "id";
// "data" = "data";
// "neighbours" = "neighbours";




var testGraph = [
                    {
                        "name": "A",
                        "id": 01,
                        "data": "fooA",
                        "neighbours": [02, 03]
                    },
                    {
                        "name": "B",
                        "id": 02,
                        "data": "fooB",
                        "neighbours": [01, 03]
                    },
                    {
                        "name": "C",
                        "id": 03,
                        "data": "fooC",
                        "neighbours": [01, 02, 04, 05]
                    },
                    {
                        "name": "D",
                        "id": 04,
                        "data": "fooD",
                        "neighbours": [03, 05, 06]
                    },
                    {
                        "name": "E",
                        "id": 05,
                        "data": "fooE",
                        "neighbours": [03, 04, 07]
                    },
                    {
                        "name": "F",
                        "id": 06,
                        "data": "fooF",
                        "neighbours": [04, 08]
                    },
                    {
                        "name": "G",
                        "id": 07,
                        "data": "fooG",
                        "neighbours": [05, 08]
                    },
                    {
                        "name": "H",
                        "id": 08,
                        "data": "fooH",
                        "neighbours": [06, 07, 09]
                    },
                    {
                        "name": "I",
                        "id": 09,
                        "data": "fooI",
                        "neighbours": [08]
                    }
                ];


function getTextData() {
    return testGraph;
}



//---------------------------------------------------------



function isValidGraphData(data) {
    // check for duplicate ids
    // 
    return true;
}



//---------------------------------------------------------



function getObjectById(nodeId, srcArray) {
    var found = null;
    var seen = 0;
    while (seen < srcArray.length && found == null) {
        if (srcArray[seen].getId() == nodeId) found = srcArray[seen];
        seen++;
    }
    return found;
}



function getObjectsById(neighboursIds, srcArray) {
    returnArray = [];
    for (var i=0; i<neighboursIds.length; i++) {
        returnArray.push(getObjectById(neighboursIds[i], srcArray));
    }
    return returnArray;
}



//---------------------------------------------------------



class Graph {
    constructor(textDataForGraph) {
        var objectArray = [];
        for (var i=0; i<textDataForGraph.length; i++) {
            var textDataForNode = textDataForGraph[i];
            var objectForNode = new Node().attachData(textDataForNode);
            objectArray.push(objectForNode);
        }

        for (var i=0; i<objectArray.length; i++) {
            var neighboursIds = objectArray[i].getNeighbours();
            var neighbourObjects = getObjectsById(neighboursIds, objectArray);
            objectArray[i].setNeighbours(neighbourObjects);
        }

        this.nodeArray = objectArray.sort(function(a, b) { return b.getNeighbours().length - a.getNeighbours().length; });
    }


    getGraph() {
        return this.nodeArray;
    }


    getIterator() {
        return new GraphIterator(this);
    }


    deepcopy() {
        var cloneArray = [];
        for (var i=0; i<this.nodeArray.length; i++) {
            cloneArray.push(this.nodeArray[i].clone());
        }
        return cloneArray;
    }
}






class GraphIterator {
    constructor(graph) {
        this.iterArray = graph.deepcopy();
        this.i=0;
    }

    nextNode() {
        var retItem = this.iterArray[this.i];
        this.i++;
        return retItem;
    }

    end() {
        return (this.i == this.iterArray.length)
    }
}



//---------------------------------------------------------



function graphRun(){
    var textDataForGraph = getTextData();
    if (isValidGraphData(textDataForGraph)) {
        var graph = new Graph(textDataForGraph);
        // console.log(graph.getGraph());

        addGraphToScene(graph);

    }
}



// src: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}


function getRandomPointNearPt(srcPt, maxDistance) {
    var rX = getRandomArbitrary(srcPt.x, srcPt.x + maxDistance);
    var rY = getRandomArbitrary(srcPt.y, srcPt.y + maxDistance);
    var rZ = getRandomArbitrary(srcPt.z, srcPt.z + maxDistance);
    return new THREE.Vector3(rX, rY, rZ);
}




function addNodes(graph) {
    var gIterator = graph.getIterator();
    while (!gIterator.end()) {
        var node = gIterator.nextNode();
        var m = node.getMesh();
        var randomPos = getRandomPointNearPt(new THREE.Vector3(), 10);
        m.position.set(randomPos.x, randomPos.y, randomPos.z);
        scene.add(m);
    }
}




function addEdges(graph) {
    var gIterator = graph.getIterator();
    console.log(gIterator);
    while (!gIterator.end()) {
        var node = gIterator.nextNode();
        var srcNodePos = node.getPosition();
        var neighbours = node.getNeighbours();
        for (var i=0; i<neighbours.length; i++) {
            var n = neighbours[i];
            var edge = getLine(srcNodePos, n.getPosition(), 0xff00ff);
            scene.add(edge);
        }
    }
}




function addGraphToScene(graph) {
    addNodes(graph);
    addEdges(graph);
}



//-----------------------------------------------------------------------------



// called after every frame;
frameUpdate = function() {
}


function setupKeyListeners() {
    window.addEventListener( 'keyup', function( event ) {
        switch ( event.keyCode ) {
            // Q
            case 81: {
                graphRun();
                break;
            }
            // W
            case 87: {
                break;
            }
        }
    });
}



//-----------------------------------------------------------------------------

