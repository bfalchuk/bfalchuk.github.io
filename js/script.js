/**
 * Author:  Ben Falchuk (some code adapted from web course "three.js journey" by B.Simon)
 * Created: May 2021
 * 
 * (c) Copyright by Ben Falchuk
 * Links: https://benfalchuk.mystrikingly.com
 *        https://sites.google.com/view/benfalchuk
 *        https://www.linkedin.com/in/bfalchuk 
 * 
 * Additional credits: 
 * Balloon model: https://poly.google.com/view/bK-kUCyS7os 
 * Earth model: https://poly.google.com/view/58PjkXNdpPb 
 * Magic sphere: https://www.cgtrader.com/free-3d-models/furniture/other/magic-sphere 
 * Buildings: https://free3d.com/3d-model/19-low-poly-buildings-974347.html 
 * Misc.: B.Simon's "three.js journey" at https://threejs-journey.xyz 
 * 
 * Scripts to support main scene loading
 * 
 **/
var stats, scene, renderer;
var camera, cameraControl; //cameras
var earthmodel = null; //the earth
const clock = new THREE.Clock();
var firefliesGeometry, firefliesCount, firefliesPositionArray, firefliesScaleArray;
var firefliesGeometry, firefliesMaterial, fireflies, firefliesSetupFlag = false;
var sprites = [], spritesCount = 30, spriteStartHeight=30, spriteEndHeight = 70;
var blimpmodel = null;

if(!init()) animate();

