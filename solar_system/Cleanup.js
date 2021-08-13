let container;
let camera;
let controls;
let renderer;
let scene;
let mesh;
let spheresToRotate = [];
let cloudGroup;

//For focus and offset of camera
let currentObject;
let camOffset = 5;

const direction = new THREE.Vector3();


/* 
    Initializes essentials (camera, controls, lights, meshes, and renderer)
    and starts animation loop
*/
function main() {

    container = document.querySelector( '#scene-container' );

    //create scene and append it to fullscreen canvas
    scene = new THREE.Scene();

    //initialize scene contents
    createCamera();
    createControls();
    createLights();
    createMeshes();
    createRenderer();

    //Start the camera at the sun
    currentObject = spheresToRotate[2];

    //Continuously render the scene
    renderer.setAnimationLoop( () => {     
        update();
        render();
    } );
}

/*
    Initializes camera in a default position
*/
function createCamera() {
    const fov = 40;
    const aspect = 2;  // the canvas default
    const near = 0.1;
    const far = 1000;
    camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    
    camera.position.set(30, 12, 30);
    camera.up.set(0, 1, 0);
    camera.lookAt(0, 0, 0);
}

/*
    Initializes lights
*/
function createLights() {
    //Point lamp for center of the sun
    const color = 0xFFFFFF;
    const intensity = 1;
    const pointLight = new THREE.PointLight(color, intensity);

    const ambientLight = new THREE.AmbientLight ( 0xffffff, 0.55);
    scene.add( ambientLight, pointLight );
}

/*
    Populates an array with all the planet meshes
*/
function createMeshes() {
    //Adding Objects & Animations//

    //For loading textures
    const textureLoader = new THREE.TextureLoader();

    //Background---actually a giant sphere!
    const backgroundTex = textureLoader.load( "images/starfield.jpg");
    const backgroundGeometry  = new THREE.SphereGeometry(90, 32, 32);
    const backgroundMaterial =  new THREE.MeshBasicMaterial({map: backgroundTex, side: THREE.DoubleSide});
    const backgroundMesh = new THREE.Mesh(backgroundGeometry,backgroundMaterial);
    scene.add(backgroundMesh);


    //Generic Sphere geometry--use for celestial bodies
    const radius = 1;
    const widthSegments = 32;
    const heightSegments = 32;
    const sphereGeometry = new THREE.SphereBufferGeometry(
        radius, widthSegments, heightSegments);
    
    //The solar system: PARENT of planet systems and star
    const solarSystem = new THREE.Object3D();
    scene.add(solarSystem);
    spheresToRotate.push(solarSystem);
    //makeAxisGrid(solarSystem, 'solarSystem', 26);


    //The Sun  
    const sunTex = textureLoader.load( "images/sun.jpg");
    const sunMaterial = new THREE.MeshPhongMaterial({color: 0xffffff, emissive: 0xffc31f, emissiveIntensity: .7, map: sunTex, flatShading: false});
    const sunMesh = new THREE.Mesh(sphereGeometry, sunMaterial);
    sunMesh.scale.set(5, 5, 5);  // make the sun large
    solarSystem.add(sunMesh);
    spheresToRotate.push(sunMesh);
    //makeAxisGrid(sunMesh, 'sunMesh');
    
    //Node for earth so it is disguished from satellites
    const earthOrbit = new THREE.Object3D();
    earthOrbit.position.x = 35;
    solarSystem.add(earthOrbit);
    spheresToRotate.push(earthOrbit);

    //The Earth
    const earthTex = textureLoader.load( "images/Earth.jpg")
    const earthBump = textureLoader.load("images/earthnormal.jpg");
    const earthSpec = textureLoader.load("images/water.png");
    const earthMaterial = new THREE.MeshPhongMaterial({map: earthTex, specularMap: earthSpec, specular: new THREE.Color('grey'), shininess: 10, flatShading: false});
    const earthMesh = new THREE.Mesh(sphereGeometry, earthMaterial);
    earthOrbit.add(earthMesh);
    spheresToRotate.push(earthMesh);
    //makeAxisGrid(earthOrbit, 'earthOrbit');

    //The Earth's clouds
    const cloudTex = textureLoader.load( "images/clouds.png");
    const cloudMaterial = new THREE.MeshPhongMaterial({map: cloudTex, transparent: true, opacity: 0.4});
    const cloudMesh = new THREE.Mesh(sphereGeometry, cloudMaterial);
    cloudMesh.scale.set(1.03,1.03,1.03);  // make slightly larger than earth
    earthOrbit.add(cloudMesh);
    cloudGroup = cloudMesh;
    //makeAxisGrid(earthMesh, 'earthMesh');
    
    //Node for moon so it is distiguished from earth
    const moonOrbit = new THREE.Object3D();
    moonOrbit.position.x = 3.5;
    moonOrbit.position.y = 1.5;
    earthOrbit.add(moonOrbit);
    
    //The Moon
    const moonTex = textureLoader.load( "images/moon.jpg")
    const moonMaterial = new THREE.MeshPhongMaterial({map: moonTex, flatShading: false, shininess: 0, reflectivity: 0});
    const moonMesh = new THREE.Mesh(sphereGeometry, moonMaterial);
    moonMesh.scale.set(.5, .5, .5);
    moonOrbit.add(moonMesh);
    spheresToRotate.push(moonMesh);
    //makeAxisGrid(moonMesh, 'moonMesh');
}

