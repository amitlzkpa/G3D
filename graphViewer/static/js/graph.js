




function graphListener() {
    this.selectedNodeNameUIDest = $("#selectedNodeNameUIDest");
    this.selectedNodeIDUIDest = $("#selectedNodeIDUIDest");
    this.selectedNodeDataUIDest = $("#selectedNodeDataUIDest");
    this.selectedNodeNeighboursUIDest = $("#selectedNodeNeighboursUIDest");
    this.reportSelectNodeChange = function(node) {
        // console.log(node.getNodeName());
        // console.log(node.getNodeNeighbours().length);
        this.selectedNodeNameUIDest.html(node.getNodeName());
        this.selectedNodeIDUIDest.html(node.getNodeID());
        this.selectedNodeDataUIDest.html(node.readData(node.getNodeData()));
        var nbDst = this.selectedNodeNeighboursUIDest;
        nbDst.empty();
        var nbs = node.getNodeNeighbours();
        $.each(nbs, function(idx, val) {
            if (!val) return;
            nbDst.append("<div class='grey-box'>" + val.getNodeName() + "</div>");
        });
    }
}


var webHTML = new graphListener();







//-----------------------------------------------------------------------------




var BRIDGE = function() {
	this.graph = null;
    this.selectedNode = null;
    this.changeListeners = [];
}


BRIDGE.prototype.setSelectedNode = function(node) {
    if (this.selectedNode != null) this.selectedNode.onUnClick();
    this.selectedNode = node;
    this.selectedNode.onClick();
    for (var i=0; i<this.changeListeners.length; i++) {
        this.changeListeners[i].reportSelectNodeChange(this.selectedNode);
    }
}


BRIDGE.prototype.registerListener = function(listener) {
    if (!listener.hasOwnProperty('reportSelectNodeChange')) {
        throw "Listener must have method named 'reportSelectNodeChange(node)' accepting a node as parameter.";
    }
    this.changeListeners.push(listener);
}


BRIDGE.prototype.deregisterListener = function(listener) {
    var remIdx = -1;
    for (var i=0; i<this.changeListeners.length; i++) {
        if (this.changeListeners[i] == listener) remIdx = i;
    }
    if (remIdx == -1) {
        throw "Attempting to remove an unregistered listener.";
    }
    this.changeListeners.splice(remIdx, 1);
}


BRIDGE.prototype.setGraph = function(graph) {
	this.graph = graph;
}


BRIDGE.prototype.getGraph = function() {
	return this.graph;
}




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
    this.geometry = new THREE.SphereGeometry(1, 32, 32);
    this.material = new THREE.MeshBasicMaterial({color: normalColor});
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

Node.prototype.getNodeData = function() {
    return this.nodeInfo.nodeData;
}

Node.prototype.getNodeNeighbours = function() {
    return this.nodeInfo.nodeNeighbours;
}

