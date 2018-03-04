
/*
 This is our final version of the initial animation demo.
 We use javascript functions to simplify the code a bit

*/


	console.log("In demo4!");

	// here we define some controls to interact with the animation ...
	var controls = new function() {
			this.camera = 0;
	}

	var gui = new dat.GUI();
	gui.add(controls, 'camera', [0,1,2,3]);
	console.dir([controls, controls.rotationX, controls.rotationZ]);


	// First we declare the variables that hold the objects we need
	// in the animation code
	var scene, camera, renderer;  // all threejs programs need these
	var textMesh, cubeMesh, coneMesh, planeMesh; // we have 4 mesh objects
	var podRacer;
	var light1,light2;  // we have two lights

	init(); // initialize these 9 variables
	animate();  // start the animation loop!

	/**
	  To initialize the scene, we initialize each of its components
	*/
	function init(){
			initScene();
			initRenderer();
			initPlaneMesh();
			initSuzanne();

			initLight1();
			initLight2();
			initCamera();
	}

	/* We don't do much here, but we could do more!
	*/
	function initScene(){
		scene = new THREE.Scene();
	}

	/*
		The renderer needs a size and the actual canvas we draw on
		needs to be added to the body of the webpage. We also specify
		that the renderer will be computing soft shadows
	*/
	function initRenderer(){
		renderer = new THREE.WebGLRenderer();
		renderer.setSize( window.innerWidth, window.innerHeight );
		document.body.appendChild( renderer.domElement );
		renderer.shadowMap.enabled = true;
		renderer.shadowMap.type = THREE.PCFSoftShadowMap;
	}

	/*
		We use a perspective camera raised 4 units and set back 20, looking at (0,0,0)
	*/
	function initCamera(){
		camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
		camera.position.z = 20;
		camera.position.y=4;
		camera.lookAt(0,0,0);
	}

	function initSuzanne(){
		var loader = new THREE.BufferGeometryLoader();
		loader.load("../models/podracer.json",
					function ( geometry, materials ) {
						var material = new THREE.MeshLambertMaterial( { color: 0x00ff00 } );
						podRacer = new THREE.Mesh( geometry, material );
						scene.add( podRacer )});
	}

	function initPlaneMesh(){
		// creating a textured plane which receives shadows
		var planeGeometry = new THREE.PlaneGeometry( 20, 20, 128 );
		var texture = new THREE.TextureLoader().load( '../images/dogs.jpg' );
		texture.wrapS = THREE.RepeatWrapping;
		texture.wrapT = THREE.RepeatWrapping;
		texture.repeat.set( 4, 4 );
		var planeMaterial = new THREE.MeshLambertMaterial( { color: 0xaaaaaa,  map: texture ,side:THREE.DoubleSide} );
		planeMesh = new THREE.Mesh( planeGeometry, planeMaterial );
		planeMesh.position.y = -2;
		scene.add(planeMesh);
		// we need to rotate the mesh 90 degrees to make it horizontal not vertical
		planeMesh.rotation.x = -Math.PI/2;
		planeMesh.receiveShadow = true;
	}


	function initLight1(){
		light1 = new THREE.SpotLight( 0xaaaaff );
		light1.position.set( 0, 10, 0 );
		light1.castShadow = true;
		//Set up shadow properties for the light
		light1.shadow.mapSize.width = 2048;  // default
		light1.shadow.mapSize.height = 2048; // default
		light1.shadow.camera.near = 0.5;       // default
		light1.shadow.camera.far = 500      // default
		// add it to the scenes
		scene.add( light1 );
	}


	function initLight2(){
		var light2 = new THREE.SpotLight( 0xffaaaa );
		light2.position.set( -100, 100, 100 );
		light2.castShadow = true;
		//Set up shadow properties for the light
		light2.shadow.mapSize.width = 2048;  // default
		light2.shadow.mapSize.height = 2048; // default
		light2.shadow.camera.near = 0.5;       // default
		light2.shadow.camera.far = 500      // default
		// add it to the scene
		scene.add( light2 );
	}



  var angle = 0;

	function animate() {
		requestAnimationFrame( animate );
		var currentTime = (new Date()).getTime();


		angle += controls.camRotation;
		switch (controls.camera){
			case '0': revolveCamera(angle); break;
			case '1': setCameraAngle1(); break;
			case '2': setCameraAngle2(); break;
			case '3': setCameraAngle3(); break;
		}

		renderer.render( scene, camera );
	}



	/* here we make the camera move in a circle of radius 20
		around the scene looking always at the coneMesh object
		We also have it oscillate higher and lower
	*/
	function revolveCamera(angle){
		camera.position.x = 5*Math.sin(angle);
		camera.position.z = 5*Math.cos(angle);
		camera.position.y = 2*(1+Math.cos(angle));
		camera.lookAt(0,0,0);
	}


	function setCameraAngle1(){
		camera.position.x=0;
		camera.position.y=1;
		camera.position.z=10;
		camera.lookAt(0,0,0);
	}

	function setCameraAngle2(){
		camera.position.x=0;
		camera.position.y=10;
		camera.position.z=0;
		camera.lookAt(0,0,0);
	}

	function setCameraAngle3(){
		camera.position.x=0;
		camera.position.y=4;
		camera.position.z=30;
		camera.lookAt(0,4,0);
	}
