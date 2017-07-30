

var initCallback;
var loadGraphCallback;


class G3DMouseInputManager {


    constructor(mouse) {
        this.mouse = mouse;
    }


    setG3DManager(G3DManager) {
        this.G3DManager = G3DManager;
        this.g3dHookListeners();
    }


    unsetG3DManager() {
        this.G3DManager = null;
        this.g3dUnhookListeners();
    }


    g3dOnMouseClick( event ) {
        var raycaster;
        raycaster = new THREE.Raycaster();
        raycaster.lineprecision = 200;
        raycaster.precision = 200;
        raycaster.setFromCamera( this.mouse, this.camera );
        var intersects = raycaster.intersectObjects( this.scene.children, true );
        if (intersects.length > 1 && intersects[0].object.isNode) {
            // need reference for bridge in here
            console.log(intersects[0].object);
            // bridge.setSelectedNode(intersects[0].object);
        }
    }


    g3dOnMouseMove( event ) {
        // calculate mouse position in normalized device coordinates
        // (-1 to +1) for both components
        this.mouse = new THREE.Vector2();
        this.mouse.x = ( event.clientX / (window.innerWidth * 0.64) ) * 2 - 1;
        this.mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    }


    g3dOnWindowResize() {
        this.camera.aspect = (window.innerWidth * 0.64) / window.innerHeight;
        this.camera.updateProjectionMatrix();
        renderer.setSize( (window.innerWidth * 0.64), window.innerHeight );
    }


    g3dHookListeners() {
        window.addEventListener( 'mousemove', this.g3dOnMouseMove, false );
        window.addEventListener( 'click', this.g3dOnMouseClick, false );
        window.addEventListener( 'resize', this.g3dOnWindowResize, false );
    }


    g3dUnhookListeners() {
        window.removeEventListener( 'mousemove', this.g3dOnMouseMove, false );
        window.removeEventListener( 'click', this.g3dOnMouseClick, false );
        window.removeEventListener( 'resize', this.g3dOnWindowResize, false );
    }

}



//---------------------------------------------------------



var loadedFont;
var G3D;
var bridge;
var scene, camera;
function initScene() {

    var initScene, renderer;
    var raycaster, mouse;
    var WIDTH_FACTOR = 0.64;

    loadedFont = loadFont('static/fonts/Open Sans_Regular.json');

    
    frameUpdate;

    
    initScene = function() {



        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize( (window.innerWidth * WIDTH_FACTOR), window.innerHeight );
        renderer.setClearColor( 0xf5f5dc, 1 );
        document.getElementById( 'viewport' ).appendChild( renderer.domElement );

        scene = new THREE.Scene();

        G3D = new G3DManager(scene, camera);

        mouse = new THREE.Vector2();
        var G3DMouseManager = new G3DMouseInputManager(mouse);
        G3D.setMouseInputManager(G3DMouseManager);

        camera = new THREE.PerspectiveCamera(
            35,
            (window.innerWidth * WIDTH_FACTOR) / window.innerHeight,
            1,
            10000
        );
        camera.position.set( -60, 50, 60 );
        camera.lookAt( scene.position );
        scene.add( camera );

        var light = new THREE.AmbientLight( 0x404040, 3 ); // soft white light
        scene.add( light );

        var dirLight = new THREE.DirectionalLight(0xffffff, 1);
        dirLight.position.set(100, 100, 50);
        scene.add(dirLight);

        raycaster = new THREE.Raycaster();
        raycaster.lineprecision = 200;
        raycaster.precision = 200;

        // g3dHookListeners();

        // scene.add(getGrid(200, 200, 3, 3));

        initCallback();
    };



    var prevHighlight = null;
    var currHighlight = null;
    function highLightHoverObject(intersects) {
        if (intersects.length < 1 || !intersects[0].object.isNode) {
            if (prevHighlight != null) prevHighlight.onHoverOut();
            return;
        }
        currHighlight = intersects[0].object;
        if (currHighlight != prevHighlight) {
            if (prevHighlight != null) prevHighlight.onHoverOut();
            if (currHighlight != null) currHighlight.onHoverIn();
        }
        prevHighlight = currHighlight;
    }





    function renderScene(){
        var controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.target.set( 0, 0, 0 );
        function render() {
            // update the picking ray with the camera and mouse position
            raycaster.setFromCamera( mouse, camera );
            var intersects = raycaster.intersectObjects( scene.children );
            highLightHoverObject(intersects);

            renderer.render( scene, camera );
            requestAnimationFrame( render );
            frameUpdate();
        }
        render();
    }


    function initAndRenderScene() {
        initScene();
        renderScene();
    }



    window.onload = initAndRenderScene();
}