// init the scene
function init(){

    if( Detector.webgl ){
        renderer = new THREE.WebGLRenderer({
            antialias : true, // true for smoother output
            preserveDrawingBuffer : true // true to allow screenshot
        });
        //renderer.setClearColorHex( 0xBBBBBB, 1 );
        //renderer.setClearColor(new THREE.Color(0xffffff, 1.0));
    }//if
    else renderer = new THREE.CanvasRenderer(); //fallback
    
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.getElementById('container_renderer').appendChild(renderer.domElement);
    //addThreejsStats(); //not needed ATM

    // create a scene
    scene = new THREE.Scene();

    // put a camera in the scene
    camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 1, 100000 );
    camera.position.set(0, 150, 150);
    scene.add(camera);

    // create a camera contol
    //cameraControls = new THREEx.DragPanControls(camera);
    cameraControls = new THREE.OrbitControls( camera, renderer.domElement );

    // transparently support window resize
    THREEx.WindowResize.bind(renderer, camera);
    // allow 'p' to make screenshot
    // THREEx.Screenshot.bindKey(renderer);
    // allow 'f' to go fullscreen where this feature is supported
    if( THREEx.FullScreen.available() ){
        THREEx.FullScreen.bindKey();		
        document.getElementById('bottommsg').innerHTML	+= "hit <i>f</i> for fullscreen";
    }//if fullscreen available

    // texture loader
    const textureLoader = new THREE.TextureLoader()
    const bakedTexture = textureLoader.load("/models/baked.png");
    bakedTexture.flipY = false;
    bakedTexture.encoding = THREE.sRGBEncoding;

    // materials
    const bakedMaterial = new THREE.MeshBasicMaterial({ map: bakedTexture }); //previously baked material

    // lights
    const light = new THREE.AmbientLight( 0x808080); // soft white light
    scene.add( light );
    const directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
    scene.add( directionalLight );
    const directionalLight2 = new THREE.DirectionalLight( 0xffffff);
    directionalLight2.position.set( 5 , 5, 0 );
    directionalLight2.target.position.set( 0, 0 ,0 );			
    scene.add( directionalLight2 );

    const loader = new THREE.GLTFLoader(); // create a loader

    // Optional: Provide a DRACOLoader instance to decode compressed mesh data
    // see: https://github.com/mrdoob/three.js/tree/master/examples/js/libs/draco 
    // const dracoLoader = new THREE.DRACOLoader();
    // dracoLoader.setDecoderPath('/vendor/draco/'); // eg ( '/examples/js/libs/draco/' );
    // loader.setDRACOLoader( dracoLoader );
    // Load a glTF resource
    loader.load(
        "/models/test1b.glb",
        function ( gltf ) {
            //console.log(gltf.scene);
            const bakedMesh = gltf.scene.children.find(child => child.name === 'baked_ground');
            bakedMesh.material = bakedMaterial;
            bakedMesh.material.flatShading = false;
            bakedMesh.material.side = THREE.FrontSide; //side-rendering {FrontSide|BackSide|DoubleSide}
            bakedMesh.material.needsUpdate = true;

            for(c of gltf.scene.children){
                if(c.name.toLowerCase().indexOf("highrise")==-1) continue; //find the element
                //c.material = new THREE.MeshToonMaterial({color:0xff4444});
                var outlineMaterial1 = new THREE.MeshBasicMaterial({ //emulate a toon mesh
                    color: 0x000000,
                    side: THREE.BackSide,
                    //transparent: true,
                });
                var outlineMesh1 = new THREE.Mesh( c.geometry, outlineMaterial1 );
                outlineMesh1.scale.set(.101,.101,.101);
                outlineMesh1.rotation.x = 1.571;
                outlineMesh1.position.set(-39.0, 0, -19.63);
                //outlineMesh1.rotation = c.rotation;
                //outlineMesh1.scale.multiplyScalar(1.05);
                scene.add( outlineMesh1 );
            }//for
            gltf.scene.scale.set(.1,.1,.1);
            scene.add(gltf.scene); 
        },
        function ( xhr ) {
            console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded main scene' );
        },
        function ( error ) {
            console.log( 'An error happened loading the Blender scene!' );
        }
    );//load
    
    loader.load(
        "/models/1227 Earth.gltf", 
        function ( gltf ) {
            //console.log(gltf.scene);
            gltf.scene.scale.set(.8,.8,.8); // scale here
            gltf.scene.position.set(-4,5.8,0);
            scene.add(gltf.scene);
            earthmodel = gltf.scene;
        },
        function ( xhr ) {
            console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded earth model' );
            setupFireflies();
            setupsprites();
        },
        function ( error ) {
            console.log( 'An error happened loading Earth model!' );
        }
    );//load

    var manager = new THREE.LoadingManager();
    manager.addHandler(/\.dds$/i, new THREE.DDSLoader());

    new THREE.MTLLoader(manager)
        .setPath('models/')
        .load('CUPIC_HOTAIRBALLOON.mtl', function (materials) {
            materials.preload();
            new THREE.OBJLoader(manager)
                .setMaterials(materials)
                .setPath('models/')
                .load('CUPIC_HOTAIRBALLOON.obj', function (object) {
                    object.name = "blimp group";
                    blimpmodel = object;
                    //object.position.x = 0; object.position.y = 50; object.position.z = 0;
                    var sf = 0.01; //0.0001
                    //object.scale.set(sf, sf,sf );

                    var textureLoader = new THREE.TextureLoader();
                    texture = textureLoader.load("models/balloonSurface_Color.png");
                    blimpmodel.traverse(function (child) {
                        //if ( child.isMesh ) child.material.map = texture;
                        if (child.isMesh){
                            child.material = new THREE.MeshPhongMaterial({
                                //color:     0x996633,
                                //specular:  0x050505,
                                //shininess: my_shine_value,
                                map: texture,
                                //side:      THREE.DoubleSide
                            });
                            child.scale.set(sf, sf, sf);
                            //child.position.set(50,100,50);
                        }//if mesh
                    });
                    blimpmodel.position.set(50,50,50);
                    scene.add(blimpmodel);
                }, 
                function(xhr){ //on progess fcn
                    if (xhr.lengthComputable) {
                        var percentComplete = xhr.loaded / xhr.total * 100;
                        console.log(Math.round(percentComplete, 2) + '% loaded balloon model');
                    }
                },
                function(){ //on error fcn
                    console.log('An error happenend loading the balloon model!')
                }
                );//load
        });//load

    const bplane = new THREE.Mesh( //bottom plane
        new THREE.PlaneGeometry(120, 99),
        new THREE.MeshBasicMaterial({ color: 0x555555, side: THREE.DoubleSide })
    );
    bplane.rotation.set(Math.PI/2, 0, 0); bplane.position.set(0,-7,0);
    scene.add(bplane);
}//init

