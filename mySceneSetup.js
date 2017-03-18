
var stopRunning;


var DEFAULT_LINE_COLOR = 0xBDBDBD;
var DEFAULT_OBJECT_COLOR = 0xE91E63;
var HIGHLIGHT_OBJECT_COLOR = 0x8D1243;





Array.prototype.remove = function() {
    var what, a = arguments, L = a.length, ax;
    while (L && this.length) {
        what = a[--L];
        while ((ax = this.indexOf(what)) !== -1) {
            this.splice(ax, 1);
        }
    }
    return this;
};







var scene, camera;
function initScene() {

    function addGridPlane() {
        var planeW = 200; // pixels
        var planeH = 200; // pixels 
        var numW = 3; // how many wide (50*50 = 2500 pixels wide)
        var numH = 3; // how many tall (50*50 = 2500 pixels tall)
        var plane = new THREE.Mesh(
            new THREE.PlaneGeometry( planeW*numW, planeH*numH, planeW, planeH ),
            new THREE.MeshBasicMaterial( {
                color: 0xBDBDBD,
                wireframe: true
            } )
        );
        plane.rotation.set(Math.PI/2, 0, Math.PI/2);

        scene.add(plane);
    }

    var initScene, renderer;
    var raycaster, mouse;


    function onMouseMove( event ) {
        // calculate mouse position in normalized device coordinates
        // (-1 to +1) for both components
        mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
        mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    }


    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize( window.innerWidth, window.innerHeight );
    }

    
    frameUpdate;

    
    initScene = function() {
        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize( window.innerWidth, window.innerHeight );
        renderer.setClearColor( 0xfffcf3, 1 );
        document.getElementById( 'viewport' ).appendChild( renderer.domElement );

        scene = new THREE.Scene();

        camera = new THREE.PerspectiveCamera(
            35,
            window.innerWidth / window.innerHeight,
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
        raycaster.lineprecision = 0.00001;
        raycaster.precision = 0.001;

        mouse = new THREE.Vector2();
        window.addEventListener( 'mousemove', onMouseMove, false );
        window.addEventListener( 'resize', onWindowResize, false );

        addGridPlane();
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
        // if(currHighlight.__proto__.hasOwnProperty('onHoverIn')) {
        //     currHighlight.onHoverIn();
        // }
        prevHighlight = currHighlight;
    }




    fail = false;

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



    stopRunning = function() {
        fail = true;
    }



    window.onload = initAndRenderScene();
}