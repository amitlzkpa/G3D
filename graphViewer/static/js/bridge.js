




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
    if (!listener.hasOwnProperty('reportLoadedGraphChange')) {
        throw "Listener must have method named 'reportLoadedGraphChange(graph)' accepting a graph as parameter.";
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
    for (var i=0; i<this.changeListeners.length; i++) {
        this.changeListeners[i].reportLoadedGraphChange(this.graph);
    }
}


BRIDGE.prototype.getGraph = function() {
    return this.graph;
}




//-----------------------------------------------------------------------------



