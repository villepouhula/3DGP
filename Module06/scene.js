
 /*************************************************************
  3D Graphics Programming
  Custom particle system example.
  (c) anssi.grohn at karelia.fi 2013
 *************************************************************/

// Parameters
var width = 800,
    height = 600
    viewAngle = 45,
    aspect = width/height,
    near = 0.1,
    far = 1000.0;

var renderer = null;
var scene = null;
var camera = null;

var mouse = {
    down: false,
    prevY: 0,
    prevX: 0
}

var camObject = null;
var keysPressed = [];
var ruins = [];

var shoulderRotationJoint;
var shoulderTiltingJoint;
var upperArm;
var elbowJoint;
var lowerArm;
var wrist;
var hand;
var thumb;
var indexfinger;
var middlefinger;
var pinky;
var customLamberShader;
var fenceShader;
var fps = {
    width: 100,
    height: 50,
    svg: null,
    data: [],
    ticks: 0,
    time: null
}
var spotLight = null;
var spotLightObj = null;
var ambientLight = null;
var custParticleSystem = null;
// for easier conversion
function colorToVec4(color){
    var res = new THREE.Vector4(color.r, color.g, color.b, color.a);
    return res;
}
function colorToVec3(color){
    var res = new THREE.Vector3(color.r, color.g, color.b);
    return res;
}