/*
    Initializes the more flexible controls from OrbitControls.js
*/
function createControls() {
    controls = new THREE.OrbitControls( camera, container );
    controls.enablePan = false;
    controls.enableZoom = false;
}
  
/*
    Initializes the WebGL renderer; renderers take all the information in the scene
    and use it to create a frame.
*/
function createRenderer() {

    renderer = new THREE.WebGLRenderer({ antialias: true});
    renderer.setSize( container.clientWidth, container.clientHeight );

    renderer.setPixelRatio( window.devicePixelRatio );

    //renderer.gammaFactor = 2.2;
    //renderer.gammaOutput = true;

    //renderer.physicallyCorrectLights = true; //lights in lumens, candela, etc

    container.appendChild( renderer.domElement );

}

/* 
    Presumably the little widget in the corner. Maybe this can be abused for camera controls.
class AxisGridHelper {
    constructor(node, units = 10) {
      const axes = new THREE.AxesHelper();
      axes.material.depthTest = false;
      axes.renderOrder = 2;  // after the grid
      node.add(axes);

      const grid = new THREE.GridHelper(units, units);
      grid.material.depthTest = false;
      grid.renderOrder = 1;
      node.add(grid);

      this.grid = grid;
      this.axes = axes;
      this.visible = false;
    }
    get visible() {
      return this._visible;
    }
    set visible(v) {
      this._visible = v;
      this.grid.visible = v;
      this.axes.visible = v;
    }
}

*/

/*
    DEBUG: Initializes the axis grid of a corresponding mesh

function makeAxisGrid(node, label, units) {
    const helper = new AxisGridHelper(node, units);
    gui.add(helper, 'visible').name(label);
}
*/

document.getElementById("sunButton").onclick = function() {
    currentObject = spheresToRotate[1];
    camOffset = 50;
}

document.getElementById("earthButton").onclick = function() {
    currentObject = spheresToRotate[2];
    camOffset = 5;
}

document.getElementById("moonButton").onclick = function() {
    currentObject = spheresToRotate[4];
    camOffset = 2;
}

function update() {
    spheresToRotate.forEach((obj) => {
        obj.rotation.y += .001;
        });

    cloudGroup.rotation.y += .004;
    
    //center camera on selected planet
    currentObject.getWorldPosition( controls.target );
    controls.update();

    // update the transformation of the camera so it has an offset position to the current target
    direction.subVectors( camera.position, controls.target );
    direction.normalize().multiplyScalar( camOffset );
    camera.position.copy( direction.add( controls.target ) );
}

/*
    Creates a frame from the current scene using the camera
*/
function render() {
    renderer.render( scene, camera );
}

/*

*/
function onWindowResize() {

    // set the aspect ratio to match the new browser window aspect ratio
    camera.aspect = container.clientWidth / container.clientHeight;
  
    // update the camera's frustum
    camera.updateProjectionMatrix();
  
    // update the size of the renderer AND the canvas
    renderer.setSize( container.clientWidth, container.clientHeight );
  
  }
  
window.addEventListener( 'resize', onWindowResize );

main();