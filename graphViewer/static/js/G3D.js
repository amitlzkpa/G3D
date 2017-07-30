





class G3DManager {
	constructor(scene, camera) {
		this.scene = scene;
		this.camera = camera;
		this.mouseInputManager = null;
	}

	setMouseInputManager(mouseInputManager) {
		this.mouseInputManager = mouseInputManager;
		mouseInputManager.setG3DManager(G3DManager);
	}


}