$(function(){

    // get div element 
    var ctx = $("#main");
    // create WebGL-based renderer for our content.
    renderer = new THREE.WebGLRenderer();

    // create camera
    camera = new THREE.PerspectiveCamera( viewAngle, aspect, near, far);

    // create scene
    scene = new THREE.Scene();
    camObject = new THREE.Object3D();
    camObject.add(camera);
    spotLightObj = new THREE.Object3D();
    spotLightObj.position.z = 0.1;
    camera.add(spotLightObj);

    // add camera to scene and set its position.
    scene.add(camObject);
    camObject.position.z = 5;
    camObject.position.y = 1.0;
    // define renderer viewport size
    renderer.setSize(width,height);

    // add generated canvas element to HTML page
    ctx.append(renderer.domElement);

    // directional light for the moon
    var directionalLight = new THREE.DirectionalLight( 0x88aaff, 1.0 ); 
    directionalLight.position.set( 1, 1, -1 ); 

    scene.add( directionalLight );

    // Add ambient light, simulating surround scattering light
    ambientLight = new THREE.AmbientLight(0x282a2f);
    scene.add( ambientLight  );
    

    scene.fog = new THREE.Fog(0x172747, 1.0, 50.0);
    // Add our flashlight
    var distance  = 6.0;
    var intensity = 2.0;
    spotLight = new THREE.SpotLight( 0xffffff, 
				     intensity,
				     distance ); 
    spotLight.castShadow = false; 
    spotLight.position = new THREE.Vector3(0,0,1);
    spotLight.target = spotLightObj;
    spotLight.exponent = 10;
    spotLight.angle = 0.81;
    scene.add( spotLight );

    // create cube  material
    var material =
	new THREE.MeshBasicMaterial(
	    {
		color: 0xFFFFFF,
		
	    });
    material.side = THREE.DoubleSide;
    
    var loader = new THREE.JSONLoader();
    // Create ground from cube and some rock
    var rockTexture = THREE.ImageUtils.loadTexture("rock.jpg");

    // texture wrapping mode set as repeating
    rockTexture.wrapS = THREE.RepeatWrapping;
    rockTexture.wrapT = THREE.RepeatWrapping;
    

    function handler(geometry, materials) {
	ruins.push(new THREE.Mesh(geometry, new THREE.MeshLambertMaterial(
	    {
		map: THREE.ImageUtils.loadTexture("rock.jpg"),
		transparent: true
		
	    }
	)));
	checkIsAllLoaded();
    }
    
    function checkIsAllLoaded(){
	if ( ruins.length == 5 ) {
	    $.each(ruins, function(i,mesh){
		scene.add(mesh);
		// mesh is rotated around 
		mesh.rotation.x = Math.PI/2.0;
		/*$.each( mesh.material.materials, function(i,d){
		    d.map = THREE.ImageUtils.loadTexture("rock.jpg");
		    d.transparent = true;
		});*/
	    });
	    // arcs
	    ruins[0].position.z = 13;
	    // corner
	    ruins[1].position.x = 13;

	    // crumbled place
	    ruins[2].position.x = -13;
	    

	    ruins[3].position.z = -13;
	}
    }
    loader.load("meshes/ruins30.js", handler);    
    loader.load("meshes/ruins31.js", handler);
    loader.load("meshes/ruins33.js", handler);
    loader.load("meshes/ruins34.js", handler); 
    loader.load("meshes/ruins35.js", handler);

    cloud_object = new THREE.Object3D();
    var cloud_texture = THREE.ImageUtils.loadTexture("clouds.png");
    var cloud_material = new THREE.MeshBasicMaterial({
        map: cloud_texture, 
        transparent: true,
        blending: THREE.AdditiveBlending
    });
    cloud_material.depthWrite = false;
        
    function sky_handler(geometry, materials){
        clouds = new THREE.Mesh(geometry, cloud_material);
        clouds.renderDepth = 1;
	scene.add(clouds);
	clouds.position = cloud_object.position;
	clouds.rotation = cloud_object.rotation;
    }
    loader.load("meshes/sky.js", sky_handler);
    
    
    //wooden logs (bonfire)
    log_object = new THREE.Object3D();
    var log_texture = THREE.ImageUtils.loadTexture("wood-texture.jpg");
    var log_material = new THREE.MeshBasicMaterial({
        map: log_texture
    });
    log_material.side = THREE.DoubleSide;

    function log_handler(geometry, materials){
        for(i=0;i<2;i++){
        logs = new THREE.Mesh(geometry, log_material);
        
            logs.scale.x = 0.2;
            logs.scale.y = 0.2;
            logs.scale.z = 0.2;

            logs.position.x = (i/2);
            logs.position.y = 0.2;
            logs.position.z = i;
            scene.add(logs);
        }
    }
    loader.load("meshes/logs.js", log_handler);


    //pine trees
    pine_object = new THREE.Object3D();
    var pine_texture = THREE.ImageUtils.loadTexture("pine.png");
    var pine_material = new THREE.MeshBasicMaterial({
        map: pine_texture,
        transparent: true,
        alphaTest: 0.5,
        blending: THREE.NormalBlending
    });
    pine_material.side = THREE.DoubleSide;
    for(i=0;i<15;i++){
        pine_geometry = new THREE.PlaneGeometry(3,5);
        pine_plane1 = new THREE.Mesh(pine_geometry, pine_material);
        pine_plane2 = new THREE.Mesh(pine_geometry, pine_material);
        
        scene.add(pine_plane1);
        scene.add(pine_plane2);
        
        pine_plane1.position.x = Math.floor((Math.random()*15)+10);
        pine_plane1.position.y = 2.4;
        pine_plane1.position.z = Math.floor((Math.random()*15)-20);
        
        pine_plane2.position = pine_plane1.position;
        pine_plane2.rotation.y = 90 * (Math.PI / 180);
        
        pine_plane1.rotation.z = 180 * (Math.PI / 180);
        pine_plane2.rotation.z = pine_plane1.rotation.z;
    }
    
    //lime trees
    lime_object = new THREE.Object3D();
    var lime_texture = THREE.ImageUtils.loadTexture("lime.png");
    var lime_material = new THREE.MeshBasicMaterial({
        map: lime_texture,
        transparent: true,
        alphaTest: 0.5,
        blending: THREE.NormalBlending
    });
    lime_material.side = THREE.DoubleSide;
    for(i=0;i<15;i++){
        lime_geometry = new THREE.PlaneGeometry(3,5);
        lime_plane1 = new THREE.Mesh(lime_geometry, lime_material);
        lime_plane2 = new THREE.Mesh(lime_geometry, lime_material);
        
        scene.add(lime_plane1);
        scene.add(lime_plane2);
        
        lime_plane1.position.x = Math.floor((Math.random()*15)+10);
        lime_plane1.position.y = 2.4;
        lime_plane1.position.z = Math.floor((Math.random()*15)-20);
        
        lime_plane2.position = lime_plane1.position;
        lime_plane2.rotation.y = 90 * (Math.PI / 180);
        
        lime_plane1.rotation.z = 180 * (Math.PI / 180);
        lime_plane2.rotation.z = lime_plane1.rotation.z;
    }
    
    
    var skyboxMaterials = [];
    skyboxMaterials.push ( new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture("./nightsky/nightsky_west.png")}));
    skyboxMaterials.push ( new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture("./nightsky/nightsky_east.png")}));
    skyboxMaterials.push ( new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture("./nightsky/nightsky_up.png")}));
    skyboxMaterials.push ( new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture("./nightsky/nightsky_down.png")}));
    skyboxMaterials.push ( new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture("./nightsky/nightsky_north.png")}));
    skyboxMaterials.push ( new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture("./nightsky/nightsky_south.png")}));
    $.each(skyboxMaterials, function(i,d){
	d.side = THREE.BackSide;
	d.depthWrite = false;

    });
    var sbmfm = new THREE.MeshFaceMaterial(skyboxMaterials);
    sbmfm.depthWrite = false;
    // Create a new mesh with cube geometry 
    var skybox = new THREE.Mesh(
	new THREE.CubeGeometry( 10,10,10,1,1,1 ), 
	sbmfm
    );

    skybox.position = camObject.position;
    skybox.renderDepth = 0;
    scene.add(skybox);
    
    
    // Construct a mesh object
    var ground = new THREE.Mesh( new THREE.CubeGeometry(100,0.2,100,1,1,1), 
				 new THREE.MeshPhongMaterial({
				     map: rockTexture,
				     transparent: true
				 }));

    
    // Do a little magic with vertex coordinates so ground looks more interesting
    $.each(ground.geometry.faceVertexUvs[0], function(i,d){

	d[0] = new THREE.Vector2(0,25);
	//d[1] = new THREE.Vector2(0,0);
	d[2] = new THREE.Vector2(25,0);
	d[3] = new THREE.Vector2(25,25);
    });
    ground.renderDepth = 2001;
    
    scene.add(ground);
    
    
    //Fire particle system
    fireParticleSystem = new CustomParticleSystem( {
	maxParticles: 40,
	energyDecrement: 2,
	throughPutFactor: 30,
	material: new THREE.ParticleBasicMaterial({
	    color: 0xffffff,
	    size: 1.6,
	    map: THREE.ImageUtils.loadTexture("fire.png"),
	    transparent: true,
	    blending: THREE.AdditiveBlending,
	    depthWrite: false
	}),
	onParticleInit: function(particle){
	    // original birth position of particle.
            //randomize
	    particle.set(Math.random(),0.1,Math.random());
	    // particle moves up
	    particle.velocity = new THREE.Vector3(0,1,0);
	    // particle life force
	    particle.energy = 1.5;
	},
	onParticleUpdate: function(particle,delta){
	    // Add velocity per passed time in seconds
	    particle.add(particle.velocity.clone().multiplyScalar(delta));
	    // reduce particle energy
	    particle.energy -= (fireParticleSystem.options.energyDecrement * delta);
	}
    });
    // add Three.js particlesystem to scene.
    scene.add(fireParticleSystem.ps);
    
    //smoke particle system
    smokeParticleSystem = new CustomParticleSystem( {
	maxParticles: 30,
	energyDecrement: 2,
	throughPutFactor: 20,
	material: new THREE.ParticleBasicMaterial({
	    color: 0xffffff,
	    size: 2,
	    map: THREE.ImageUtils.loadTexture("smoke.png"),
	    transparent: true,
	    blending: THREE.AdditiveBlending,
	    depthWrite: false
	}),
	onParticleInit: function(particle){
	    // original birth position of particle.
            //randomize
	    particle.set(Math.random(),0.5,Math.random());
	    // particle moves up
	    particle.velocity = new THREE.Vector3(0,3,0);
	    // particle life force
	    particle.energy = 1.2;
	},
	onParticleUpdate: function(particle,delta){
	    // Add velocity per passed time in seconds
	    particle.add(particle.velocity.clone().multiplyScalar(delta));
	    // reduce particle energy
	    particle.energy -= (smokeParticleSystem.options.energyDecrement * delta);
	}
    });
    // add Three.js particlesystem to scene.
    scene.add(smokeParticleSystem.ps);

    
    fps.time = new Date();
    // request frame update and call update-function once it comes
    requestAnimationFrame(update);

    ////////////////////
    // Setup simple input handling with mouse
    document.onmousedown = function(ev){
	mouse.down = true;
	mouse.prevY = ev.pageY;
	mouse.prevX = ev.pageX;
    }

    document.onmouseup = function(ev){
	mouse.down = false;
    }

    document.onmousemove = function(ev){
	if ( mouse.down ) {

	    var rot = (ev.pageY - mouse.prevY) * 0.01;
	    var rotY = (ev.pageX - mouse.prevX) * 0.01;

	    camObject.rotation.y -= rotY;
	    camera.rotation.x -= rot;

	    mouse.prevY = ev.pageY;
	    mouse.prevX = ev.pageX;
	}
    }
    ////////////////////
    // setup input handling with keypresses
    document.onkeydown = function(event) {
	keysPressed[event.keyCode] = true;
    }
    
    document.onkeyup = function(event) {
	keysPressed[event.keyCode] = false;
    }
    
    
    // querying supported extensions
    var gl = renderer.context;
    var supported = gl.getSupportedExtensions();

    console.log("**** Supported extensions ***'");
    $.each(supported, function(i,d){
	console.log(d);
    });
    //Create SVG element
    fps.svg = d3.select("#fps")
	.append("svg")
	.attr("width", fps.width)
	.attr("height", fps.height);

});

