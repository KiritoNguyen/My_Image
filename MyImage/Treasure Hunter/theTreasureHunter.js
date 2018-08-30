window.addEventListener('DOMContentLoaded', function () {       
    var canvas = document.getElementById('canvas');
    var engine = new BABYLON.Engine(canvas, true);

    // SOUND
    var backgroundSong;
    var gunshot;
    var explosion;

    // Value of time score attack
    var timeScoreAttack;      
    var intervalTimeScoreAttack;

    // Time variable of time rush
    var timeRush;

    // Time variable of battle tank
    var timeBattleTank;
    var intervalTimeBattleTank;
    // Light and camera variables
    var light, camera;
    
    // Environment variables
    var skybox;

    //Crate and array of crates
    var crate;
    var crates;

    var speed=1; //set speed

    var velocity=1;
    
    var flagEnergy=true;// check key energy

    var energy=0;
    var energyCount=setInterval(function(){energy++},2000);
    var treeList;
    var treeRootList;

    // Tank variables
    var tank, muzzleTank, muzzle;
    var enemyList=[];
    var enemySpeed=1;

    // default Value of Slider variable
    var sliderValue = 20;

    //Particle effect of giftBox
    var particleSystemBlow;

    // Text FPS
    var txtFps;

    var n = 1;  // number of continue

    var tankCreation = function(scene) {
        BABYLON.SceneLoader.ImportMesh("", "https://raw.githubusercontent.com/KiritoNguyen/My_Image/275d42382a314d6d0f7dfb27035bbc56b4431ef0/MyImage/Kiet/", "Tank.babylon", scene, function (newMeshes) {
            tank = newMeshes[0];
            tank.position = new BABYLON.Vector3(0, -4, 0);
            tank.scaling = new BABYLON.Vector3(0.8, 0.8, 0.8);
            tank.isPickable = false;

            // muzzleTank = newMeshes[1];
            // muzzleTank.position = new BABYLON.Vector3(0, 0, 3);
            // muzzleTank.scaling = new BABYLON.Vector3(0.8, 0.8, 0.8);
            // muzzleTank.isPickable = false;
        });

        muzzle = new BABYLON.MeshBuilder.CreateCylinder('muzzle', {height: 2}, scene);
        muzzle.visibility = 0;
        muzzle.isPickable = false;
    }

    //Function use to calculate Cast Ray
    function vecToLocal(vector, mesh){
        var m = mesh.getWorldMatrix();
        var v = BABYLON.Vector3.TransformCoordinates(vector, m);
        return v;		 
    }
    
    var enemyTankMoving=function(enemy,enemyPos,tankPos){
        var diffX=-tankPos.x+enemyPos.x;
        var diffY=-tankPos.z+enemyPos.z;
        enemy.rotation.y=Math.atan2(diffX,diffY);
        if(enemyPos.x-tankPos.x<20)
            enemyPos.x+=enemySpeed;
            else
                enemyPos.x-=enemySpeed;
        if(enemyPos.z-tankPos.z<20)
            enemyPos.z+=enemySpeed;
            else
                enemyPos.z-=enemySpeed;
    }

    var enemyTankCreation = function(scene) {
        BABYLON.SceneLoader.ImportMesh("", "https://raw.githubusercontent.com/KiritoNguyen/My_Image/275d42382a314d6d0f7dfb27035bbc56b4431ef0/MyImage/Kiet/", 
        "Tank.babylon", scene, function (newMeshes) {
            var enemy = newMeshes[0];
            enemyList = [enemy]
            enemy.scaling = new BABYLON.Vector3(0.8, 0.8, 0.8);
            enemy.position = new BABYLON.Vector3(Math.random()*300 - 100, -4, Math.random()*300 - 100)
            enemy.isPickable = true;

            for (var i = 0; i < 5; i++) {			
                var clone = enemy.clone("newEnemy");
                clone.position = new BABYLON.Vector3(Math.random()*300 - 100, -4, Math.random()*300 - 100);
                clone.isPickable = true;
                enemyList.push(clone);
               
            }
        });
        
    }

    var createLightAndCamera = function(scene) {
        ////////////////////// LIGHT /////////////////////////
        light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);
        light.intensity = 0.7;

        ////////////////////// CAMERA /////////////////////////
        camera = new BABYLON.ArcRotateCamera("arcRotateCamera", BABYLON.Tools.ToRadians(270), BABYLON.Tools.ToRadians(75), 75, new BABYLON.Vector3(0, 0, 0), scene);     
        //camera = new BABYLON.UniversalCamera("UniversalCamera", new BABYLON.Vector3(0, 3, -30), scene);
        
        camera.lowerRadiusLimit = 30;
        camera.upperRadiusLimit = 110;      
        camera.useBouncingBehavior = true; 
        camera.checkCollisions = true;
        // camera.lowerBetaLimit = Math.PI / 3;
        camera.upperBetaLimit = Math.PI / 2;
        camera.attachControl(canvas, true);
    }

    /////////////////////// ENVIRONMENT //////////////////////////
    var basicEnvironment = function(scene) {

        ////////////////////// TREE //////////////////////           
        BABYLON.SceneLoader.ImportMesh("", "https://raw.githubusercontent.com/BabylonJS/Website/master/Assets/Tree/", "tree.babylon", 
        scene, function (newMeshes) {

            var mesh = newMeshes[0];
            treeList=[mesh];
            mesh.position = new BABYLON.Vector3(10, -5, 0);
            mesh.scaling = new BABYLON.Vector3(100, 100, 100);
            mesh.isPickable=false;

            var treeRoot=new BABYLON.MeshBuilder.CreateCylinder("treeRoot",{height:50,diameter:6},scene);
            treeRoot.isVisible=false;
            treeRootList=[treeRoot];
            treeRoot.position=new BABYLON.Vector3(mesh.position.x,mesh.position.y,mesh.position.z);
            treeRootList.push(treeRoot);

            for (var i = 0; i < 20; i++) {			
                newMeshes.forEach(function (m) {
                    var clone = m.clone("newtree");
                    var treeClone=treeRoot.clone("treeRoot");
                    clone.position = new BABYLON.Vector3(Math.random()*300 - 100, -5, Math.random()*300 - 100);
                    treeRoot.position=new BABYLON.Vector3(clone.position.x, clone.position.y, clone.position.z);
                    clone.isPickable = false;
                    treeRoot.isPickable = false;
                    treeRoot.isVisible=false;
                    treeList.push(clone);
                    treeRootList.push(treeClone);
                });
            }
        });

        ///////////////////////// Skybox /////////////////////////
        skybox = BABYLON.Mesh.CreateBox("skyBox", 600.0, scene);
        // skybox.checkCollisions = true;
        
        skybox.material = new BABYLON.StandardMaterial("skyBox", scene);
        skybox.material.backFaceCulling = false;
        skybox.material.reflectionTexture = new BABYLON.CubeTexture("https://raw.githubusercontent.com/BabylonJS/Website/master/Assets/skybox/snow", scene);
        skybox.material.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
        skybox.material.diffuseColor = new BABYLON.Color3(0, 0, 0);
        skybox.material.specularColor = new BABYLON.Color3(0, 0, 0);
        skybox.material.disableLighting = true;

        var skybox_ground = new BABYLON.MeshBuilder.CreateGround('skybox_ground', {width: 600, height: 600}, scene);
        skybox_ground.position.y = -124;     

        ///////////////// GROUND ///////////////////
        var ground = new BABYLON.MeshBuilder.CreateGround('ground', {width: 400, height: 400}, scene);
        ground.position.y = -5;
        ground.checkCollisions = true;

        ground.material = new BABYLON.StandardMaterial('groundMaterial', scene);
        ground.material.diffuseTexture = new BABYLON.Texture('https://raw.githubusercontent.com/KiritoNguyen/My_Image/master/MyImage/Kiet/snow_texture.jpg', scene);
        ground.material.backFaceCulling = false;
        
        ground.physicsImpostor = new BABYLON.PhysicsImpostor(ground,  BABYLON.PhysicsImpostor.BoxImpostor, {mass: 0, restitution: 0.0}, scene);       

        //////////// Invisible wall ///////////
        var inviWallFront = new BABYLON.MeshBuilder.CreatePlane('inviWallFront', {size: 400}, scene);
        var inviWallBack = new BABYLON.MeshBuilder.CreatePlane('inviWallBack', {size: 400}, scene);
        var inviWallLeft = new BABYLON.MeshBuilder.CreatePlane('inviWallLeft', {size: 400}, scene);
        var inviWallRight = new BABYLON.MeshBuilder.CreatePlane('inviWallRight', {size: 400}, scene);

        inviWallFront.visibility = 0;
        inviWallBack.visibility = 0;
        inviWallLeft.visibility = 0;
        inviWallRight.visibility = 0;

        inviWallFront.isPickable = false;
        inviWallBack.isPickable = false;
        inviWallLeft.isPickable = false;
        inviWallRight.isPickable = false;

        inviWallFront.position = new BABYLON.Vector3(0, 0, -200);
        inviWallBack.position = new BABYLON.Vector3(0, 0, 200);
        inviWallLeft.position = new BABYLON.Vector3(-200, 0, 0);
        inviWallRight.position = new BABYLON.Vector3(200, 0, 0);

        inviWallLeft.rotation.y = Math.PI / 2;
        inviWallRight.rotation.y = Math.PI / 2;

        inviWallFront.physicsImpostor = new BABYLON.PhysicsImpostor(inviWallFront,  BABYLON.PhysicsImpostor.BoxImpostor, {mass: 0, restitution: 0.0}, scene);   
        inviWallBack.physicsImpostor = new BABYLON.PhysicsImpostor(inviWallBack,  BABYLON.PhysicsImpostor.BoxImpostor, {mass: 0, restitution: 0.0}, scene);   
        inviWallLeft.physicsImpostor = new BABYLON.PhysicsImpostor(inviWallLeft,  BABYLON.PhysicsImpostor.BoxImpostor, {mass: 0, restitution: 0.0}, scene);   
        inviWallRight.physicsImpostor = new BABYLON.PhysicsImpostor(inviWallRight,  BABYLON.PhysicsImpostor.BoxImpostor, {mass: 0, restitution: 0.0}, scene);  

        /////////////////// FOG ////////////////////
        scene.fogMode = BABYLON.Scene.FOGMODE_EXP2;
        scene.fogDensity = 0.008;
        scene.fogColor = new BABYLON.Color3(0.9, 0.9, 0.85);
    }       

    /////////////////////// SOUND ///////////////////////////
    var soundManager = function(scene) {
        gunshot = new BABYLON.Sound("gunshot", "https://raw.githubusercontent.com/tranminhquan/Metroid_Game_2/master/Metroid/Resources/sound/sfx/bullet.wav", scene);
        explosion = new BABYLON.Sound('explosion', 'https://raw.githubusercontent.com/KiritoNguyen/My_Image/master/MyImage/Kiet/Explosion%2B6.wav', scene);
        explosion.setVolume(0.2);
    } 

    //////////////////// EfFECT SNOW DROP ///////////////////////
    var snowDropEffect = function(scene) {
        // Create Invisible box use for drop particle
        var fountain = new BABYLON.Mesh.CreateBox('fountain', 1, scene);
        fountain.position = new BABYLON.Vector3(0, 25, 0);
        fountain.visibility = 0;

        // Create a particle system
        var particleSystem = new BABYLON.ParticleSystem("particles", 10000, scene);

        //Texture of each particle
        particleSystem.particleTexture = new BABYLON.Texture("https://raw.githubusercontent.com/KiritoNguyen/My_Image/master/MyImage/Phi/starburst_white_300_drop_2.png", scene);           

        // Where the particles come from
        particleSystem.emitter = fountain; // the starting object, the emitter
        particleSystem.minEmitBox = new BABYLON.Vector3(-200, 20, -200); // Starting all from
        particleSystem.maxEmitBox = new BABYLON.Vector3(200, 20, 200); // To...

        // Colors of all particles
        particleSystem.color1 = new BABYLON.Color4(1, 1, 1.0, 1.0);
        particleSystem.color2 = new BABYLON.Color4(1, 1, 1.0, 1.0);
        particleSystem.colorDead = new BABYLON.Color4(1, 1, 1, 0.0);

        // Size of each particle (random between...
        particleSystem.minSize = 0.2;
        particleSystem.maxSize = 0.7;

        // Life time of each particle (random between...
        particleSystem.minLifeTime = 0.3;
        particleSystem.maxLifeTime = 3.5;

        // Emission rate
        particleSystem.emitRate = 8000;

        // Blend mode : BLENDMODE_ONEONE, or BLENDMODE_STANDARD
        particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_STANDARD;
        
        // Set the gravity of all particles
        particleSystem.gravity = new BABYLON.Vector3(0, 9.81, 0);                

        // Direction of each particle after it has been emitted
        particleSystem.direction1 = new BABYLON.Vector3(-7, -10, 3);
        particleSystem.direction2 = new BABYLON.Vector3(7, -10, -3);

        // Angular speed, in radians
        particleSystem.minAngularSpeed = 0;
        particleSystem.maxAngularSpeed = Math.PI;

        // Speed
        particleSystem.minEmitPower = 1;
        particleSystem.maxEmitPower = 3;
        particleSystem.updateSpeed = 0.005;
        
        // Start the particle system
        particleSystem.start();
    }

    //////////////////// EfFECT GIFTBOX BLOW ///////////////////////
    var giftBoxBlowEffect = function(scene) {
        // Create Invisible box use for drop particle
        particleSystemBlow = new BABYLON.ParticleSystem('particleBlow', 5000, scene);

        //Texture of each particle
        particleSystemBlow.particleTexture = new BABYLON.Texture("https://raw.githubusercontent.com/BabylonJS/Website/master/Assets/Flare.png", scene);

        // Colors of all particles
        particleSystemBlow.color1 = new BABYLON.Color4(1, 1, 0, 1.0);
        particleSystemBlow.color2 = new BABYLON.Color4(1, 0, 1.0, 1.0);
        particleSystemBlow.colorDead = new BABYLON.Color4(0.1, 0, 0.2, 0.0);

        // Size of each particle (random between...
        particleSystemBlow.minSize = 0.5;
        particleSystemBlow.maxSize = 1.0;

        // Life time of each particle (random between...
        particleSystemBlow.minLifeTime = 1;
        particleSystemBlow.maxLifeTime = 3;

        // Emission rate
        particleSystemBlow.emitRate = 2000;

        // Blend mode : BLENDMODE_ONEONE, or BLENDMODE_STANDARD
        particleSystemBlow.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE;
        
        // Set the gravity of all particles
        particleSystemBlow.gravity = new BABYLON.Vector3(0, -9.81, 0);

        // Direction of each particle after it has been emitted
        particleSystemBlow.direction1 = new BABYLON.Vector3(-5, 5, 5);
        particleSystemBlow.direction2 = new BABYLON.Vector3(5, 5, -5);

        // Speed
        particleSystemBlow.minEmitPower = 3;
        particleSystemBlow.maxEmitPower = 5;
    }            

    ///////////// GUI CHANGE COLOR OF TANK ////////////
    var changeColorTank = function(advancedTexture, material) {
        var panelColor = new BABYLON.GUI.StackPanel();
        panelColor.width = "200px";
        panelColor.isVertical = true;
        panelColor.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        panelColor.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        panelColor.top = '160px';
        panelColor.left = '30px';
        advancedTexture.addControl(panelColor);

        var textBlock = new BABYLON.GUI.TextBlock();
        textBlock.text = "Tank color:";
        textBlock.height = "30px";
        textBlock.color = 'red';
        panelColor.addControl(textBlock);     

        var picker = new BABYLON.GUI.ColorPicker();
        picker.value = material.diffuseColor;
        picker.height = "100px";
        picker.width = "100px";
        picker.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        picker.onValueChangedObservable.add(function(value) { // value is a color3s
            material.diffuseColor.copyFrom(value);
        });
        panelColor.addControl(picker);
    }  

    ///////////// GUI OPTION ////////////
    var optionGUI = function(advancedTexture, scene) {
        var btnOption = BABYLON.GUI.Button.CreateSimpleButton("btnOption", "Advanced Option");
        btnOption.width = 0.08;
        btnOption.height = "50px";
        btnOption.cornerRadius = 20;
        btnOption.color = "Orange";
        btnOption.thickness = 4;
        btnOption.background = "green";
        btnOption.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        btnOption.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        btnOption.top = "110px";
        btnOption.left = "-10px";   

        var btnChangeCamera = BABYLON.GUI.Button.CreateSimpleButton("btnChangeCamera", "Free Camera");
        btnChangeCamera.width = 0.08;
        btnChangeCamera.height = "50px";
        btnChangeCamera.cornerRadius = 20;
        btnChangeCamera.color = "Orange";
        btnChangeCamera.thickness = 4;
        btnChangeCamera.background = "green";
        btnChangeCamera.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
        btnChangeCamera.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        btnChangeCamera.top = "-10px";
        btnChangeCamera.left = "-10px";   

        var panelFPS = new BABYLON.GUI.StackPanel();
        panelFPS.width = "80px"
        panelFPS.height = "20px"
        panelFPS.top = -10;
        panelFPS.left = 10;
        panelFPS.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        panelFPS.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
        panelFPS.background = 'blue';

        txtFps = new BABYLON.GUI.TextBlock()
        txtFps.color="yellow";

        panelFPS.addControl(txtFps);

        ////////// CHECK BOX ///////////
        var panelCheckBox = new BABYLON.GUI.StackPanel();
        panelCheckBox.width = "20px";
        panelCheckBox.height = "100px";
        panelCheckBox.isVertical = true;
        panelCheckBox.top = '20px';
        panelCheckBox.left = '-140px';
        panelCheckBox.background = 'red';
        panelCheckBox.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;

        var cbSkyBox = new BABYLON.GUI.Checkbox('cbSkyBox');
        cbSkyBox.width = "20px";
        cbSkyBox.height = "20px";
        cbSkyBox.isChecked = true;
        cbSkyBox.color = "green";            
        panelCheckBox.addControl(cbSkyBox);  

        var cbSnow = new BABYLON.GUI.Checkbox('cbSnow');
        cbSnow.width = "20px";
        cbSnow.height = "20px";
        cbSnow.isChecked = true;
        cbSnow.color = "green";     
        panelCheckBox.addControl(cbSnow);  

        var cbFog = new BABYLON.GUI.Checkbox('cbFog');
        cbFog.width = "20px";
        cbFog.height = "20px";
        cbFog.isChecked = true;
        cbFog.color = "green";     
        panelCheckBox.addControl(cbFog);  

        var cbBackgroundSong = new BABYLON.GUI.Checkbox('cbBackgroundSong');
        cbBackgroundSong.width = "20px";
        cbBackgroundSong.height = "20px";
        cbBackgroundSong.isChecked = true;
        cbBackgroundSong.color = "green";     
        panelCheckBox.addControl(cbBackgroundSong);  

        var cbEffectSound = new BABYLON.GUI.Checkbox('cbEffectSound');
        cbEffectSound.width = "20px";
        cbEffectSound.height = "20px";
        cbEffectSound.isChecked = true;
        cbEffectSound.color = "green";     
        panelCheckBox.addControl(cbEffectSound);  

        ////////// HEADER CHECK BOX ///////////
        var panelHeaderCheckBox = new BABYLON.GUI.StackPanel();
        panelHeaderCheckBox.width = "140px";
        panelHeaderCheckBox.height = "100px";
        panelHeaderCheckBox.isVertical = true;
        panelHeaderCheckBox.top = '20px';
        panelHeaderCheckBox.background = 'yellow';
        panelHeaderCheckBox.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        panelHeaderCheckBox.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        
        var headerSkybox = new BABYLON.GUI.TextBlock();
        headerSkybox.text = "SKYBOX";
        headerSkybox.width = "140px";
        headerSkybox.height = '20px';
        headerSkybox.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        headerSkybox.color = "blue";
        panelHeaderCheckBox.addControl(headerSkybox);

        var headerSnow = new BABYLON.GUI.TextBlock();
        headerSnow.text = "SNOW";
        headerSnow.width = "180px";
        headerSnow.width = "140px";
        headerSnow.height = '20px';
        headerSnow.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        headerSnow.color = "blue";
        panelHeaderCheckBox.addControl(headerSnow);  

        var headerFog = new BABYLON.GUI.TextBlock();
        headerFog.text = "FOG";
        headerFog.width = "180px";
        headerFog.width = "140px";
        headerFog.height = '20px';
        headerFog.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        headerFog.color = "blue";
        panelHeaderCheckBox.addControl(headerFog);                 

        var headerBackgroundSong = new BABYLON.GUI.TextBlock();
        headerBackgroundSong.text = "MUSIC";
        headerBackgroundSong.width = "140px";
        headerBackgroundSong.height = '20px';
        headerBackgroundSong.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        headerBackgroundSong.color = "blue";
        panelHeaderCheckBox.addControl(headerBackgroundSong);

        var headerEffectSound = new BABYLON.GUI.TextBlock();
        headerEffectSound.text = "EFFECT SOUND";
        headerEffectSound.width = "140px";
        headerEffectSound.height = '20px';
        headerEffectSound.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        headerEffectSound.color = "blue";
        panelHeaderCheckBox.addControl(headerEffectSound);
       
        btnOption.onPointerClickObservable.add(function() {
            scene.debugLayer.hide();
            scene.debugLayer.show();  
        });

        var clicks = 0;
        btnChangeCamera.onPointerClickObservable.add(function() {
            if (clicks % 2 == 0) {
                console.log(clicks);
                camera.dispose();
                camera = new BABYLON.FreeCamera("freeCamera", new BABYLON.Vector3(tank.position.x + 30, tank.position.y + 30, tank.position.z + 30), scene); 
                btnChangeCamera.children[0].text = 'Arc Rotate Camera';
                camera.checkCollisions = true;
                camera.attachControl(canvas, true);
            }
            else {
                console.log(clicks);
                camera.dispose();
                btnChangeCamera.children[0].text = 'Free Camera';
                camera = new BABYLON.ArcRotateCamera("arcRotateCamera", BABYLON.Tools.ToRadians(270), BABYLON.Tools.ToRadians(75), 75, 
                new BABYLON.Vector3(tank.position.x, tank.position.y + 30, tank.position.z + 30), scene); 
                camera.lowerRadiusLimit = 30;
                camera.upperRadiusLimit = 110;      
                camera.useBouncingBehavior = true; 
                camera.checkCollisions = true;
                camera.upperBetaLimit = Math.PI / 2;
                camera.attachControl(canvas, true); 
            }
            clicks++;
        });

        cbSkyBox.onIsCheckedChangedObservable.add(function(value) {
            skybox.isVisible = value;
        });

        cbSnow.onIsCheckedChangedObservable.add(function(value) {
            scene.particlesEnabled = value;
        });

        cbFog.onIsCheckedChangedObservable.add(function(value) {
            scene.fogEnabled = value;
        });

        cbBackgroundSong.onIsCheckedChangedObservable.add(function(value) {
            if (value == true)
                backgroundSong.play();
            else
                backgroundSong.pause();
        });

        cbEffectSound.onIsCheckedChangedObservable.add(function(value) {
            scene.audioEnabled = value;
        });   

        advancedTexture.addControl(btnOption);
        advancedTexture.addControl(btnChangeCamera);
        advancedTexture.addControl(panelCheckBox);
        advancedTexture.addControl(panelHeaderCheckBox);
        advancedTexture.addControl(panelFPS);
    }
    ////////////////////////////////////////////////////////////////////////////

    var createScene = function () {
        // This creates a basic Babylon Scene object (non-mesh)
        var scene = new BABYLON.Scene(engine);
        scene.clearColor = new BABYLON.Color3.Black();
        
        createLightAndCamera(scene);

        ///////////////////////// MENU //////////////////////
        var advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

        var panel = new BABYLON.GUI.StackPanel();
        panel.width = "1200px";
        panel.height="80px";
        panel.isVertical = true;
        panel.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        panel.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        panel.top="-200px";

        var name = new BABYLON.GUI.TextBlock();
        name.text = "THE TREASURE HUNTER";
        name.color = "yellow";
        name.height = "100px";
        name.fontSize = 100;
        name.paddingTop=-20;
        name.fontFamily ="Algerian";
        name.fontStyle ="bold italic";
        panel.addControl(name); 

        var btnTimeRush = BABYLON.GUI.Button.CreateImageButton("btnTimeRush", "Time Rush", 
        'https://raw.githubusercontent.com/KiritoNguyen/My_Image/master/MyImage/Nhan/Time.png');
        btnTimeRush.width = 0.27;
        btnTimeRush.height = "70px";
        btnTimeRush.cornerRadius = 20;
        btnTimeRush.color = "Orange";
        btnTimeRush.thickness = 4;
        btnTimeRush.background = "green";
        btnTimeRush.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        btnTimeRush.children[0].fontSize=40;
        btnTimeRush.children[0].fontFamily ="Jokerman";

        var btnScoreAttack = BABYLON.GUI.Button.CreateImageButton("btnScoreAttack", "Score Attack", 
        'https://raw.githubusercontent.com/KiritoNguyen/My_Image/master/MyImage/Nhan/score.png');
        btnScoreAttack.width = 0.27;
        btnScoreAttack.height = "70px";
        btnScoreAttack.cornerRadius = 20;
        btnScoreAttack.color = "Orange";
        btnScoreAttack.thickness = 4;
        btnScoreAttack.background = "green";
        btnScoreAttack.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        btnScoreAttack.top="100px";
        btnScoreAttack.children[0].fontSize=40;
        btnScoreAttack.children[0].fontFamily ="Jokerman";

        var btnBattleTank = BABYLON.GUI.Button.CreateImageButton("btnBattleTank", "Battle Tank", 
        'https://raw.githubusercontent.com/KiritoNguyen/My_Image/master/MyImage/Nhan/tankBattle.png');
        btnBattleTank.width = 0.27;
        btnBattleTank.height = "70px";
        btnBattleTank.cornerRadius = 20;
        btnBattleTank.color = "Orange";
        btnBattleTank.thickness = 4;
        btnBattleTank.background = "green";
        btnBattleTank.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        btnBattleTank.top="200px";
        btnBattleTank.children[0].fontSize=40;
        btnBattleTank.children[0].fontFamily ="Jokerman";

        advancedTexture.addControl(panel); 
        advancedTexture.addControl(btnTimeRush); 
        advancedTexture.addControl(btnScoreAttack);
        advancedTexture.addControl(btnBattleTank);

        // Background Song
        backgroundSong = new BABYLON.Sound('backgroundSong', 'https://raw.githubusercontent.com/KiritoNguyen/My_Image/master/MyImage/Kiet/05%20-%20Calderock%20Village%20(SEA).mp3', scene, null, {loop: true, autoplay: true});           
        backgroundSong.setVolume(0.5);

        //scene 1
        var scene1 = createSceneSlider();

        //scene 3
        var scene3 = createSceneBattleTank();

        //scene 2
        var scene2 = createSceneScoreAttack();

        var advancedTexture;
        var createGUI = function(showScene) {             
            switch (showScene) {
                case 0:
                    advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI", true, scene);
                break
                case 1:            
                    advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI", true, scene1);
                break
                case 2:                              
                    advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI", true, scene2);
                break
                case 3:            
                    advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI", true, scene3);
                break
            }

            btnTimeRush.onPointerClickObservable.add(function() {       
                timeRush = 0;     
                clearInterval(intervalTimeScoreAttack);  
                clearInterval(intervalTimeBattleTank);    
                change(1);
            })
            btnScoreAttack.onPointerClickObservable.add(function(){     
                timeScoreAttack = 60;
                clearInterval(intervalTimeBattleTank);
                change(2);
            })
            btnBattleTank.onPointerClickObservable.add(function(){   
                timeBattleTank = 0;
                clearInterval(intervalTimeScoreAttack); 
                change(3);
            })
        }
        createGUI(0);

        var change = function(showScene) {
            engine.stopRenderLoop();

            engine.runRenderLoop(function () {         
                switch (showScene) {
                    case 0:                    
                        advancedTexture.dispose();
                        createGUI(showScene);
                        scene.render();
                    break
                    case 1:
                        advancedTexture.dispose();
                        createGUI(showScene);
                        btnScoreAttack.dispose();
                        btnTimeRush.dispose();
                        btnBattleTank.dispose();
                        scene1.render();
                    break
                    case 2:
                        advancedTexture.dispose();
                        createGUI(showScene);
                        btnScoreAttack.dispose();
                        btnTimeRush.dispose();
                        btnBattleTank.dispose();           
                        scene2.render();
                    break
                    case 3:
                        advancedTexture.dispose();
                        createGUI(showScene);
                        btnScoreAttack.dispose();
                        btnTimeRush.dispose();
                        btnBattleTank.dispose();
                        scene3.render();
                    break
                }
            }
        )}            
        return scene;
    };

    var createSceneSlider = function() {
        var scene = new BABYLON.Scene(engine);
        scene.clearColor = new BABYLON.Color3.Black();
        createLightAndCamera(scene);   

        var advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

        var panel = new BABYLON.GUI.StackPanel();
        panel.width = "220px";
        panel.height = '200px';
        panel.background = 'white';
        panel.horizontalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        panel.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        advancedTexture.addControl(panel);

        var header = new BABYLON.GUI.TextBlock();
        header.text = "Number of crates: 20";
        header.height = "30px";
        header.color = "red";
        panel.addControl(header); 

        var slider = new BABYLON.GUI.Slider();
        slider.minimum = 5;
        slider.maximum = 100;
        slider.value = 20;
        slider.height = "20px";
        slider.width = "200px";
        slider.onValueChangedObservable.add(function(value) {
            header.text = "Number of crates: " + Math.round(value);
            sliderValue = Math.round(value);
        });
        panel.addControl(slider);   

        var btnStart = BABYLON.GUI.Button.CreateSimpleButton("btnStart", "START GAME");
        btnStart.width = 0.12;
        btnStart.height = "80px";
        btnStart.cornerRadius = 20;
        btnStart.color = "Orange";
        btnStart.thickness = 4;
        btnStart.background = "green";
        btnStart.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        btnStart.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        btnStart.top = 20;
        advancedTexture.addControl(btnStart);

        btnStart.onPointerClickObservable.add(function() {
            engine.stopRenderLoop();
            var game = createSceneTimeRush(); 
            engine.runRenderLoop(function () {
                advancedTexture.dispose();
                btnStart.dispose();
                game.render(); // Khởi tạo mới sau khi nhấn start             
            })
        });

        return scene;
    }

    var createSceneTimeRush = function() {
        var scene = new BABYLON.Scene(engine);

        var gravityVector = new BABYLON.Vector3(0,-9.81, 0);
        var physicsPlugin = new BABYLON.CannonJSPlugin();
        scene.enablePhysics(gravityVector, physicsPlugin);

        createLightAndCamera(scene);
        tankCreation(scene);
        snowDropEffect(scene);
        giftBoxBlowEffect(scene);
        basicEnvironment(scene);
        // changeColorTank(advancedTexture, tank.material);
        soundManager(scene);

        /////////////////////// CRATES ///////////////////////
        function rand() {
            let sign = Math.random() < 0.5;
            return Math.random() * (sign ? 1 : -1);
        }

        function cratePosition(crate) {
            crate.position.y = 20;
            crate.position.x = rand() * 50;
            crate.position.z = rand() * 50;
        }

        crate = BABYLON.MeshBuilder.CreateBox("crate0", {size: 8}, scene);  
        crate.checkCollisions = true;
        cratePosition(crate);
        crates = [crate];

        for (let i = 0; i < sliderValue - 1; i++) {
            let b = crate.clone("crate" + (i + 1));
            cratePosition(b)
            crates.push(b);
        }  
        
        var crateMaterial = new BABYLON.StandardMaterial("crateMaterial", scene);
        crateMaterial.diffuseTexture = new BABYLON.Texture("https://thumbs.dreamstime.com/b/plain-wood-crate-one-side-wooden-63453318.jpg", scene);
        crateMaterial.diffuseTexture.hasAlpha = true;          
        
        crates.forEach(crate => {
            crate.material = crateMaterial;
            crate.physicsImpostor = new BABYLON.PhysicsImpostor(crate, BABYLON.PhysicsImpostor.BoxImpostor, {mass: 1, restitution: 0.9});
        });

        /////////////////// RAY CAST ////////////////////
        var ray = new BABYLON.Ray();
        var rayHelper = new BABYLON.RayHelper(ray);
        
        var localMeshDirection = new BABYLON.Vector3(3, 0, 0);
        var localMeshOrigin = new BABYLON.Vector3(0, 1.5, 0);
        var length = 6;

        rayHelper.attachToMesh(muzzle, localMeshDirection, localMeshOrigin, length);        

        //////////// TIME COUNT ///////////////
        var timeCount = setInterval(function(){timeRush++}, 1000);  

        /////////////////// CONTROL ////////////////////
        var Control = function() {
            scene.actionManager = new BABYLON.ActionManager(scene);
            var map = {}; //object for multiple key presses

            scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyDownTrigger, function (evt) {
                map[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";

            }));

            scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyUpTrigger, function (evt) {
                map[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";
            }));


            /****************************Move Tank*****************************/

            scene.registerAfterRender(function () {
                camera.setTarget(tank.position);
                if ((map["w"] || map["W"])) {
                    if(pickResult.pickedPoint.z > tank.position.z)
                    {
                        tank.position.z +=speed*Math.abs(Math.sin(Math.atan(a)));
                        tank.position.x=(tank.position.z-b)/a;

                    }
                    else if(pickResult.pickedPoint.z<tank.position.z)
                    {
                        tank.position.z -= speed*Math.abs(Math.sin(Math.atan(a)));
                        tank.position.x=(tank.position.z-b)/a;
                    }
                };

                if ((map["s"] || map["S"])) {
                    if(pickResult.pickedPoint.z>tank.position.z)
                        {
                            tank.position.z -= speed*Math.abs(Math.sin(Math.atan(a)));
                            tank.position.x=(tank.position.z-b)/a;
                        }
                    else if(pickResult.pickedPoint.z<tank.position.z)
                    {
                        tank.position.z += speed*Math.abs(Math.sin(Math.atan(a)));   
                        tank.position.x=(tank.position.z-b)/a;
                    }
                };
            });

            scene.actionManager.registerAction(
                new BABYLON.ExecuteCodeAction(
                    {
                        trigger: BABYLON.ActionManager.OnKeyDownTrigger,
                        parameter: 'v'
                    },
                    function() {
                        castRay();
                        rayHelper.show(scene, new BABYLON.Color3.Green());
                        gunshot.play();
                        setTimeout(function(){rayHelper.hide()}, 100);
                    }
                )
            )
            scene.actionManager.registerAction(
            new BABYLON.ExecuteCodeAction(
                {
                    trigger: BABYLON.ActionManager.OnKeyDownTrigger,
                    parameter: 'e'
                },
                function() {
                    if(energy>0){
                    flagEnergy=false;
                    speed=velocity*2; 
                    energy--;
                    }
                })
            )
            scene.actionManager.registerAction(
                new BABYLON.ExecuteCodeAction(
                    {
                        trigger: BABYLON.ActionManager.OnKeyUpTrigger,
                        parameter: 'e'
                    },
                    function() {
                        flagEnergy=true;
                    }
                )
            )
        }

        /////////////////////////// GUI ////////////////////////////
        var advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

        var textEndGame = new BABYLON.GUI.TextBlock();
        textEndGame.color = "green";
        textEndGame.fontSize = 30;
        textEndGame.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        textEndGame.top = "15px";

        var textTime = new BABYLON.GUI.TextBlock();
        textTime.color = "white";
        textTime.fontSize = 50;
        textTime.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        textTime.top = "15px";

        var btnContinue = BABYLON.GUI.Button.CreateSimpleButton("btnContinue", "Continue?");
        btnContinue.width = 0.2;
        btnContinue.height = "40px";
        btnContinue.cornerRadius = 20;
        btnContinue.color = "Orange";
        btnContinue.thickness = 4;
        btnContinue.background = "green";
        btnContinue.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        btnContinue.top = "140px";
        btnContinue.isVisible = false;
        
        var btnBack = BABYLON.GUI.Button.CreateSimpleButton("btnBack", "Main Menu");
        btnBack.width = 0.08;
        btnBack.height = "40px";
        btnBack.cornerRadius = 20;
        btnBack.color = "Orange";
        btnBack.thickness = 4;
        btnBack.background = "green";
        btnBack.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        btnBack.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        btnBack.top = "60px";
        btnBack.left = "-10px";

        var btnRestart = BABYLON.GUI.Button.CreateImageButton("btnRestart", "Restart", "https://raw.githubusercontent.com/KiritoNguyen/My_Image/master/MyImage/Phi/images/refresh.png");
        btnRestart.width = 0.08;
        btnRestart.height = "40px";
        btnRestart.cornerRadius = 20;
        btnRestart.color = "Orange";
        btnRestart.thickness = 4;
        btnRestart.background = "green";
        btnRestart.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        btnRestart.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        btnRestart.top = "10px";
        btnRestart.left = "-10px";                           

        var gameStop = false; // Biến kiểm tra game đã kết thúc hay chưa

        // Event button //
        btnContinue.onPointerClickObservable.add(function() {
            particleSystemBlow.stop();
            textEndGame.text = '';
            btnContinue.isVisible = false;
            gameStop = false;
            timeRush = 0;
            timeCount = setInterval(function(){timeRush++}, 1000);   

            Control();

            crate = BABYLON.MeshBuilder.CreateBox("crate0", {size: 8}, scene);  
            crate.checkCollisions = true;
            cratePosition(crate);
            crates = [crate];

            for (let i = sliderValue * n - 1; i < sliderValue*(n+1) - 1; i++) {
                let b = crate.clone("crate" + (i + 1));
                cratePosition(b)
                crates.push(b);
            }
            n++;
            crates.forEach(crate => {
                crate.material = crateMaterial;
                crate.physicsImpostor = new BABYLON.PhysicsImpostor(crate, BABYLON.PhysicsImpostor.BoxImpostor, {mass: 1, restitution: 0.9});
            });

            giftBox.visibility = 0;                     
            giftBox.isPickable = false;
            setTimeout(function() {
                giftBox.position = new BABYLON.Vector3(crates[0].position.x, crates[0].position.y, crates[0].position.z);
            }, 6000);
        });

        btnBack.onPointerClickObservable.add(function() {
            engine.stopRenderLoop();
            backgroundSong.stop();
            clearInterval(timeCount);
            var menuGame = createScene(); // Khởi tạo lại menu mới sau khi nhấn Back
            engine.runRenderLoop(function () {
                advancedTexture.dispose();
                btnBack.dispose();
                btnContinue.dispose();
                menuGame.render();              
            })                
        });

        btnRestart.onPointerClickObservable.add(function() {
            timeRush = 0;
            clearInterval(timeCount);
            var restartGame = createSceneTimeRush();   // Khởi tạo lại màn chơi mới sau khi nhấn Restart
            engine.stopRenderLoop();
            engine.runRenderLoop(function () {
                advancedTexture.dispose();
                btnBack.dispose();
                restartGame.render();              
            })                
        });       
          
        advancedTexture.addControl(textTime);
        advancedTexture.addControl(textEndGame);   
        advancedTexture.addControl(btnContinue); 
        advancedTexture.addControl(btnBack);
        advancedTexture.addControl(btnRestart);
        optionGUI(advancedTexture, scene);
        /////////////////////////// END GUI //////////////////////////         

        // SET LOCATION OF GIFT BOX INSIDE CRATE           
        /////////////////////// GIFT BOX ////////////////////////
        var giftBox = new BABYLON.MeshBuilder.CreateBox('giftBox', {size: 3}, scene);
        giftBox.material = new BABYLON.StandardMaterial('giftBoxMaterial', scene);  
        giftBox.visibility = 0;                     
        giftBox.isPickable = false;
        setTimeout(function() {
            giftBox.position = new BABYLON.Vector3(crates[0].position.x, crates[0].position.y, crates[0].position.z);
        }, 8000);

        particleSystemBlow.emitter = giftBox; // the starting object, the emitter
        particleSystemBlow.minEmitBox = new BABYLON.Vector3(-3, 0, -3); // Starting all from
        particleSystemBlow.maxEmitBox = new BABYLON.Vector3(3, 0, 3); // To...

        var a = 0, b = 0, pickResult;
        var direction = new BABYLON.Vector2.Zero();

        scene.onPointerMove = function () {
            pickResult = scene.pick(scene.pointerX, scene.pointerY);
            var diffX = -pickResult.pickedPoint.x + tank.position.x;
            var diffY = -pickResult.pickedPoint.z + tank.position.z;
            direction.x = diffX;
            direction.y = diffY;
            
            if (pickResult.hit) {
                tank.rotation.y = Math.atan2(diffX, diffY);	
                if(diffX != 0) {
                    a = diffY/diffX;
                    b = pickResult.pickedPoint.z-a*pickResult.pickedPoint.x;
                }	          
            }	
        };

        function castRay(){       
            var origin = tank.position;
        
            var forward = new BABYLON.Vector3(0, 0, -1);		
            forward = vecToLocal(forward, tank);
        
            var direction = forward.subtract(origin);
            direction = BABYLON.Vector3.Normalize(direction);
        
            var length = 20;
        
            var ray = new BABYLON.Ray(origin, direction, length);

            var hit = scene.pickWithRay(ray);

            if (hit.pickedMesh){
                hit.pickedMesh.scaling.y -= 0.02;
                hit.pickedMesh.scaling.x -= 0.02;
                hit.pickedMesh.scaling.z -= 0.02;

                if (hit.pickedMesh.scaling.y <= 0.9) {
                    if (hit.pickedMesh.name == 'crate0') {
                        giftBox.visibility = 1;
                        clearInterval(timeCount);
                        textEndGame.text = 'Congratulation\nYou have found a gift box!\nYour ' + textTime.text;
                        gameStop = true;
                        particleSystemBlow.start();
                        btnContinue.isVisible = true;
                    }
                    explosion.play();
                    hit.pickedMesh.dispose();
                    const index = crates.indexOf(hit.pickedMesh);
                    crates.splice(index, 1);
                }
            }
        }

        Control();

        ///////////////////////////////////////////////////////
        var red = 1, green = 0, blue = 0;
        scene.registerBeforeRender(function() {
            // Change color of gift box
            if(red > 0 && blue <= 0){
                red -= 0.01;
                green += 0.01;
            }
            if(green > 0 && red <= 0){
                green -= 0.01;
                blue += 0.01;
            }
            if(blue > 0 && green <= 0){
                red += 0.01;
                blue -= 0.01;
            }

            giftBox.material.diffuseColor = new BABYLON.Color3(red, green, blue);

            // TIME SHOW
            if (gameStop == false)
                textTime.text = "Time: " + Math.floor(timeRush / 60) + ":" + timeRush % 60;
            else if (gameStop == true) {
                textTime.text = '';
                for (var i = 0; i < scene.actionManager.actions.length; i++) {
                    scene.actionManager.actions.splice(i, i);
                }
            }

            // Collide with crates
            crates.forEach(crate => {
                if (tank.intersectsMesh(crate, true)) {
                speed=0;
                    if(direction.x>=0)
                        tank.position.x-=0.2;
                    else
                        tank.position.x+=0.2;
                    if(direction.z>=0)
                        tank.position.z-=0.2;
                    else
                        tank.position.z+=0.2;
                }
            });

            treeRootList.forEach(tree => {
                if (tank.intersectsMesh(tree, true)) {
                speed=0;
                    if(direction.x>=0)
                        tank.position.x-=0.2;
                    else
                        tank.position.x+=0.2;
                    if(direction.z>=0)
                        tank.position.z-=0.2;
                    else
                        tank.position.z+=0.2;
                }
            });

            if(flagEnergy)
                speed=velocity;

            // Muzzle of tank
            muzzle.position = new BABYLON.Vector3(tank.position.x, tank.position.y, tank.position.z);
            muzzle.rotation = new BABYLON.Vector3(tank.rotation.x, tank.rotation.y + Math.PI / 2, tank.rotation.z);

            // fps
            txtFps.text = 'FPS: ' + engine.getFps().toFixed();
        })

        return scene;
    };

    var createSceneScoreAttack = function() {
        // This creates a basic Babylon Scene object (non-mesh)
        var scene = new BABYLON.Scene(engine);

        var gravityVector = new BABYLON.Vector3(0,-9.81, 0);
        var physicsPlugin = new BABYLON.CannonJSPlugin();
        scene.enablePhysics(gravityVector, physicsPlugin);

        createLightAndCamera(scene);
        tankCreation(scene);
        snowDropEffect(scene);
        giftBoxBlowEffect(scene);
        basicEnvironment(scene);
        // changeColorTank(advancedTexture, tank.material);
        soundManager(scene);

        /////////////////////// CRATES ///////////////////////
        function rand() {
            let sign = Math.random() < 0.5;
            return Math.random() * (sign ? 1 : -1);
        }

        function cratePosition(crate) {
            crate.position.y = 20;
            crate.position.x = rand() * 50;
            crate.position.z = rand() * 50;
        }

        crate = BABYLON.MeshBuilder.CreateBox("crate0", {size: 8}, scene);  
        crate.checkCollisions = true;
        cratePosition(crate);
        crates = [crate];

        for (let i = 0; i < 4; i++) {
            let b = crate.clone("crate" + (i + 1));
            cratePosition(b)
            crates.push(b);
        }  
        
        var crateMaterial = new BABYLON.StandardMaterial("crateMaterial", scene);
        crateMaterial.diffuseTexture = new BABYLON.Texture("https://thumbs.dreamstime.com/b/plain-wood-crate-one-side-wooden-63453318.jpg", scene);
        crateMaterial.diffuseTexture.hasAlpha = true;          
        
        crates.forEach(crate => {
            crate.material = crateMaterial;
            crate.physicsImpostor = new BABYLON.PhysicsImpostor(crate, BABYLON.PhysicsImpostor.BoxImpostor, {mass: 1, restitution: 0.9});
        });

        /////////////////// RAY CAST ////////////////////
        var ray = new BABYLON.Ray();
        var rayHelper = new BABYLON.RayHelper(ray);
        
        var localMeshDirection = new BABYLON.Vector3(3, 0, 0);
        var localMeshOrigin = new BABYLON.Vector3(0, 1.5, 0);
        var length = 6;

        rayHelper.attachToMesh(muzzle, localMeshDirection, localMeshOrigin, length);   

        //////////// TIME COUNT & SCORE ///////////////
        intervalTimeScoreAttack = setInterval(function(){timeScoreAttack--;},1000);
        var score = 0; 
        var countScore = 5;

        /////////////////////////// GUI ////////////////////////////
        var advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

        var textTime = new BABYLON.GUI.TextBlock();
        textTime.color = "white";
        textTime.fontSize = 40;
        textTime.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        textTime.top = "15px";

        var scoreText=new BABYLON.GUI.TextBlock();
        scoreText.color="yellow";
        scoreText.text="Scores: " + score;
        scoreText.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        scoreText.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        scoreText.top = 10;
        scoreText.left = 10;

        var energyText=new BABYLON.GUI.TextBlock();
        energyText.color="yellow";
        energyText.text="Energy: ";
        energyText.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        energyText.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        energyText.top = 50;
        energyText.left = 10;

        var btnBack = BABYLON.GUI.Button.CreateSimpleButton("btnBack", "Main Menu");
        btnBack.width = 0.08;
        btnBack.height = "40px";
        btnBack.cornerRadius = 20;
        btnBack.color = "Orange";
        btnBack.thickness = 4;
        btnBack.background = "green";
        btnBack.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        btnBack.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        btnBack.top = "60px";
        btnBack.left = "-10px";        

        var btnRestart = BABYLON.GUI.Button.CreateImageButton("btnRestart", "Restart", "https://raw.githubusercontent.com/KiritoNguyen/My_Image/master/MyImage/Phi/images/refresh.png");
        btnRestart.width = 0.08;
        btnRestart.height = "40px";
        btnRestart.cornerRadius = 20;
        btnRestart.color = "Orange";
        btnRestart.thickness = 4;
        btnRestart.background = "green";
        btnRestart.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        btnRestart.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        btnRestart.top = "10px";
        btnRestart.left = "-10px";       

        btnBack.onPointerClickObservable.add(function() {
            engine.stopRenderLoop();
            backgroundSong.stop();
            clearInterval(intervalTimeScoreAttack);
            var menuGame = createScene();
            engine.runRenderLoop(function () {
                advancedTexture.dispose();
                btnBack.dispose();
                menuGame.render();     // Khởi tạo lại menu mới sau khi nhấn Back        
            })                
        });

        btnRestart.onPointerClickObservable.add(function() {
            timeScoreAttack = 60;
            engine.stopRenderLoop();
            clearInterval(intervalTimeScoreAttack);
            var restartGame = createSceneScoreAttack();   // Khởi tạo lại màn chơi mới sau khi nhấn Restart
            engine.runRenderLoop(function () {
                advancedTexture.dispose();
                btnBack.dispose();
                restartGame.render();              
            })                
        });

        advancedTexture.addControl(energyText);
        advancedTexture.addControl(scoreText);
        advancedTexture.addControl(textTime);
        advancedTexture.addControl(btnBack);
        advancedTexture.addControl(btnRestart); 
        optionGUI(advancedTexture, scene);
           
        /////////////////////////// END GUI //////////////////////////         

        // SET LOCATION OF GIFT BOX INSIDE CRATE                
        /////////////////////// GIFT BOX ////////////////////////
        var giftBox = new BABYLON.MeshBuilder.CreateBox('giftBox', {size: 3}, scene);
        giftBox.material = new BABYLON.StandardMaterial('giftBoxMaterial', scene);  
        giftBox.visibility = 0;                     
        giftBox.isPickable = false;
        setTimeout(function() {
            giftBox.position = new BABYLON.Vector3(crates[0].position.x, crates[0].position.y, crates[0].position.z);
        }, 5000);

        particleSystemBlow.emitter = giftBox; // the starting object, the emitter
        particleSystemBlow.minEmitBox = new BABYLON.Vector3(-3, 0, -3); // Starting all from
        particleSystemBlow.maxEmitBox = new BABYLON.Vector3(3, 0, 3); // To...

        var a = 0, b = 0, pickResult;
        var direction = new BABYLON.Vector2.Zero();

        scene.onPointerMove = function () {
            pickResult = scene.pick(scene.pointerX, scene.pointerY);
            var diffX = -pickResult.pickedPoint.x + tank.position.x;
            var diffY = -pickResult.pickedPoint.z + tank.position.z;
            direction.x = diffX;
            direction.y = diffY;
            
            if (pickResult.hit) {

                tank.rotation.y = Math.atan2(diffX, diffY);	

                if(diffX != 0) {
                    a = diffY/diffX;
                    b = pickResult.pickedPoint.z-a*pickResult.pickedPoint.x;
                }	          
            }	
        };        

        function castRay(){       
            var origin = tank.position;
        
            var forward = new BABYLON.Vector3(0, 0, -1);		
            forward = vecToLocal(forward, tank);
        
            var direction = forward.subtract(origin);
            direction = BABYLON.Vector3.Normalize(direction);
        
            var length = 20;
        
            var ray = new BABYLON.Ray(origin, direction, length);

            var hit = scene.pickWithRay(ray);

            if (hit.pickedMesh){
                hit.pickedMesh.scaling.y -= 0.02;
                hit.pickedMesh.scaling.x -= 0.02;
                hit.pickedMesh.scaling.z -= 0.02;

                if (hit.pickedMesh.scaling.y <= 0.9) {
                    countScore--;
                    if (hit.pickedMesh.name == 'crate0') {
                        giftBox.visibility = 1;
                        score += countScore;
                        timeScoreAttack += countScore;
                        countScore += 5;

                        //Create more crate after hit gift box   
                        crate = BABYLON.MeshBuilder.CreateBox("crate0", {size: 8}, scene);  
                        crate.checkCollisions = true;
                        cratePosition(crate);
                        crates = [crate];

                        for (let i = 0; i < 4; ++i) {
                            let b = crate.clone("crate" + (i + 1));
                            cratePosition(b)
                            crates.push(b);
                        }

                        crates.forEach(crate => {
                            crate.material = crateMaterial;
                            crate.physicsImpostor = new BABYLON.PhysicsImpostor(crate, BABYLON.PhysicsImpostor.BoxImpostor, {mass: 1, restitution: 0.9});
                        });

                        particleSystemBlow.start();
                        setTimeout(function(){
                            particleSystemBlow.stop();
                        }, 2000);

                        setTimeout(function() {
                            giftBox.position = new BABYLON.Vector3(crates[0].position.x, crates[0].position.y, crates[0].position.z);
                            giftBox.visibility = 0;
                        }, 3000);

                    }
                    explosion.play();                    
                    hit.pickedMesh.dispose();
                    const index = crates.indexOf(hit.pickedMesh);
                    crates.splice(index, 1);
                }

            }
        }

        scene.actionManager = new BABYLON.ActionManager(scene);
        var map = {}; //object for multiple key presses

        scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyDownTrigger, function (evt) {
            map[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";

        }));

        scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyUpTrigger, function (evt) {
            map[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";
        }));

        /****************************Move Tank*****************************/

        scene.registerAfterRender(function () {
            camera.setTarget(tank.position);
            if ((map["w"] || map["W"])) {
                if(pickResult.pickedPoint.z > tank.position.z)
                {
                    tank.position.z +=speed*Math.abs(Math.sin(Math.atan(a)));
                    tank.position.x=(tank.position.z-b)/a;

                }
                else if(pickResult.pickedPoint.z<tank.position.z)
                {
                    tank.position.z -= speed*Math.abs(Math.sin(Math.atan(a)));
                    tank.position.x=(tank.position.z-b)/a;
                }

            };

            if ((map["s"] || map["S"])) {
                if(pickResult.pickedPoint.z>tank.position.z)
                {
                    tank.position.z -= speed*Math.abs(Math.sin(Math.atan(a)));
                    tank.position.x=(tank.position.z-b)/a;
                }
                else if(pickResult.pickedPoint.z<tank.position.z)
                {
                    tank.position.z += speed*Math.abs(Math.sin(Math.atan(a)));   
                    tank.position.x=(tank.position.z-b)/a;
                }
            };
        });

        scene.actionManager.registerAction(
            new BABYLON.ExecuteCodeAction(
            {
                trigger: BABYLON.ActionManager.OnKeyDownTrigger,
                parameter: 'v'
            },
            function() {
                castRay();
                rayHelper.show(scene, new BABYLON.Color3.Green());
                gunshot.play();
                setTimeout(function(){rayHelper.hide()}, 100);
            })
        )
        scene.actionManager.registerAction(
        new BABYLON.ExecuteCodeAction(
            {
                trigger: BABYLON.ActionManager.OnKeyDownTrigger,
                parameter: 'e'
            },
            function() {
                if(energy>0){
                flagEnergy=false;
                speed=velocity*2; 
                energy--;
                }
            })
        )
        scene.actionManager.registerAction(
            new BABYLON.ExecuteCodeAction(
            {
                trigger: BABYLON.ActionManager.OnKeyUpTrigger,
                parameter: 'e'
            },
            function() {
                flagEnergy=true;
            })
        )            

        ///////////////////////////////////////////////////////
        var red = 1, green = 0, blue = 0;
        scene.registerBeforeRender(function() {
            // Change color of gift box
            if(red > 0 && blue <= 0){
                red -= 0.01;
                green += 0.01;
            }
            if(green > 0 && red <= 0){
                green -= 0.01;
                blue += 0.01;
            }
            if(blue > 0 && green <= 0){
                red += 0.01;
                blue -= 0.01;
            }

            giftBox.material.diffuseColor = new BABYLON.Color3(red, green, blue);

            // TIME SHOW
            scoreText.text="Scores: " + score;
            energyText.text="Energy: "+ energy;
            textTime.text="Time: "+ Math.floor(timeScoreAttack/60)+":" + timeScoreAttack%60;
            if(timeScoreAttack <= 0){
                textTime.text="Time up!\n Your score: " + score;
                for (var i = 0; i < scene.actionManager.actions.length; i++) {
                    scene.actionManager.actions.splice(i, i);
                }
                clearInterval(energyCount);
            }

            // Collide with crates
            crates.forEach(crate => {
                if (tank.intersectsMesh(crate, true)) {
                speed=0;
                    if(direction.x>=0)
                        tank.position.x-=0.2;
                    else
                        tank.position.x+=0.2;
                    if(direction.z>=0)
                        tank.position.z-=0.2;
                    else
                        tank.position.z+=0.2;
                }
            });

            treeRootList.forEach(tree => {
                if (tank.intersectsMesh(tree, true)) {
                speed=0;
                    if(direction.x>=0)
                        tank.position.x-=0.2;
                    else
                        tank.position.x+=0.2;
                    if(direction.z>=0)
                        tank.position.z-=0.2;
                    else
                        tank.position.z+=0.2;
                }
            });

            if(flagEnergy)
                speed=velocity;

            // Muzzle of tank
            muzzle.position = new BABYLON.Vector3(tank.position.x, tank.position.y, tank.position.z);
            muzzle.rotation = new BABYLON.Vector3(tank.rotation.x, tank.rotation.y + Math.PI / 2, tank.rotation.z);

            // fps
            txtFps.text = 'FPS: ' + engine.getFps().toFixed();
        })

        return scene;
    };

    var createSceneBattleTank = function() {
        var scene = new BABYLON.Scene(engine);

        var gravityVector = new BABYLON.Vector3(0,-9.81, 0);
        var physicsPlugin = new BABYLON.CannonJSPlugin();
        scene.enablePhysics(gravityVector, physicsPlugin);

        // console.log(enemyList.Le);
        var enemyLength = 6;
        createLightAndCamera(scene);
        tankCreation(scene);
        enemyTankCreation(scene);
        snowDropEffect(scene);
        giftBoxBlowEffect(scene);
        basicEnvironment(scene);
        // changeColorTank(advancedTexture, tank.material);
        soundManager(scene);

        //////////// TIME COUNT ///////////////
        intervalTimeBattleTank = setInterval(function(){timeBattleTank++}, 1000);  
        
        /////////////////////////// GUI ////////////////////////////
        var advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

        var textEndGame = new BABYLON.GUI.TextBlock();
        textEndGame.color = "green";
        textEndGame.fontSize = 30;
        textEndGame.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        textEndGame.top = "15px";

        var textTime = new BABYLON.GUI.TextBlock();
        textTime.color = "white";
        textTime.fontSize = 50;
        textTime.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        textTime.top = "15px";
        
        var btnBack = BABYLON.GUI.Button.CreateSimpleButton("btnBack", "Main Menu");
        btnBack.width = 0.08;
        btnBack.height = "40px";
        btnBack.cornerRadius = 20;
        btnBack.color = "Orange";
        btnBack.thickness = 4;
        btnBack.background = "green";
        btnBack.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        btnBack.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        btnBack.top = "60px";
        btnBack.left = "-10px";

        var btnRestart = BABYLON.GUI.Button.CreateImageButton("btnRestart", "Restart", "https://raw.githubusercontent.com/KiritoNguyen/My_Image/master/MyImage/Phi/images/refresh.png");
        btnRestart.width = 0.08;
        btnRestart.height = "40px";
        btnRestart.cornerRadius = 20;
        btnRestart.color = "Orange";
        btnRestart.thickness = 4;
        btnRestart.background = "green";
        btnRestart.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        btnRestart.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        btnRestart.top = "10px";
        btnRestart.left = "-10px";                           

        // Event button //
        btnBack.onPointerClickObservable.add(function() {
            engine.stopRenderLoop();
            backgroundSong.stop();
            clearInterval(intervalTimeBattleTank);
            var menuGame = createScene(); // Khởi tạo lại menu mới sau khi nhấn Back
            engine.runRenderLoop(function () {
                advancedTexture.dispose();
                btnBack.dispose();
                menuGame.render();              
            })                
        });

        btnRestart.onPointerClickObservable.add(function() {
            timeBattleTank = 0;
            clearInterval(intervalTimeBattleTank);
            var restartGame = createSceneBattleTank();   // Khởi tạo lại màn chơi mới sau khi nhấn Restart
            engine.stopRenderLoop();
            engine.runRenderLoop(function () {
                advancedTexture.dispose();
                btnBack.dispose();
                restartGame.render();              
            })                
        });       
          
        advancedTexture.addControl(textTime);
        advancedTexture.addControl(textEndGame);   
        advancedTexture.addControl(btnBack);
        advancedTexture.addControl(btnRestart);
        optionGUI(advancedTexture, scene);
        /////////////////////////// END GUI //////////////////////////         
         
        /////////////////////// GIFT BOX ////////////////////////
        var giftBox = new BABYLON.MeshBuilder.CreateBox('giftBox', {size: 3}, scene);
        giftBox.material = new BABYLON.StandardMaterial('giftBoxMaterial', scene);  
        giftBox.visibility = 0;                     
        giftBox.isPickable = false;

        particleSystemBlow.emitter = giftBox; // the starting object, the emitter
        particleSystemBlow.minEmitBox = new BABYLON.Vector3(-3, 0, -3); // Starting all from
        particleSystemBlow.maxEmitBox = new BABYLON.Vector3(3, 0, 3); // To...

        var a = 0, b = 0, pickResult;
        var direction = new BABYLON.Vector2.Zero();

        scene.onPointerMove = function () {
            pickResult = scene.pick(scene.pointerX, scene.pointerY);
            var diffX = -pickResult.pickedPoint.x + tank.position.x;
            var diffY = -pickResult.pickedPoint.z + tank.position.z;
            direction.x = diffX;
            direction.y = diffY;
            
            if (pickResult.hit) {

                tank.rotation.y = Math.atan2(diffX, diffY);	

                if(diffX != 0) {
                    a = diffY/diffX;
                    b = pickResult.pickedPoint.z-a*pickResult.pickedPoint.x;
                }	          
            }	
        };

        function castRay(meshhit){       
            meshhit.scaling.y -= 0.02;
            meshhit.scaling.x -= 0.02;
            meshhit.scaling.z -= 0.02;
            if (meshhit.scaling.y <= 0.9) {
                meshhit.dispose();
                explosion.play();
                enemyLength--;
                if (enemyLength <= 0) {
                    clearInterval(intervalTimeBattleTank);
                    giftBox.visibility = 1;
                }
                const index = enemyList.indexOf(meshhit);
                enemyList.splice(index, 1);            
            }
        }

        var bulletCreation = function(scene, _position, a, b, pickedPoint){
            var bullet=new BABYLON.MeshBuilder.CreateSphere("bullet", {diameter:1}, scene);
            bullet.material = new BABYLON.StandardMaterial("bulletMat", scene);
            bullet.material.diffuseColor = new BABYLON.Color3.Red;
            bullet.position = new BABYLON.Vector3(_position.x, _position.y + 1.5, _position.z);

            var positionFol = new BABYLON.Vector3.Zero();
            positionFol.y = bullet.position.y;
            if(pickedPoint.z > _position.z) {
                positionFol.z = _position.z + 50*Math.abs((Math.sin(Math.atan(a))));
                positionFol.x = (positionFol.z-b)/a;
            }
            else if(pickedPoint.z < _position.z) {
                positionFol.z = _position.z - 50*Math.abs((Math.sin(Math.atan(a))));
                positionFol.x = (positionFol.z-b)/a;
            }

            var framerate = 200;
            var animationBullet = new BABYLON.Animation("bulletAnimation", "position", framerate, 
            BABYLON.Animation.ANIMATIONTYPE_VECTOR3,BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);

            var keys = [];
            keys.push({
                frame: 0,
                value: bullet.position
            });

            keys.push({
                frame: framerate,
                value:positionFol
            });

            animationBullet.setKeys(keys);

            bullet.animations.push(animationBullet);
            scene.beginAnimation(bullet, 0, 100, false);

            var move = setInterval(function() {          
                enemyList.forEach(enemy => {
                    if (bullet.intersectsMesh(enemy, true)) {
                        console.log("hit!");
                        clearInterval(move);
                        bullet.dispose();
                        castRay(enemy);
                    }
                });
            });
            setTimeout(function() {
                clearInterval(move); 
                bullet.dispose();
            }, 500);
        }

        /////////////////// CONTROL ////////////////////
        scene.actionManager = new BABYLON.ActionManager(scene);
        var map = {}; //object for multiple key presses

        scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyDownTrigger, function (evt) {
            map[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";
        }));

        scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyUpTrigger, function (evt) {
            map[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";
        }));

        /****************************Move Tank*****************************/

        scene.registerAfterRender(function () {
            camera.setTarget(tank.position);
            if (map["w"] || map["W"]) {
                if(pickResult.pickedPoint.z > tank.position.z) {
                    tank.position.z +=speed*Math.abs(Math.sin(Math.atan(a)));
                    tank.position.x=(tank.position.z-b)/a;
                }
                else if(pickResult.pickedPoint.z<tank.position.z) {
                    tank.position.z -= speed*Math.abs(Math.sin(Math.atan(a)));
                    tank.position.x=(tank.position.z-b)/a;
                }
            };

            if (map["s"] || map["S"]) {
                if(pickResult.pickedPoint.z>tank.position.z) {
                    tank.position.z -= speed*Math.abs(Math.sin(Math.atan(a)));
                    tank.position.x=(tank.position.z-b)/a;
                }
                else if(pickResult.pickedPoint.z<tank.position.z) {
                    tank.position.z += speed*Math.abs(Math.sin(Math.atan(a)));   
                    tank.position.x=(tank.position.z-b)/a;
                }
            };
        });

        scene.actionManager.registerAction(
            new BABYLON.ExecuteCodeAction(
            {
                trigger: BABYLON.ActionManager.OnKeyDownTrigger,
                parameter: 'v'
            },
            function() {
                bulletCreation(scene,tank.position,a,b,pickResult.pickedPoint);
                gunshot.play();
            })
        )
        scene.actionManager.registerAction(
            new BABYLON.ExecuteCodeAction(
            {
                trigger: BABYLON.ActionManager.OnKeyDownTrigger,
                parameter: 'e'
            },
            function() {
                if(energy>0){
                flagEnergy=false;
                speed=velocity*2; 
                energy--;
                }
            })
        )
        scene.actionManager.registerAction(
            new BABYLON.ExecuteCodeAction(
            {
                trigger: BABYLON.ActionManager.OnKeyUpTrigger,
                parameter: 'e'
            },
            function() {
                flagEnergy=true;
            })
        )

        ///////////////////////////////////////////////////////
        var red = 1, green = 0, blue = 0;
        scene.registerBeforeRender(function() {
            // Change color of gift box
            if(red > 0 && blue <= 0){
                red -= 0.01;
                green += 0.01;
            }
            if(green > 0 && red <= 0){
                green -= 0.01;
                blue += 0.01;
            }
            if(blue > 0 && green <= 0){
                red += 0.01;
                blue -= 0.01;
            }

            giftBox.material.diffuseColor = new BABYLON.Color3(red, green, blue);
            console.log(enemyLength);
            
            // END GAME
            if (enemyLength <= 0) {
                textTime.text = "You have taken\nthe enemy power source";
                textTime.color = 'blue';
                giftBox.position = new BABYLON.Vector3(tank.position.x, tank.position.y + 5, tank.position.z);
                speed=velocity*3;
                particleSystemBlow.start();
            } else {
                textTime.text = "Time: " + Math.floor(timeBattleTank / 60) + ":" + timeBattleTank % 60;
            }
                
            // Collide with enemy
            enemyList.forEach(enemy => {
                if (tank.intersectsMesh(enemy, true)) {
                speed = 0;
                    if(direction.x>=0)
                        tank.position.x -= 0.2;
                    else
                        tank.position.x += 0.2;
                    if(direction.z>=0)
                        tank.position.z -= 0.2;
                    else
                        tank.position.z += 0.2;
                }
            });

            treeRootList.forEach(tree => {
                if (tank.intersectsMesh(tree, true)) {
                speed=0;
                    if(direction.x>=0)
                        tank.position.x-=0.2;
                    else
                        tank.position.x+=0.2;
                    if(direction.z>=0)
                        tank.position.z-=0.2;
                    else
                        tank.position.z+=0.2;
                }
            });
            enemyList.forEach(enemy=>{
                {
                    enemyTankMoving(enemy,enemy.position,tank.position);
                }
            })

            if(flagEnergy)
                speed = velocity;

            // Muzzle of tank
            muzzle.position = new BABYLON.Vector3(tank.position.x, tank.position.y, tank.position.z);
            muzzle.rotation = new BABYLON.Vector3(tank.rotation.x, tank.rotation.y + Math.PI / 2, tank.rotation.z);

            // fps, time
            txtFps.text = 'FPS: ' + engine.getFps().toFixed();            
        })

        return scene;
    }

    //////Register service worker
    if('serviceWorker' in navigator) {
    navigator.serviceWorker
        .register('/service-worker.js')
        .then(function() { console.log("Service Worker Registered"); });
    }
    
    var scene = createScene();
    engine.runRenderLoop(function(){
        scene.render();
    }); 
})