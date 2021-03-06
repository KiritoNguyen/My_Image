var canvas = document.getElementById("renderCanvas"); 
var engine = new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true });

engine.loadingUIText = "LOADING ...";

var camera;
var particleSystem;                             // biến quản lý hiệu ứng tuyết rơi
var timeMobile, intervalTimeMobile;             // biến quản lý thời gian khi sử dụng chế độ điện thoại và vòng lặp biến thời gian
var connect = false;                            // flag kiểm tra trạng thái write và load của feature path record
var timeChangeColorRoute = 500;                 // Biến quản lý thời gian thay đổi màu của route
var fillColorRoute = "green";                   // Màu vòng tròn trong của một node trong route
var strokeColorRoute = "yellow";                // Màu vòng tròn ngoài của một node trong route
var colorBegin = "aqua";                        // Màu node đầu tiên trong route
var colorEnd = "red";                           // Màu node cuối cùng trong route

// Hàm tạo lable info cho Route
var createlabelInformation = function(x,y,z,content) {

    var locInfo = new BABYLON.Mesh.CreateBox("locInfo", 0, scene);    // Tạo box ảo để neo Marker
    locInfo.visibility = 0;
    locInfo.position= new BABYLON.Vector3(x,y,z);

    var advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");      // Khởi tạo màn hình chứa button
    var lbInfo = BABYLON.GUI.Button.CreateSimpleButton("lb", content);   
    advancedTexture.addControl(lbInfo);                       
    lbInfo.width = "100px";
    lbInfo.height = "50px";
    lbInfo.color = "white";
    lbInfo.fontSize=15;
    lbInfo.linkWithMesh(locInfo);   
    lbInfo.linkOffsetY =-50;
    lbInfo.background="Red";
    lbInfo.isEnabled=false;
    
    var lineInfo = new BABYLON.GUI.Line();   // Khởi tạo liên kết giữa box ảo và button
    lineInfo.lineWidth = 2;
    lineInfo.color = "Red";
    lineInfo.y2 = 20;
    lineInfo.linkOffsetY = -10;
    advancedTexture.addControl(lineInfo);
    lineInfo.linkWithMesh(locInfo); 
    lineInfo.connectedControl = lbInfo;
}

// Hàm tạo button close của chế độ xem hình 360 độ
var createBtnClose = function(advancedTexture) {
    var button = BABYLON.GUI.Button.CreateSimpleButton("but", "X");                         // Khởi tạo button close
    button.width = "40px";
    button.height ="40px";
    button.top = 10;
    button.left = -10;
    button.color = "white";
    button.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    button.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
    button.background = "green";
    advancedTexture.addControl(button);                                                     // Thêm button vào màn hình
    button.onPointerClickObservable.add(function(){                                         // Sự kiện quay về màn hình map 3D
        advancedTexture.dispose();
        sceneMap = createScene();
        engine.stopRenderLoop();
        engine.runRenderLoop(function () {               
            sceneMap.render();
        })
    })
}
var createBtnSwitchScene=function(sceneLeft, sceneRight, advancedTexture){
    var btnLeft = BABYLON.GUI.Button.CreateImageOnlyButton("btnSwitchLeft", "https://raw.githubusercontent.com/KiritoNguyen/My_Image/master/MyImage/Phi/130856.png");
    btnLeft.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    btnLeft.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
    btnLeft.left = 100;
    btnLeft.width = "100px";
    btnLeft.height ="100px";
    btnLeft.color = "transparent";

    var btnRight = BABYLON.GUI.Button.CreateImageOnlyButton("btnSwitchRight", "https://raw.githubusercontent.com/KiritoNguyen/My_Image/master/MyImage/Map3D/assets/images/arrow_right.png");
    btnRight.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
    btnRight.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
    btnRight.left =- 100;  
    btnRight.width = "100px";
    btnRight.height ="100px";
    btnRight.color = "transparent";

    advancedTexture.addControl(btnRight);             
    advancedTexture.addControl(btnLeft);            

    btnLeft.onPointerClickObservable.add(function(){
        advancedTexture.dispose();
        engine.stopRenderLoop();
        engine.runRenderLoop(function () {               
            sceneLeft.render();
        })     
    })

    btnRight.onPointerClickObservable.add(function(){
        advancedTexture.dispose();
        engine.stopRenderLoop();
        engine.runRenderLoop(function () {               
            sceneRight.render();
        })     
    })
}

