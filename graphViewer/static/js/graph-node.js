



//-----------------------------------------------------------------------------
//-----------------------------------------------------------------------------



var highLightColor = new THREE.Color("rgb(255, 0, 0)");
var normalColor = new THREE.Color("rgb(255, 255, 0)");
var neightbourHighlightColor = new THREE.Color("rgb(0, 255, 0)");

var defaultLineColor = new THREE.Color("rgb(100, 100, 100)");
var highlightLineColor = new THREE.Color("rgb(0, 0, 0)");


function Node(nodeID, nodeName, nodeData, nodeNeighbours) {
    this.type = 'Node';
    this.isNode = true;
    this.nodeInfo = {};
    this.nodeInfo.nodeID = nodeID;
    this.nodeInfo.nodeName = nodeName;
    this.nodeInfo.nodeData = nodeData;
    this.nodeInfo.nodeNeighbours = nodeNeighbours;
    this.nodeInfo.labelMesh = getTextMesh(nodeName, "#000000");
    this.geometry = new THREE.SphereGeometry(1, 6, 6);
    this.material = new THREE.MeshPhongMaterial({color: normalColor, shininess: 1});
    THREE.Mesh.call( this, this.geometry, this.material );
}



Node.prototype = Object.create( THREE.Mesh.prototype );
Node.prototype.constructor = Node;

Node.prototype.getNodeID = function() {
    return this.nodeInfo.nodeID;
}

Node.prototype.getNodeName = function() {
    return this.nodeInfo.nodeName;
}

Node.prototype.getNodeLabelMesh = function() {
    return this.nodeInfo.labelMesh;
}

Node.prototype.getNodeData = function() {
    return this.nodeInfo.nodeData;
}

Node.prototype.getNodeNeighbours = function() {
    return this.nodeInfo.nodeNeighbours;
}

Node.prototype.setNodeNeighbours = function(neightbourArray) {
    this.nodeInfo.nodeNeighbours = neightbourArray;
}

Node.prototype.setPosition = function(x, y, z) {
    this.position.set(x, y, z);
    this.getNodeLabelMesh().position.set(x+1.2, y, z);
}

Node.prototype.equals = function(otherNode) {
    if (!(otherNode instanceof Node)) return false;
    return this.nodeInfo.nodeID == otherNode.getNodeID();
}

Node.prototype.toString = function() {
    return "[" + this.nodeInfo.nodeID + " - " + this.nodeInfo.nodeName + "]-->" + this.nodeInfo.nodeNeighbours.toString();
}


Node.prototype.onHoverIn = function(){
}


Node.prototype.onHoverStay = function(){
}


Node.prototype.onHoverOut = function(){
}


Node.prototype.onClick = function(){
    var nbs = this.getNodeNeighbours();
    for (var i=0; i<nbs.length; i++) {
        if (!nbs[i] || nbs[i].getNodeID()==this.getNodeID()) continue;
        nbs[i].secondaryHighlight();
    }
    this.primaryHighlight();
}


Node.prototype.onUnClick = function(){
    var nbs = this.getNodeNeighbours();
    for (var i=0; i<nbs.length; i++) {
        if (!nbs[i]) continue;
        nbs[i].clearHighlight();
    }
    this.clearHighlight();
}


Node.prototype.readData = function(data) {
    // jsonData = JSON.parse(data);
    // var links = data.split(',');
    var retText = "";
    // for(var i=0; i<links.length; i++) {
    //     retText += ("<a href='#'>" + links[i] + "</a></br>");
    // }
    retText = data['introText']
    // console.log(retText);
    return retText;
}





//---------------------------------



Node.prototype.primaryHighlight = function() {
    this.material.color = highLightColor;
}


Node.prototype.secondaryHighlight = function() {
    this.material.color = neightbourHighlightColor;
}


Node.prototype.clearHighlight = function() {
    this.material.color = normalColor;
}



//-----------------------------------------------------------------------------
//-----------------------------------------------------------------------------