var angle = 0.0;
var movement = 0.0;
var moving = false;
function update(){

    // render everything 
    renderer.setClearColorHex(0x000000, 1.0);
    renderer.clear(true);
    renderer.render(scene, camera); 
    angle += 0.001;
    moving = false;
    if ( keysPressed["W".charCodeAt(0)] == true ){
	var dir = new THREE.Vector3(0,0,-1);
	var dirW = dir.applyMatrix4(camObject.matrixRotationWorld);
	camObject.translate(0.1, dirW);
	moving = true;
    }

    if ( keysPressed["S".charCodeAt(0)] == true ){

	var dir = new THREE.Vector3(0,0,-1);
	var dirW = dir.applyMatrix4(camObject.matrixRotationWorld);
	camObject.translate(-0.1, dirW);
	moving = true;

    }
    if ( keysPressed["A".charCodeAt(0)] == true ){
	var dir = new THREE.Vector3(-1,0,0);
	var dirW = dir.applyMatrix4(camObject.matrixRotationWorld);
	camObject.translate(0.1, dirW);
	moving = true;
    }

    if ( keysPressed["D".charCodeAt(0)] == true ){

	var dir = new THREE.Vector3(-1,0,0);
	var dirW = dir.applyMatrix4(camObject.matrixRotationWorld);
	camObject.translate(-0.1, dirW);
	moving = true;
    }
    
    if ( keysPressed["P".charCodeAt(0)] == true ){
	custParticleSystem.init(1);
    }
    
    if ( keysPressed["Q".charCodeAt(0)] == true ){

	shoulderRotationJoint.rotation.y += 0.1;

    }
    if ( keysPressed["E".charCodeAt(0)] == true ){

	shoulderRotationJoint.rotation.y -= 0.1;

    }
    // so strafing and moving back-fourth does not double the bounce
    if ( moving ) {
	movement+=0.1;
	camObject.position.y = Math.sin(movement*2.30)*0.07+1.2; 
    }
    spotLight.position = camObject.position;
           

    var dir = new THREE.Vector3(0,0,-1);
    var dirW = dir.applyMatrix4(camObject.matrixRotationWorld);

    spotLight.target.position = dirW;

    if ( fireParticleSystem != null ){
	fireParticleSystem.update();
    }
    if ( smokeParticleSystem != null ){
	smokeParticleSystem.update();
    }
    
    //put clouds "over" the camera
    cloud_object.position.x = camObject.position.x;
    cloud_object.position.y = camObject.position.y - 0.45; //put little close to the ground
    cloud_object.position.z = camObject.position.z;

    //rotate clouds
    var rotation_speed = 0.0003;  //rotation speed
    cloud_object.rotation.y += rotation_speed;

    // request another frame update
    requestAnimationFrame(update);
    
    fps.ticks++;
    var tmp = new Date();
    var diff = tmp.getTime()-fps.time.getTime();

    if ( diff > 1000.0){
	fps.data.push(fps.ticks);
	if ( fps.data.length > 15 ) {
	    fps.data.splice(0, 1);
	}
	fps.time = tmp;
	fps.ticks = 0;
	displayFPS();
    }
    
}
  