// Hàm tạo scene map 3D
var createScene = function() {
    scene = new BABYLON.Scene(engine);
    scene.collisionsEnabled = true;

    ///////////////// LIGHT //////////////////
    var light = new BABYLON.PointLight("light", new BABYLON.Vector3(-5000, 6000, -16000), scene);
    light.intensity = 2;
    var hemisphericlight = new BABYLON.HemisphericLight("hemisphericlight", new BABYLON.Vector3(-5000, 6000, -16000), scene);
    hemisphericlight.intensity = 0.01;

    /////////////// CAMERA ///////////////
    camera = new BABYLON.UniversalCamera("", new BABYLON.Vector3(0, 100, -500), scene)
    camera.setTarget(new BABYLON.Vector3(-700, 30, 0)); 
    camera.speed = 20;
    camera.checkCollisions = true;
    camera.attachControl(canvas, true);
    document.getElementById('cameraChange').innerHTML = "Free Camera";
    // camera = new BABYLON.ArcRotateCamera("arcRotateCamera", -Math.PI,  -Math.PI/2, 3200, BABYLON.Vector3.Zero(), scene);
    // camera.target = new BABYLON.Vector3.Zero();
    // camera.wheelPrecision = 1;
    // camera.lowerRadiusLimit = 200;
    // camera.upperRadiusLimit = 4000;      
    // camera.upperBetaLimit = Math.PI / 3;
    // camera.attachControl(canvas, true); 
    
    /////////////// LENS FLARE EFFECT ///////////////
    var lightSphere0 = BABYLON.Mesh.CreateSphere("Sphere0", 16, 0.5, scene);
        
    lightSphere0.material = new BABYLON.StandardMaterial("white", scene);
    lightSphere0.material.diffuseColor = new BABYLON.Color3(0, 0, 0);
    lightSphere0.material.specularColor = new BABYLON.Color3(0, 0, 0);
    lightSphere0.material.emissiveColor = new BABYLON.Color3(1, 1, 1);

    lightSphere0.position = light.position;
    
    var lensFlareSystem = new BABYLON.LensFlareSystem("lensFlareSystem", light, scene);
    var flare00 = new BABYLON.LensFlare(0.2, 0, new BABYLON.Color3(1, 1, 1), "https://raw.githubusercontent.com/BabylonJS/Babylon.js/master/Playground/textures/Flare2.png", lensFlareSystem);
    var flare01 = new BABYLON.LensFlare(0.5, 0.2, new BABYLON.Color3(0.5, 0.5, 1), "https://raw.githubusercontent.com/BabylonJS/Babylon.js/master/Playground/textures/flare3.png", lensFlareSystem);
    var flare02 = new BABYLON.LensFlare(0.2, 1.0, new BABYLON.Color3(1, 1, 1), "https://raw.githubusercontent.com/BabylonJS/Babylon.js/master/Playground/textures/flare3.png", lensFlareSystem);
    var flare03 = new BABYLON.LensFlare(0.4, 0.4, new BABYLON.Color3(1, 0.5, 1), "https://raw.githubusercontent.com/BabylonJS/Babylon.js/master/Playground/textures/flare.png", lensFlareSystem);
    var flare04 = new BABYLON.LensFlare(0.1, 0.6, new BABYLON.Color3(1, 1, 1), "https://raw.githubusercontent.com/BabylonJS/Babylon.js/master/Playground/textures/Flare2.png", lensFlareSystem);
    var flare05 = new BABYLON.LensFlare(0.3, 0.8, new BABYLON.Color3(1, 1, 1), "https://raw.githubusercontent.com/BabylonJS/Babylon.js/master/Playground/textures/flare3.png", lensFlareSystem);

    /////////////////SKY BOX/////////////////
    var skybox = BABYLON.MeshBuilder.CreateBox("skyBox", {size: 12000}, scene);
    var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
    skyboxMaterial.backFaceCulling = false;
    skybox.infiniteDistance = true;
    skyboxMaterial.disableLighting = true;
    skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("https://raw.githubusercontent.com/BabylonJS/Website/master/Assets/skybox/TropicalSunnyDay", scene);
    skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
    skybox.material = skyboxMaterial;			

    //////////////////// EfFECT SNOW DROP ///////////////////////
    // Create Invisible box use for drop particle
    var fountain = new BABYLON.Mesh.CreateBox('fountain', 100, scene);
    fountain.position = new BABYLON.Vector3(0, 1200, 0);
    fountain.visibility = 0;

    // Create a particle system
    var particleSystem = new BABYLON.GPUParticleSystem("particles", { capacity: 5000 }, scene);

    //Texture of each particle
    particleSystem.particleTexture = new BABYLON.Texture("https://raw.githubusercontent.com/KiritoNguyen/My_Image/master/MyImage/Phi/starburst_white_300_drop_2.png", scene);           

    // Where the particles come from
    particleSystem.emitter = fountain; // the starting object, the emitter
    particleSystem.minEmitBox = new BABYLON.Vector3(-2000, 20, -2000); // Starting all from
    particleSystem.maxEmitBox = new BABYLON.Vector3(2000, 20, 2000); // To...

    // Colors of all particles
    particleSystem.color1 = new BABYLON.Color4(1, 1, 1.0, 1.0);
    particleSystem.color2 = new BABYLON.Color4(1, 1, 1.0, 1.0);
    particleSystem.colorDead = new BABYLON.Color4(1, 1, 1, 0.0);

    // Size of each particle (random between...
    particleSystem.minSize = 5;
    particleSystem.maxSize = 15;

    // Life time of each particle (random between...
    particleSystem.minLifeTime = 1;
    particleSystem.maxLifeTime = 7;

    // Emission rate
    particleSystem.emitRate = 1000;

    // Blend mode : BLENDMODE_ONEONE, or BLENDMODE_STANDARD
    particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_STANDARD;
    
    // Set the gravity of all particles
    particleSystem.gravity = new BABYLON.Vector3(0, 9.81, 0);                

    // Direction of each particle after it has been emitted
    particleSystem.direction1 = new BABYLON.Vector3(-7, -120, 3);
    particleSystem.direction2 = new BABYLON.Vector3(7, -120, -3);

    // Angular speed, in radians
    particleSystem.minAngularSpeed = 0;
    particleSystem.maxAngularSpeed = Math.PI;

    // Speed
    particleSystem.minEmitPower = 1;
    particleSystem.maxEmitPower = 3;
    particleSystem.updateSpeed = 0.005;    
    
    // Start the particle system
    // particleSystem.start();
    
    ///////////////// INVISIBLE WALL ///////////////// => Tường ảo để chặn camera ra khỏi map
    var inviWallTop = new BABYLON.MeshBuilder.CreatePlane('inviWallTop', {size: 4000}, scene);
    var inviWallFront = new BABYLON.MeshBuilder.CreatePlane('inviWallFront', {height: 5000, width: 4000}, scene);
    var inviWallBack = new BABYLON.MeshBuilder.CreatePlane('inviWallBack', {height: 5000, width: 4000}, scene);
    var inviWallLeft = new BABYLON.MeshBuilder.CreatePlane('inviWallLeft', {height: 5000, width: 4000}, scene);
    var inviWallRight = new BABYLON.MeshBuilder.CreatePlane('inviWallRight', {height: 5000, width: 4000}, scene);

    inviWallTop.visibility = 0;
    inviWallFront.visibility = 0;
    inviWallBack.visibility = 0;
    inviWallLeft.visibility = 0;
    inviWallRight.visibility = 0;

    inviWallTop.checkCollisions = true;
    inviWallFront.checkCollisions = true;
    inviWallBack.checkCollisions = true;
    inviWallLeft.checkCollisions = true;
    inviWallRight.checkCollisions = true;

    inviWallTop.position = new BABYLON.Vector3(0, 4000, 0);
    inviWallFront.position = new BABYLON.Vector3(0, 1500, -2000);
    inviWallBack.position = new BABYLON.Vector3(0, 1500, 2000);
    inviWallLeft.position = new BABYLON.Vector3(-2000, 1500, 0);
    inviWallRight.position = new BABYLON.Vector3(2000, 1500, 0);

    inviWallTop.rotation.x = -Math.PI / 2;
    inviWallLeft.rotation.y = -Math.PI / 2;
    inviWallRight.rotation.y = Math.PI / 2; 
    inviWallFront.rotation.y = Math.PI;

    ///////////////// GROUND TO DRAW ///////////////// => Ground để vẽ route
    var groundTexture = new BABYLON.DynamicTexture("dynamic texture", 512, scene, true);    

    var dynamicMaterial = new BABYLON.StandardMaterial('mat', scene);                      
    dynamicMaterial.diffuseTexture = groundTexture;

    var groundDraw = BABYLON.Mesh.CreateGround("groundDraw", 3900, 3900, 2, scene);         
    groundDraw.position.y = -45;
    dynamicMaterial.diffuseTexture.hasAlpha = true;
    groundDraw.material = dynamicMaterial;

    ///////////////// GROUND VISIBLE ///////////////// => Ground hiện thị mặt đất, ground sẽ thay đổi texture từ cỏ sang tuyết và ngược lại mỗi 10s
    var ground = BABYLON.Mesh.CreateGround("groundVisible", 14000, 14000, 2, scene);
    ground.position.y = -55;
    ground.checkCollisions = true;
    ground.visibility = 1
    ground.material = new BABYLON.StandardMaterial('groundMaterial', scene);
    // ground tuyết
    ground.material.diffuseTexture = new BABYLON.Texture('https://raw.githubusercontent.com/KiritoNguyen/My_Image/master/MyImage/Kiet/snow_texture.jpg', scene);
    // ground cỏ
    ground.material.diffuseTexture = new BABYLON.Texture('https://raw.githubusercontent.com/KiritoNguyen/My_Image/d49dbff4cf5e1f3454dddc049942da5d3378ac6b/MyImage/testMini/06feee7a09df2f669e6f71a3d4f9ee2b.jpg', scene);        
    ground.material.backFaceCulling = false;

    // Tính toán thời gian thay đổi texture của ground
    setInterval(() => {
        particleSystem.stop();  
        setTimeout(() => {
            ground.material.diffuseTexture = new BABYLON.Texture('https://raw.githubusercontent.com/KiritoNguyen/My_Image/d49dbff4cf5e1f3454dddc049942da5d3378ac6b/MyImage/testMini/06feee7a09df2f669e6f71a3d4f9ee2b.jpg', scene);
        }, 5000)                    
    }, 10000);

    setInterval(() => {
        // particleSystem.start();  
        setTimeout(() => {
            ground.material.diffuseTexture = new BABYLON.Texture('https://raw.githubusercontent.com/KiritoNguyen/My_Image/master/MyImage/Kiet/snow_texture.jpg', scene);                    
        }, 5000)                       
    }, 20000);

    ////// Lists of Data //////
    var PointData=[];
    var PosLocation=[];
    
    ///////////// Position of Location /////////////
    var loadLocation = () => {
        var newPosition=[];   
        jQuery.getJSON('https://api.myjson.com/bins/fjtcm', (obj) =>{
            {
                for (var i = 0; i < obj.length; i++) {
                    var counter = obj[i].position[0];
                    var pos=new Point3(counter.x,counter.y,counter.z);
                    newPosition.push(pos);
                }
            }
            var i=0;
            newPosition.forEach(p=>{
                PosLocation[i]=new Point3(p.x,p.y,p.z);
                i++;
            })  
        })
        
    }
    loadLocation(); // Gán vị trí các Marker vào mảng PosLocation
    
    var locStadium = new BABYLON.Mesh.CreateBox("locStadium", 0, scene);    // Tạo box ảo để neo Marker
    locStadium.visibility = 0;

    var locParking = new BABYLON.Mesh.CreateBox("locParking", 0, scene);
    locParking.visibility = 0;

    var locNationalLeague = new BABYLON.Mesh.CreateBox("locNationalLeague", 0, scene);
    locNationalLeague.visibility = 0;
    
    var locKippaxLake = new BABYLON.Mesh.CreateBox("locKippaxLake", 0, scene);
    locKippaxLake.visibility = 0;

    var locStadiumSportsPhysiotherapy = new BABYLON.Mesh.CreateBox("locStadiumSportsPhysiotherapy", 0, scene);
    locStadiumSportsPhysiotherapy.visibility = 0;

    var locGateACricket = new BABYLON.Mesh.CreateBox("locGateACricket", 0, scene);
    locGateACricket.visibility = 0;

    var locSydneyCricketGround = new BABYLON.Mesh.CreateBox("locSydneyCricketGround", 0, scene);
    locSydneyCricketGround.visibility = 0;

    var locStadiumForecourt = new BABYLON.Mesh.CreateBox("locStadiumForecourt", 0, scene);
    locStadiumForecourt.visibility = 0;

    // Gán vị trí cho các box ảo (settimeout để đảm load Location hoàn tất, tránh việc chưa hoàn tất việc đọc file json từ server)
    setTimeout(function(){
        locStadium.position= new BABYLON.Vector3(PosLocation[0].x, PosLocation[0].z, PosLocation[0].y);
        locParking.position= new BABYLON.Vector3(PosLocation[1].x, PosLocation[1].z, PosLocation[1].y);
        locNationalLeague.position= new BABYLON.Vector3(PosLocation[2].x, PosLocation[2].z, PosLocation[2].y);
        locKippaxLake.position= new BABYLON.Vector3(PosLocation[3].x, PosLocation[3].z, PosLocation[3].y);
        locStadiumSportsPhysiotherapy.position= new BABYLON.Vector3(PosLocation[4].x, PosLocation[4].z, PosLocation[4].y);
        locGateACricket.position= new BABYLON.Vector3(PosLocation[5].x, PosLocation[5].z, PosLocation[5].y);
        locSydneyCricketGround.position= new BABYLON.Vector3(PosLocation[6].x, PosLocation[6].z, PosLocation[6].y);
        locStadiumForecourt.position= new BABYLON.Vector3(PosLocation[7].x, PosLocation[7].z, PosLocation[7].y);
        createlabelInformation(1350,-50,-300,"New Meeting");
    }, 5000);

    // Đặt các thuộc tính cho việc vẽ Route
    var invertY = true;
    var context = groundTexture._context;
    var size = groundTexture.getSize();
    groundTexture.update(invertY);

    var draw = false;   // Flag kiểm tra trạng thái có được phép vẽ hay không
    var preMove=new BABYLON.Vector2(0,0);   // Khai báo biến preMove

    // Sự kiện ấn chuột => bật biến Draw
    var onPointerDown = function (evt) {
        draw = true;
        preMove.x = scene.pointerX;
        preMove.y = scene.pointerY;
    };

    // Sự kiện thả chuột => tắt biến Draw
    var onPointerUp = function (evt) {
        draw = false;
    };

    // Sự kiện di chuyển chuột
    var onPointerMove = function (evt) {
        var d = Math.sqrt((scene.pointerX-preMove.x)*(scene.pointerX-preMove.x)+(scene.pointerY-preMove.y)*(scene.pointerY-preMove.y)); // Tính khoảng cách giữa tọa độ chuột cũ và tọa độ hiện tại
        if (draw && DrawMode && Math.floor(d)>15 && Math.floor(d)<25) { // Kiểm tra flag draw và giới hạn khoảng cách giữa tọa độ chuột và tọa độ chuột hiện tại (vị trí cũ và mới không được quá xa và quá gần)
            var pickResult = scene.pick(scene.pointerX, scene.pointerY);	
            var texcoords = pickResult.getTextureCoordinates();

            var centerX = texcoords.x * size.width;
            var centerY = size.height - texcoords.y * size.height;
            var radius = 3;

            // draw circle
            context.beginPath();
            context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
            var point = new Point(pickResult.pickedPoint.x, pickResult.pickedPoint.z);
            PointData.push(point);
            context.fillStyle = 'green';
            context.fill();
            context.lineWidth = 2;
            context.strokeStyle = '#00EE00';
            context.stroke();
            preMove.x=scene.pointerX;
            preMove.y=scene.pointerY;
            groundTexture.update(invertY);
        }
    };

    // Add các sự kiện chuột vào canvas
    canvas.addEventListener("pointerdown", onPointerDown, false);
    canvas.addEventListener("pointerup", onPointerUp, false);
    canvas.addEventListener("pointermove", onPointerMove, false);
    
    scene.onDispose = function () {
        canvas.removeEventListener("pointerdown", onPointerDown);
        canvas.removeEventListener("pointerup", onPointerUp);
        canvas.removeEventListener("pointermove", onPointerMove);
    };
    

    //////////////// STADIUM MODEL ////////////////// => Load model của stadium
    var assetsManager = new BABYLON.AssetsManager(scene);
    // var meshTask = assetsManager.addMeshTask("stadium", "", "https://raw.githubusercontent.com/KiritoNguyen/My_Image/master/MyImage/stadiumModel/stadium.babylon"); 
    var meshTask = assetsManager.addMeshTask("stadium", "", "https://raw.githubusercontent.com/KiritoNguyen/My_Image/master/MyImage/newModel/full/full.babylon");
    meshTask.onSuccess = function (task) {
        m = task.loadedMeshes;
        m[0].position = new BABYLON.Vector3(-1100, -45, -300);
        m[0].scaling = new BABYLON.Vector3(0.004, 0.004, 0.004); // Nếu model quá to thì có thể chỉnh lại thông số vector để scale model cho phù hợp
        BABYLON.OBJFileLoader.OPTIMIZE_WITH_UV = true;

        for(var i = 0; i < m.length; i++) { // Search ground Texture dựa vào danh sách name và id của từng model
            ///////////////////GROUND TEXTURE/////////////// 
            // if (m[i].name == 'Mesh01') {             
            //     m[i].position.y = -1300;
            // } 
            m[i].checkCollisions = true;
        }
    }	
     
    assetsManager.useDefaultLoadingScreen = false;
    assetsManager.load();

    //////////////// OPTIMIZE SCENE //////////////////
    var options = new BABYLON.SceneOptimizerOptions(30, 500);
    options.addOptimization(new BABYLON.HardwareScalingOptimization(0, 2.5));
    var optimizer = new BABYLON.SceneOptimizer(scene, options);
    
    //////////////// HUD //////////////////    
    var advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

    var txtFps = new BABYLON.GUI.TextBlock();   // Hiển thị FPS
    txtFps.height = "40px";
    txtFps.color = "red";
    txtFps.fontSize = 16;
    txtFps.top = 10;
    txtFps.left = 10;
    txtFps.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    txtFps.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    advancedTexture.addControl(txtFps);

    var txtTimeMobile = new BABYLON.GUI.TextBlock();    // Hiển thị thời gian chế độ mobile còn lại
    txtTimeMobile.height = "40px";
    txtTimeMobile.color = "red";
    txtTimeMobile.fontSize = 16;
    txtTimeMobile.top = 40;
    txtTimeMobile.left = 10;
    txtTimeMobile.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    txtTimeMobile.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    advancedTexture.addControl(txtTimeMobile);

    var txtOptimize = new BABYLON.GUI.TextBlock();  // Hiển thị thông báo trạng thái optimize
    txtOptimize.height = "40px";
    txtOptimize.color = "red";
    txtOptimize.fontSize = 24;
    txtOptimize.top = 1;
    txtOptimize.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    advancedTexture.addControl(txtOptimize);  

    var notificationText=new BABYLON.GUI.TextBlock();   // Hiển thị các thông báo
    notificationText.height = "40px";
    notificationText.color = "red";
    notificationText.fontSize = 24;
    notificationText.top = 1;
    notificationText.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    notificationText.horizontalAlignment=BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    advancedTexture.addControl(notificationText);  

    ///////////////////////////// BUTTON CHANGE CAMERA /////////////////////////
    var cameraFreeFunction = function() {
        camera.dispose();
        camera = new BABYLON.UniversalCamera("", new BABYLON.Vector3(0, 100, -500), scene)
        camera.setTarget(new BABYLON.Vector3(-700, 30, 0)); 
        camera.speed = 20;
        camera.checkCollisions = true;
        camera.attachControl(canvas, true);
        document.getElementById("cameraChange").onclick = cameraRotateFunction;
        document.getElementById('cameraChange').innerHTML = "Free Camera";
    }
    var cameraRotateFunction = function() {
        camera.dispose();
        camera = new BABYLON.ArcRotateCamera("arcRotateCamera", -Math.PI, -Math.PI/2, 3200, BABYLON.Vector3.Zero(), scene);
        camera.target = new BABYLON.Vector3.Zero();
        camera.wheelPrecision = 1;
        camera.lowerRadiusLimit = 200;
        camera.upperRadiusLimit = 3600;      
        camera.upperBetaLimit = Math.PI / 3;
        camera.attachControl(canvas, true);      
        document.getElementById("cameraChange").onclick = cameraFreeFunction;       
        document.getElementById('cameraChange').innerHTML = "Arc Rotate Camera";
    }
    document.getElementById("cameraChange").onclick = cameraRotateFunction;   

    /////////////////////////////////BUTTON MOBILE CONTROL//////////////////////////////// => Kích hoạt chế độ sử dụng mobile để di chuyển camera
    var mobileControlFunction = function() {
        do {
            timeMobile = parseInt(window.prompt('Enter time out for mobile control (10 seconds < time < 60 seconds): ', '20'));
        } while(isNaN(timeMobile) || timeMobile > 60 || timeMobile < 10);

        camera.dispose();
        camera = new BABYLON.VirtualJoysticksCamera("VJC", new BABYLON.Vector3(0, 100, -500), scene);
        camera.inertia = 0;
        camera.speed = 20;
        camera.checkCollisions = true;
        camera.inputs.attached.virtualJoystick.camera.inertia = 0; 

        scene.activeCamera = camera;
        scene.activeCamera.attachControl(canvas);

        setTimeout(() => {
            camera.inputs.attached.virtualJoystick.detachControl();
            var currentPos=new BABYLON.Vector3(camera.position.x,camera.position.y,camera.position.z);
            var dir=new BABYLON.Vector3(camera.rotation.x, camera.rotation.y,camera.rotation.z);
            camera.dispose();
            camera = new BABYLON.UniversalCamera("", currentPos, scene);
            camera.rotation = dir;
            camera.speed = 20;
            camera.checkCollisions = true;
            camera.attachControl(canvas, true); 
        }, parseInt(timeMobile) * 1000);
        
        intervalTimeMobile = setInterval(() => {
            timeMobile--;
        }, 1000);
    }
    document.getElementById("mobileControl").onclick = mobileControlFunction;

    ///////////Set Notification/////////////////    => Chức năng hiện thị thông báo
    var setNotification=function(text){
        notificationText.text=text;
    }

    /////////////////// BUTTON RECORD PATH ////////////////////////  => Chức năng ghi hình đường đi của camera
    var Record=false;
    var recordFunction = function() {
        RecordPointData=[];
        DirData=[];
        Record=true;
        camera.dispose();
        camera = new BABYLON.UniversalCamera("", new BABYLON.Vector3(0, 100, -500), scene);
        camera.setTarget(new BABYLON.Vector3(-700, 30, 0));
        camera.speed = 20;
        camera.checkCollisions = true;
        camera.attachControl(canvas, true); 
        document.getElementById('addRecord').innerHTML = 'Save Path';
        document.getElementById('addRecord').onclick = savePathFunction;
    }

    // Hàm kiểm tra tên của path mới (không được trùng với tên trong danh sách path đã có)
    var checkNamePath=function(newName){
        var count =0;
        NamePathData.forEach(n=>{
            if(n!=newName)
            {
                count++;
            }
        })
        if(count==NamePathData.length)
            return true;
        else
            return false;
    }

    // Hàm lưu path
    var savePathFunction = function() {
        Record=false;
        do{
            var nameOfPath = prompt("Please enter Path Record name:");      
        }while(nameOfPath===""||checkNamePath(nameOfPath)==false);
        if(nameOfPath!=null&&checkNamePath(nameOfPath)&&RecordPointData.length>=1) {
            writeRecordData(nameOfPath);
        } 
        
        document.getElementById('addRecord').innerHTML = 'Record';
        document.getElementById('addRecord').onclick = recordFunction;
    }
    document.getElementById('addRecord').onclick = recordFunction;
    
    // Tạo đối tượng Point 3 tham số
    function Point3(_x,_y,_z){
        this.x=_x;
        this.y=_y;
        this.z=_z;
    }

    var DirData=[];
    var RecordPointData=[];
    var NamePathData=[];

    /////////////LOAD RECORD DATA////////////// 
    var loadRecordData = () => {  //=> Đọc tất cả name của path từ file json từ server và lưu vào NamePathData[]
        connect=false;   
        var newNamePathData=[];
        jQuery.getJSON('https://api.myjson.com/bins/13o8p6', (obj) => {
            if(obj.length >= 1) {
                for (var i = 0; i < obj.length; i++) {
                    var name=obj[i].name;
                    newNamePathData.push(name);
                }
            }
            newNamePathData.forEach(n=>{
                NamePathData.push(n);
            })           
            var i = 0;
            document.getElementById('path').innerHTML="";
            var myDiv = document.getElementById('path');
            newNamePathData.forEach(p => {
                var option = document.createElement('option');
                option.textContent = newNamePathData[i];
                myDiv.add(option);
                i++;
            })
            connect=true;                       
        })
    }
    loadRecordData();
    var loadRecordDataByName = (nameOfPath) => { //=> Đọc dữ liệu của path theo name
        connect=false;
        var newPointData=[];  
        var newDirData=[];         
        jQuery.getJSON('https://api.myjson.com/bins/13o8p6', (obj) => {
            if(obj.length >= 1) {
                for (var i = 0; i < obj.length; i++) {
                    if(obj[i].name==nameOfPath){
                        for (var j = 0; j < obj[i].point.length; j++) {
                            var counter = obj[i].point[j];
                            var point=new Point3(counter.x,counter.y,counter.z);
                            newPointData.push(point);
                        }
                    }
                }
                for (var i = 0; i < obj.length; i++) {
                    if(obj[i].name==nameOfPath){
                        for (var j = 0; j < obj[i].direct.length; j++) {
                            var counter = obj[i].direct[j];
                            var dir=new Point3(counter.x,counter.y,counter.z);
                            newDirData.push(dir);
                        }
                    }
                }
            }
            RecordPointData=[];
            DirData=[];
            newPointData.forEach(p=>{
                RecordPointData.push(p);
            })
            newDirData.forEach(d=>{
                DirData.push(d);
            })             
            connect=true;
        })
        
    }

    /////////////WRITE RECORD DATA////////////// => Ghi Path vào file json của server
    var writeRecordData=(nameOfPath)=>{
        connect=false;
        var arrayData=[];
        setNotification("SAVING ...");
        jQuery.getJSON('https://api.myjson.com/bins/13o8p6', (obj) =>{
            for (var i = 0; i < obj.length; i++) {
                arrayData.push(obj[i]);
            }
            var newDataPoint=JSON.stringify(RecordPointData);
            var newDataDir=JSON.stringify(DirData);
            var id = 1;
            if(obj.length!=0){
                id=obj[obj.length-1].id+1;
            }
            
            var standardJson=`{"id": ${id},"name":"${nameOfPath}","point":${newDataPoint},"direct":${newDataDir}}`;
            standardJson=JSON.parse(standardJson);
            arrayData.push(standardJson);
            var updatedData=JSON.stringify(arrayData);
            // do update
            $.ajax({
                url: "https://api.myjson.com/bins/13o8p6", //JSON API
                type: "PUT",
                data: updatedData,
                contentType: "application/json; charset=utf-8",
                dataType: "json"
            });
            connect=true;
           
        });   
        var check=setInterval(function(){
            if(connect)
            {
                clearInterval(check);
                connect=false;
                loadRecordData();
                var check2=setInterval(function(){
                    if(connect){
                        clearInterval(check2);
                        setNotification("SAVED!");
                        setTimeout(function(){
                            setNotification("");
                        },1000);
                        connect=false;
                    }
                },200);
            }
        },200);
    }

    /////////////////////////////////BUTTON PLAY RECORD///////////////////////////////// => Chức năng chạy record với tên lấy từ list các Path
    var playRecordFunction = function() {
        if(Record==false){
            setNotification("LOADING ...");
            loadRecordDataByName(document.getElementById('path').value);    // Lấy dữ liệu của Path theo name lấy từ list
            var check=setInterval(function(){
                if(connect){
                    clearInterval(check);
                    setNotification("");
                    camera.dispose();
                    camera = new BABYLON.UniversalCamera("", new BABYLON.Vector3(0, 100, -500), scene)
                    camera.setTarget(new BABYLON.Vector3(-700, 30, 0)); 
                    document.getElementById('cameraChange').innerHTML = 'Free Camera';
                    camera.speed = 20;
                    camera.checkCollisions = true;
                    camera.attachControl(canvas, true);
                    var count=0;
                    var frameRate = 60;
                    var movein_keys = []; 
                    var dir_keys=[];
                    RecordPointData.forEach(p=>{
                        movein_keys.push({
                            frame: count*frameRate/10,
                            value: new BABYLON.Vector3(p.x, p.y, p.z)
                        });
                        count++;
                    })
                    count=0;
                    DirData.forEach(d => {
                        dir_keys.push({
                            frame: count*frameRate/10,
                            value: new BABYLON.Vector3(d.x,d.y,d.z)
                        });
                        count++;
                    })
                    
                    // Dùng Animation để chạy record
                    var movein = new BABYLON.Animation("movein", "position", frameRate, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, 
                    BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);

                    var dirin = new BABYLON.Animation("dirin", "rotation", frameRate, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, 
                    BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);

                    movein.setKeys(movein_keys);
                    dirin.setKeys(dir_keys);
                    scene.beginDirectAnimation(camera, [movein,dirin], 0, count * frameRate, false);
                    connect=false;
                }
            },100);
        }
    }
    document.getElementById('playRecord').onclick = playRecordFunction;

    /////////////////////////////////BUTTON DELETE PATH///////////////////////////////// => Xóa Path khỏi file json theo tên lấy từ list
    var deletePathFunction=()=>{
        connect=false;
        setNotification("DELETING ...");
        var arrayData=[];
        jQuery.getJSON('https://api.myjson.com/bins/13o8p6', (obj) =>{
            for (var i = 0; i < obj.length; i++) {
                if(obj[i].name!=document.getElementById('path').value)
                    arrayData.push(obj[i]);
            }
            var updatedData=JSON.stringify(arrayData);
            // do update
            $.ajax({
                url: "https://api.myjson.com/bins/13o8p6", //JSON API
                type: "PUT",
                data: updatedData,
                contentType: "application/json; charset=utf-8",
                dataType: "json"
            });
            arrayData=[];     
            connect=true;
        });   
        var check=setInterval(function(){
            if(connect)
            {
                clearInterval(check);
                connect=false;
                loadRecordData();
                var check2=setInterval(function(){
                    if(connect){
                        clearInterval(check2);
                        setNotification("DELETED!");
                        setTimeout(function(){
                            setNotification("");
                        },1000);
                        connect=false;
                    }
                },100);   
            }
        },100);
    }

    document.getElementById("deleteRecord").onclick = deletePathFunction;

    /////////////////////////////////BUTTON OPTIMIZE/////////////////////////////////////
    var optimizeFunction = function() {
        document.getElementById('optimize').hidden = true;
        optimizer.start();
    }
    document.getElementById("optimize").onclick = optimizeFunction;

    /////////////////////////////////BUTTON ADVANCED OPTION/////////////////////////////////////
    var advOptionFunction = function() {
        if (scene.debugLayer.isVisible()) {
            scene.debugLayer.hide();
        }
        else {
            scene.debugLayer.show();
        }
    }
    document.getElementById("advOption").onclick = advOptionFunction;

    /////////////////////////////////BUTTON DRAW ROUTE///////////////////////////////// => Xử lí sự kiện vẽ route cho button Draw Route
    var mesharray=[]; //Array lưu trữ arrow đã vẽ
    var DrawMode = false;   //Kiểm tra chế độ vẽ ,mặc định false (không vẽ)
    var drawFunction = function() { //Hàm xử lí Draw Route
        ClearArrow();
        DrawMode = true;    //Chế độ vẽ route bật
        camera.dispose();
        camera = new BABYLON.ArcRotateCamera("arcRotateCamera", -Math.PI, -Math.PI/2, 3600, BABYLON.Vector3.Zero(), scene);
        camera.target = new BABYLON.Vector3.Zero();
        document.getElementById("cameraChange").disabled = true;
        document.getElementById("addRoute").innerHTML = 'Save Route';   //addRoute là id của button Draw Route
        document.getElementById("addRoute").onclick = saveRouteFunction;
    }
    var saveRouteFunction = function() {    //Hàm xử lí cho Save Route
        DrawMode = false;   //Chế độ vẽ route tắt
        document.getElementById("cameraChange").disabled = false;
        camera.attachControl(canvas, true);
        do{     //Kiểm tra nhập tên trước khi save route
            var nameOfRoute = prompt("Please enter route name:");      
        }while(nameOfRoute==="" );
        if(nameOfRoute!=null) {
            writeRouteData(nameOfRoute);
        } 
        document.getElementById("addRoute").innerHTML = 'Draw';
        document.getElementById("addRoute").onclick = drawFunction;
    }
    var writeRouteData=(nameOfRoute)=>{         //Hàm ghi dữ liệu Route xuống JSON
        var id=1;   //Định nghĩa trường id cho mỗi route
        var arrayData=[];   //arrayData dùng lưu mảng route 
        var directionData=[] // dung de luu mang direction
        for (var i=1;i<PointData.length;i++){
            var directX=PointData[i].x-PointData[i-1].x;
            var directY=PointData[i].y-PointData[i-1].y;
            var direct=new Point(directX,directY);
            directionData.push(direct);
        }
 
        jQuery.getJSON('https://api.myjson.com/bins/vf6v4', (obj) =>{       //Sử dụng getJson để lấy dữ liệu từ file JSON
            for (var i = 0; i < obj.length; i++) {          
                arrayData.push(obj[i]); 
            }    
            if(obj.length!=0){
                id=obj[obj.length-1].id+1;
            }
            var newData=JSON.stringify(PointData);       
            var newDirection=JSON.stringify(directionData);     
            var standardJson=`{"id": ${id},"name":"${nameOfRoute}","location":${newData},"direction":${newDirection}}`;
            standardJson=JSON.parse(standardJson);
            arrayData.push(standardJson);
            var updatedData=JSON.stringify(arrayData);
            // do update
            $.ajax({
                url: "https://api.myjson.com/bins/vf6v4",
                type: "PUT",
                data: updatedData,
                contentType: "application/json; charset=utf-8",
                dataType: "json"
            });
            PointData=[];  
            function removeOptions(selectbox) {     //Xóa tất cả các item trong list Route
                for(i = selectbox.options.length - 1; i >= 0; i--) {
                    selectbox.remove(i);
                }
            }
            removeOptions(document.getElementById("route"));    
            setTimeout(() => {
                loadRouteData();  
            }, 3000);      //Load lại dữ liệu cho list Route sau khi remove 
            resetFuntion();
        });                             
    }
    document.getElementById("addRoute").onclick = drawFunction;
    
    function Point(_x,_y){
        this.x=_x;
        this.y=_y;
    }

    var resetFuntion=()=>{      // Delete drawed route
        groundTexture.dispose();    
        groundTexture = new BABYLON.DynamicTexture("dynamic texture", 512, scene, true);
        dynamicMaterial = new BABYLON.StandardMaterial('mat', scene);
        dynamicMaterial.diffuseTexture = groundTexture;
        context = groundTexture._context;
        size = groundTexture.getSize(); 
        groundDraw = BABYLON.Mesh.CreateGround("groundDraw", 3900, 3900, 2, scene);
        groundDraw.position.y = -45;
        dynamicMaterial.diffuseTexture.hasAlpha = true;
        groundDraw.material = dynamicMaterial;
    }

    var ClearArrow=()=>{ //Delete displayed arrow
        mesharray.forEach(p=>{
            p.dispose();
        });
    }

    /////////////////////////////////BUTTON DELETE ROUTE///////////////////////////////////// =>Xử lí sự kiện cho button Delete

    var deleteFunction=()=>{
        var arrayData=[];      //arrayData lưu trữ mảng Route
        jQuery.getJSON('https://api.myjson.com/bins/vf6v4', (obj) =>{
            var e = document.getElementById("route");
            var getItem = e.options[e.selectedIndex].text;      //Lấy nội dung của item trong list đã chọn
            for (var i = 0; i < obj.length; i++) {
                arrayData.push(obj[i]);
            } 

            function removeArrayEl(arr, RouteName){
                newArr = [];        //newArr lưu trữ các route sau khi xóa
                index=-1;
                if(RouteName==="All Route")     //Kiểm tra nếu chọn All Route thì sẽ cập nhật lại JSON với mảng rỗng
                {
                    arrayData=[];
                    var updatedData=JSON.stringify(arrayData);         
                    // do update
                    $.ajax({
                        url: "https://api.myjson.com/bins/vf6v4",
                        type: "PUT",
                        data: updatedData,
                        contentType: "application/json; charset=utf-8",
                        dataType: "json"
                    });
                    return;                    
                }
                
                for(var i = 0, l = arr.length;i < l; i++){      //Lấy index của item trong list được chọn để delete
                    var counter = arr[i].name;
                    if(counter == RouteName){
                        index=arr[i].id;
                    }
                }
                for(var i = 0, l = arr.length;i < l; i++){      //Thêm các Route vào newArr ngoại trừ Route đã xóa
                    var counter = arr[i].id;
                    if(counter != index){
                        newArr.push(arr[i]);
                    }
                }
                return newArr;
            }
            var newarray=removeArrayEl(arrayData,getItem);                          

            var updatedData=JSON.stringify(newarray);     
            // do update
                $.ajax({
                    url: "https://api.myjson.com/bins/vf6v4",
                    type: "PUT",
                    data: updatedData,
                    contentType: "application/json; charset=utf-8",
                    dataType: "json"
                });
            function removeOptions(selectbox) {        ////Xóa tất cả các item trong list Route
                for(i = selectbox.options.length - 1; i >= 0; i--) {
                    selectbox.remove(i);
                }
            }
            removeOptions(document.getElementById("route"));        
            loadRouteData();   //Load lại dữ liệu cho list Route sau khi remove 
            ClearArrow();
        });
    }

    document.getElementById("deleteRoute").onclick = deleteFunction;
    ///////////////////Change Route Color///////// => Thay đổi màu sắc cho Route khi được vẽ
    var ChangeRouteColor=(x)=>{ 
        var x = document.getElementById("colorpicker").value;       //x là value mà colorpicker đã chọn 
        strokeColorRoute=x;
    }
    // document.getElementById("colorpicker").onchange=ChangeRouteColor;
    ///////////////////////////Draw Point/////////////////////////////////
    var DrawOnePointTemp = function(arrow,x, y,diffX,diffY,i,pointLength) {
        arrow.material = new BABYLON.StandardMaterial("arrowMat", scene);
        arrow.material.diffuseTexture = new BABYLON.Texture("https://raw.githubusercontent.com/KiritoNguyen/My_Image/master/MyImage/Map3D/assets/images/2000px-Red_right_arrow.svg.png", scene);
        arrow.material.diffuseTexture.hasAlpha = true;
        arrow.material.diffuseColor = new BABYLON.Color3(0.6, 0, 0);
        arrow.position = new BABYLON.Vector3(x, 10, y);
        arrow.rotation.y = Math.atan2(diffX, diffY)+Math.PI/2;
        setInterval(function(){
            arrow.material.diffuseColor = new BABYLON.Color3(0.6, 0, 0);
        },timeChangeColorRoute);
        setTimeout(function(){
            arrow.material.diffuseColor = new BABYLON.Color3(1, 0, 0);
            setInterval(function(){
                arrow.material.diffuseColor = new BABYLON.Color3(1, 0, 0);
            },pointLength*timeChangeColorRoute);
        },i*timeChangeColorRoute);
    }
    var DrawOnePointWithColor=function(groundTexture, invertY, x, y, colorFill, colorStroke){
        var context = groundTexture._context;
            context.beginPath();
            context.arc(x, y, 3, 0, 2 * Math.PI, false);
            
            context.fillStyle = colorFill;
            context.fill();
            context.lineWidth = 2;
            context.strokeStyle = colorStroke;
            context.stroke();
            groundTexture.update(invertY);
    }

    var DrawHeadRoute=function(sphere,x,y){
        sphere.material = new BABYLON.StandardMaterial("sphereMat", scene);
        sphere.material.diffuseTexture = new BABYLON.Texture("https://image.flaticon.com/icons/svg/189/189647.svg", scene);
        sphere.material.diffuseTexture.hasAlpha = true;
        sphere.position = new BABYLON.Vector3(x, -50, y);
        // var hl = new BABYLON.HighlightLayer("hl1", scene);
        // hl.addMesh(sphere, BABYLON.Color3.Red());
    }

    ///////////////////////////// LOAD Route Data ////////////////////////////  => Load dữ liệu Route 

    var loadRouteData = () => {  
        var newPointData=[];  
        var newDirectionData=[];
        var PointObject=[];      
        jQuery.getJSON('https://api.myjson.com/bins/vf6v4', (obj) =>{
            for (var i = 0; i < obj.length; i++) {
                PointObject.push(obj[i]);
                for (var j = 0; j < obj[i].location.length; j++) {
                    var counter = obj[i].location[j];
                    var point=new Point(counter.x,counter.y);
                }
            }
            var i=0; 
            document.getElementById('route').innerHTML="";
            var myDiv = document.getElementById("route");   
            var default_option_none = document.createElement("option");     //Option None trong list Route
            var default_option_all = document.createElement("option");     //Option All Route trong list Route
            default_option_none.textContent = "None";
            default_option_all.textContent = "All Route";
            myDiv.add(default_option_none);
            myDiv.add(default_option_all);
            PointObject.forEach(p => {      //Thêm các option tương ứng các Route vào myDiv
                var option = document.createElement("option");
                option.textContent = PointObject[i].name;
                option.value=PointObject[i].id;
                myDiv.add(option);
                i++;
            });  
        });  
        var count=-1;
        var meshcount=0;
        document.getElementById("route").addEventListener("change", e => {      //XỬ lí sự kiện khi click vào item trong list Route
            if (e.target.value !=null) {                        
                if(e.target.value==="All Route")    //Xử lí khi chọn All Route
                    {
                        ClearArrow();
                        groundDraw = BABYLON.Mesh.CreateGround("groundDraw", 3900, 3900, 2, scene);
                        groundDraw.position.y = -45;
                        dynamicMaterial.diffuseTexture.hasAlpha = true;
                        groundDraw.material = dynamicMaterial;
                        for (var i = 0; i < PointObject.length; i++) {
                            for (var j = 0; j < PointObject[i].location.length; j++) {
                                var counter = PointObject[i].location[j];
                                var point=new Point(counter.x,counter.y);
                                newPointData.push(point);
                            }

                            for (var j = 0; j < PointObject[i].direction.length; j++) {              
                                var counter = PointObject[i].direction[j];                             
                                var point=new Point(counter.x,counter.y);
                                newDirectionData.push(point);
                            }
                            var pointLength=newPointData.length;
                            var counti = 1;
                            newPointData.forEach(p => {
                                if(counti == 1)
                                {
                                    var sphere = BABYLON.Mesh.CreateGround("arrow"+meshcount, 150, 150, 100, scene);
                                    DrawHeadRoute(sphere,p.x,p.y);
                                    mesharray.push(sphere);
                                    meshcount++;
                                }
                                if(counti==pointLength)
                                { 
                                    var sphere = BABYLON.Mesh.CreateGround("arrow"+meshcount, 150, 150, 100, scene);
                                    DrawHeadRoute(sphere,p.x,p.y);
                                    mesharray.push(sphere);
                                    meshcount++;
                                }
                                if(counti > 1 && counti < pointLength)
                                    {
                                        var arrow = BABYLON.Mesh.CreateGround("arrow"+meshcount, 75, 75, 100, scene);
                                        DrawOnePointTemp(arrow,p.x, p.y, -newDirectionData[counti-2].x, -newDirectionData[counti-2].y,counti,pointLength+1);
                                        mesharray.push(arrow);
                                        meshcount++;
                                    }
                                
                            counti++;
                            }); 
                            newPointData=[];
                            newDirectionData=[];
                        }
                    } 
                else if(e.target.value ==="None"){      //Xử lí khi chọn None
                    ClearArrow();
                }     
                else{       //XỬ lí khi click các route khác
                    var i=0;
                    PointObject.forEach(p => {
                        if(e.target.value==PointObject[i].id)   
                        { 
                            
                            for (var j = 0; j < PointObject[i].location.length; j++) {              
                                var counter = PointObject[i].location[j];                             
                                var point=new Point(counter.x,counter.y);
                                newPointData.push(point);
                            }
                            for (var j = 0; j < PointObject[i].direction.length; j++) {              
                                var counter = PointObject[i].direction[j];                             
                                var point=new Point(counter.x,counter.y);
                                newDirectionData.push(point);
                            }
                            if(count!=i){
                                ClearArrow();                         
                                groundDraw = BABYLON.Mesh.CreateGround("groundDraw", 3900, 3900, 2, scene);
                                groundDraw.position.y = -45;
                                dynamicMaterial.diffuseTexture.hasAlpha = true;
                                groundDraw.material = dynamicMaterial;
                                var pointLength=newPointData.length;
                                var counti = 1;
                                newPointData.forEach(p => {
                                    if(counti == 1)
                                    {
                                        //DrawOnePointWithColor(groundTexture, invertY, p.x, p.y,colorBegin,colorBegin);
                                        var sphere = BABYLON.Mesh.CreateGround("arrow"+meshcount, 150, 150, 100, scene);
                                        DrawHeadRoute(sphere,p.x,p.y);
                                        mesharray.push(sphere);
                                        meshcount++;
                                    }
                                    if(counti==pointLength)
                                    { 
                                        var sphere = BABYLON.Mesh.CreateGround("arrow"+meshcount, 150, 150, 100, scene);
                                        DrawHeadRoute(sphere,p.x,p.y);
                                        mesharray.push(sphere);
                                        meshcount++;
                                    }
                                        //DrawOnePointWithColor(groundTexture, invertY, p.x, p.y,colorEnd,colorEnd);
                                    if(counti > 1 && counti < pointLength)
                                        // DrawOnePoint(groundTexture,invertY, p.x, p.y, counti, pointLength + 1,fillColorRoute,strokeColorRoute);
                                        {
                                            var arrow = BABYLON.Mesh.CreateGround("arrow"+meshcount, 75, 75, 100, scene);
                                            DrawOnePointTemp(arrow,p.x, p.y, -newDirectionData[counti-2].x, -newDirectionData[counti-2].y,counti,pointLength+1);
                                            mesharray.push(arrow);
                                            meshcount++;
                                        }
                                    
                                counti++;
                                }); 
                                newPointData=[];
                                newDirectionData=[];
                            }
                            count=i;
                        }                              
                        i++;
                    });
                   
                }
            }
        });
    }
    loadRouteData();

  

    /////////////////////////// BUTTON LOCATION //////////////////////////
    
    var btnStadium = BABYLON.GUI.Button.CreateSimpleButton("btnStadium", "Allianz Stadium");    // Khởi tạo button
    advancedTexture.addControl(btnStadium);
    btnStadium.width = "80px";
    btnStadium.height = "80px";
    btnStadium.color = "white";
    btnStadium.background = "gray";
    btnStadium.fontSize=15;
    btnStadium.linkWithMesh(locStadium);   
    btnStadium.linkOffsetY =-100;
    btnStadium.onPointerClickObservable.add(function(){ //XỬ lí sự kiện mở ảnh 360
        advancedTexture.dispose();
        var scene1=createStadium();
        engine.stopRenderLoop();
        engine.runRenderLoop(function () {               
            scene1.render();
        })
    })

    var lineStadium = new BABYLON.GUI.Line();   // Khởi tạo liên kết giữa box ảo và button
    lineStadium.lineWidth = 2;
    lineStadium.color = "Gray";
    lineStadium.y2 = 20;
    lineStadium.linkOffsetY = -10;
    advancedTexture.addControl(lineStadium);
    lineStadium.linkWithMesh(locStadium); 
    lineStadium.connectedControl = btnStadium; 
    
    var btnParking = BABYLON.GUI.Button.CreateImageOnlyButton("btnParking", "data:image/svg+xml;base64,PHN2ZyBpZD0iTGF5ZXJfMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB3aWR0%0D%0AaD0iNDIuNyIgaGVpZ2h0PSI2MCIgdmlld0JveD0iMCAwIDQyLjcgNjAiPjxzdHlsZT4uc3Qwe2Zp%0D%0AbGw6IzcwNGI0M30uc3Qxe2ZpbGw6I2ZmZn08L3N0eWxlPjxnIGlkPSJwcmVjaW5jdC1lcDItZXZl%0D%0AbnQtcGFya2luZyI+PHBhdGggaWQ9InBhdGgtcHJlY2luY3QtZXAyLWV2ZW50LXBhcmtpbmciIGNs%0D%0AYXNzPSJzdDAiIGQ9Ik0yMS4zIDYwYy0uNCAwLS44LS4yLTEuMS0uNUMxOS40IDU4LjQgMCAzMi43%0D%0AIDAgMjEuMyAwIDkuNiA5LjYgMCAyMS4zIDBzMjEuMyA5LjYgMjEuMyAyMS4zYzAgMTEuNC0xOS40%0D%0AIDM3LTIwLjIgMzguMS0uMi40LS42LjYtMS4xLjZ6Ii8+PHBhdGggY2xhc3M9InN0MSIgZD0iTTE1%0D%0ALjYgMjQuMmMtMS40IDAtMi41IDEuMS0yLjUgMi41czEuMSAyLjUgMi41IDIuNSAyLjUtMS4xIDIu%0D%0ANS0yLjVjLS4xLTEuNC0xLjItMi41LTIuNS0yLjV6bTAgMy4yYy0uNCAwLS43LS4zLS43LS43cy4z%0D%0ALS43LjctLjdjLjQgMCAuNy4zLjcuN3MtLjMuNy0uNy43eiIvPjxwYXRoIGNsYXNzPSJzdDEiIGQ9%0D%0AIk0zMy42IDI0LjZsLS40LTMuM2MtLjEtLjYtLjYtMS4xLTEuMy0xLjFIMzFsLTIuOC0yLjVjLS4z%0D%0ALS4yLS42LS40LTEtLjRoLTUuNmMtMS4zIDAtMi41LjQtMy40IDEuMkwxNS4xIDIxbC00LjIgMWMt%0D%0ALjUuMS0uOS42LS45IDEuMnYxLjJjLS4yIDAtLjMuMS0uMy4zdjEuNmMwIC4yLjIuNC40LjRoMi40%0D%0Adi0uM2MwLTEuNyAxLjQtMy4xIDMuMS0zLjFzMy4xIDEuNCAzLjEgMy4xdi4zaDYuNnYtLjNjMC0x%0D%0ALjcgMS40LTMuMSAzLjEtMy4xIDEuNyAwIDMuMSAxLjQgMy4xIDMuMXYuM2gyLjJjLjIgMCAuNC0u%0D%0AMi40LS40di0xLjVjLS4xIDAtLjMtLjItLjUtLjJ6bS04LjMtNGwtNy44LjQgMS41LTEuMmMuOC0u%0D%0ANyAxLjgtMSAyLjktMWgzLjR2MS44em0xLjMtLjF2LTEuN2guNWMuMiAwIC4zLjEuNS4ybDEuNiAx%0D%0ALjQtMi42LjF6Ii8+PHBhdGggY2xhc3M9InN0MSIgZD0iTTI4LjMgMjQuMmMtMS40IDAtMi41IDEu%0D%0AMS0yLjUgMi41czEuMSAyLjUgMi41IDIuNSAyLjUtMS4xIDIuNS0yLjUtMS4yLTIuNS0yLjUtMi41%0D%0Aem0wIDMuMmMtLjQgMC0uNy0uMy0uNy0uN3MuMy0uNy43LS43Yy40IDAgLjcuMy43LjdzLS4zLjct%0D%0ALjcuN3pNMTMuNiAxMy4xaC40Yy43IDAgMS40LS4yIDEuOC0uNi4zLS4zLjUtLjguNS0xLjNzLS4y%0D%0ALTEtLjYtMS4zYy0uNC0uMy0uOS0uNC0xLjctLjQtLjggMC0xLjMgMC0xLjcuMXY1LjVoMS4ydi0y%0D%0Aem0wLTIuNmguNWMuNiAwIDEgLjMgMSAuOCAwIC42LS40LjktMS4xLjloLS40di0xLjd6Ii8+PHBh%0D%0AdGggY2xhc3M9InN0MSIgZD0iTTExLjIgMTYuOGg2LjJjLjggMCAxLjQtLjYgMS40LTEuNFY5LjJj%0D%0AMC0uOC0uNi0xLjQtMS40LTEuNGgtNi4yYy0uOCAwLTEuNC42LTEuNCAxLjR2Ni4yYzAgLjguNyAx%0D%0ALjQgMS40IDEuNHptLS4zLTcuNWMwLS4yLjItLjQuNC0uNGg2Yy4yIDAgLjQuMi40LjR2NmMwIC4y%0D%0ALS4yLjQtLjQuNGgtNmMtLjIgMC0uNC0uMi0uNC0uNHYtNnoiLz48L2c+PC9zdmc+");
    btnParking.color = "transparent";
    btnParking.background = "transparent";
    advancedTexture.addControl(btnParking);
    btnParking.width = "60px";
    btnParking.height = "90px";
    btnParking.linkWithMesh(locParking);   
    btnParking.linkOffsetY =-50;
    btnParking.onPointerClickObservable.add(function(){     
        advancedTexture.dispose();
        var scene1=createParking();
        engine.stopRenderLoop();
        engine.runRenderLoop(function () {               
            scene1.render();
        })
    })

    var btnNationalLeague = BABYLON.GUI.Button.CreateImageOnlyButton("btnNationalLeague", "data:image/svg+xml;base64,PHN2ZyBpZD0iTGF5ZXJfMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxu%0D%0Aczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgd2lkdGg9IjQyLjciIGhlaWdo%0D%0AdD0iNjAiIHZpZXdCb3g9IjAgMCA0Mi43IDYwIj48c3R5bGU+LnN0MHtmaWxsOiMwZjU3MmR9PC9z%0D%0AdHlsZT48ZyBpZD0icHJlY2luY3QtbmF0aW9uYWwtcnVnYnktbGVhZ3VlIj48cGF0aCBpZD0icGF0%0D%0AaC1wcmVjaW5jdC1uYXRpb25hbC1ydWdieS1sZWFndWUiIGNsYXNzPSJzdDAiIGQ9Ik0yMS4zIDYw%0D%0AYy0uNCAwLS44LS4yLTEuMS0uNUMxOS40IDU4LjQgMCAzMi43IDAgMjEuMyAwIDkuNiA5LjYgMCAy%0D%0AMS4zIDBzMjEuMyA5LjYgMjEuMyAyMS4zYzAgMTEuNC0xOS40IDM3LTIwLjIgMzguMS0uMi40LS42%0D%0ALjYtMS4xLjZ6Ii8+PGltYWdlIHdpZHRoPSI1MCIgaGVpZ2h0PSI2MyIgeGxpbms6aHJlZj0iZGF0%0D%0AYTppbWFnZS9wbmc7YmFzZTY0LGlWQk9SdzBLR2dvQUFBQU5TVWhFVWdBQUFEUUFBQUJCQ0FZQUFB%0D%0AQ2VsNGVaQUFBQUNYQklXWE1BQUJQV0FBQVQxZ0d4TmhCMUFBQUEgR1hSRldIUlRiMlowZDJGeVpR%0D%0AQkJaRzlpWlNCSmJXRm5aVkpsWVdSNWNjbGxQQUFBSE94SlJFRlVlTnJjZTNsOFZlVzE5dlB1ZmVZ%0D%0AaCBKM05JUWdZQ0lXR2VaUWd6b2xZRVJZV0wwMVY3dlZmYjZ0ZnZWMnY5dk8xbmJYdDd2MnZWMW5v%0D%0AN1haV2lMU3BJY1FKRlJCQVFBaHBDIHdwUUVRdVo1T3NrNU9mTTVlNzkzdlh1ZmhHQkIwZGI3eDdm%0D%0AemU4OCtaNDlydld1dFp6MXI3UjNnLzdPRmZlN2U3eTB3Z3ZNVU1KNU4gNnl3YW94Q0xwVU9KcFVC%0D%0AVmtta2tRWWttME5wT3d3WlZ0WUNyWmpyVEJIQURyZVhQM0lQVFVHaFRqTllSTUNrTVNRcEJrZ00w%0D%0AL0pBTiBYc2h5UDYzZDlOc0x5ZEJOeDNSQlloMlEwQTRWbmZqbDBkQ1ZLZlR3Z2xRU1pocGkwWm1J%0D%0AaGljaUhDeEVKRGlHQkU2anc0eVFqWUNSIFpMVllJVmtkc0Zyc2NKbHBXQnhJb085T3N3MTJreFUy%0D%0AT3NaaU1NRmtNTUlneVdEc3dpMDQ1NGlwQ2lLeEtFS3hDQUxSTVB5UklBYkQgQVhoRGZuaENQbmlD%0D%0AZmdSREFhaTBIV0UvRUNYNTZWaW9YQ0ZGQjBpR0pwaHQ1Mkd5Vk1Ob3FxVHQ1WGoyazVZTENqMjhh%0D%0AQTU0N0hFTSA5cTJDMzhOZ2RjS2FuSW04MUJ4TXlzakhSQnBGNmJrb1NNbEdUbUlHMHV3dW1BMG1I%0D%0AcC90ejVza2Zoa1A0Sjg1NXBMWEVJcjNCd1paIGk2Y2JqZTRPbk90cFFuVlhFODUwTmFDMnV4bGVk%0D%0AenZnNndlRUxNbFo1MkF3L0I4OGRlZ3RBNktCSERKcjN2U2l1ZXorQlRmanBrbUwgTUNvaDVTS0Jh%0D%0AVVpaTjUzYzFOK0p3dzBuME9ycFFhZlh6WHI5L2VqemUrR2xtZlRSTFBzaklZUm8xc05LRkZFbHBs%0D%0AbER0d3hKR0ZkQiBXTTBvRzJBaWkxdU1abVkzV1RUckpwQzFVK3dKU0xVbjBmMlRhWjFJRTVqT3hT%0D%0AUitvM2d1YnA2eTVDTGxmZUVnMjE5ZndYNzc4Vi9ZICs5V0hraENPVHFiTnBCRHRzTmhkYk4yMEZm%0D%0AeSt1YXRSMlY2TC96cjZObzYzbldWVlhZMW82KzlDME9jR2ZUQnlSWXFBYUh3T0paRC8gMDVyQ1JC%0D%0Ab2FROXZFRUNwYzBrQk0wNUNyNUVaRFE5RUhWL1RmWXA4NFJqWnljaXVBbERVNEVsbUdLdzFGYWJt%0D%0AWW5sV0laZU5tNGxwUyAxR215OFVOMXgrRWI2Tlp1WmdCVG1VUi9zaVN6RDA3dDUwOXNlZ0psOVNj%0D%0AWUVoUElkNlA2a0VsWWNXRkhFa0N6cUFrcTVDV0xZTkN0IEh5TUVVTDRnV29YU1ppdkZvUU5hVEdw%0D%0AbUkrRURnd0JabXVKQjMwOFdBc1VqWFpkcCt4VUZzYUFQYmQ0K3RKSHcrM3crYkpHZGVPVGUgSDZs%0D%0Aeml1Y3lXY2luOExoQ25PYVRhUXRYRFdhdUpxY3dCTExCSEluSWRLVWlOMmtVQmJnSllSSytpU3pX%0D%0ANlIvUXdZRmN5bVZMd0pqYyBpWEFTS0FnWHU2d3VqR21BNEFrSDBVYng0S1U0MEN4QjF4Zlh5cVE0%0D%0AemFQN2tBc1NLUGpRME5PQ2dRQXBTTUNpQWFWQkRKcFF1ZzlBIHlqcEQ0T1FKTVhKVkVSaVNtQm1E%0D%0AY0l0aGhYUUhVZWltcWhZMEFhUVkwdkRZaXJ2eDRNSmJod1Y3cWZSTlBMSDlLVFFKRnpTWWNjUGsg%0D%0AeFhqaXh1OWlYT3JvSzg0VEF0RU8xSi9Fci9hK2hQM0hkc0ZGYnZRbzNlZTc4ZnNjYVR5Tko5NTRH%0D%0AdVF0UUZMbWhlRDdLMlJoNUJCYyBDTTVsb1FIbm1rSVNmYUZUeU9rZ2FZZUpQK0Ura3RncVNSZGRa%0D%0ARm54UEN3bjBORGRLd3BoNnM4ZTgwV0xBSUFiSnN6RHh0c2Z4ejh1IFdLc0JSMndvTHIvVXdvWFZt%0D%0AZTRBVE1nMEZFUEN1L1VkbkYrSVluNEpZTTRqT0w5cDFyV29yQ3RIUlhPVk5rdER4d1NDUVd6ZHNR%0D%0ATXYgdjdrZHpRUGRDQ2tSN2RKSmxMTXlITWx3V20yNGJ2a3lyTHYrZXFRa0ppRS9PUXVMcHEzQTNv%0D%0ANTYrTWpOdnRLaUdZUEZZeHB4aFdMNiBScWFyeGRXNHBwZGJsaGJOeGJLWjF4RWExbEhpQ3c0RFda%0D%0AU0E0ZVRwb3poK1loOFdMRnFKb25HVEtPN0NPRlZkZ2RMeWR4RnE5K0xUIEEzc2hxVkg4eTUzM2FP%0D%0AZGtKYVloVzhUUlpkUFI1UUdHYTNDaVRUc2tUUmxWR3JZUUxRSVhPRmRKSFQxcFhGWXB3UXB1bUx3%0D%0ASTVSWDcgd01rcXcwWTFFaXVZa29neDloTGN2L29CckoyNFdJKzdZenZ3azdjOWFHeXBwdndrSVd3%0D%0ATzYyZ282NVBLdm9COVhkN2g2RElrcjdDRyBRR21vTEI1REV0ZEJRUVFaNGIvS0x6MWJkREw1dXFM%0D%0ARjJLTHhjN0I0L2cwSTJLendCVHdYRG9yU3VhRVlwUk4xeEoxSjhxaklVUTdNIFg3SUs4MHFXNkF5%0D%0AUGxsNjNtMGJmbHpiUUVJMFNNb2xJa1NTR2VOam9LQ2YwRVNBUU4rTWxMM0NpdWdwdFhaMllPV2t5%0D%0Ac2pOR1lXWHggZk1yc0xnMFpMNXEyejV4KzY5UmxXREoyQmdpSmtFYXB3Q29nWHdEcFlCQm5UcDVD%0D%0AYzFjN1REYmJWN1NTeXZRSTBqUzZ5T1Uwc09DZiBFei8xN1ExNDllM3RHUFN0eHUxcmJzR2N2RW1Z%0D%0AbUZsQVJOVDh1VGQxVUtJVVkrUVNERWNJUEY3SGE5ditDUHNZTSt4VzI5K0FDY0szICtEREtTUUlV%0D%0AY0NGcTlCaTZsR0Q1YWVpSWRLSDA0RWZvN2V6VkdIV0t6UVhCeFQ1djZlanVSbWxGT1JwYVd6QjA3%0D%0AYnJ6ZGZod3p5NDAgQmpvb1R6ckFvbC9XNTNSdm9xRFhWa3lFanpLa0VQM1dtUmN4QllGeHVMUkda%0D%0Ab3NONW1RcjlsWWN3SWRIRGx6eHJYZnQzWTNiTnF6SCBBOS81RG81VUhOZTJUWjQwQVEvOTlGRXN1%0D%0AMjRwVklvak5YWWhEL0VZZ1VZL3hWVm5KOURUUEdJMEFkMDB2TDF4UnFqRnZOQ0NFaXY5IGtJZVln%0D%0AcVNoaE1BRm9VNGN0aS9oZVdHaU51bG0xQmhiOE5hSGIySGErRW1ZTUtuNEN4V1M4aEloTFVuR0I0%0D%0AZmZRL0x2RTVIOHlJOVIgUEg0c2xveVpnUWZYZmhjLzJmUVRITisvQi9VRkpTakl5WUhMbVl5OHFR%0D%0AdFI3SFJpRkgwZlFrR0o2WFNtdzlPTE02M1ZCRHlLQmdyQyBFRnB5SDA2c2NVY1UwTWQxNm5ONUpC%0D%0AWHNJdDJPRDFyTE1PL29BUlFYRllFWnZnQjJyVlM0amhVMVlqNjJuTnlOaEJkUzhNVDMvNVg0IFd4%0D%0AcVZCTXZoWFQyQW4vejBDVHpqZmhvL2Z2ekhWSU9Od2ZQckhyM2twWVQvZk54UWliVy9leENnNU0w%0D%0AMTJUVmxtUzZjUm4yMG5Ccm4gK2x4aXc0VHk0dkpNbkVOVkY1Q1lpSDVIbEt6ME92WWZPbmhKL3g0%0D%0ANUkwd2hEL1pReFdramhqMDFEYThlMm9ZWC8vd1NNWXV3dHYrZSBaVGZqY1ZMazNicFNQUE9ILzZS%0D%0AcU5mejVoRjFETVduRUptRWpObHhZRXNyeHVBUnNDQlFZekdiNHlLUTc5M3lJcnNPTnNFb21OSVM3%0D%0AIFVPOGgzellTWW1VN2NiQytGZC8vMWMreGZQL0hTRTVLMUVqbllVOFZPaU4rdlBIT2U2ais0QVRo%0D%0AallJVHdTYjBSeUxhclpEdWdtOGkgeDNQYmY0OVRWV2RSUEhrU25FWUxGS3VFek14a3ZQeldSclIz%0D%0AZEdOOFVURXBGc1JJZ0JLS2lEQ3BqM1FqUU5leldpeFF0WHBqbU15TiBLQitnbHcrS2lDRm9OUWtM%0D%0Aa0VLN2RyK0pYZFVVbktJdGtlVUNsaGNBR1FraXk0S1BTY0h4c3RNNC90d2UwZTdRWFd2UkdGRE5n%0D%0AYzN2IGJRUWErL1FFV3BnT2xOQjJCMUgvSU1WaFZpcDZtUWZiRG00RC9ySXg3cGFFbEl2SEF0TlRz%0D%0AWG4zWnVCbEtoM01sNklHTkxMcC9rc28gWFZCU2p6TUZuU0R6SVF1SjN4cjNnUVlKR2loRTZVd3I3%0D%0AVjlBQ3BRVVhIelJZRVJmeS9IOTh3b0VaSTdvRU5ESDlVV2ZUUmdFS25FayBDOUE2bGR6djFpbFV3%0D%0AUEdMRTdHNDVpMVRFSi80eTNPZWNCaWNRSXFrRmM2bG8xeThmTkJCZ2VsMFRnZnRlSEpsbnhraldZ%0D%0AQldhSExkIE10Sm5XaDU4eERtWGE0TkVWWTFSYWtPVTI2SzAxMExZTkJ6TlY3Sm9rODkwQkx3UVEv%0D%0ARkxhSXcxUXA4Und3VnBWUDVGcWZyU1piZDYgQllsUzBEQ0NYV00waUFRNlhsUzhneXE1cE1XcFFm%0D%0ATG41MVc2Zm96OE9XUmdGd2p1VUF6UkY3b2VFeWtxTlNuQ2t5d3hOTGRiaUI3UiBMa3ZzODV0TmY4%0D%0AdkNxVUNreXk4ZFc0Si9Ybkl6dWdmNzhWLzd0dUJVTDVYbkp1T2xPMkJpVTR3K0JpeXdtR1BJVFBl%0D%0ATHFXTWlHOUVFIFNjTUtLVnk0bThSdkt1eFdDKzZ1d2k4T1M5SWJaV05ac0U4MExNZ2RqT3JmWHls%0D%0AaUI2a21GMjZhdUFTM1RscUtmcjhYZFMxTnFPNXQgMGl0WTJYU3hJaXA5ZUUwd3hDVE1tTmJPLzIx%0D%0AWks3K21hSnBhN21hU29vcGFaSWo2a0hveUZSR1N6UGhnaXdsanVrM1M1aVZ0ZlBlMyBLdFRsczdz%0D%0ANC9DWnRSc0N2M0xldmFKR05wRVFBbjlhY1JHMTdFODUzdEtDbXFSNnhtS0szd2tiR2NZQXMxbXZE%0D%0AbU5HRC9JLy9ja0w5IGRFTU5YeEtWV2U4Wmk1WlREZkpJdG8wNFU2QWhVTFh1SEdPMjh5WTJZMXFZ%0D%0AdjN0ckZkOCtvNFAveDk1OGRyb3VpV2t1YUk5Y0FJbS8gWlNGeUd6SDY4YzdwSFRoV1UwSGljTFFw%0D%0AN1FUWGttNGQwYU1UOFV5VG1aWWE0UGRmZjQ3L1lGWVhOd2NrVm5mSXlwcTdHY3Vib2ZWNyB0SUx1%0D%0AQXZXSjV5VU41NmpZczlvNUlrRUQ2azdaV0hwN2xHMG85dktWOTUza3p4OVA1Nzgva01mYXUyd016%0D%0Ac2pmSGwraU9EUGIwUzlGIDBCK28xVTFCOVJXTVpJMEFLZVUzdzJsV3NHYmxlZjZ6QlkxcXZoSE1l%0D%0AMHFXem5ZNldKaU00VWhRSWN2cUVMeXhDeWpITVd5dWVDdUYgR1F5Y2Nxc0NIeWtXcVVoa0thT0M3%0D%0ARWV6T3RSYko3ajVMMHF6c1BWSU5ndGNTWHdKL0JRZDBSZ3BiekRvamNhUlpGNG9KYmE3VW5SeCBJ%0D%0AaVJHandWV1d4VFRwM2Z4SjVjM3Fvc3lReXpXTlZweWR5NW1BMm9ubU8wa0RCRWZJakd6SnUyRkhz%0D%0AK0k4a0hYVUVTVkFBMTFtSEhJIEpLeHNVVERndHFDclBGSEs5M0gyeCt2cSthNEhLdFhsTTc4Z3Zv%0D%0AVHdCTWttL3dEc1JJdU1va0VwbmlSSThpWHFlenFaN29GQkU1Yk4gNk9TNzdxOVFTKzg4bzg0MSs2%0D%0AVzJza0twVFg2ZXVlYS9BdHZVWnloVjVjRElReG90a2pTaUtIcU9naFo4Tm9hSStsaU5Lczl5cWN6%0D%0AbiBwMlE4bE1TWjZDa3Ftdkg2VzYzTTJtTmlDL0tEL04zYktMNW1kdkwvMkpkMzZmaUtCR0ZqWnF5%0D%0AZTl3MnNtRGdYZTg0Y3hjNFRIeEhSIENPcGQwS0hqZkNhUlR6Q3BZSUEvdXJ5UnJ5dDJ3K2lSV2Fq%0D%0AS3pQcjZ3RTc1RWlBUlY4d2dFZG84WmxSMXBHQU9zWjh4S2VSRkJOMTkgb254Z24ra3BtQ2svbVF3%0D%0AUzIzbkN5TXYyRy9uNldTcW01aXBzZ0h3NXJEQXQzZ1RCTlpoVlJPbDcvM2tic3lkRTJSMEYvWHps%0D%0AV0E5LyAvbGdHLy8zQlhEMitIQ0srSXBwQzg4ZE13b01sNjdCdy9IUVV1ckxSMDkyQy9VM0hkVGNM%0D%0AbVRTTFpHWUUrQU0zbk9jUHpPNUNPbGRaIDRKeUZ1YjFHU0VaT09UWUtzNmNlRFRXdjRyV2VmcUJ2%0D%0ASnlZNXlwQ1lZTUdtVW9uN0U4eFlmdytZMWZoWEZ0S0JvcTFibGw3WVpzV08gdlhZOHVNR2diaWdK%0D%0AczB5cnlnYTlRakU5SkFnNEtPZHlZc015SXRWV2xwZ2FZVCthMzZiZU9zbk5uenFVaFMxSFJYelpT%0D%0AQ2tGZlo0QSBldnZjbWlYY2ZmM284NUxwT2Uyai9UYTdndlVyR3ZrUEZyYnpDYTRnSW0xR2FhRGJT%0D%0ARGtvVEs1T1BFMHlVeENZc1dCY0NCbGRmMEpUIDg0dVlOVTVDWTc5RjNmQmNBdnYwaUl3MWQ1ZzFw%0D%0AaUF6UHBJcGFOMFJiY2o1RGk3TlNjUFo4akMrK3l4amZ6bGt3cU8zaFBtSzZXRm0gSjUvMWVabkdR%0D%0AL1VIQ1lLbWN3UUdqSWg0WmFrd004STNycTdqOTB6cjVqOGxhKzJ0VEdHMTlXMzR0eTIveHFiZFc5%0D%0ASHNia05kcjV1QyAyb1psczdyNWp4YzM4OFY1ZzFCNlplYXZ0ckJ3bEVOMnBNUHB5RVBZMzRPZ3Q1%0D%0AVVVVaEFqR0o5WUhLSHRNbjk4bXcwdnZHdG5LaVZYIHl3dzc1S2xKR29nSnFuT0JiZE9YcUNLem1D%0D%0ATHpxeWIyODZ0dTlMUGRhV2xNclpmNGdWTUQrUFNFRVd1V0cva1BiZzVpNXZnSW96SUYgQVI4YkJq%0D%0AWmhMVEUzd1U0ak03b2x0akRMeDNmZFVjVjN6RTdtUDkrZng4cVB0N1B5R29KbGx4MHpacWo4aDh2%0D%0ATzhUVkZiaGdDWU9GeiBSaGFOeUJyNEtNU2VXd0lsQ0NjK1RvWGtXM0NFZjQ0SmhVRjBkTnI1djI5%0D%0ASzVMOTV5OHk4YmtLMllpZFFZRVAyVkEvV0xtNm42a0JDIFJERUtRMTFvWXdtSEU0M0hlWWtENnZh%0D%0AcmE5blc4V2JwNmFQalVKMmRqZUI1RDdidTl1S2pJeWJjZTJPSWYzdU5IN21aVVJZaU53eUYgNGds%0D%0AQWdCejV2RUsvd3EwR1pyQXBiRzFoSDE5UzRPRy9uVGlLYnoyYnl0WVhkZkx2ek90RWloUmpzUllL%0D%0AK29Dc0ZjM2FlVnlHay9JZiB1ZytqdXZSN21KTFRqdEdqVkw3NWZSZC9Zck9EMWRXWUdNYVNxODVN%0D%0AUm1vUng3MGxEWGhzUWlkUGNoYmlaSmdNeE9TUmJKc0w2c01FIGUraHBOVXZCWmpOV3BIdVFTVFA1%0D%0AS2xscXB5c1ZBL1lVREhRTTRyVmREQTF0REhkZUYxS1hUZ3N4ZTdMS29tUXRRWTcxMXBGK1JaVUkg%0D%0AWkt4VFlnNmJncnVtOVBCckNnZDRoamtLcDE5bE1UOU5IdTFuQnMxYmhoL21jVmxHUVk0YmRrY1pQ%0D%0AMW90NDRYVENUaFFhbUh0WWNwMyBNeE5nR1dQR25EbHVmSXRnZlZheUY2RTZBMnVreEN5TjFSOGZq%0D%0AV2lTWE9pY3htS01kWGN5V04wU1p1WUdXZkhjSm43dDJINjhWSkhCIFBqNmVoT2J6TnZTZThLTHly%0D%0ASW10V0dERXZkY0crWXp4WWRIaEowRjE0ZlJ5bjc2TG1QQ0Q1Wm5EeUxlRUJibUdLbVpUa1liVGdT%0D%0AQ2Mgb3FZenVCU3R1MUZWYTZCNFk5aFRha2FuendKdmloTnlrUVBqWndUd3dPeDZ2akovQUZtK0dP%0D%0AdXBOcUNsSHl4eGpCUm5DbXdFVTJCNiAzMEduUUtLODR5d1VsdERmWmtIQ29NcStNY3JMWjYzMDhk%0D%0AM2prN0RwMkNoMjhrUWF6alVHMExWbkVNY3F6Vmh6ZFFDM1hSM2dZN0lqIFRBMlJ0WUpNejdOUy9C%0D%0ARkJoRnlhbENORXhrVWRNdHBuSktTVEtaODJ0aHY1YTN0dGVPZERHODRSVXhoSW9rU1RZMFg2NUJq%0D%0AdW10T0MgRFVVOVBFK09ncmVZV0UrL2pRV0lkQ3FNSEZ3cmV0aFFsM1FZNVRqWCs2WHhyS3MvbmhE%0D%0ARmJkQlBmazdKTk1zVnhWMjV2WHh1dHBlLyBXWnlLcmNjeVdQT3BkSlMzRHFKNWl3a0h5OHpZc01y%0D%0AUDF5d01JRGt0eGpoWlM0Mnd5ejdVbDgwRS9RNFY3Z0daNzNqZmhpM3YybkdpIHpvb2V1d05xa1JN%0D%0ANXBNaUM0bDU4YzBvWG4rUUtJSW1Rc0wvUHhzSml3dFQ0YzJwbHFHWFAyY2htQ2xuSVFBcUhnLzZJ%0D%0AMzJ5dzJDQkwgTm9vQnY1WnZ4SWtxeld6QVF3Z1dsTm1VeEFqUG45ck9sK1Y3K0t0RjZkaDVMSVYx%0D%0AMWRoeG9ObUxjNzgxWTg4UkMrNWU0MU9Yemc0eCBzMU9sZWlUZTJJaXpBbEV6TXFlS2NFVGkreit4%0D%0AOGorOTQyQ2x4MjNva095STVDWEFWY1J3dyt4ZTNENjFteGNsQlpIbFZaaS9rVnd2IExHdHhKeGk1%0D%0AeHB5aXdrT054QlFTNFl0RnVTZm9pY0ZnOU9rS21ldzlYWDVQZDZ1bko5R1luWWVVUk1vRDNoNU5H%0D%0AVDBtdUhZaGhSaEQgc04vSXJBR0ZMVXIyOGVLRkFYN3RPRGQvK1hnR08wangxWFRlanA1akZGOW56%0D%0AR3psRWorK3VkckhwMC9VbmdVeCtNV3pTRzJDZUdXMSBDWC9jNGNDZUEzYldFclREbjU0QTR6Z1RW%0D%0Ac3owNE80Wlhid2swNE8wQUUxR214RytnSkVwSXVhRXNXV3VnWWVZRzZlZ2owWVhuQ2xUIFVSUDJv%0D%0AOTdkUWp6THFiMU5JbU5lcmtNSjlFOGJuWmhXT0d2Y0V0N1ExSVdHcGlNWU40b3poMVdteksyN2pr%0D%0AaWsybk15UVlXQ0VrdWcgdUJpZkVrQkpvUWNGbzhQb2NOaFlLM09oMTJ2R3VWTXlqaDR6b3Rjblkz%0D%0AUldESW1qVkRSMUd2Q0h2emo1TXh1VHNLL0N4VnJ0U1loTyBjR0hxb2hBZXVicVZQelNuSFhQc0FU%0D%0AajdKQllsajRoRkNBMjFQalhpU0VoMGtTcUxCRnNNZFIxQlh0NDdpUmZOL1I3ZXJ6MHV2WGYwIHJY%0D%0AWkl0czBvNzZ5U01YZTBGeEhmbUVBc01udmNxRUtqek1kajB4dTFxS252d0xnOEkzTFNLRU5Kb2dJ%0D%0AUXdjZjFZbExFdTBLaEdKSlkgR21LWWxPblRGTXZNaXFMTjZtQWRQQUdkdlNhY09tYkFxUm9aNVEx%0D%0ARy91b2JUclo5VHhLcjVVa3NPRFlKQlNVY0QxM1h6aCtaMzRwbCB5WVBJOEVZWTkwcFNOR0prd3My%0D%0ASDRrOEFpY25Ba0pSQWRJdHdZY3ZId0I5MnB2S2NHZDlHV2tFK252emcrVmhiZDJzNWNhMW5VZEZK%0D%0AIDJXMStab1FxUklQUDIxUE1sVWp1L01uemFWNUc0YTNkTmV6d0tTOFVreGtGV1NxU1hRcmoranNR%0D%0AZXM2SlYxRGsyOHdVQnNzeVJvalEgK2pCbjdDRE1WTjQwbVJKWmQ4eUJwaFlacHl1TjdPeWdDd1Ba%0D%0AS1VpWmJjUnRLM3Y0WTh0YWNDM05aWTQwaGRtTXF5Ui8wTUY4dms0QyBwQmpFREFxTEVGOUdBcm1x%0D%0AU2dvZHFqTHluMjlqZU8rQUdjVlhiY0EvYkxpRmJhdDRXM3I3Nkk3Mm1OWDFJaUx5eDZqc0lKZjdw%0D%0ARU4wIE5udVVtTi9lT2RBNXhXSXhPVmN2WEltRTlDeDEvNmUxMkxldmwxVjNXT0Z3U2NqUFZLaWlW%0D%0AY0ZqZXVVMHBKam1FbEdpYVJITzhod2ggekNLbHB1WDVFSElaV0lQcXdpQzVvbUc4Q2RlczhPQ3hs%0D%0AUzM4anNsZG1Nd0lDZ2ZIUzJIbnQ1bDUxRDBrVHk2aWdTWVlvczB3VXFZVSB6OENNQkNCblcwejht%0D%0AYmV0K04zbUdNNTFtUG55ZjdpTFAvUlAzNVNPZFovQWN4OXU4ZzN3Nkhzd0p6eUxQM3dhQUlhZWRo%0D%0ANXREV05XIGRtdUl4eEliT3VzbkcwMnljVlhKTmF4d3lrU2M3bW5Ga2NPTjdPaEpNeHFwSHNsS1VZ%0D%0AaVd4Smg0Q1VvZ0QwZjg5Wjc0V3k0aTc3Z0kgVzhlbUJERnZIRmtnSTRxRVRKWDlZMGszZjJoK0c5%0D%0AVXlQcGJxSi9yajVleHMxMmowU3F1UWxIRVZXcnZjNkd3NWpOU2s4M0M2R0hvOSBCdjc4SGh2KzMy%0D%0AWXpEaHp4SVphWnd2LzU0WWR4OTQzcldGbm5hZmJrTzg5Rld6M3VvN0RaSHNldnlocUhleS9EQUQ1%0D%0AdUNvRnNvTTR2IGg1MTFIYlhGL25EQXVIVEdZbmJONG1Yb29mcjlhUFZaMUpURjJLZlZEcmlwVk00%0D%0AZEZVTmF1aUw2RUZDamVxNFd5S2dwUnNobW9NSXAgVllxaE9OT1BrbUl2RnFSNWtCMkpNdWFqUkJ1%0D%0AVG1DREgvbUNBd01LSG1zWnVLQU1mb2NCNUNNRndpTC8wb1JPLzNPYkFPN3VBdWxBQSArYXZtOGw4%0D%0AODlqTXNuRDZYN1R6OUVmdlBYYitOTlFZSFBrRy84cStFM1NkUTFzbi9XcUV6RFZSUldRZVE3enp0%0D%0ARDBmVWhyYmFvb2J1IEp2dlVzZE53eDZMVkxIbHNKcXFEamFnNTI4Vk9WVmh4L0x3Vm9oMldseDJE%0D%0ATTRrQ1NkV0E0cUw0b2dxWjJTakNVOGlVNXJES0JQVVIgTFdnMS92S1RqU3JPQkhNcjBneGxjT0VN%0D%0ATDYwSzgyZTNKTER0SDVoUTFSVUNLN0x4ZGZmZnkzNXh6Nk1zUFRtRFBiM3JCZmI2Z1ZjRCByWkhn%0D%0AKzdCWUhzT2h2a3E4Zi82aWw0d3VMdkRiUEJ6WFR4dEFPSG9tRkE3M3RQZTI1aDVycUV3M0VnbGNQ%0D%0AV3NGbXpkekRub1RvempaIGU1NTRuVXFsZ1FOVkxRYTRLSEJ6UjBlWmliSy85dkpsL1AyNDRUYTFv%0D%0Adk0yall5S0xZcDQ3WVpnT0VtRjFSN2hOZlZSL081TkkvNjAgMDhFcU8ySVl5T004Zi9rVS9PeWhI%0D%0AN0wxODFhaGx0eiswYTMvemc2ZlB0alRwNmdiWWJFOUNVZENOZDQ4bzF6NU82ZmZ2aW9aVWU5YyBT%0D%0AanpmR21WelhyZHM4aUxqM2N2dTRMbEphZnkxc2wxNGVlZWYwWHpzUExPN2JjZ2puNzltc1EvM1h1%0D%0AL0hsTUl3MDE1Nzgrc3RhRDEvIDZWeE9WWFF0cVZyVU12N3A4MmIrMHZ0MmtXVFJPTUF4bUJ6Z09i%0D%0AUEdzWHRXMzRVMVU1YVNOMW54NG9IWDJYdEgzbExPRDdwckVGV2YgaEN0MUwzNTl0UDJ5L2N2TEts%0D%0AVFdGc1R5NGxaRVFtVythTmpkMU5XUVYxWlhrV1MxSnVMRzZTdFl5ZFE1OEtkSXJDWll4N3Y2UXV6%0D%0AcyBLUWMrcWJUQVRlUTBKek5HZ2E0eWpXWEVNTnh0SVlZRGlmSkphN2VSYjN6SGdhYzJKV0ZQbVEz%0D%0ATmhqQ1VpUmErNnRhMTdQK3UrMThvIEdUY0hUWDBkZU96MUo5bEhGUjhNdEFYOVc4bWtQNlI4Y0Fp%0D%0AL09kcjMxZDhLRnN0M3JpSkoxRFNFQitkU3hyc3YwNXB3N1lJSjg4ejMgTEwrVEY2Wmw0LzNxdzN6%0D%0AVHZpMnM4a2daNUhZRDBrTW1UQjBYd1ByVmc3aHhTUUFwU1dTV3FFNkQzZjB5Zi91Z0RWdDNPSEd5%0D%0AMW9adSBTd1JLZG94UG16ZWIzYnRpQTc0eFlTRzVWeHRlL3VnVlZsbDdUS256dXFzb1NUd05TOEpC%0D%0AeU5ZbS9QclFGN1kxcjd4Yi9lZ1M0dlZkIHVaU0FickZMMHIyNUtWbUZhK2ZkaUp0bVhrTmhydkJY%0D%0AeXQ5am0vZThqcDZxVnBpNmJNZ2trRmd3YXhEM3JmZGlLWEc2QTFWbXZQQjYgQWtyTG5VUkdDZDNU%0D%0AQTBpYm1JMDdWcTdIN2JOV0VjMDM0TzN5M1hqenlOdXMyZDFlNjFmVnZlU2p6eU0xdXhaUEhyamkx%0D%0AN1crWFB2OSBrWVhFZEtPcDhQZlBJc1h1VHJYWWJwaVVPOUVwWXF1a1lCcE9kWnpGeHNQYjhjR2hQ%0D%0AVkFhUTdEMVdWR2NIRVpPVmdndFZGK2Q3VGZEIG54eUNSTlhueW9WWDQ3NEZ0MkpLVmhGSzYwN2c1%0D%0AZjJ2c0RQTlZZTzk0Y0JPRXV0bE9CS3JpWjQzNDVlbGY4Y1gwUyszZkwvRWhFSFAgYU1RaUs0MFM3%0D%0Ac3QySk0xZVNrRjh4NkwxZkhSaUtuWlZmNHhOQjdiaTFQRUtja01aVXNBQzFSYUNrcWxnOHF3WnVI%0D%0AZkplbHcvWVJGYSBQWDE0NWVOdGJQL0ovV2p6OVI4anZ2c2kwWVE5c0xwYVNaSEkzLy9OK2k5YS92%0D%0AZjhCUGo2eEFQVmRRa0d3MjI1cVRtajF5NVlTNkN4IG5LdXhDTjlhc1p1OXN2ZDFkRGJWSXlOdkRP%0D%0ANVlzUjRiWmx4SEUyL0NPeFg3OE1hUk4xbHpiMHVyVjRtK1JqWENOamhTeitMWlV1L1ggOTY4Q1Y3%0D%0ASTh2RkJDTkppQm9IY09DWFYzbXNWKzNlVGNpYmE3bHQ2bXVXRmxTeFZxTzg2ak1MTUEwM0ltbzdU%0D%0AK0pEWWZlSldkYmpvVCA2QTRGM2ljSlhvYk5VUWFqc1F0UGY2Sit2Zi83OEtYaWE3NEZnOTRjeEtK%0D%0AWEd5WDJUOW4ycEZrTEppN0E3UXZYOGJtNUUvQkpTelZlIFBiU2RsVllkUnR1Z3V6eXFLQnRoTW44%0D%0ASVoySUxuam9jK3AvNVo0NnZzbnh2UHRIcnZ2R1VmTlk2Wk5OdFl6UEc1R2VsNTZHOXB4bDEgWGZX%0D%0ATnZxaHdMLzRtcklubjhKc3l6Ly9zZjZkOFpXdk5reENKcHNFL09JM2k1VTdKWUZoS3RkWkJSWW4r%0D%0AbWFoK0paaWxCODhkVnIrTyBXMzg5Q2cyREJxRmh4SmROckRXTktyY2UyS3h0ZU9yVHlOZDV5LzhX%0D%0AWUFBTjFXQzlTbzVWVWdBQUFBQkpSVTVFcmtKZ2dnPT0iIHRyYW5zZm9ybT0ibWF0cml4KC41NiAw%0D%0AIDAgLjU2IDcuMzQgNi41MDgpIiBvdmVyZmxvdz0idmlzaWJsZSIvPjwvZz48L3N2Zz4=");
    btnNationalLeague.color = "transparent";
    btnNationalLeague.background = "transparent";
    advancedTexture.addControl(btnNationalLeague);
    btnNationalLeague.width = "60px";
    btnNationalLeague.height = "90px";
    btnNationalLeague.linkWithMesh(locNationalLeague);   
    btnNationalLeague.linkOffsetY =-50;
    btnNationalLeague.onPointerClickObservable.add(function(){
        advancedTexture.dispose();
        var scene1=createNationalLeague();
        engine.stopRenderLoop();
        engine.runRenderLoop(function () {               
            scene1.render();
        })
    })

    var btnKippaxLake = BABYLON.GUI.Button.CreateSimpleButton("btnKippaxLake", "Kippax Lake");
    advancedTexture.addControl(btnKippaxLake);
    btnKippaxLake.width = "80px";
    btnKippaxLake.height = "80px";
    btnKippaxLake.color = "white";
    btnKippaxLake.background = "gray";
    btnKippaxLake.fontSize=15;
    btnKippaxLake.linkWithMesh(locKippaxLake);   
    btnKippaxLake.linkOffsetY =-100;
    btnKippaxLake.onPointerClickObservable.add(function(){
        advancedTexture.dispose();
        var scene1=createLake();
        engine.stopRenderLoop();
        engine.runRenderLoop(function () {               
            scene1.render();
        })
    })

    var lineKippaxLake = new BABYLON.GUI.Line();
    lineKippaxLake.lineWidth = 2;
    lineKippaxLake.color = "Gray";
    lineKippaxLake.y2 = 20;
    lineKippaxLake.linkOffsetY = -10;
    advancedTexture.addControl(lineKippaxLake);
    lineKippaxLake.linkWithMesh(locKippaxLake); 
    lineKippaxLake.connectedControl = btnKippaxLake; 

    var btnStadiumSportsPhysiotherapy = BABYLON.GUI.Button.CreateImageOnlyButton("btnStadiumSportsPhysiotherapy", "data:image/svg+xml;base64,PHN2ZyBpZD0iTGF5ZXJfMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB3aWR0%0D%0AaD0iNDMiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA0MyA2MCI+PHN0eWxlPi5zdDB7ZmlsbDoj%0D%0AMzA4NTFmfS5zdDF7ZmlsbDojZmZmfTwvc3R5bGU+PHBhdGggY2xhc3M9InN0MCIgZD0iTTIxLjUg%0D%0ANjBjLS40IDAtLjgtLjItMS4xLS41QzE5LjYgNTguNC4yIDMyLjcuMiAyMS4zLjIgOS42IDkuNyAw%0D%0AIDIxLjUgMHMyMS4zIDkuNiAyMS4zIDIxLjNjMCAxMS40LTE5LjQgMzctMjAuMiAzOC4xLS4zLjQt%0D%0ALjcuNi0xLjEuNnoiLz48cGF0aCBjbGFzcz0ic3QxIiBkPSJNMjkuMiA3LjNjLTQgLjQtNyAyLjQt%0D%0AOC43IDUuMi0xLjIgMS40LTMuNSA1LjktNC4zIDguMi0xLjUgMi45LTIuOCA2LjMtMy45IDkuNC0u%0D%0ANiAxLjkgMi4yIDMuMSAyLjkgMS4yLjgtMi4zIDEuNy00LjggMi44LTcuMSAxLjEgMi40IDIuMSA0%0D%0ALjcgMy4zIDcgLjkgMS44IDMuNi4yIDIuNy0xLjYtMS4yLTIuNC0yLjMtNC44LTMuNC03LjJ2LS4x%0D%0AYy4yLjEuNC4xLjYgMCAxLjctLjMgMy4zLS42IDUtLjkuNy0uMSAxLS45LjktMS41LS4zLTEuOS0x%0D%0ALjQtMy4yLTIuNy00LjQtLjItLjctLjgtMS4zLTEuNi0xLjggMS41LTIuNCAzLjktMy43IDctMy45%0D%0AIDEuNi0uMiAxLTIuNi0uNi0yLjV6bS02IDEwLjZjLjQuNC44LjkgMSAxLjQtLjguMi0xLjYuMy0y%0D%0ALjQuNS40LS43LjktMS4zIDEuNC0xLjl6Ii8+PGNpcmNsZSBjbGFzcz0ic3QxIiBjeD0iMjYuNiIg%0D%0AY3k9IjEzLjYiIHI9IjIuMSIvPjwvc3ZnPg==");
    btnStadiumSportsPhysiotherapy.color = "transparent";
    btnStadiumSportsPhysiotherapy.background = "transparent";
    advancedTexture.addControl(btnStadiumSportsPhysiotherapy);
    btnStadiumSportsPhysiotherapy.width = "60px";
    btnStadiumSportsPhysiotherapy.height = "90px";
    btnStadiumSportsPhysiotherapy.linkWithMesh(locStadiumSportsPhysiotherapy);   
    btnStadiumSportsPhysiotherapy.linkOffsetY =-50;
    btnStadiumSportsPhysiotherapy.onPointerClickObservable.add(function(){
        advancedTexture.dispose();
        var scene1=createStadiumSportsPhysiotherapy();
        engine.stopRenderLoop();
        engine.runRenderLoop(function () {               
            scene1.render();
        })
    })

    var btnGateACricket = BABYLON.GUI.Button.CreateImageOnlyButton("btnGateACricket", "data:image/svg+xml;base64,PHN2ZyBpZD0iTGF5ZXJfMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB3aWR0%0D%0AaD0iNDIuNyIgaGVpZ2h0PSI2MCIgdmlld0JveD0iMCAwIDQyLjcgNjAiPjxzdHlsZT4uc3Qwe2Zp%0D%0AbGw6IzAyNjQzZX0uc3Qxe2ZpbGw6I2ZmZn08L3N0eWxlPjxnIGlkPSJwcmVjaW5jdC1zY2ctZ2F0%0D%0AZS1hIj48cGF0aCBpZD0icGF0aC1wcmVjaW5jdC1zY2ctZ2F0ZS1hIiBjbGFzcz0ic3QwIiBkPSJN%0D%0AMjEuMyA2MGMtLjQgMC0uOC0uMi0xLjEtLjVDMTkuNCA1OC40IDAgMzIuNyAwIDIxLjMgMCA5LjYg%0D%0AOS42IDAgMjEuMyAwczIxLjMgOS42IDIxLjMgMjEuM2MwIDExLjQtMTkuNCAzNy0yMC4yIDM4LjEt%0D%0ALjIuNC0uNi42LTEuMS42eiIvPjxwYXRoIGNsYXNzPSJzdDEiIGQ9Ik0xNi4xIDM3LjlsMy4yLTEw%0D%0ALjRoMy4zbDMuMiAxMC40aC0yLjlsLS41LTIuMmgtMi45bC0uNSAyLjJoLTIuOXptNC01LjFsLS4x%0D%0ALjhoMS45bC0uMi0uN2MtLjEtLjUtLjMtMS0uNC0xLjYtLjEtLjYtLjMtMS4xLS40LTEuN2gtLjFj%0D%0ALS4xLjUtLjIgMS4xLS40IDEuNyAwIC41LS4xIDEtLjMgMS41ek02LjkgMTkuNWMwLS43LjEtMS4y%0D%0ALjMtMS44LjItLjUuNS0uOS44LTEuMy4zLS4zLjctLjYgMS4yLS44LjQtLjIuOS0uMyAxLjQtLjMu%0D%0ANSAwIDEgLjEgMS40LjMuNC4yLjcuNCAxIC43bC0xLjEgMS4zYy0uMi0uMi0uMy0uMy0uNS0uNC0u%0D%0AMi0uMS0uNC0uMS0uNy0uMS0uMiAwLS40LjEtLjYuMi0uMi4xLS40LjMtLjUuNC0uMS4yLS4zLjQt%0D%0ALjMuNy0uMi4zLS4zLjctLjMgMSAwIC43LjEgMS4zLjQgMS43LjMuNC43LjYgMS4yLjZoLjNjLjEg%0D%0AMCAuMi0uMS4yLS4xdi0xLjFoLTF2LTEuN0gxM3YzLjdjLS4xLjEtLjMuMi0uNS40bC0uNi4zYy0u%0D%0AMi4xLS40LjItLjcuMi0uMi4xLS41LjEtLjcuMS0uNSAwLTEtLjEtMS40LS4yLS40LS4zLS44LS41%0D%0ALTEuMS0uOC0uMy0uMy0uNi0uNy0uOC0xLjItLjItLjYtLjMtMS4yLS4zLTEuOHptMTEuOSAyLjJo%0D%0ALTIuMWwtLjQgMS43aC0yLjFsMi40LTcuOEgxOWwyLjQgNy44aC0yLjJsLS40LTEuN3ptLS40LTEu%0D%0ANmwtLjEtLjUtLjMtMS4yYy0uMS0uNC0uMi0uOS0uMy0xLjItLjEuNC0uMi44LS4zIDEuM2wtLjMg%0D%0AMS4yLS4xLjRoMS40em01LjMtMi45aC0yLjJ2LTEuN0gyOHYxLjdoLTIuMnY2LjFoLTIuMXYtNi4x%0D%0Aem01LjktMS43aDUuM3YxLjdoLTMuMnYxLjJoMi43djEuN2gtMi43djEuNEgzNXYxLjdoLTUuNHYt%0D%0ANy43eiIvPjwvZz48L3N2Zz4=");
    btnGateACricket.color = "transparent";
    btnGateACricket.background = "transparent";
    advancedTexture.addControl(btnGateACricket);
    btnGateACricket.width = "60px";
    btnGateACricket.height = "90px";
    btnGateACricket.linkWithMesh(locGateACricket);   
    btnGateACricket.linkOffsetY =-50;
    btnGateACricket.onPointerClickObservable.add(function(){
        advancedTexture.dispose();
        var scene1=createGateACricket();
        engine.stopRenderLoop();
        engine.runRenderLoop(function () {               
            scene1.render();
        })
    })

    var btnSydneyCricketGround = BABYLON.GUI.Button.CreateSimpleButton("btnSydneyCricketGround", "Sydney Cricket Ground");
    advancedTexture.addControl(btnSydneyCricketGround);
    btnSydneyCricketGround.width = "80px";
    btnSydneyCricketGround.height = "80px";
    btnSydneyCricketGround.color = "white";
    btnSydneyCricketGround.background = "gray";
    btnSydneyCricketGround.fontSize=15;
    btnSydneyCricketGround.linkWithMesh(locSydneyCricketGround);   
    btnSydneyCricketGround.linkOffsetY =-100;
    btnSydneyCricketGround.onPointerClickObservable.add(function(){
        advancedTexture.dispose();
        var scene1=createSydneyCricketGround();
        engine.stopRenderLoop();
        engine.runRenderLoop(function () {               
            scene1.render();
        })
    })

    var lineSydneyCricketGroundt = new BABYLON.GUI.Line();
    lineSydneyCricketGroundt.lineWidth = 2;
    lineSydneyCricketGroundt.color = "Gray";
    lineSydneyCricketGroundt.y2 = 20;
    lineSydneyCricketGroundt.linkOffsetY = -10;
    advancedTexture.addControl(lineSydneyCricketGroundt);
    lineSydneyCricketGroundt.linkWithMesh(locSydneyCricketGround); 
    lineSydneyCricketGroundt.connectedControl = btnSydneyCricketGround; 

    var btnStadiumForecourt = BABYLON.GUI.Button.CreateImageOnlyButton("btnStadiumForecourt", "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MyIgaGVpZ2h0%0D%0APSI2MCIgdmlld0JveD0iMCAwIDQzIDYwIj48cGF0aCBmaWxsPSIjMDAzNzgxIiBkPSJNMjEuNSA2%0D%0AMGMtLjQzMiAwLS44MzktLjIwMi0xLjEwMS0uNTQ2QzE5LjU3MyA1OC4zNjcuMTYxIDMyLjY5Ni4x%0D%0ANjEgMjEuMzM5LjE2MSA5LjU3MyA5LjczMyAwIDIxLjUgMHMyMS4zMzkgOS41NzMgMjEuMzM5IDIx%0D%0ALjMzOWMwIDExLjM1Ny0xOS40MTIgMzcuMDI4LTIwLjIzOCAzOC4xMTVBMS4zODQgMS4zODQgMCAw%0D%0AIDEgMjEuNSA2MHoiLz48cGF0aCBkPSJNNy44NjkgMTguMjM5SDYuNzNsLjYwNi0xLjk3OC41MzMg%0D%0AMS45Nzh6TTYuMTQgMjAuNDJsLjM4OC0xLjI5OWgxLjUzNGwuMzYzIDEuMjk5aDEuNDIxbC0xLjQx%0D%0AMi00Ljk1OGMtLjA4MS0uMjkyLS4yNTgtLjQyOC0uNTY2LS40MjhoLTIuMDF2LjQ2OGguMTY5Yy4y%0D%0AMSAwIC4zMjMuMDgyLjMyMy4yNDIgMCAuMTA2LS4wMjQuMTk0LS4xMDcuNDM2bC0xLjQxMiA0LjI0%0D%0ASDYuMTR6bTUuMzQ0IDB2LTQuOTczYzAtLjI1OS0uMTUyLS40MTMtLjQwMy0uNDEzSDkuODM4di40%0D%0ANjhoLjA4MWMuMjEgMCAuMjk4LjA4OS4yOTguM3Y0LjYxN2gxLjI2N3ptMi4xNTUgMHYtNC45NzNj%0D%0AMC0uMjU5LS4xNTQtLjQxMy0uNDA0LS40MTNoLTEuMjQzdi40NjhoLjA4Yy4yMTEgMCAuMjk5LjA4%0D%0AOS4yOTkuM3Y0LjYxN2gxLjI2OHptMi4yMTEtNC44OTRjMC0uMzYxLS4yNjctLjU4LS43MjctLjU4%0D%0ALS40NTIgMC0uNzI4LjIxOS0uNzI4LjU4IDAgLjM2NS4yNzYuNTgxLjcyOC41ODEuNDU5IDAgLjcy%0D%0ANy0uMjE2LjcyNy0uNTgxbS0uMDI0IDQuODk0di0zLjYyNWMwLS4yNTktLjE1NC0uNDExLS40MDUt%0D%0ALjQxMWgtMS4yMjZ2LjQ1OWguMDcyYy4yMSAwIC4yOTguMDk2LjI5OC4zMDd2My4yN2gxLjI2MXpt%0D%0AMi43NzUtMS45Mzl2Ljc4NWMtLjIxMS4yMTktLjQ2OC4zNDktLjY4Ni4zNDktLjIyNyAwLS4zMDct%0D%0ALjExMi0uMzA3LS40MTQgMC0uMjk5LjA2My0uNDM1LjI5LS41MjMuMTctLjA3NC4zODgtLjEzOC43%0D%0AMDMtLjE5N20tMS43MDUtLjk0MmMuNDIxLS4yMDIuODgxLS4zMTUgMS4yNDQtLjMxNS4zNCAwIC40%0D%0ANjEuMTIxLjQ2MS40NzR2LjA5Yy0uNTE2LjA4Mi0uNjc4LjExNC0uOTY5LjE3OS0uMTY4LjA0LS4z%0D%0AMjQuMDg3LS40NzguMTUzLS41MDkuMjA0LS43NS41OTgtLjc1IDEuMjAzIDAgLjc2Ny4zMzEgMS4x%0D%0AMzggMS4wMTcgMS4xMzguMjUgMCAuNDc3LS4wNDguNjc5LS4xMjguMTc3LS4wNzkuMjgyLS4xNDUu%0D%0ANTQxLS4zNDd2LjA1N2MwIC4yNDkuMTI4LjM3OC4zNzkuMzc4aDEuMTU0di0uNDM1aC0uMDU3Yy0u%0D%0AMjE3IDAtLjI5OC0uMDk4LS4yOTgtLjM1NXYtMS45MjNjMC0xLjAyNS0uMzU2LTEuMzgyLTEuMzgy%0D%0ALTEuMzgyLS4zMzEgMC0uNjUzLjA0Mi0uOTY3LjExNC0uMzE3LjA3Mi0uNDc5LjEzNy0uODU2LjMy%0D%0AM2wuMjgyLjc3NnptNS4xMTkgMi44ODF2LTIuNzI5Yy4yMTEtLjIzNS40MjgtLjM0LjY3OC0uMzQu%0D%0AMjY3IDAgLjMzMS4xMDUuMzMxLjUxMnYyLjU1OGgxLjI1OXYtMi43NDVjMC0uNjM5LS4wNDYtLjg0%0D%0ALS4yNDktMS4wNTctLjE3LS4xODctLjQyOC0uMjgzLS43Ni0uMjgzLS40OTMgMC0uODQuMTUzLTEu%0D%0AMzA2LjU4OXYtLjE2MWMwLS4yNTEtLjEzMS0uMzc5LS4zODktLjM3OWgtMS4xOTZ2LjQ1OWguMDcy%0D%0AYy4yMSAwIC4zLjA5Ni4zLjMwN3YzLjI3aDEuMjZ6bTYuMDA2LS44NDhoLTEuNzZsMS42OC0yLjM1%0D%0ANnYtLjgzM2gtMi42MzJjLS4yOTkgMC0uNDM2LjEzNy0uNDM2LjQzN3YuNzMzaC40Njh2LS4wNzJj%0D%0AMC0uMTg1LjA5Ny0uMjc0LjI5OC0uMjc0aC45MDZsLTEuNjk2IDIuMzgzdi44M2gzLjE3M3YtLjg0%0D%0AOHptNi42MTEuNzQ1di00LjU2M2MwLS4zNjMtLjEyOS0uNDg2LS40ODItLjQ4NmgtMS4wNjh2LjUx%0D%0AaC4wNjRjLjI0NCAwIC4yOTEuMDU1LjI5MS4zNDl2NC4xOTFoMS4xOTV6bS41MjcgMGgxLjE4N3Yt%0D%0AMy41NTRjMC0uMzU3LS4xMzgtLjQ4NS0uNDg2LS40ODVoLS43MDF2NC4wMzl6bS0yLjI0NiAwdi00%0D%0ALjAzOWgtLjcwM2MtLjM0OCAwLS40ODQuMTI5LS40ODQuNDg1djMuNTU0aDEuMTg3em00LjU1NC0y%0D%0ALjMxOWMwIDIuMDExLTEuNDQ2IDMuNDcyLTMuNDMyIDMuNDcyLTEuOTg3IDAtMy40MzItMS40NjIt%0D%0AMy40MzItMy40NzIgMC0yLjAxMSAxLjQ0Ni0zLjQ3MyAzLjQzMi0zLjQ3MyAxLjk4Ny0uMDAxIDMu%0D%0ANDMyIDEuNDcgMy40MzIgMy40NzNtLjcwMiAwYzAtMi4zNjQtMS43NjktNC4xMzUtNC4xMzQtNC4x%0D%0AMzUtMi4zNjcgMC00LjEzNSAxLjc3MS00LjEzNSA0LjEzNSAwIDIuMzY3IDEuNzY4IDQuMTM0IDQu%0D%0AMTM1IDQuMTM0IDIuMzY2LS4wMDEgNC4xMzQtMS43NjcgNC4xMzQtNC4xMzRNMTEuNDEzIDI3LjQ3%0D%0AYy0uODM4IDAtMS4yMDItLjMxMi0xLjIwMi0uMzEybC0uMDM5LS44NThzLjMzMS40MzUgMS4xNS40%0D%0AMzVjLjQ2OCAwIC43MTQtLjE4OS43MTQtLjU0NiAwLS4zMTItLjEyMy0uNDA5LS40NjgtLjYxbC0u%0D%0ANTA3LS4yOTJjLS4zNTEtLjIwMi0uODMxLS40ODEtLjgzMS0xLjIzNCAwLS43NzkuNDc0LTEuMjcz%0D%0AIDEuNDQyLTEuMjczLjczNCAwIDEuMTExLjMwNSAxLjExMS4zMDV2LjgyNXMtLjMxOC0uMzk2LTEu%0D%0AMDU5LS4zOTZjLS40NjEgMC0uNjEuMTg4LS42MS40NjhzLjIwOC4zOTYuNTA2LjU3MmwuNDgxLjI4%0D%0AYy40NzQuMjczLjgzMS41OTcuODMxIDEuMjczLjAwMS43OTEtLjQ2NyAxLjM2My0xLjUxOSAxLjM2%0D%0AM20zLjc3NC0uMTVzLS4yMTQuMTMtLjY4OS4xM2MtLjMwNSAwLS41OTEtLjA2NS0uNzg2LS4zMjUt%0D%0ALjE0OS0uMjAxLS4xNzUtLjQ2OC0uMTc1LS44MzF2LTEuNjgzaC0uMzUxdi0uNjE3aC4zNTF2LS41%0D%0ANzhsLjg5LS4xODJ2Ljc2aC43Nzl2LjYxN2gtLjc3OXYxLjYzN2MwIC4xNzUuMDEzLjMwNS4wNjUu%0D%0AMzkuMDU5LjA5MS4xNjkuMTU2LjMzMS4xNTYuMjg2IDAgLjM5Ni0uMTE3LjM5Ni0uMTE3bC0uMDMy%0D%0ALjY0M3ptMi4xOS4xMDR2LS40MjlzLS4xNzYuNDU1LS44NjQuNDU1Yy0uNzAyIDAtLjk2OC0uNTMz%0D%0ALS45NjgtMS4wNDYgMC0xLjA1My44NjQtMS4xMDQgMS40MjktMS4xMzFsLjM3Ny0uMDE5di0uMTU2%0D%0AYzAtLjIwMS0uMDEzLS41Mi0uNjI0LS41Mi0uNTU4IDAtLjg0NC4zMDUtLjg0NC4zMDV2LS42NzZz%0D%0ALjMxMi0uMjYgMS4wOTgtLjI2YzEuMTg5IDAgMS4yMjguNjg5IDEuMjI4IDEuMTE3djIuMzA2bC0u%0D%0AODMyLjA1NHptLS4wMi0xLjYzbC0uMjg2LjAyYy0uMzc3LjAyNi0uNjYzLjExNy0uNjYzLjUyNiAw%0D%0AIC4xOTUuMDg1LjQ0OC40NDkuNDQ4LjMwNSAwIC41LS4yMTQuNS0uNDg3di0uNTA3em0zLjQzMiAx%0D%0ALjYzN3YtLjQ0MnMtLjIwMS40NjgtLjg2NC40NjhjLS43NjcgMC0xLjIzNC0uNTg0LTEuMjM0LTEu%0D%0ANjc2IDAtMS42MDUuODMxLTEuODM5IDEuNDIzLTEuODM5LjQzNSAwIC42NjMuMjQuNjYzLjI0VjIy%0D%0ALjVsLjg5LS4xMDR2NC45N2wtLjg3OC4wNjV6bS0uMDEzLTIuNjE4cy0uMTM2LS4yMDEtLjQ4Ny0u%0D%0AMjAxYy0uNDc0IDAtLjY5NS4zMTItLjY5NSAxLjA3MnMuMjIxIDEuMDM5LjY1IDEuMDM5Yy4yODYg%0D%0AMCAuNTMzLS4xNjkuNTMzLS41Mzl2LTEuMzcxem0xLjgyMi0xLjQyM2MtLjMxOCAwLS41MDctLjE2%0D%0AOS0uNTA3LS40NDIgMC0uMzU3LjI1My0uNDY4LjUwNy0uNDY4LjMxOCAwIC41MDcuMTY5LjUwNy40%0D%0ANDIgMCAuMzU4LS4yNTMuNDY4LS41MDcuNDY4bS0uNDQ4LjYwNGguODk3djMuNDA0aC0uODk3di0z%0D%0ALjQwNHptMy4zNzkgMy40M3YtLjQ0MnMtLjI0Ny40NjgtLjk0Mi40NjhjLS4zMzEgMC0uNTY1LS4x%0D%0AMDQtLjcyOC0uMjUzLS4zMDUtLjI4Ni0uMzE4LS43MDItLjMxOC0uOTYydi0yLjI0MWguODl2Mi4w%0D%0AMDdjMCAuMzI0LjAwNy43MDguNTM5LjcwOC4yMzQgMCAuNTQ2LS4xMzYuNTQ2LS41MTN2LTIuMjAy%0D%0AaC44OXYzLjM3MWwtLjg3Ny4wNTl6bTUuMjg0LS4wMjZ2LTEuOTk0YzAtLjMzMi0uMDEzLS43MjEt%0D%0ALjUyLS43MjEtLjI3MyAwLS41NTIuMTUtLjU1Mi41MTN2Mi4yMDJoLS44OXYtMS45OTRjMC0uMzMy%0D%0ALS4wMTMtLjcyMS0uNTItLjcyMS0uMjczIDAtLjU1My4xNS0uNTUzLjUxM3YyLjIwMmgtLjg5di0z%0D%0ALjQwNGguODc3di40MTVzLjI0Ny0uNDY4LjkyOS0uNDY4Yy42OTUgMCAuODgzLjQ3NC44ODMuNDc0%0D%0Acy4yNi0uNDgxIDEuMDI3LS40ODFjLjIwOCAwIC41MjYuMDI2Ljc3My4yNTMuMjk4LjI3My4zMjUu%0D%0ANjQ5LjMyNS45ODF2Mi4yMjhoLS44ODl6IiBmaWxsPSIjRkZGIi8+PC9zdmc+");
    btnStadiumForecourt.color = "transparent";
    btnStadiumForecourt.background = "transparent";
    advancedTexture.addControl(btnStadiumForecourt);
    btnStadiumForecourt.width = "60px";
    btnStadiumForecourt.height = "90px";
    btnStadiumForecourt.linkWithMesh(locStadiumForecourt);   
    btnStadiumForecourt.linkOffsetY =-50;
    btnStadiumForecourt.onPointerClickObservable.add(function(){
        advancedTexture.dispose();
        var scene1=createStadiumForecourt();
        engine.stopRenderLoop();
        engine.runRenderLoop(function () {               
            scene1.render();
        })
    })

    // OPTIMIZE NOTIFICATION 
    optimizer.onNewOptimizationAppliedObservable.add(function () {
        txtOptimize.text = "Optimizing ...";
    });
    optimizer.onFailureObservable.add(function () {
        txtOptimize.text = "Optimized. Frame rate was " + optimizer.currentFrameRate;
    });

    var prePos=new BABYLON.Vector3.Zero();
    var preDir=new BABYLON.Vector3.Zero();

    scene.registerBeforeRender(function() {
        // Hiển thị FPS
        txtFps.text = 'FPS: ' + engine.getFps().toFixed();
        // Kiểm tra xem nếu user kích hoạt tính năng 'Optimize' thì sẽ thay đổi lại kích cỡ các button và dòng dữ hiển thị thông báo
        if (document.getElementById('optimize').hidden == true) {
            setTimeout(function(){
                txtOptimize.text = "";
                txtFps.top = -10;
                txtTimeMobile.top = 5;
           
                btnGateACricket.scaleX = 0.5;  
                btnKippaxLake.scaleX = 0.5;  
                btnNationalLeague.scaleX = 0.5;  
                btnParking.scaleX = 0.5; 
                btnStadium.scaleX = 0.5; 
                btnStadiumForecourt.scaleX = 0.5;  
                btnStadiumSportsPhysiotherapy.scaleX =  0.5;  
                btnSydneyCricketGround.scaleX = 0.5;  
                
                btnGateACricket.scaleY = 0.5;  
                btnKippaxLake.scaleY = 0.5;
                btnNationalLeague.scaleY = 0.5;
                btnParking.scaleY = 0.5;
                btnStadium.scaleY = 0.5;
                btnStadiumForecourt.scaleY = 0.5;
                btnStadiumSportsPhysiotherapy.scaleY = 0.5;
                btnSydneyCricketGround.scaleY = 0.5;

                btnGateACricket.linkOffsetY = -50;
                btnKippaxLake.linkOffsetY = -60;
                btnNationalLeague.linkOffsetY = -50; 
                btnParking.linkOffsetY = -50;
                btnStadium.linkOffsetY = -60;
                btnStadiumForecourt.linkOffsetY = -50;
                btnStadiumSportsPhysiotherapy.linkOffsetY = -50;
                btnSydneyCricketGround.linkOffsetY = -60;

                lineKippaxLake.linkOffsetY = -5;
                lineStadium.linkOffsetY = -5;
                lineSydneyCricketGroundt.linkOffsetY = -5;
            }, 10000)
        }

        // Kiểm tra xem nếu user kích hoạt tính năng 'Record' thì nếu user không di chuyển camera (xét cả vị trí và góc xoay) thì tọa độ đó sẽ không được lưu vào json
        if(Record)
        {
            var currentPos=new BABYLON.Vector3(camera.position.x,camera.position.y,camera.position.z);
            var currentDir=new BABYLON.Vector3(camera.rotation.x,camera.rotation.y,camera.rotation.z);
    
            if(Math.abs(prePos.x-currentPos.x)>1||Math.abs(prePos.y-currentPos.y)>1||Math.abs(prePos.z-currentPos.z)>1
                ||Math.abs(preDir.x-currentDir.x)>0.1||Math.abs(preDir.y-currentDir.y)>0.1||Math.abs(preDir.z-currentDir.z)>0.1){
                var point=new Point3(currentPos.x,currentPos.y,currentPos.z);
                RecordPointData.push(point);
                prePos=currentPos;
                var dir=new BABYLON.Vector3(camera.rotation.x, camera.rotation.y,camera.rotation.z);
                DirData.push(dir);
                preDir=currentDir;
            }
        }

        // Hiển thị thời gian còn lại của chế độ mobile
        if (timeMobile > 0)
            txtTimeMobile.text = 'Time Mobile: ' + timeMobile;
        // Hiển thị thông báo hết thời gian sử dụng mobile
        else if (timeMobile <= 0) {
            clearInterval(intervalTimeMobile);   
            txtTimeMobile.text = "Time's up";
        } 
        // Hiển thị thông báo chưa kích hoạt tính năng sử dụng mobile
        else
            txtTimeMobile.text = 'Mobile control not yet activated';
    })

    return scene;
}

