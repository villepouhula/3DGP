/*************************************************************
  3D Graphics Programming
  anssi.grohn@karelia.fi 2013
  Mesh loading and camera movement demo code with Three.js
 *************************************************************/
// Parameters
var width = 1000,
    height = 600,
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

var shoulder;
var elbow;
var hand;

$(function(){
    // get div element 
    var ctx = $("#main");
    // create WebGL-based renderer for our content.
    renderer = new THREE.WebGLRenderer();

    // create camera
    camera = new THREE.PerspectiveCamera( viewAngle, aspect, near, far);
    camObject = new THREE.Object3D();
    // create scene
    scene = new THREE.Scene();
    // camera will be the the child of camObject
    camObject.add(camera);

    // add camera to scene and set its position.
    scene.add(camObject);
    camObject.position.z = 5;
    camObject.position.y = 2.0;

    // define renderer viewport size
    renderer.setSize(width,height);

    // add generated canvas element to HTML page
    ctx.append(renderer.domElement);
    
    
    //arm object is the parent object
    var arm = new THREE.Object3D();
    
    //add shoulder sphere
    shoulder = new THREE.Mesh(    
        new THREE.SphereGeometry(0.4,16,16),
        new THREE.MeshBasicMaterial( { color: 0xff0000 })
    );
    
    //shoulder is the child of the arm
    arm.add(shoulder);
    
    //add upper arm cube
    var upperarm = new THREE.Mesh(
        new THREE.CubeGeometry(0.4,1.0,0.4),
        new THREE.MeshBasicMaterial( { color: 0x00ff00 })
    );
    upperarm.translateY(0.5);
    //upperarm is the child of the shoulder    
    shoulder.add(upperarm);
    
    //elbow sphere
    elbow = new THREE.Mesh(    
        new THREE.SphereGeometry(0.3,16,16),
        new THREE.MeshBasicMaterial( { color: 0x0000ff })
    );
    elbow.translateY(0.5);
    //elbow is the child of the upperarm
    upperarm.add(elbow);

    //add lower arm cube
    var lowerarm = new THREE.Mesh(
        new THREE.CubeGeometry(0.35,0.8,0.35),
        new THREE.MeshBasicMaterial( { color: 0xff00ff })
    );
    lowerarm.translateY(0.4);  
    //lower arm is the child of the elbow
    elbow.add(lowerarm);
        
    //add hand cube
    hand = new THREE.Mesh(
        new THREE.CubeGeometry(0.5,0.5,0.35),
        new THREE.MeshBasicMaterial( { color: 0xffff00 })
    );
    hand.translateY(0.5);
    //hand is the child of the lower arm
    lowerarm.add(hand);
    
    //add thumb
    var thumb = new THREE.Mesh(
        new THREE.CubeGeometry(0.11,0.35,0.11),
        new THREE.MeshBasicMaterial( { color: 0x00ffff })
    );
    thumb.translateY(0.1);
    thumb.translateX(-0.34);
    thumb.rotation.z = 60 * (Math.PI / 180);
    //thumb is the child of the hand
    hand.add(thumb);
    
    //add index finger
    var index_finger = new THREE.Mesh(
        new THREE.CubeGeometry(0.11,0.35,0.11),
        new THREE.MeshBasicMaterial( { color: 0x00ffff })
    );
    index_finger.translateY(0.4);
    index_finger.translateX(-0.15);
    //fingers are the childs of the hand
    hand.add(index_finger);
    
    //add middle finger
    var middle_finger = new THREE.Mesh(
        new THREE.CubeGeometry(0.11,0.35,0.11),
        new THREE.MeshBasicMaterial( { color: 0x00ffff })
    );
    middle_finger.translateY(0.4);
    middle_finger.translateX(0);
    hand.add(middle_finger);
    
    //add ring finger
    var ring_finger = new THREE.Mesh(
        new THREE.CubeGeometry(0.11,0.35,0.11),
        new THREE.MeshBasicMaterial( { color: 0x00ffff })
    );
    ring_finger.translateY(0.4);
    ring_finger.translateX(0.15);
    hand.add(ring_finger);
    
    
    //add the whole arm to the scene
    arm.position.y = 1;
    scene.add(arm);
    
    
    // Create ground from cube and some rock
    var rockTexture = THREE.ImageUtils.loadTexture("rock.jpg");

    // texture wrapping mode set as repeating
    rockTexture.wrapS = THREE.RepeatWrapping;
    rockTexture.wrapT = THREE.RepeatWrapping;

    // Construct a mesh object
    var ground = new THREE.Mesh( new THREE.CubeGeometry(100,0.2,100,1,1,1),
				 new THREE.MeshBasicMaterial({
				     map: rockTexture,
				     transparent: true
				 }));
    // do a little magic with vertex coordinates so ground looks more intersesting.
    $.each( ground.geometry.faceVertexUvs[0], function(i,d){
	d[0] = new THREE.Vector2(0,25);
	d[2] = new THREE.Vector2(25,0);
	d[3] = new THREE.Vector2(25,25);
    });

    // add ground to scene
    scene.add(ground);

    // mesh loading functionality
    var loader = new THREE.JSONLoader();
    function handler( geometry, materials ){
	ruins.push( new THREE.Mesh(geometry, new THREE.MeshBasicMaterial(
	    {
		map: rockTexture,
		transparent: true
	    })));
	checkIsAllLoaded();
    }
    function checkIsAllLoaded(){

	if ( ruins.length == 5 ){
	    $.each(ruins, function(i,mesh){
    		// rotate 90 degrees
		mesh.rotation.x = Math.PI/2;
		scene.add(mesh);		
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
    // loading of meshes 
    loader.load("meshes/ruins30.js", handler);
    loader.load("meshes/ruins31.js", handler);
    loader.load("meshes/ruins33.js", handler);
    loader.load("meshes/ruins34.js", handler);
    loader.load("meshes/ruins35.js", handler);

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
    

});

//rotation angle
var angle = 0.0;

function update(){
            
    shoulder.rotation.z = Math.cos(angle);
    elbow.rotation.z = Math.sin(angle);
    hand.rotation.x = Math.sin(angle);
    
    angle += 0.1;
    
    // render everything 
    renderer.setClearColorHex(0x000000, 1.0);
    renderer.clear(true);
    renderer.render(scene, camera); 
    
    if ( keysPressed["W".charCodeAt(0)] == true ){
	var dir = new THREE.Vector3(0,0,-1);
	var dirW = dir.applyMatrix4(camObject.matrixRotationWorld);
	camObject.translate(0.1, dirW);
    }

    if ( keysPressed["S".charCodeAt(0)] == true ){
	var dir = new THREE.Vector3(0,0,-1);
	var dirW = dir.applyMatrix4(camObject.matrixRotationWorld);
	camObject.translate(-0.1, dirW);
    }
    if ( keysPressed["A".charCodeAt(0)] == true ){
	var dir = new THREE.Vector3(1,0,0);
	var dirW = dir.applyMatrix4(camObject.matrixRotationWorld);
	camObject.translate(-0.1, dirW);
    
    }

    if ( keysPressed["D".charCodeAt(0)] == true ){
	var dir = new THREE.Vector3(1,0,0);
	var dirW = dir.applyMatrix4(camObject.matrixRotationWorld);
	camObject.translate(0.1, dirW);
    }
    

    // request another frame update
    requestAnimationFrame(update);
}
    