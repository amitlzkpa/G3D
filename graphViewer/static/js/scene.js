




function graphListener() {
	this.loadedGraphId = $("#loadedGraphId");
	this.loadedGraphName = $("#loadedGraphName");
	this.loadedGraphNodeCount = $("#loadedGraphNodeCount");
	this.loadedGraphNodeList = $("#loadedGraphNodeList");
    this.selectedNodeNameUIDest = $("#selectedNodeNameUIDest");
    this.selectedNodeIDUIDest = $("#selectedNodeIDUIDest");
    this.selectedNodeDataUIDest = $("#selectedNodeDataUIDest");
    this.selectedNodeNeighboursUIDest = $("#selectedNodeNeighboursUIDest");
    this.reportLoadedGraphChange = function(graph) {
    	this.loadedGraphId.text(graph.getGraphId());
    	this.loadedGraphName.text(graph.getGraphName());
    	this.loadedGraphNodeCount.text(graph.getNodeCount());
    	var nbDst = this.loadedGraphNodeList;
    	nbDst.empty();
    	var nds = graph.getGraphArray();
    	$.each(nds, function(idx, val) {
    		if (!val) return;
    		$html = $.parseHTML("<div class='grey-box' data-nodeId='" + val.getNodeID() + "'>" + val.getNodeName() + "</div>");
    		var $q = nbDst.append($html);
    	});
    }
    this.reportSelectNodeChange = function(node) {
        this.selectedNodeNameUIDest.html(node.getNodeName());
        this.selectedNodeIDUIDest.html(node.getNodeID());
        this.selectedNodeDataUIDest.html(node.readData(node.getNodeData()));
        var nbDst = this.selectedNodeNeighboursUIDest;
        nbDst.empty();
        var nbs = node.getNodeNeighbours();
        $.each(nbs, function(idx, val) {
            if (!val) return;
    		$html = $.parseHTML("<div class='grey-box' data-nodeId='" + val.getNodeID() + "'>" + val.getNodeName() + "</div>");
    		var $q = nbDst.append($html);
        });
    }
}


var webHTML = new graphListener();







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



var graphGroup = new THREE.Group();


function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}


function getRandomPointNearPt(srcPt, maxDistance) {
	var startX = srcPt.x - (maxDistance/2);
	var startY = srcPt.y - (maxDistance/2);
	var startZ = srcPt.z - (maxDistance/2);
    var rX = getRandomArbitrary(startX, srcPt.x + maxDistance);
    var rY = getRandomArbitrary(startY, srcPt.y + maxDistance);
    var rZ = getRandomArbitrary(startZ, srcPt.z + maxDistance);
    return new THREE.Vector3(rX, rY, rZ);
}


function addNodesToGraphGroup(graph) {
    var gIterator = graph.getIterator();
    var maxDistrRad = 10;
    var decrementFactor = 0.95;
    var i = 1;
    while (!gIterator.end()) {
        var node = gIterator.nextNode();
        var distrRad = maxDistrRad / i;
        var randomPos = getRandomPointNearPt(node.position, distrRad);
        node.setPosition(randomPos.x, randomPos.y, randomPos.z);
        var lbl = node.getNodeLabelMesh();
        graphGroup.add(node);
        graphGroup.add(lbl);
        i *= decrementFactor;
    }
}




function addEdgesToGraphGroup(graph) {
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
        }
    }
}




function addGraphToScene(graph) {
    addNodesToGraphGroup(graph);
    addEdgesToGraphGroup(graph);
    scene.add(graphGroup);
}


function clearScene() {
    scene.remove(graphGroup);
}


function reloadGraph(graph) {
	clearScene();
    addGraphToScene(graph);
	reloadGraphCallback();
}



//-----------------------------------------------------------------------------



var graphViz;



function updateGraph(jsonDataForGraph, graphSrc, msgArray) {
	var retMsg = msgArray[0];
    if (Graph.isValidGraphData(jsonDataForGraph)) {
	    var graph = new Graph(jsonDataForGraph, graphSrc);
	    graphViz.setGraph(graph);
	    reloadGraph(graphViz.getGraph());
	    // retMsg = "Succesfully updated graph with " + graph.getNodeCount() + " nodes.";
	    msgArray[0] = retMsg;
	    return;
    }
    retMsg = "Graph load failed.";
    msgArray[0] = retMsg;
}


initCallback = function() {
    graphViz = new GraphVisualization("graphViz");
    G3D.addVisualization(graphViz);
    graphViz.registerListener(webHTML);
}


reloadGraphCallback = function() {
	// console.log("reloadGraphCallback");
}


// called after every frame;
frameUpdate = function() {
}


// called in the frame after stopping
afterStopCallBack = function() {
	console.log("afterStopCallBack");
}


function setupKeyListeners() {
    window.addEventListener( 'keyup', function( event ) {
        switch ( event.keyCode ) {
            // Q
            case 81: {
                break;
            }
            // C
            case 67: {
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



//-----------------------------------------------------------------------------





function test() {
	var queryTerm = "Sachin Tendulkar"
}









