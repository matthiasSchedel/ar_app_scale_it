// init renderer

var renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true
});
var rendererCSS;
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
//var camera = new THREE.PerspectiveCamera()

scene = new THREE.Scene();
// CAMERA
var SCREEN_WIDTH = window.innerWidth, SCREEN_HEIGHT = window.innerHeight;
var VIEW_ANGLE = 45, ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = 0.1, FAR = 20000;
camera = new THREE.PerspectiveCamera( VIEW_ANGLE, ASPECT, NEAR, FAR);
scene.add(camera);
camera.position.set(0,150,400);
camera.lookAt(scene.position);	

////////////////////////////////////////////////////////////////////////////////
//          handle arToolkitSource
////////////////////////////////////////////////////////////////////////////////
if (document.baseURL != 'https://matthiasschedel.github.io/ar_app_scale_it/')
{
    var arToolkitSource = new THREEx.ArToolkitSource({
        // to read from the webcam 
        //sourceType: 'webcam',
         sourceType : 'image',
         sourceUrl : THREEx.ArToolkitContext.baseURL + '/data/data/scale_hero.png',		
    
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
    cameraParametersUrl: THREEx.ArToolkitContext.baseURL + '/data/data/camera_para.dat',
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
    patternUrl: THREEx.ArToolkitContext.baseURL + '/data/data/scale.hero',
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
var gun = THREEx.ArToolkitContext.baseURL + "/model/gun.3ds",
    texture_loader = new THREE.TextureLoader();
var normal = texture_loader.load(THREEx.ArToolkitContext.baseURL + '/model/normal.jpg');
var loader = new THREE.TDSLoader();
loader.setResourcePath(THREEx.ArToolkitContext.baseURL + '/model/');
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
    //scene.add(object);
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


	
var planeMaterial   = new THREE.MeshBasicMaterial({color: 0x000000, opacity: 0.1, side: THREE.DoubleSide });
var planeWidth = 360;
var planeHeight = 120;
var planeGeometry = new THREE.PlaneGeometry( planeWidth, planeHeight );
var planeMesh= new THREE.Mesh( planeGeometry, planeMaterial );
planeMesh.position.set(0,0,0)
// add it to the standard (WebGL) scene
scene.add(planeMesh);

cssScene = new THREE.Scene();
	// create the iframe to contain webpage
	var element	= document.createElement('iframe')
	// webpage to be loaded into iframe
	element.src	= "http://stemkoski.github.io/Three.js/index.html";
	// width of iframe in pixels
	var elementWidth = 1024;
	// force iframe to have same relative dimensions as planeGeometry
	var aspectRatio = planeHeight / planeWidth;
	var elementHeight = elementWidth * aspectRatio;
	element.style.width  = elementWidth + "px";
	element.style.height = elementHeight + "px";
	
	// create a CSS3DObject to display element
	var cssObject = new THREE.CSS3DObject( element );
	// synchronize cssObject position/rotation with planeMesh position/rotation 
	cssObject.position = planeMesh.position;
	cssObject.rotation = planeMesh.rotation;
	// resize cssObject to same size as planeMesh (plus a border)
	var percentBorder = 0.05;
	cssObject.scale.x /= (1 + percentBorder) * (elementWidth / planeWidth);
	cssObject.scale.y /= (1 + percentBorder) * (elementWidth / planeWidth);
	cssScene.add(cssObject);
	
	// create a renderer for CSS
	rendererCSS	= new THREE.CSS3DRenderer();
	rendererCSS.setSize( window.innerWidth, window.innerHeight );
	rendererCSS.domElement.style.position = 'absolute';
	rendererCSS.domElement.style.top	  = 0;
	rendererCSS.domElement.style.margin	  = 0;
	rendererCSS.domElement.style.padding  = 0;
	document.body.appendChild( rendererCSS.domElement );
	// when window resizes, also resize this renderer
	THREEx.WindowResize(rendererCSS, camera);

	renderer.domElement.style.position = 'absolute';
	renderer.domElement.style.top      = 0;
	// make sure original renderer appears on top of CSS renderer
	renderer.domElement.style.zIndex   = 1;
	rendererCSS.domElement.appendChild( renderer.domElement );



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
    rendererCSS.render( cssScene, camera );
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
var containsGun = function(objects){
    // console.log(objects)
    if (!objects ||objects === undefined || objects == null) return false
    if (objects[0].object.name == 'PortalGun') { return true }
    return false
}
var onDocumentMouseDown = function(evt) 
{
    var raycaster = new THREE.Raycaster(); // create once
var mouse = new THREE.Vector2(); // create once



mouse.x = ( event.clientX / renderer.domElement.clientWidth ) * 2 - 1;
mouse.y = - ( event.clientY / renderer.domElement.clientHeight ) * 2 + 1;

raycaster.setFromCamera( mouse, camera );
// console.log(scene.children[3].children[0])
var intersects = raycaster.intersectObjects( scene.children[3].children);
if (containsGun(intersects)) { console.log('hit')}
// console.log('intersects',intersects)
}
document.addEventListener( 'mousedown', onDocumentMouseDown, false );
