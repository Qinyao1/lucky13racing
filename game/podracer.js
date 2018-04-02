	// First we declare the variables that hold the objects we need
	// in the animation code
	var scene, camera, renderer;  // all threejs programs need these
	var planeMesh, podRacer, testTrack;
	var light;
	var clock;
	var listener, sound, audioLoader;

	var controls =
	     {fwd:false, bwd:false, left:false, right:false,
				 hardLeft:false, hardRight:false, boost: false,
				OnCooldown: false, boostTimer:0, speed:0,
		    camera:camera}

	init();

	function init(){
			initGame();
			initPlaneMesh();
			initTestTrack();
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

		//Initializes skybox
		var geometry = new THREE.SphereGeometry( 1000, 1000, 80 );
		var texture = new THREE.TextureLoader().load( '/textures/space.PNG' );
		texture.wrapS = THREE.RepeatWrapping;
		texture.wrapT = THREE.RepeatWrapping;
		texture.repeat.set( 10, 10 );
		var material = new THREE.MeshLambertMaterial( { color: 0xffffff, map:texture, side:THREE.DoubleSide } );
		var mesh = new THREE.Mesh( geometry, material, 0 );
		scene.add( mesh );

		//Initializes renderer
		renderer = new THREE.WebGLRenderer();
		renderer.setSize( window.innerWidth, window.innerHeight - 50 );
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

		//Initializes audio listener and global audio source
		listener = new THREE.AudioListener();
		sound = new THREE.Audio( listener );
		audioLoader = new THREE.AudioLoader();
		camera.add( listener );
		idle();
	}

	function initPodRacer(){
		var loader = new THREE.JSONLoader();
		var texture = new THREE.TextureLoader().load( '../textures/b2.png' );
		loader.load("../models/racer.json",
					function ( geometry, materials ) {
						material = new THREE.MeshLambertMaterial({color:0xffffff, map:texture});
						pmaterial = new Physijs.createMaterial(material,0.1,0.5);
						podRacer = new Physijs.BoxMesh(geometry, pmaterial);
						podRacer.position.y = 0
						podRacer.position.x = 0
						podRacer.position.z = 0
						podRacer.add(camera);
						scene.add(podRacer);
						scene.add(planeMesh);
						animate();
						});
	}

	function initTestTrack(){
		var loader = new THREE.JSONLoader();
		var texture = new THREE.TextureLoader().load( '../textures/desert.png' );
		loader.load("../models/racetrack3.json",
					function ( geometry, materials ) {
						material = new THREE.MeshLambertMaterial({color:0xffffff, map:texture});
						pmaterial = new Physijs.createMaterial(material,0.5, 0.5);
						testTrack = new Physijs.BoxMesh(geometry, pmaterial,0);
						testTrack.position.y = 0
						testTrack.position.x = 0
						testTrack.position.z = 0
						testTrack.receiveShadow = true;
						scene.add(testTrack);
						});
	}

	function initPlaneMesh(){
		// creating a textured plane which receives shadow
		var geometry = new THREE.PlaneGeometry( 20000, 20000, 128 );
		var pmaterial = new Physijs.createMaterial(
				new THREE.MeshLambertMaterial(), 0.5, 0.5);
		planeMesh = new Physijs.BoxMesh( geometry, pmaterial, 0 );
		planeMesh.position.y = -10;
		planeMesh.rotation.x = -Math.PI/2;
		planeMesh.receiveShadow = true;
	}

	function initControls(){
			// here is where we create the eventListeners to respond to operations

			  //create a clock for the time-based animation ...
				clock = new THREE.Clock();
				clock.start();

				window.addEventListener( 'keydown', keydown);
				window.addEventListener( 'keyup',   keyup );
	  }

		function idle(){
			if(controls.fwd == true || controls.bwd == true){
				sound.stop();
				sound = new THREE.Audio( listener );
			}
			audioLoader = new THREE.AudioLoader();
			audioLoader.load( '/audio/while_idling.wav', function( buffer ) {
				sound.setBuffer( buffer );
				sound.setLoop( true );
				sound.setVolume( 0.03 );
				sound.play();
		});
		}

		function accelerate(){
			if(controls.fwd == false && controls.bwd == false){
				sound.stop();
				sound = new THREE.Audio( listener );
			}
			audioLoader = new THREE.AudioLoader();
			audioLoader.load( '/audio/while_boosting.wav', function( buffer ) {
				sound.setBuffer( buffer );
				sound.setLoop( true );
				sound.setVolume( 0.03 );
				sound.play();
		});
		}

		function boost(){
			if(controls.OnCooldown == true){
				return;
			}
			if(controls.boost == false){
				sound.stop();
				sound = new THREE.Audio( listener );
			}
			audioLoader = new THREE.AudioLoader();
			audioLoader.load( '/audio/activate_boost.wav', function( buffer ) {
				sound.setBuffer( buffer );
				sound.setLoop( false );
				sound.setVolume( 0.05 );
				sound.play();
		});
		}

		function keydown(event){
			console.log("Keydown:"+event.key);
			//console.dir(event);
			// this is the regular scene
			switch (event.key){
				// change the way the avatar is moving
				case "w": accelerate(); controls.fwd = true; break;
				case "s": accelerate(); controls.bwd = true; break;
				case "a": controls.left = true; break;
				case "d": controls.right = true; break;
				case "r": controls.up = true; break;
				case "f": controls.down = true; break;

				// switch cameras
				case "1": camera.position.set(0,7,-15); break;
				case "2": camera.position.set(0,4,-6); break;
				case "3": camera.position.set(0,25,-30); break; // We can delete this later. This was just to see if the test track added properly (Rebecca)

				// Vehicle airbrakes, decreases turning radius
				case "ArrowLeft": controls.hardLeft = true;break;
				case "ArrowRight": controls.hardRight = true;break;
				//Boost
				case " ": boost(); controls.boost = true;break;
			}

		}

		function keyup(event){
			//console.log("Keydown:"+event.key);
			//console.dir(event);
			switch (event.key){
				case "w": idle(); controls.fwd  = false; break;
				case "s": idle(); controls.bwd  = false; break;
				case "a": controls.left  = false; break;
				case "d": controls.right = false; break;
				case "r": controls.up    = false; break;
				case "f": controls.down  = false; break;
				case "ArrowLeft": controls.hardLeft = false;break;
				case "ArrowRight": controls.hardRight = false;break;
				case " ": controls.boost = false;break;
			}
		}

	  function updateAvatar(){
			"change the avatar's linear or angular velocity based on controls state (set by WSAD key presses)"
			var forward = podRacer.getWorldDirection(forward);
			podRacer.setLinearVelocity(forward.multiplyScalar(controls.speed));

			//Acceleration System
			if(controls.boost && controls.OnCooldown == false){
				controls.boostTimer += 1.5;
				controls.speed += 3;
			} else if(controls.fwd && controls.speed <= 150){
				controls.speed += 1;
			} else if(controls.bwd && controls.speed > -75){
				controls.speed -= 1;
			} else if (controls.speed < 0){
				controls.speed += 1;
			} else if (controls.speed > 0){
				controls.speed -= 1;
			}

			//Boost usage cooldown timer
			if(controls.boostTimer > 118 && controls.OnCooldown != true){
				controls.boostTimer = 300;
				controls.OnCooldown = true;
			} else if(controls.boostTimer >= 0 && controls.OnCooldown == true){
				controls.boostTimer -= .5;
				if(controls.boostTimer == 0){
					controls.OnCooldown = false;
				}
			} else if(controls.boostTimer >= 0.5 && controls.OnCooldown == false){
				controls.boostTimer -= .5;
			}

			//Turn System
			if (controls.hardLeft){
				podRacer.setAngularVelocity(new THREE.Vector3(0,controls.speed*0.0175,0));
			} else if (controls.hardRight){
				podRacer.setAngularVelocity(new THREE.Vector3(0,-controls.speed*0.0175,0));
			} else if (controls.left){
				podRacer.setAngularVelocity(new THREE.Vector3(0,controls.speed*0.0075,0));
			} else if (controls.right){
				podRacer.setAngularVelocity(new THREE.Vector3(0,-controls.speed*0.0075,0));
			} else {
				podRacer.setAngularVelocity(new THREE.Vector3(0,0,0));
			}

		}

	function animate() {
		requestAnimationFrame( animate );
		updateAvatar();
		scene.simulate();
		renderer.render( scene, camera );
		//HUD
		var info = document.getElementById("info");
		info.innerHTML='<div style="font-size:24pt">Speed: ' + controls.speed +
		'  Cooldown:  ' + controls.boostTimer + '</div>';
	}
