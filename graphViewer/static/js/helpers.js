



// HELPERS
//---------------------------------------------------------



function loadFont(fontJSONPath) {
    var loader = new THREE.FontLoader();
    loader.load( fontJSONPath, function ( font ) {
        loadedFont = font;
    } );
}




function getTextMesh(text, fontColor) {
    var textMat = new THREE.MeshBasicMaterial({color: fontColor});
    var geom = new THREE.TextGeometry( text, {
        font: loadedFont,
        size: 0.5,
        height: 0,
        curveSegments: 12,
    } );
    var textMesh = new THREE.Mesh(
        geom,
        textMat
      );
    return textMesh;
}




function getGrid(planeW, planeH, numW, numH) {
    var plane = new THREE.Mesh(
        new THREE.PlaneGeometry( planeW*numW, planeH*numH, planeW, planeH ),
        new THREE.MeshBasicMaterial( {
            color: 0xBDBDBD,
            wireframe: true
        } )
    );
    plane.rotation.set(Math.PI/2, 0, Math.PI/2);

    return plane;
}