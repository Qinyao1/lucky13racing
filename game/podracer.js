	// First we declare the variables that hold the objects we need
	// in the animation code
	var scene, camera, renderer;  // all threejs programs need these
	var planeMesh, podRacer, track, checkPoint, barrier;
	var light, clock;
	var listener, sound, audioLoader;
	var startScene, startCamera, startText;
	var endScene, endCamera;
	var controls =
	     {  fwd:false, bwd:false, left:false, right:false,
					hardLeft:false, hardRight:false, boost: false,
				  OnCooldown: false, boostTimer:0, speed:0,
		    	camera:camera }

	var gameInfo =
				{ nextCP:false, CP:0, lap:1, isOffTrack:false }

	const checkPointXposition = [ 315, 50, -165, -300, -220, 35, 310, 390 ];
	const checkPointYposition = 0.35;
	const checkPointZposition = [ 230, 340, 270, 30, -250, -350, -270, -10 ];
	const trackCenter = new THREE.Vector3(50,-1,0);

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

	function createEndScene(){
		endScene = new Physijs.Scene();
		var geometry = new THREE.BoxGeometry( 1000, 1000, 80 );
		var texture = new THREE.TextureLoader().load( '/textures/gameover.png' );
		texture.wrapS = THREE.RepeatWrapping;
		texture.wrapT = THREE.RepeatWrapping;
		texture.repeat.set( 1,1 );
		var material = new THREE.MeshLambertMaterial( { color: 0xffffff, map:texture, side:THREE.DoubleSide } );
		var mesh = new THREE.Mesh( geometry, material, 0 );
		mesh.translateY(5000);
		mesh.rotateZ(-Math.PI/2);
		mesh.rotateY(Math.PI/2);
		endScene.add( mesh );
		endCamera = new THREE.PerspectiveCamera( 90, window.innerWidth / window.innerHeight, 0.1, 1000 );
		endCamera.position.set(0,50,1);
		endCamera.lookAt(0,0,0);
		return endScene

	}

	function init(){
		initPhysijs();
		initGame();
		initTrack();
		initPodRacer();
		initBackgroundObjects();
		initCheckPoint();
		addBarriers();
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
		
		var geometry3 = new THREE.BoxGeometry( 1000, 1000, 80 );
		var texture3 = new THREE.TextureLoader().load( '/textures/controls.png' );
		texture3.wrapS = THREE.RepeatWrapping;
		texture3.wrapT = THREE.RepeatWrapping;
		texture3.repeat.set( 1,1 );
		var material3 = new THREE.MeshLambertMaterial( { color: 0xffffff, map:texture3, side:THREE.DoubleSide } );
		var mesh3 = new THREE.Mesh( geometry3, material3, 0 );
		mesh3.translateY(2000);
		mesh3.rotateX(Math.PI/2);
		//mesh3.rotateY(Math.PI/2);
		scene.add( mesh3 );

		//Initializes renderer
		renderer = new THREE.WebGLRenderer();
		renderer.setSize( window.innerWidth, window.innerHeight - 275 );
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
		var loader = new THREE.JSONLoader();
		var texture = new THREE.TextureLoader().load( '../textures/Apex.png' );
		loader.load("../models/Apex.json",
					function ( geometry, materials ) {
						material = new THREE.MeshLambertMaterial({color:0xffffff, map:texture});
						pmaterial = new Physijs.createMaterial(material,0.1,0.5);
						podRacer = new Physijs.BoxMesh(geometry, pmaterial, 1000);
						podRacer.add(camera);
						podRacer.position.x = 450;


						podRacer.addEventListener( 'collision',
								function( other_object ){
									if(other_object == barrier){
										console.log("hit barrier");
										//barrier.material.color.setHex((Math.random()*0xFFFFFF<<0));
										var geometry = new THREE.BoxGeometry( 1000, 1000, 80 );
										var texture = new THREE.TextureLoader().load( '/textures/gameover.png' );
										texture.wrapS = THREE.RepeatWrapping;
										texture.wrapT = THREE.RepeatWrapping;
										texture.repeat.set( 1,1 );
										var material = new THREE.MeshLambertMaterial( { color: 0xffffff, map: texture, side:THREE.DoubleSide } );
										var mesh = new THREE.Mesh( geometry, material, 0 );
										mesh.translateY(5000);
										mesh.rotateZ(-Math.PI/2);
										mesh.rotateY(Math.PI/2);
										scene.add( mesh );
									}
								}
							)

						scene.add(podRacer);
						scene.add(track);
						animate();
						});
	}

	//ALEXA
	function initBackgroundObjects(){
		var loader = new THREE.JSONLoader();
		var texture = new THREE.TextureLoader().load( '../textures/earth.PNG' );
		loader.load("../models/earth.json",
					function ( geometry, materials ) {
						material = new THREE.MeshLambertMaterial({color:0xffffff, map:texture});
						pmaterial = new Physijs.createMaterial(material,0.1,0.5);
						earth = new THREE.Mesh(geometry, pmaterial);
						earth.position.x = 100;
						earth.position.z = 100;
						earth.scale.set(10,10,10);
						earth.rotation.set(Math.PI/2, 0, 0);
						scene.add(earth);
					});

		createSphere('../textures/mercury.jpeg', 0, 0);
		createSphere('../textures/venus.jpeg', 100, -100);
		createSphere('../textures/mars.jpeg', 50, -50);
		createSphere('../textures/saturn.jpeg', 200, -80);
		createSphere('../textures/uranus.jpeg', 250, -30);
		createSphere('../textures/neptune.PNG', 200, -30);
		createSphere('../textures/pluto.PNG', 200, -100);
	}

	//ALEXA
	function createSphere(texture, xPos, zPos){
		var texture = new THREE.TextureLoader().load( texture );
		var geometry = new THREE.SphereGeometry( 5, 32, 32 );
		var material = new THREE.MeshBasicMaterial( {color: 0xffffff, map: texture} );
		var sphere = new THREE.Mesh( geometry, material );
		sphere.scale.set(5, 5, 5)
		sphere.position.set(xPos, 0, zPos);
		sphere.rotateZ(0.5);
		scene.add( sphere );
	}

	function initCheckPoint(){
		var texture = new THREE.TextureLoader().load( '/textures/yellowcloud_ft.jpg' );
		var geometry = new THREE.TorusGeometry(10, 2, 16, 100);
		var material = new THREE.MeshLambertMaterial({color:0xffffff, map:texture, side: THREE.DoubleSide});
		checkPoint = new THREE.Mesh(geometry, material);
		checkPoint.scale.set(2,2,2);
		checkPoint.position.set(
		checkPointXposition[0],
		checkPointYposition,
		checkPointZposition[0]);

		scene.add(checkPoint);
	}

	function updateCheckPoint(){
		if(gameInfo.CP >= 7){
			gameInfo.CP = 0;
			gameInfo.lap++;
		}

		if(checkPoint.position.distanceTo(podRacer.position) < 40){
			gameInfo.CP++;
			checkPoint.position.set(
				checkPointXposition[gameInfo.CP],
				checkPointYposition,
				checkPointZposition[gameInfo.CP])
		} else {
			checkPoint.rotateY(.05);
		}
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
		track = new Physijs.BoxMesh(geometry, pmaterial, 0);
		track.position.set(50,-1,0);
		track.rotation.x = Math.PI/2;
		track.scale.set(500,500,500); // outer radius = 500, inner radius = 250
		scene.add(track);
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
				case "1": camera.position.set(0,2500,-100);camera.lookAt(0,0,10);break;
				case "2": camera.position.set(0,7,-10); camera.lookAt(0,0,10); break;
				case "3": camera.position.set(0,4,-2); camera.lookAt(0,0,10) ;break;

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
			} else if(controls.fwd && controls.speed < 750){
				controls.speed += 1;
			} else if(controls.bwd && controls.speed > -75){
				controls.speed -= 5;
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

			if(podRacer.position.y > 0.5){
				podRacer.position.y = 0.33; //Normal y position of podRacer
				podRacer.__dirtyPosition;
			}
		}

		function checkTrackBoundary(){
			if(podRacer.position.y < 0){
				podRacer.position.y -= 10;
				podRacer.__dirtyPosition = true;
				gameInfo.isOffTrack = true;
			} else if(podRacer.position.distanceTo(trackCenter) < 465 &&
					podRacer.position.distanceTo(trackCenter) > 235){
			} else {
				podRacer.position.y -= 10;
				podRacer.__dirtyPosition = true;
				gameInfo.isOffTrack = true;
			}
		}

	function animate() {
		console.log(podRacer.position.distanceTo(trackCenter));
		requestAnimationFrame( animate );
		updateCheckPoint();
		updateAvatar();
		updateBackgroundObjects();
		checkTrackBoundary();
		scene.simulate();
		renderer.render( scene, camera );

		//HUD
		var info = document.getElementById("info");
	}

	//ALEXA - used for the speedometer
	function getSpeed(){
		return controls.speed;
	}

	function getTime(){
		return controls.clock;
	}

	//ALEXA
	function addBarriers(){
		var texture = new THREE.TextureLoader().load( '../textures/holo.jpeg' );
		var geometry = new THREE.RingBufferGeometry( 200, 250, 32 );
		var material = new THREE.MeshBasicMaterial( { color: 0xfffff, side: THREE.DoubleSide, map: texture } );
		barrier = new THREE.Mesh( geometry, material);
		barrier.rotation.set(Math.PI/2, 0, Math.PI/2);
		barrier.position.set(50, 0, 0);
		scene.add( barrier );
	}

	function updateBackgroundObjects(){
		barrier.rotateZ(0.5);
		barrier.__dirtyRotation = true;
	}
