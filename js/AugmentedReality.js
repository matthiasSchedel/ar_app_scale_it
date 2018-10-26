// init renderer
var renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true
});
renderer.setClearColor(new THREE.Color('lightgrey'), 0)
renderer.setSize(640, 480);
renderer.domElement.style.position = 'absolute'
renderer.domElement.style.top = '0px'
renderer.domElement.style.left = '0px'
document.body.appendChild(renderer.domElement);

// array of functions for the rendering loop
var onRenderFcts = [];

// init scene and camera
var scene = new THREE.Scene();

//////////////////////////////////////////////////////////////////////////////////
//		Initialize a basic camera
//////////////////////////////////////////////////////////////////////////////////

// Create a camera
var camera = new THREE.Camera();
scene.add(camera);


////////////////////////////////////////////////////////////////////////////////
//          handle arToolkitSource
////////////////////////////////////////////////////////////////////////////////
if (document.baseURL != 'https://matthiasschedel.github.io/ar_app_scale_it/')
{
    var arToolkitSource = new THREEx.ArToolkitSource({
        // to read from the webcam 
        //sourceType: 'webcam',
         sourceType : 'image',
         sourceUrl : THREEx.ArToolkitContext.baseURL + 'data/data/scale_hero.png',		
    
        // sourceType : 'video',
        // sourceUrl : THREEx.ArToolkitContext.baseURL + '../data/videos/headtracking.mp4',		
    })
    camera.position.set (0,0,100)
} else {
    var arToolkitSource = new THREEx.ArToolkitSource({
        // to read from the webcam 
        sourceType: 'webcam'
    }) 
}

console.log('artool',arToolkitSource)
// arToolkitContext.domElement.baseURL = 'https://matthiasschedel.github.io/ar_app_scale_it/';
arToolkitSource.init(function onReady() {
    onResize()
})

// handle resize
window.addEventListener('resize', function () {
    onResize()
})
function onResize() {
    arToolkitSource.onResize()
    arToolkitSource.copySizeTo(renderer.domElement)
    if (arToolkitContext.arController !== null) {
        arToolkitSource.copySizeTo(arToolkitContext.arController.canvas)
    }
}
////////////////////////////////////////////////////////////////////////////////
//          initialize arToolkitContext
////////////////////////////////////////////////////////////////////////////////
// create atToolkitContext
var arToolkitContext = new THREEx.ArToolkitContext({
    cameraParametersUrl: THREEx.ArToolkitContext.baseURL + './data/data/camera_para.dat',
    detectionMode: 'mono',
})
// initialize it
arToolkitContext.init(function onCompleted() {
    // copy projection matrix to camera
    camera.projectionMatrix.copy(arToolkitContext.getProjectionMatrix());
})
// update artoolkit on every frame
onRenderFcts.push(function () {
    if (arToolkitSource.ready === false) return
    arToolkitContext.update(arToolkitSource.domElement)
    // update scene.visible if the marker is seen
    scene.visible = camera.visible
})

////////////////////////////////////////////////////////////////////////////////
//          Create a ArMarkerControls
////////////////////////////////////////////////////////////////////////////////

// init controls for camera
var markerControls = new THREEx.ArMarkerControls(arToolkitContext, camera, {
    type: 'pattern',
    patternUrl: THREEx.ArToolkitContext.baseURL + './data/data/scale.hero',
    // as we controls the camera, set changeMatrixMode: 'cameraTransformMatrix'
    changeMatrixMode: 'cameraTransformMatrix'
})
console.log('params', markerControls.parameters)
// as we do changeMatrixMode: 'cameraTransformMatrix', start with invisible scene
scene.visible = false

//////////////////////////////////////////////////////////////////////////////////
//		add an object in the scene
//////////////////////////////////////////////////////////////////////////////////

// add a torus knot	
var geometry = new THREE.CubeGeometry(1, 1, 1);
var material = new THREE.MeshNormalMaterial({
    transparent: true,
    opacity: 0.5,
    side: THREE.DoubleSide
});
scene.add(new THREE.HemisphereLight());
var directionalLight = new THREE.DirectionalLight(0xffeedd);
directionalLight.position.set(0, 0, 2);
scene.add(directionalLight);

var mesh = new THREE.Mesh(geometry, material);
mesh.position.y = geometry.parameters.height / 2
// scene.add( mesh );
var gun = THREEx.ArToolkitContext.baseURL + "./model/gun.3ds",
    texture_loader = new THREE.TextureLoader();
var normal = texture_loader.load(THREEx.ArToolkitContext.baseURL + './model/normal.jpg');
var loader = new THREE.TDSLoader();
loader.setResourcePath(THREEx.ArToolkitContext.baseURL + './model/');
var object_g
// SET model VAR here!!!
loader.load(gun, function (object) {
    object.traverse(function (child) {
        if (child instanceof THREE.Mesh) {
            child.material.normalMap = normal;
        }
    });
    object.position.set(-1,-2,0)
    object_g = object
    scene.add(object);
});

var geometry = new THREE.TorusKnotGeometry(0.3, 0.1, 64, 16);
var material = new THREE.MeshNormalMaterial();
var mesh = new THREE.Mesh(geometry, material);

var map = new THREE.TextureLoader().load(THREEx.ArToolkitContext.baseURL + './data/images/logo_scale_it.png');
var material = new THREE.SpriteMaterial({ map: map, color: 0xffffff, fog: true });
var sprite = new THREE.Sprite(material);
sprite.rotation.x = 180
sprite.rotation.z = 0
sprite.rotation.y = 180
sprite.position.y = .1
//scene.add(sprite);

mesh.position.y = 0.5

// scene.add( image );


onRenderFcts.push(function (delta) {
    object_g.rotation.x += Math.PI * delta
    // /sprite.rotation.y = Math.PI*delta
    sprite.rotation.z += Math.PI * delta
})
//////////////////////////////////////////////////////////////////////////////////
//		render the whole thing on the page
//////////////////////////////////////////////////////////////////////////////////

// render the scene
onRenderFcts.push(function () {
    renderer.render(scene, camera);
})

// run the rendering loop
var lastTimeMsec = null
requestAnimationFrame(function animate(nowMsec) {
    // keep looping
    requestAnimationFrame(animate);
    // measure time
    lastTimeMsec = lastTimeMsec || nowMsec - 1000 / 60
    var deltaMsec = Math.min(200, nowMsec - lastTimeMsec)
    lastTimeMsec = nowMsec
    // call each update function
    onRenderFcts.forEach(function (onRenderFct) {
        onRenderFct(deltaMsec / 1000, nowMsec / 1000)
    })
})