///////////////////// 360 DEGREE IMAGE /////////////////////
var createStadium=function(){   // Scene chứa hình ảnh 360 của stadium
    var scene = new BABYLON.Scene(engine);
    var camera = new BABYLON.ArcRotateCamera("Camera", Math.PI / 2,  Math.PI / 2, 10, BABYLON.Vector3.Zero(), scene);
    var advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");      // Khởi tạo màn hình chứa button

    camera.attachControl(canvas, true);
    camera.lowerRadiusLimit = 1;
    camera.upperRadiusLimit = 25;   

    var stadium = new BABYLON.PhotoDome(
        "stadium",
        "https://raw.githubusercontent.com/KiritoNguyen/My_Image/master/MyImage/Phi/Stadium_3.jpg",
        {
            resolution: 100,
            size: 50
        },
        scene
    );
    createBtnClose(advancedTexture);
    createBtnSwitchScene(sceneStadium, sceneStadiumSportsPhysiotherapy, advancedTexture);   
    return scene;
}
var sceneStadium = createStadium();

var createParking=function(){
    var scene = new BABYLON.Scene(engine);
    var camera = new BABYLON.ArcRotateCamera("Camera", Math.PI / 2,  Math.PI / 2, 10, BABYLON.Vector3.Zero(), scene);
    var advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");      // Khởi tạo màn hình chứa button

    camera.attachControl(canvas, true);
    camera.lowerRadiusLimit = 1;
    camera.upperRadiusLimit = 25;   

    var Parking = new BABYLON.PhotoDome(
        "parking",
        "https://raw.githubusercontent.com/KiritoNguyen/My_Image/master/MyImage/Phi/Parking.jpg",
        {
            resolution: 100,
            size: 50
        },
        scene
    );
    createBtnClose(advancedTexture);
    createBtnSwitchScene(sceneStadium, sceneGateACricket, advancedTexture);      
    return scene;
}
var sceneParking = createParking();