// for displaying fps meter 
function displayFPS(){

    fps.svg.selectAll("rect").remove();
    
    fps.svg.append("rect")
	.attr("x", 0)
	.attr("y", 0)
	.attr("width", 100)
	.attr("height", 50)
	.attr("fill", "rgb(0,0,0)");

    fps.svg.selectAll("rect")
	.data(fps.data)
	.enter()
	.append("rect")
	.attr("x", function(d, i) {
	    return (i * (2+1));  //Bar width of 20 plus 1 for padding
	})
	.attr("y", function(d,i){
	    return 50-(d/2);
	})
	.attr("width", 2)
	.attr("height", function(d,i){
	    return (d/2);
	})
	.attr("fill", "#FFFFFF");
	
    fps.svg.selectAll("text").remove();
    fps.svg
	.append("text")
	.text( function(){
	    return fps.data[fps.data.length-1] + " FPS";
	})
	.attr("x", 50)
	.attr("y", 25)
	.attr("fill", "#FFFFFF");
}  
    

var CustomParticleSystem = function( options )
{
    var that = this;
    
    this.prevTime = new Date();
    this.particles = new THREE.Geometry();
    this.options = options;

    this.numAlive = 0;
    this.throughPut = 0.0;
    this.throughPutFactor = 0.0;
    if ( options.throughPutFactor !== undefined ){
	this.throughPutFactor = options.throughPutFactor;
    }

    // add max amount of particles (vertices) to geometry
    for( var i=0;i<this.options.maxParticles;i++){
	this.particles.vertices.push ( new THREE.Vector3());
    }
    
    this.ps = new THREE.ParticleSystem(this.particles, 
				       this.options.material);
    this.ps.renderDepth = 0;
    this.ps.sortParticles = false;
    this.ps.geometry.__webglParticleCount = 0;

    this.getNumParticlesAlive = function(){
	return this.numAlive;
    }
    this.setNumParticlesAlive = function(particleCount){
	this.numAlive = particleCount;
    }
    this.getMaxParticleCount = function(){
	return this.ps.geometry.vertices.length;
    }

    this.removeDeadParticles = function(){

	var endPoint = this.getNumParticlesAlive();
	for(var p=0;p<endPoint;p++){
	    var particle = this.ps.geometry.vertices[p];
	    //console.log("remove dead particles", particle.energy);
	    if ( particle.energy <= 0.0 ){
		// remove from array
		var tmp = this.ps.geometry.vertices.splice(p,1);
		// append to end of array
		this.ps.geometry.vertices.push(tmp[0]);
		// vertices have shifted, no need to as far anymore
		endPoint--;
		// decrease alive count by one
		this.setNumParticlesAlive( this.getNumParticlesAlive()-1);
		
	    }
	}
    }

    this.init = function( particleCount ){
	var previouslyAlive = this.getNumParticlesAlive();
	var newTotal = particleCount + previouslyAlive;
	newTotal = (newTotal > this.getMaxParticleCount()) ? 
	    this.getMaxParticleCount() : newTotal;
	
	this.setNumParticlesAlive(newTotal);
	// initialize every particle
	for(var p=previouslyAlive;p<newTotal;p++){
	    this.options.onParticleInit( this.ps.geometry.vertices[p]);
	}
	this.ps.geometry.verticesNeedUpdate = true;
	
    }
    
    this.update = function(){

	var now = new Date();
	var delta = (now.getTime() - that.prevTime.getTime())/1000.0;
	
	// a quick hack to get things working.
	this.ps.geometry.__webglParticleCount = this.getNumParticlesAlive();
	
	// seek and destroy dead ones
	this.removeDeadParticles();

	var endPoint = this.getNumParticlesAlive();
	for( var p=0;p<endPoint;p++){
	    var particle = this.ps.geometry.vertices[p];
	    if ( particle !== undefined ){
		this.options.onParticleUpdate(particle, delta);
	    }
	}
	// Add new particles according to throughput factor
	that.throughPut += (that.throughPutFactor * delta);
	var howManyToCreate  = Math.floor( that.throughPut );
	if ( howManyToCreate > 1 ){
	    that.throughPut -= howManyToCreate;
	    that.init( howManyToCreate );
	}
	// Changes in position need to be reflected to VBO
	this.ps.geometry.verticesNeedUpdate = true;
	
	that.prevTime = now;
    }
}