class Graph {
    constructor(dataForGraph, id, name="") {
        this.graphId = id;
        this.graphName = name == "" ? id : name;
        this.graphLibrary = {};
        this.graphArray = [];
        for (var i=0; i<dataForGraph.length; i++) {
            var textDataForNode = dataForGraph[i];
            var objectForNode = new Node(textDataForNode['nodeID'],
                                         textDataForNode['nodeName'],
                                         textDataForNode['nodeData'],
                                         textDataForNode['nodeNeighbours']);
            this.graphLibrary[objectForNode.getNodeID()] = objectForNode;
            this.graphArray.push(objectForNode);
        }

        for (var i=0; i<this.graphArray.length; i++) {
            var neighboursIds = this.graphArray[i].getNodeNeighbours();
            var neighbourObjects = [];
            for (var j=0; j<neighboursIds.length; j++) {
                neighbourObjects.push(this.graphLibrary[neighboursIds[j]]);
            }
            this.graphArray[i].setNodeNeighbours(neighbourObjects);
        }
        this.graphArray = this.graphArray.sort(function(a, b) { return b.getNodeNeighbours().length - a.getNodeNeighbours().length; });
    }


    getGraphId() {
        return this.graphId;
    }


    getGraphName() {
        return this.graphName;
    }


    getNodeCount() {
        return this.graphArray.length;
    }


    getNode(nodeId) {
        return this.graphLibrary[nodeId];
    }


    getGraphArray() {
        return this.graphArray;
    }


    getIterator() {
        return new GraphIterator(this);
    }


    getIteratorFromNode(startNode) {
        var graphArray = new GraphIterator(this);
        return placeElementFirst(graphArray, startNode);
    }


    deepcopy() {
        var cloneArray = [];
        for (var i=0; i<this.graphArray.length; i++) {
            cloneArray.push(this.graphArray[i].clone());
        }
        return cloneArray;
    }


    // UNTESTED
    findPath(startNodeId, endNodeId) {
        var start = graph.getNode(startNodeId);
        var end = graph.getNode(endNodeId);
        var queue = [];
        var iter = graph.getIteratorFromNode(start);
        var nd = iter.nextNode();
        queue.push(nd);
        while(queue.length > 0) {
            nd = queue.pop();
            var nbrs = nd.getNodeNeighbours();
            for (var i=0; i<nbrs.length; i++) {
                queue.push(nbrs[i]);
                if (end.equals(nbrs[i])) return queue;
            }
        }
    }
}






class GraphIterator {
    constructor(graph) {
        this.iterArray = graph.getGraphArray();
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


// ref: https://stackoverflow.com/questions/1181575/determine-whether-an-array-contains-a-value
var contains = function(needle) {
    // Per spec, the way to identify NaN is that it is not equal to itself
    var findNaN = needle !== needle;
    var indexOf;

    if(!findNaN && typeof Array.prototype.indexOf === 'function') {
        indexOf = Array.prototype.indexOf;
    } else {
        indexOf = function(needle) {
            var i = -1, index = -1;

            for(i = 0; i < this.length; i++) {
                var item = this[i];

                if((findNaN && item !== item) || item === needle) {
                    index = i;
                    break;
                }
            }

            return index;
        };
    }

    return indexOf.call(this, needle) > -1;
};


function hasNoDuplicateIds(nodeData, retInfo) {
    var seenIds = [];
    for (var i=0; i<nodeData.length; i++) {
        var currNodeId = nodeData[i].getNodeID();
        if (contains.call(seenIds, currNodeId)) {
            retInfo = "Node contains duplicate id: " + currNodeId;
            return false;
        }
        seenIds.push(currNodeId);
    }
    retInfo = "";
    return true;
}




Graph.isValidGraphData = function(nodeData) {
    return true;
    var retInfo = "";
    var duplicateIdCheck = hasNoDuplicateIds(nodeData, retInfo);
    if (retInfo != "") {
        console.log(retInfo);
    }
    var finalCheck = duplicateIdCheck;
    return finalCheck;
}