var createNationalLeague=function(){
    var scene = new BABYLON.Scene(engine);
    var camera = new BABYLON.ArcRotateCamera("Camera", Math.PI / 2,  Math.PI / 2, 10, BABYLON.Vector3.Zero(), scene);
    var advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");      // Khởi tạo màn hình chứa button

    camera.attachControl(canvas, true);
    camera.lowerRadiusLimit = 1;
    camera.upperRadiusLimit = 25;   

    var national_league = new BABYLON.PhotoDome(
        "nationalLeague",
        "https://raw.githubusercontent.com/KiritoNguyen/My_Image/master/MyImage/Phi/National%20Rugby%20League.jpg",
        {
            resolution: 100,
            size: 50
        },
        scene
    );
    createBtnClose(advancedTexture);
    return scene;
}
var sceneNationalLeague = createNationalLeague();

var createStadiumSportsPhysiotherapy = function(){
    var scene = new BABYLON.Scene(engine);
    var camera = new BABYLON.ArcRotateCamera("Camera", Math.PI / 2,  Math.PI / 2, 10, BABYLON.Vector3.Zero(), scene);
    var advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");      // Khởi tạo màn hình chứa button

    camera.attachControl(canvas, true);
    camera.lowerRadiusLimit = 1;
    camera.upperRadiusLimit = 25;   

    var stadiumSportsPhysiotherapy = new BABYLON.PhotoDome(
        "stadiumSportsPhysiotherapy",
        "https://raw.githubusercontent.com/KiritoNguyen/My_Image/master/MyImage/Phi/STADIUM_SPORTS_PHYSIOTHERAPY.jpg",
        {
            resolution: 100,
            size: 50
        },
        scene
    );
    createBtnClose(advancedTexture);
    return scene;
}
var sceneStadiumSportsPhysiotherapy = createStadiumSportsPhysiotherapy();

