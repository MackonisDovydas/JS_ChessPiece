var moving = -21;
var movingState = 0;
var objWhite;
var objBlack;
var step = 0;

var camera;
$(function (){
    var container = new THREE.Object3D();
    var stats = initStats();

    // create a scene, that will hold all our elements such as objects, cameras and lights.
    var scene = new THREE.Scene();

    const spotLight = new THREE.SpotLight( 0xffffff , 0.2);
    spotLight.position.set( 0, 1000, 0 );
    
    spotLight.castShadow = true;
    scene.add( spotLight );
    // create a render and set the size
    var webGLRenderer = new THREE.WebGLRenderer();
    webGLRenderer.setClearColor(0xEEEEEE, 1.0);
    webGLRenderer.setSize(window.innerWidth, window.innerHeight);
    webGLRenderer.shadowMap.Enabled = true;

    //webGLRenderer.shadowMap.type = THREE.PCFSoftShadowMap;
    ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);

    var directionalLight = new THREE.DirectionalLight(0xFFFFFF, 0.8);
    directionalLight.position.copy(new THREE.Vector3(25, 30, -50));
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.right = 50;
    directionalLight.shadow.camera.left = -50;
    directionalLight.shadow.camera.top = 50;
    directionalLight.shadow.camera.bottom = -50;
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;

    scene.add(directionalLight);

    // position and point the camera to the center of the scene

    var material = new THREE.MeshBasicMaterial();
    var textureLoader = new THREE.TextureLoader();
    textureLoader.load('assets/chessboard.jpg',
    function (texture) {    
        material.map = texture;
        material.needsUpdate = true;
    });

    var planeGeometry = new THREE.PlaneGeometry(48, 48);
    var plane = new THREE.Mesh(planeGeometry, material);
    plane.rotateX(-Math.PI * 0.5);
    scene.add(plane);

    // add the output of the renderer to the html element
    $("#WebGL-output").append(webGLRenderer.domElement);    

    var blackMaterial = new THREE.MeshPhongMaterial({
        color: '#484b52',
        reflectivity: 100,
        shininess: 100,
        shading: THREE.SmoothShading
    });

    var whiteMaterial = new THREE.MeshPhongMaterial({
        color: '#dedfe3',
        reflectivity: 100,
        shininess: 100,
        shading: THREE.SmoothShading
    });

    white_queen = {
        'name': 'White Queen',
        'model': 'assets/Queen.model.json',
        'black': false,
        'position': { x: 3 , y: 0, z: -21 },
        'rotation': { x: 0, y: 0, z: 0 },
        'board': false
    };
    black_queen = {
        'name': 'Black Queen',
        'model': 'assets/Queen.model.json',
        'black': true,
        'position': { x: -3, y: 0, z: 21 },
        'rotation': { x: 0, y: 0, z: 0 },
        'board': false
    };

    var loader = new THREE.JSONLoader();
    loader.load(white_queen.model, function(geometry) {
        objWhite = new THREE.Mesh(geometry, whiteMaterial);
        objWhite.position.x = white_queen.position.x;
        objWhite.position.y = white_queen.position.y;
        objWhite.position.z = white_queen.position.z;
        objWhite.rotation.set(degreeToRad(white_queen.rotation.x), degreeToRad(white_queen.rotation.y), degreeToRad(white_queen.rotation.z));
        objWhite.castShadow = true;
        objWhite.receiveShadow = true;
        objWhite.name = 'Queen';
            scene.add(objWhite);
    });
    loader.load(black_queen.model, function(geometry) {
        objBlack = new THREE.Mesh(geometry, blackMaterial);
        objBlack.position.x = black_queen.position.x;
        objBlack.position.y = black_queen.position.y;
        objBlack.position.z = black_queen.position.z;
        objBlack.rotation.set(degreeToRad(black_queen.rotation.x), degreeToRad(black_queen.rotation.y), degreeToRad(black_queen.rotation.z));
        objBlack.castShadow = true;
        objBlack.receiveShadow = true;
        scene.add(objBlack);
    });

    var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    
    camera.position.x = -30;
    camera.position.y = 40;
    camera.position.z = 50;
    camera.lookAt(new THREE.Vector3(10, 0, 0));
    camControl = new THREE.TrackballControls( camera, webGLRenderer.domElement );
    // setup the control gui
    var AllControls = function() {
        // we need the first child, since it's a multimaterial

        this.changeFov = 45;
        this.freeCamera = false;
        this.cameraPosition = 0;
        this.fovIncrement = 0.2;
        this.dobyEffect = 45;
        this.reset = function(){
            controls.cameraPosition = 1;
            camera.position.x = -30;
            camera.position.y = 40;
            camera.position.z = 50;
            camera.lookAt(new THREE.Vector3(10, 0, 0));
            controls.freeCamera = true;
        };
        this.setFov = function(){
            controls.cameraPosition = 1;
            controls.freeCamera = false;
            let init_depht_s    = Math.tan(4.0/2.0 * Math.PI/180.0) * 2.0;
            let current_depht_s = Math.tan(controls.changeFov/2.0 * Math.PI/180.0) * 2.0;
            camera.position.set(-30, 5, 30 * init_depht_s / current_depht_s);
            camera.lookAt(new THREE.Vector3(0, 0, 0));
            camera.fov = controls.changeFov;
            camera.updateProjectionMatrix();
        };
        this.setDollyZoom = function(){
            controls.freeCamera = false;
            camera.position.x = 0;
            camera.position.y = 10;
            camera.position.z = 60;
            camera.lookAt(objBlack);
            this.cameraPosition = 3;
        };
        this.follow = function(){
            this.cameraPosition = 4;
            controls.freeCamera = false;
            camera.position.x = 15; // 15
            camera.position.y = 15;
            camera.position.z = 15;
            //camera.lookAt(scene.position);
            camera.lookAt(new THREE.Vector3(0, 8, 0));
            var box = new THREE.Object3D();
            var mesh;
            var Objloader = new THREE.ObjectLoader();
            Objloader.load('assets/camera.obj', function (geo) {
                mesh = geo;
                mesh.rotation.y = Math.PI;
                mesh.position.y = -11.3;
                box.add(mesh);
            });
            var axes = new THREE.AxisHelper( 60 );
            box.add(axes);
            box.rotation.y = Math.PI;
            camObject = new THREE.Object3D();
            camObject.add(box);
            camObject.scale.set(0.05, 0.05, 0.05);
            camObject.position.y = 12;
            scene.add(camObject);
            camera.position = camObject.position
            camera.updateProjectionMatrix();
        };
    }

    var controls = new AllControls();

    var gui = new dat.GUI();
    gui.add(controls, 'reset');
    gui.add(controls, 'changeFov', 40, 160).step(1).onChange(controls.setFov);
    gui.add(controls, 'setDollyZoom');
    gui.add(controls, 'follow');
    render();

    function render() {
        
        stats.update();
        if (moving <= 21 && movingState == 0){
            moving += 0.2;
        }
        else if (moving >= -21 && movingState == 1){
            moving -= 0.2;
        }
        else{
            if(movingState == 1){
                movingState = 0;
            }
            else if(movingState == 0){
                movingState = 1;
            }
        }
        // render using requestAnimationFrame
        requestAnimationFrame(render);
        webGLRenderer.render(scene, camera);
        if (controls.freeCamera) {
            camControl.update();
        }
        objWhite.position.z = moving;

        if (controls.cameraPosition == 3){
            camera.fov = controls.dobyEffect;
            controls.dobyEffect = controls.dobyEffect + controls.fovIncrement;
            camera.position.z = camera.position.z - controls.fovIncrement / 2;
            camera.position.z = objBlack.position.z + 10 / (2 * Math.tan(Math.PI / 180 * controls.dobyEffect / 2));
            camera.updateProjectionMatrix();
            if (controls.dobyEffect > 100 || controls.dobyEffect < 30){
              controls.fovIncrement = -1 * controls.fovIncrement;
            }
        }
        if (controls.cameraPosition == 4){
            var sphere = scene.getObjectByName('Queen');
            renderer.render(scene, camera);
            camObject.lookAt(objWhite.position);
            camera.position = camObject.position;
            camera.lookAt(objWhite.position);
            camera.updateProjectionMatrix();
            step += 0.2;
            sphere.position.x = 10 * Math.cos(step);
            sphere.position.y = 1.5 + 6 * Math.abs(Math.sin(step));
        }

    }

    function degreeToRad(deg) {
        return deg * (Math.PI / 180);
    }
    
    function initStats() {

        var stats = new Stats();
        stats.setMode(0); // 0: fps, 1: ms

        // Align top-left
        stats.domElement.style.position = 'absolute';
        stats.domElement.style.left = '0px';
        stats.domElement.style.top = '0px';

        $("#Stats-output").append(stats.domElement);

        return stats;
    }
});

