	// First we declare the variables that hold the objects we need
	// in the animation code
	var scene, camera, renderer;  // all threejs programs need these
	var planeMesh, podRacer, testTrack;
	var light;
	var forward;

	var controls =
	     {fwd:false, bwd:false, left:false, right:false,
				speed:10,
		    camera:camera}

	init();

	function init(){
			initGame();
			initPlaneMesh();
			initPodRacer();
			initGridHelper();
			initControls();
	}

	function initGridHelper(){
		var size = 10000;
		var divisions = 10000;
		var gridHelper = new THREE.GridHelper( size, divisions );
		scene.add( gridHelper );
	}

	function initGame(){
		//Initializes scene
		scene = new Physijs.Scene();

		//Initializes renderer
		renderer = new THREE.WebGLRenderer();
		renderer.setSize( window.innerWidth, window.innerHeight );
		document.body.appendChild( renderer.domElement );
		renderer.shadowMap.enabled = true;
		renderer.shadowMap.type = THREE.PCFSoftShadowMap;

		//Initializes Physijs scripts
		Physijs.scripts.worker = '/js/physijs_worker.js';
		Physijs.scripts.ammo = '/js/ammo.js';

		//Initializes light
		light = new THREE.AmbientLight( 0x404040, 5 );
		scene.add( light );

		//Initializes camera
		camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
		camera.position.set(0,7,-15);
		camera.lookAt(0,0,10);

	}

	function initPodRacer(){
		var loader = new THREE.JSONLoader();
		var texture = new THREE.TextureLoader().load( '../textures/b2.png' );
		loader.load("../models/racer.json",
					function ( geometry, materials ) {
						material = new THREE.MeshLambertMaterial({color:0xffffff, map:texture});
						pmaterial = new Physijs.createMaterial(material,0.1,0.5);
						podRacer = new Physijs.BoxMesh(geometry, pmaterial);
						podRacer.add(camera);
						scene.add(podRacer);
						scene.add(planeMesh);
						animate();
						});
	}

	function initPlaneMesh(){
		// creating a textured plane which receives shadow
		var geometry = new THREE.PlaneGeometry( 20000, 20000, 128 );
		var pmaterial = new Physijs.createMaterial(
				new THREE.MeshLambertMaterial(), 0.5, 0.5);
		planeMesh = new Physijs.BoxMesh( geometry, pmaterial, 0 );
		planeMesh.position.y = -2;
		planeMesh.rotation.x = -Math.PI/2;
		planeMesh.receiveShadow = true;
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
			//console.log("Keydown:"+event.key);
			//console.dir(event);
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
				case "1": camera.position.set(0,7,-15); break;
				case "2": camera.position.set(0,4,-6); break;

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
				case "m": controls.speed = 100; break;
			}
		}

	  function updateAvatar(){
			"change the avatar's linear or angular velocity based on controls state (set by WSAD key presses)"

			var forward = podRacer.getWorldDirection(forward);

			if (controls.fwd){
				podRacer.setLinearVelocity(forward.multiplyScalar(controls.speed));
			} else if (controls.bwd){
				podRacer.setLinearVelocity(forward.multiplyScalar(-controls.speed));
			} else {
				var velocity = podRacer.getLinearVelocity();
				velocity.x=velocity.z=0;
				podRacer.setLinearVelocity(velocity); //stop the xz motion
			}

			if (controls.left){
				podRacer.setAngularVelocity(new THREE.Vector3(0,controls.speed*0.1,0));
			} else if (controls.right){
				podRacer.setAngularVelocity(new THREE.Vector3(0,-controls.speed*0.1,0));
			} else {
				podRacer.setAngularVelocity(new THREE.Vector3(0,0,0));
			}

		}

	function animate() {
		requestAnimationFrame( animate );
		updateAvatar();
		scene.simulate();
		renderer.render( scene, camera );
	}
