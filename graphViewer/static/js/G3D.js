





class G3DManager {
	
	constructor(scene) {
		this.scene = scene;
		this.vizs = {};
	}

	objectsClicked(intersectingObjects) {
		if (intersectingObjects.length < 1) return;
		for (var key in this.vizs) {
		    if (!this.vizs.hasOwnProperty(key)) continue;
            graphViz.objectClicked(intersectingObjects[0].object);
		}
	}

	addVisualization(visualizationObject) {
		if (visualizationObject.name in this.vizs) {
			console.log("A visualization with name '" + visualizationObject.name + "' already exists.");
			return;
		}
		this.vizs[visualizationObject.name] = visualizationObject;
	}


}