// setup geometry and positions
function setupFireflies(){
    firefliesGeometry = new THREE.BufferGeometry(); //use buffer geometry for the dots
    firefliesCount = 250;
    firefliesPositionArray = new Float32Array(firefliesCount * 3);
    firefliesScaleArray = new Float32Array(firefliesCount);

    for(let i = 0; i < firefliesCount; i++){
        firefliesPositionArray[i * 3 + 0] = (Math.random() - 0.5) * 100;
        firefliesPositionArray[i * 3 + 1] = Math.random() * 100;
        firefliesPositionArray[i * 3 + 2] = (Math.random() - 0.5) * 100; 
        firefliesScaleArray[i] = Math.random()*10;
    }//for

    firefliesGeometry.setAttribute('position', new THREE.BufferAttribute(firefliesPositionArray, 3));
    firefliesGeometry.setAttribute('aScale', new THREE.BufferAttribute(firefliesScaleArray, 1));

    // Material
    firefliesMaterial = new THREE.ShaderMaterial({
        uniforms:{
            uTime: { value: 0 },
            uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
            uSize: { value: 200 }
        },
        vertexShader: document.getElementById( 'vertexShader' ).textContent,
        fragmentShader: document.getElementById( 'fragmentShader' ).textContent,
        transparent: false, //set false for render ordering always behind other objs so more limited views
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });
    fireflies = new THREE.Points(firefliesGeometry, firefliesMaterial); //the points
    scene.add(fireflies);
    firefliesSetupFlag = true;
}

//init the text
function setupsprites(){
    for(var i=0;i<spritesCount;i++){
        if(Math.random()<0.5) var prefix = "git "; else prefix = "";
        var threesprite = new SpriteText(
            prefix+git_cmds_list[Math.floor(Math.random() * git_cmds_list.length)], //text
            3.5, //height
            "#ffffff" //color
            );
            threesprite.fontFace = 'arial';
            threesprite.borderWidth = 0; //the square bounding border
            threesprite.strokeWidth = 2.8; //width proportional to text size
            threesprite.strokeColor = "#000000";
            threesprite.material.transparent = true;
            threesprite.material.opacity = 1.0; 
            threesprite.material.needsUpdate = true; 
            sprites.push({sprite:threesprite});
    }//for
    for (elt of sprites){
        elt.sprite.position.set(
            (Math.random() - 0.5) * 20, //x
            getrandint(spriteStartHeight, spriteEndHeight), //y height
            (Math.random() - 0.5) * 20 //z
        );
        elt.sprite.material.rotation = getrandrange(-Math.PI/16, Math.PI/16);
        elt.upspeed = getrandint(75,130)/1000; //rand interval
        //sprite.scale.set(10,10,10);
        scene.add(elt.sprite);
    }//for
}

//animation loop
function animate() {
    // loop on request animation loop (it has to be at the begining of the function)
    requestAnimationFrame( animate );
    render(); // render
    if(stats) stats.update(); // update stats pane if nec.
    const elapsedTime = clock.getElapsedTime();
    if (firefliesSetupFlag==true){ //update shader material info
        firefliesMaterial.uniforms.uTime.value = elapsedTime;
    }//if
    if(earthmodel){ //update earth
        earthmodel.rotation.y -= 0.005;
    }//if
    if(blimpmodel){ //update blimp/balloon
        var orbit_radius = 65;
        blimpmodel.position.set(
            orbit_radius*Math.cos(-1*elapsedTime/4),
            50, //height above ground
            orbit_radius*Math.sin(-1*elapsedTime/4)
        );
        blimpmodel.rotation.set(null, elapsedTime%360, null);
    }//if
    for(elt of sprites){
        if(elt.sprite.position.y>spriteEndHeight){
            elt.sprite.position.y = spriteStartHeight;
            elt.sprite.material.opacity = 1.0;
            elt.sprite.material.needsUpdate = true;
        }//if
        else elt.sprite.position.y += elt.upspeed; // 0.1 ;
        var spriterelativeheight = spriteEndHeight - elt.sprite.position.y;
        var spritespantotal = spriteEndHeight - spriteStartHeight;
        if( spriterelativeheight/spritespantotal < .95){
            var val = spriterelativeheight/spritespantotal;
            elt.sprite.material.opacity = val; //(0,1)
            elt.sprite.material.needsUpdate = true;
        }//if
    }//for
}

// render the scene and other updates
function render() {
    cameraControls.update(); //update camera controls
    renderer.render( scene, camera ); //render the scene
}

// open the popup on load
document.getElementById('btn_info').click();