var createGateACricket = function(){
    var scene = new BABYLON.Scene(engine);
    var camera = new BABYLON.ArcRotateCamera("Camera", Math.PI / 2,  Math.PI / 2, 10, BABYLON.Vector3.Zero(), scene);
    var advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");      // Khởi tạo màn hình chứa button

    camera.attachControl(canvas, true);
    camera.lowerRadiusLimit = 1;
    camera.upperRadiusLimit = 25;   

    var gateACricket = new BABYLON.PhotoDome(
        "gateA_Cricket",
        "https://raw.githubusercontent.com/KiritoNguyen/My_Image/master/MyImage/Phi/GATE_A.jpg",
        {
            resolution: 100,
            size: 50
        },
        scene
    );
    createBtnClose(advancedTexture);
    return scene;
}
var sceneGateACricket =createGateACricket();

var createSydneyCricketGround = function(){
    var scene = new BABYLON.Scene(engine);
    var camera = new BABYLON.ArcRotateCamera("Camera", Math.PI / 2,  Math.PI / 2, 10, BABYLON.Vector3.Zero(), scene);
    var advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");      // Khởi tạo màn hình chứa button

    camera.attachControl(canvas, true);
    camera.lowerRadiusLimit = 1;
    camera.upperRadiusLimit = 25;   

    var gateACricket = new BABYLON.PhotoDome(
        "sydneyCricketGround",
        "https://raw.githubusercontent.com/KiritoNguyen/My_Image/master/MyImage/Phi/Sydney_Cricket_Ground.jpg",
        {
            resolution: 100,
            size: 50
        },
        scene
    );
    createBtnClose(advancedTexture);
    return scene;
}
var sceneSydneyCricketGround =createSydneyCricketGround();