Node.prototype.setNodeNeighbours = function(neightbourArray) {
    this.nodeInfo.nodeNeighbours = neightbourArray;
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







//---------------------------------------------------------





var testGraph = [
                    {
                        "nodeName": "A",
                        "nodeID": 01,
                        "nodeData": "fooA,gooA",
                        "nodeNeighbours": [02, 03]
                    },
                    {
                        "nodeName": "B",
                        "nodeID": 02,
                        "nodeData": "fooB,gooB",
                        "nodeNeighbours": [01, 03]
                    },
                    {
                        "nodeName": "C",
                        "nodeID": 03,
                        "nodeData": "fooC,gooC",
                        "nodeNeighbours": [01, 02, 04, 05]
                    },
                    {
                        "nodeName": "D",
                        "nodeID": 04,
                        "nodeData": "fooD",
                        "nodeNeighbours": [03, 05, 06]
                    },
                    {
                        "nodeName": "E",
                        "nodeID": 05,
                        "nodeData": "fooE,gooE",
                        "nodeNeighbours": [03, 04, 07]
                    },
                    {
                        "nodeName": "F",
                        "nodeID": 06,
                        "nodeData": "fooF,gooF",
                        "nodeNeighbours": [04, 08]
                    },
                    {
                        "nodeName": "G",
                        "nodeID": 07,
                        "nodeData": "fooG,gooG,hooG",
                        "nodeNeighbours": [05, 08]
                    },
                    {
                        "nodeName": "H",
                        "nodeID": 08,
                        "nodeData": "",
                        "nodeNeighbours": [06, 07, 09]
                    },
                    {
                        "nodeName": "I",
                        "nodeID": 09,
                        "nodeData": "fooI,gooI",
                        "nodeNeighbours": [08]
                    }
                ];


function getTextData() {
    return testGraph;
}



//---------------------------------------------------------



function isValidGraphData(nodeData) {
    // check for duplicate ids
    // 
    return true;
}



//---------------------------------------------------------




class Graph {
    constructor(dataForGraph) {
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



var graphGroup = new THREE.Group();


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
        var randomPos = getRandomPointNearPt(node.position, 20);
        node.position.set(randomPos.x, randomPos.y, randomPos.z);
        graphGroup.add(node);
	    scene.add(node);
    }
    scene.add(graphGroup);
}




function addEdges(graph) {
    var gIterator = graph.getIterator();
    while (!gIterator.end()) {
        var node = gIterator.nextNode();
        var srcNodePos = node.position;
        var nodeNeighbours = node.getNodeNeighbours();
        for (var i=0; i<nodeNeighbours.length; i++) {
            var n = nodeNeighbours[i];
            if (!n) continue;
            var edge = getLine(srcNodePos, n.position,  defaultLineColor);
            graphGroup.add(edge);
            scene.add(edge);
        }
    }
    scene.add(graphGroup);
}




function addGraphToScene(graph) {
    addNodes(graph);
    addEdges(graph);
    // var spritey = makeTextSprite( "Amit", 
    //     { fontsize: 24, borderColor: {r:0, g:0, b:0, a:0}, backgroundColor: {r:255, g:255, b:255, a:0.6} } );
    // spritey.position.set(0,0,10);
    // scene.add( spritey );
}


function clearScene() {
	console.log("clearing scene");
    scene.remove(graphGroup);
}


function reloadGraph(graph) {
	clearScene();
    addGraphToScene(graph);
}





// ref: http://stackoverflow.com/questions/23514274/three-js-2d-text-sprite-labels
// function makeTextSprite( message, parameters )
// {
//     var fontface = parameters.hasOwnProperty("fontface") ? parameters["fontface"] : "Arial";
//     var fontsize = parameters.hasOwnProperty("fontsize") ? parameters["fontsize"] : 36;
//     var borderThickness = parameters.hasOwnProperty("borderThickness") ? parameters["borderThickness"] : 4;
//     var borderColor = parameters.hasOwnProperty("borderColor") ?parameters["borderColor"] : { r:0, g:0, b:0, a:1.0 };
//     var backgroundColor = parameters.hasOwnProperty("backgroundColor") ?parameters["backgroundColor"] : { r:255, g:255, b:255, a:1.0 };
//     var textColor = parameters.hasOwnProperty("textColor") ?parameters["textColor"] : { r:0, g:0, b:0, a:1.0 };

//     var canvas = document.createElement('canvas');
//     var context = canvas.getContext('2d');
//     context.font = "Bold " + fontsize + "px " + fontface;
//     var metrics = context.measureText( message );
//     var textWidth = metrics.width;

//     context.fillStyle   = "rgba(" + backgroundColor.r + "," + backgroundColor.g + "," + backgroundColor.b + "," + backgroundColor.a + ")";
//     context.strokeStyle = "rgba(" + borderColor.r + "," + borderColor.g + "," + borderColor.b + "," + borderColor.a + ")";

//     context.lineWidth = borderThickness;

//     context.fillStyle = "rgba("+textColor.r+", "+textColor.g+", "+textColor.b+", 1.0)";
//     context.fillText( message, borderThickness, fontsize + borderThickness);

//     var texture = new THREE.Texture(canvas) 
//     texture.needsUpdate = true;

//     var spriteMaterial = new THREE.SpriteMaterial( { map: texture, useScreenCoordinates: false } );
//     var sprite = new THREE.Sprite( spriteMaterial );
//     sprite.scale.set(0.5 * fontsize, 0.25 * fontsize, 0.75 * fontsize);
//     return sprite;   
// }



// function findPath() {
//     var start = graph.getNode(01);
//     var end = graph.getNode(07);
//     var queue = [];
//     var iter = graph.getIteratorFromNode(start);
//     var nd = iter.nextNode();
//     queue.push(nd);
//     while(queue.length > 0) {
//         nd = queue.pop();
//         var nbrs = nd.getNodeNeighbours();
//         for (var i=0; i<nbrs.length; i++) {
//             queue.push(nbrs[i]);
//             if (end.equals(nbrs[i])) return queue;
//         }
//     }
// }



//-----------------------------------------------------------------------------



function updateGraph(jsonDataForGraph) {
    var graph = new Graph(jsonDataForGraph);
    bridge.setGraph(graph);
	reloadGraph(bridge.getGraph());
}


initCallback = function() {
	console.log("Scene initCallback");
    bridge = new BRIDGE();
    bridge.registerListener(webHTML);
}


// called after every frame;
frameUpdate = function() {
}


// called in the frame after stopping
afterStopCallBack = function() {
	console.log("STOP!!");
}


function setupKeyListeners() {
    window.addEventListener( 'keyup', function( event ) {
        switch ( event.keyCode ) {
            // Q
            case 81: {
                stopRunning();
                break;
            }
            // G
            case 71: {
                clearScene();
                break;
            }
            // F
            case 70: {
                // console.log(findPath());
                break;
            }
        }
    });
}





// Mesh.prototype.onHoverOut()  = function() {
//     console.log("foo");
// }


//-----------------------------------------------------------------------------



