	// First we declare the variables that hold the objects we need
	// in the animation code
	var scene, camera, renderer;  // all threejs programs need these
	var planeMesh, podRacer, testTrack;
	var light1,light2;  // we have two lights
	var avatar, avatarCam;

	var controls =
	     {fwd:false, bwd:false, left:false, right:false,
				speed:10,
		    camera:camera}

	var gameState =
				     {score:0, health:10, scene:'main', camera:'none' }

	init(); // initialize these 9 variables
	animate();  // start the animation loop!




	/**
	  To initialize the scene, we initialize each of its components
	*/
	function init(){
			initScene();
			initPlaneMesh();
			initTestTrack();
			initControls();
			initLight1();
			initLight2();
			initCamera();
			initPodRacer();
	}

	function initPhysijs(){
	    Physijs.scripts.worker = '../js/physijs_worker.js';
	    Physijs.scripts.ammo = '../js/ammo.js';
	  }

	/* Initializes Scene and Renderer
	*/
	function initScene(){
		scene = new Physijs.Scene();
		renderer = new THREE.WebGLRenderer();
		renderer.setSize( window.innerWidth, window.innerHeight );
		document.body.appendChild( renderer.domElement );
		renderer.shadowMap.enabled = true;
		renderer.shadowMap.type = THREE.PCFSoftShadowMap;
		initPhysijs();
	}

	/*
		We use a perspective camera raised 4 units and set back 20, looking at (0,0,0)
	*/
	function initCamera(){
		camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
		camera.position.set(0,4,0);
		camera.lookAt(0,4,10);
	}

	function initPodRacer(){
		var loader = new THREE.BufferGeometryLoader();
		var texture = new THREE.TextureLoader().load( '../textures/b2.png' );
		loader.load("../models/podracer.json",
					function ( geometry, materials ) {
						material = new THREE.MeshPhongMaterial({color:0xffffff, map:texture});
						pmaterial = new Physijs.createMaterial(material,0.9,0.5);
						podRacer = new Physijs.BoxMesh( geometry, pmaterial, 0 );
						avatar = podRacer;
						camera.position.set(0,6,-13);
						camera.lookAt(0,4,10);
						podRacer.add(camera);
						scene.add(podRacer);
						});
	}

	function initTestTrack(){
		var loader = new THREE.BufferGeometryLoader();
		loader.load("../models/FullTestTrack.json",
					function ( geometry, materials ) {
						var material = new THREE.MeshPhongMaterial({color:0xffff00});
						var pmaterial = new Physijs.createMaterial(material,0.9,0.5);
						testTrack = new Physijs.BoxMesh( geometry, material, 0);
						testTrack.scale.set(50,50,50);
						scene.add( testTrack )});
	}

	function initPlaneMesh(){
		// creating a textured plane which receives shadow
		var planeGeometry = new THREE.PlaneGeometry( 20, 20, 128 );
		var planeMaterial = new THREE.MeshLambertMaterial( { color: 0xaaaaaa} );
		planeMesh = new THREE.Mesh( planeGeometry, planeMaterial );
		planeMesh.position.y = -2;
		scene.add(planeMesh);
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


	var clock;

	function initControls(){
			// here is where we create the eventListeners to respond to operations

			  //create a clock for the time-based animation ...
				clock = new THREE.Clock();
				clock.start();

				window.addEventListener( 'keydown', keydown);
				window.addEventListener( 'keyup',   keyup );
	  }

		function keydown(event){
			console.log("Keydown:"+event.key);
			console.dir(event);
			// first we handle the "play again" key in the "youwon" scene
			// this is the regular scene
			switch (event.key){
				// change the way the avatar is moving
				case "w": controls.fwd = true;  break;
				case "s": controls.bwd = true; break;
				case "a": controls.left = true; break;
				case "d": controls.right = true; break;
				case "r": controls.up = true; break;
				case "f": controls.down = true; break;
				case "m": controls.speed = 30; break;

				// switch cameras
				case "1": camera.position.set(0,4,-6);; break;
				case "2": camera.position.set(0,4,-6);; break;

				// move the camera around, relative to the avatar
				case "ArrowLeft": camera.translateY(1);break;
				case "ArrowRight": camera.translateY(-1);break;
				case "ArrowUp": camera.translateZ(-1);break;
				case "ArrowDown": camera.translateZ(1);break;

			}

		}

		function keyup(event){
			//console.log("Keydown:"+event.key);
			//console.dir(event);
			switch (event.key){
				case "w": controls.fwd   = false;  break;
				case "s": controls.bwd   = false; break;
				case "a": controls.left  = false; break;
				case "d": controls.right = false; break;
				case "r": controls.up    = false; break;
				case "f": controls.down  = false; break;
				case "m": controls.speed = 10; break;
			}
		}



	  function updateAvatar(){
			"change the avatar's linear or angular velocity based on controls state (set by WSAD key presses)"

			var forward = avatar.getWorldDirection();

			if (controls.fwd){
				podRacer.setLinearVelocity(forward.multiplyScalar(controls.speed));
			} else if (controls.bwd){
				podRacer.setLinearVelocity(forward.multiplyScalar(-controls.speed));
			} else {
				var velocity = avatar.getLinearVelocity();
				velocity.x=velocity.z=0;
				podRacer.setLinearVelocity(velocity); //stop the xz motion
			}

			if (controls.left){
				podRacer.setAngularVelocity(new THREE.Vector3(0,controls.speed*0.1,0));
			} else if (controls.right){
				podRacer.setAngularVelocity(new THREE.Vector3(0,-controls.speed*0.1,0));
			}

		}

  var angle = 0;

	function animate() {
		requestAnimationFrame( animate );

						updateAvatar();
			    	scene.simulate();
						if (gameState.camera!= 'none'){
							renderer.render( scene, gameState.camera );
						}

		angle += controls.camRotation;
		switch (controls.camera){
			case '0': revolveCamera(angle); break;
			case '1': setCameraAngle1(); break;
			case '2': setCameraAngle2(); break;
			case '3': setCameraAngle3(); break;
		}

		renderer.render( scene, camera );
	}
