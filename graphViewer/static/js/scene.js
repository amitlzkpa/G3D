




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




function addNodesToGraphGroup(graph) {
    var gIterator = graph.getIterator();
    while (!gIterator.end()) {
        var node = gIterator.nextNode();
        var randomPos = getRandomPointNearPt(node.position, 20);
        node.position.set(randomPos.x, randomPos.y, randomPos.z);
        graphGroup.add(node);
	    // scene.add(node);
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
            // scene.add(edge);
        }
    }
}




function addGraphToScene(graph) {
    addNodesToGraphGroup(graph);
    addEdgesToGraphGroup(graph);
    scene.add(graphGroup);
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
	reloadGraphCallback();
}


initCallback = function() {
	console.log("Scene initCallback");
    bridge = new BRIDGE();
    bridge.registerListener(webHTML);
}


reloadGraphCallback = function() {
	console.log("loadGraphCallback initCallback");
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
                loadGraph();
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