var createStadiumForecourt=function(){
    var scene = new BABYLON.Scene(engine);
    var camera = new BABYLON.ArcRotateCamera("Camera", Math.PI / 2,  Math.PI / 2, 10, BABYLON.Vector3.Zero(), scene);
    var advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");      // Khởi tạo màn hình chứa button

    camera.attachControl(canvas, true);
    camera.lowerRadiusLimit = 1;
    camera.upperRadiusLimit = 25;   

    var stadiumForecourt = new BABYLON.PhotoDome(
        "stadiumForecourt",
        "https://raw.githubusercontent.com/KiritoNguyen/My_Image/master/MyImage/Phi/ALLIANZ_STADIUM_FORECOURT.jpg",
        {
            resolution: 100,
            size: 50
        },
        scene
    );
    createBtnClose(advancedTexture);
    return scene;
}
var sceneStadiumForecourt = createStadiumForecourt();

var createLake=function(){
    var scene = new BABYLON.Scene(engine);
    var camera = new BABYLON.ArcRotateCamera("Camera", Math.PI / 2,  Math.PI / 2, 10, BABYLON.Vector3.Zero(), scene);
    var advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");      // Khởi tạo màn hình chứa button

    camera.attachControl(canvas, true);
    camera.lowerRadiusLimit = 1;
    camera.upperRadiusLimit = 25;   

    var lake = new BABYLON.PhotoDome(
        "lake",
        "assets/images/Kippax_Lake.jpg",
        {
            resolution: 100,
            size: 50
        },
        scene
    );
    createBtnClose(advancedTexture);
    return scene;
}
var sceneLake = createLake();

///////////// Register service worker /////////////
if('serviceWorker' in navigator) {
    navigator.serviceWorker
    .register('/service-worker.js')
    .then(function() { console.log("Service Worker Registered"); });
}

var sceneMap = createScene();  // Gán scene mặc định cho canvas
engine.runRenderLoop(function () {  // Update scene
    sceneMap.render(); // Render scene
});

// Resize
window.addEventListener("resize", function () {
    engine.resize();
});