	// First we declare the variables that hold the objects we need
	// in the animation code
	var scene, camera, renderer;  // all threejs programs need these
	var planeMesh, podRacer, testTrack;
	var light;
	var clock;
	var listener, sound, audioLoader;
	var startScene, startCamera, startText;
	var controls =
	     {  fwd:false, bwd:false, left:false, right:false,
					hardLeft:false, hardRight:false, boost: false,
				  OnCooldown: false, boostTimer:0, speed:0,
		    	camera:camera }

	init();
	initControls();

	var timerVar = setInterval(countTimer, 1000);
	var totalSeconds = 0;

	function countTimer() {
	   ++totalSeconds;
	   var hour = Math.floor(totalSeconds /3600);
	   var minute = Math.floor((totalSeconds - hour*3600)/60);
	   var seconds = totalSeconds - (hour*3600 + minute*60);
	   document.getElementById("timer").innerHTML = hour + ":" + minute + ":" + seconds;
	}

	function init(){
		initPhysijs();
		initGame();
		initTrack();
		initPodRacer();
		initEarth();
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
		var geometry = new THREE.SphereGeometry( 550, 550, 80 );
		var texture = new THREE.TextureLoader().load( '/textures/clouds.png' );
		texture.wrapS = THREE.RepeatWrapping;
		texture.wrapT = THREE.RepeatWrapping;
		texture.repeat.set( 7, 1 );
		var material = new THREE.MeshLambertMaterial( { color: 0xffffff, map:texture, side:THREE.DoubleSide } );
		var mesh = new THREE.Mesh( geometry, material, 0 );
		scene.add( mesh );

		var geometry2 = new THREE.BoxGeometry( 1000, 1000, 80 );
		var texture2 = new THREE.TextureLoader().load( '/textures/scene.png' );
		texture2.wrapS = THREE.RepeatWrapping;
		texture2.wrapT = THREE.RepeatWrapping;
		texture2.repeat.set( 1,1 );
		var material2 = new THREE.MeshLambertMaterial( { color: 0xffffff, map:texture2, side:THREE.DoubleSide } );
		var mesh2 = new THREE.Mesh( geometry2, material2, 0 );
		mesh2.translateY(5000);
		mesh2.rotateZ(-Math.PI/2);
		mesh2.rotateY(Math.PI/2);
		scene.add( mesh2 );

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
	  	camera.position.set(-650,5650,50);
		camera.lookAt(0,0,10);

		//Initializes audio listener and global audio source
		listener = new THREE.AudioListener();
		sound = new THREE.Audio( listener );
		audioLoader = new THREE.AudioLoader();
		camera.add( listener );
		idle();
	}

	function initPodRacer(){
		console.log("hello!");
		var loader = new THREE.JSONLoader();
		var texture = new THREE.TextureLoader().load( '../textures/diffuse.bmp' );
		loader.load("../models/feisar.json",
					function ( geometry, materials ) {
						material = new THREE.MeshLambertMaterial({color:0xffffff, map:texture});
						pmaterial = new Physijs.createMaterial(material,0.1,0.5);
						podRacer = new Physijs.BoxMesh(geometry, pmaterial, 1000);
						podRacer.add(camera);
						podRacer.position.x = 350;
						scene.add(podRacer);
						scene.add(testTrack);
						animate();
						});
	}

	//ALEXA
	function initEarth(){
		var loader = new THREE.JSONLoader();
		var texture = new THREE.TextureLoader().load( '../textures/earth.PNG' );
		loader.load("../models/earth.json",
					function ( geometry, materials ) {
						material = new THREE.MeshLambertMaterial({color:0xffffff, map:texture});
						pmaterial = new Physijs.createMaterial(material,0.1,0.5);
						earth = new Physijs.BoxMesh(geometry, pmaterial, 0);
						earth.position.x = 100;
						earth.position.z = 100;
						earth.scale.set(10,10,10);
						scene.add(earth);
					});
	}

	function initPhysijs(){
		Physijs.scripts.worker = '/js/physijs_worker.js';
		Physijs.scripts.ammo = '/js/ammo.js';
	}

	function initTrack() {
		var geometry = new THREE.RingGeometry();
		var texture = new THREE.TextureLoader().load( '../textures/desert.png' );
		var material = new THREE.MeshLambertMaterial({color:0xffffff, map:texture, side:THREE.DoubleSide });
		var pmaterial = new Physijs.createMaterial(material,0.1,0.5);
		testTrack = new Physijs.BoxMesh(geometry, pmaterial, 0);
		testTrack.position.set(50,-1,0);
		testTrack.rotation.x = Math.PI/2;
		testTrack.scale.set(500,500,500); // outer radius = 500, inner radius = 250
		scene.add(testTrack);
	}

	function initControls(){
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

			switch (event.key){
				// change the way the avatar is moving
				case "w": accelerate(); controls.fwd = true; break;
				case "s": accelerate(); controls.bwd = true; break;
				case "a": controls.left = true; break;
				case "d": controls.right = true; break;
				case "r": controls.up = true; break;
				case "f": controls.down = true; break;

				// switch cameras
				case "1": camera.position.set(0,7,-15); 	camera.lookAt(0,0,10); break;
				case "2": camera.position.set(0,4,-6); break;

				// Vehicle airbrakes, decreases turning radius
				case "ArrowLeft": controls.hardLeft = true;break;
				case "ArrowRight": controls.hardRight = true;break;

				//Boost
				case " ": boost(); controls.boost = true;break;
			}

		}

		function keyup(event){
			//console.log("Keydown:"+event.key);
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
			// podRacer.__dirtyPosition = true;
			if((podRacer.position.x > 500 || podRacer.position.x < -500) || (podRacer.position.x < 250 && podRacer.position.x > -250)) {
				"Entered if statement"
				podRacer.position. y = -1000
				podRacer.__dirtyPosition = true;
			}
			// if((podRacer.position.z > 500 || podRacer.position.z < -500) || (podRacer.position.z < 250 && podRacer.position.z > -250)) {
			// 	podRacer.position.y = -1000;
			// 	podRacer.__dirtyPosition = true;
			// }
		}

	function animate() {

		requestAnimationFrame( animate );
		updateAvatar();
		scene.simulate();
		renderer.render( scene, camera );

		//HUD
		var info = document.getElementById("info");
		/*info.innerHTML='<div style="font-size:24pt">Speed: ' + controls.speed +
		'  Cooldown:  ' + controls.boostTimer + '</div>';*/
	}

	//ALEXA - used for the speedometer
	function getSpeed(){
		return controls.speed;
	}

	function getTime(){
		return controls.clock;
	}
