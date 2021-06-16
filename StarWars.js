(function () { //não apagar

	var canvas; // representação genérica dos canvas

	var canvases = {
		background: {
			canvas: null,
			ctx: null
		}, // canvas, drawingSurface (contex2d)
		entities: {
			canvas: null,
			ctx: null
		},
		components: {
			canvas: null,
			ctx: null
		}
	};

    var entities = [];
	var teclas = new Array(255);
	var umHanSolo = undefined;
	//var drawingSurface;
	var umInimigo_Cantina = undefined;
	var osLasers=[]; //array para os Lasers
	var debugMode = true;
	//var andou = false;
	var animationHandler;
	var barraVidaHanSolo = undefined;
	var barraVidaInimigo_Cantina = undefined;
	var gameTimer = undefined;
	var loadInfo = undefined;
	var assetsLoadInfo = undefined;
	var assetsLoaded = 0;
	var assets = [];

	var GameSounds = {
		HAN_SOLO: {},
		LASER: {},
		AMBIENTE: {}
	};
    
    var GameStates = {
		RUNNING: 1,
		PAUSED: 2,
		STOPED: 3,
		LOADING: 4,
		LOADED: 5
	}
    var gameState = undefined;
    
    window.addEventListener("load", init, false);

	function init() {
	
		canvases.background.canvas = document.querySelector("#canvasBack");
		canvases.background.ctx = canvases.background.canvas.getContext("2d");

		canvases.entities.canvas = document.querySelector("#canvasEnt");
		canvases.entities.ctx = canvases.entities.canvas.getContext("2d");

		canvases.components.canvas = document.querySelector("#canvasComp");
		canvases.components.ctx = canvases.components.canvas.getContext("2d");

        // canvas é uma referencia global genérica para as definições globais dos canvas (largura e altura)
        canvas = canvases.entities.canvas; //
		load();

		//gameWorld= new GameWorld(0,0,canvases.background.width,canvases.background.height);

		//camera= new Camera(0, gameWorld.height,Math.floor(gameWorld.width),gameWorld.height);
	}

    function load(){
		loadInfo = document.querySelector("#loadInfo");
		assetsLoadInfo = document.querySelector("#assetLoaded");
		
		gameState = GameStates.LOADING;

        // carregar as spritesheets
		var spBackground = new SpriteSheet();
		spBackground.load("assets//Background2.png", "assets//Background2.json", loaded);
		assets.push(spBackground);
			
		var spHanSolo = new SpriteSheet();
		spHanSolo.load("assets//Han_Solo.png", "assets//Han_Solo.json", loaded);
		assets.push(spHanSolo);

		var spInimigo_Cantina = new SpriteSheet();
		spInimigo_Cantina.load("assets//Inimigo_Cantina.png", "assets//Inimigo_Cantina.json", loaded);
		assets.push(spInimigo_Cantina);

		//carregar os sons
		gSoundManager.loadAsync("sounds/Nivel2_Fundo.mp3", function (so) {
			GameSounds.AMBIENTE.FUNDO = so;
			loaded("sounds/Nivel2_Fundo.mp3")
		});
		assets.push(GameSounds.AMBIENTE.FUNDO);

		gSoundManager.loadAsync("sounds/Tiro_HanSolo.mp3", function (so) {
			GameSounds.HAN_SOLO.Ataque = so;
			loaded("sounds/Tiro_HanSolo.mp3")


		});

		gSoundManager.loadAsync("sounds/Final.mp3", function (so) {
			GameSounds.AMBIENTE.FINAL = so;
			loaded("sounds/Final.mp3")
		});
		assets.push(GameSounds.HAN_SOLO.Ataque);
	}
        function loaded(assetName) {
		 
            assetsLoaded++;
            assetsLoadInfo.innerHTML = "Loading: " + assetName;
            if (assetsLoaded < assets.length) return;
            
            assets.splice(0); // apagar o array auxiliar usado para o load

        // Se já conseguimos chegar aqui, os assets estão carregados! Podemos começar a criar 
		// e configurar os elementos do jogo
		assetsLoadInfo.innerHTML = "Jogo Carregado! Por favor pressione qualquer letra/número para iniciar o jogo...";
		
		gameState = GameStates.LOADED;
		//update();
        window.addEventListener("keypress",setupGame,false); // espera por uma tecla pressionada para começar
	}

    function setupGame(){
	 
		window.removeEventListener("keypress",setupGame,false);
		
		loadInfo.classList.toggle("hidden"); // esconder a informaçao de loading
	
		oBackground = new Background(gSpriteSheets['assets//Background2.png'], 0, 0);
		//oBackground.x=Math.floor((oBackground.width/3)*-2);
		entities.push(oBackground);
		
		 
		// ajustar os canvas ao tamanho da janela
		canvases.background.canvas.width = window.innerWidth;
		canvases.background.canvas.height = oBackground.height;
		canvases.entities.canvas.width = window.innerWidth;
		canvases.entities.canvas.height = oBackground.height;
		canvases.components.canvas.width = window.innerWidth;
		canvases.components.canvas.height = oBackground.height;
		
		//oBackground.y=oBackground.height-window.innerHeight;
		canvases.background.canvas.style.backgroundColor = "#DEF4FE";

		/* Primeiro tinha-se de fazer o push da entidade background e de seguida o da personagem  */

        // criar as entidades

		umHanSolo = new Han(gSpriteSheets['assets//Han_Solo.png'], canvas.width - 1500, canvas.height - 250, GameSounds.HAN_SOLO);
		entities.push(umHanSolo);

		umInimigo_Cantina = new Inimigo(gSpriteSheets['assets//Inimigo_Cantina.png'], canvas.width -200, canvas.height - 150);
		entities.push(umInimigo_Cantina);
		
		
		
		
		//criar os componentes informativos e temporizadores
		barraVidaHanSolo = new EnergyBar(5, 5, 120, 12, canvases.components.ctx, 'Vida do Han Solo ', "black", "black", "blue");
		
		barraVidaInimigo_Cantina = new EnergyBar(canvas.width - 135, 5, 120, 12, canvases.components.ctx, 'Vida do Inimigo', "black", "black", "red");
		gameTimer = new GameTimer((canvas.width >> 1) - 25, 5, 50, 50, canvases.components.ctx, '', "green", "black", "white", update, stopGame);

        // aplicar efeitos gráficos ao canvas. Teste os vários filtros
        oBackground.render(canvases.background.ctx);

        canvases.background.canvas.fadeIn(1000);

		GameSounds.AMBIENTE.FUNDO.play(true, 0.3);

        gameState = GameStates.RUNNING

		gameTimer.start();
       
		window.addEventListener("keydown", keyDownHandler, false);
		window.addEventListener("keyup", keyUpHandler, false);
		update();

	}

	//função que para o jogo. É chamada pelo timer, quando a contagem chega a zero
	function stopGame() {
		cancelAnimationFrame(animationHandler);
		gameState = GameStates.STOPED;
		gameTimer.stop();
		gSoundManager.stopAll();
        GameSounds.AMBIENTE.FINAL.play(true, 0.4);
	 
		//COMPLETAR: tocar o som ambiente final (volume 0.2)
	
		canvases.background.canvas.colorize("#614719");
		canvases.entities.canvas.colorize("#614719");
		canvases.components.canvas.grayScale();
		canvases.components.canvas.fadeOut(2000);
	}

    // tratamento dos inputs
    function keyDownHandler(e){
		var codTecla=e.keyCode;
		teclas[codTecla]=true;  
	}

	function keyUpHandler(e){
		var codTecla=e.keyCode;
		teclas[codTecla]=false;  

		switch (codTecla) {
			case keyboard.KPAD_PLUS:
				umHanSolo.vx = umHanSolo.vy += 3;
				break;
			case keyboard.KPAD_MINUS:
				umHanSolo.vx = umHanSolo.vy -= 3;
				break;
				case keyboard.SPACE :
					umHanSolo.podeDisparar = true;
					break;
			}
			umHanSolo.inativo();
		}
	

    function update(){
		//Create the animation loop
    if (gameState == GameStates.RUNNING) {

		if(teclas[keyboard.LEFT]) 	{
			umHanSolo.andar();
			umHanSolo.x-=umHanSolo.vx;
			umHanSolo.dir=1;
		}
		if(teclas[keyboard.RIGHT]) 	{
			umHanSolo.andar();
			umHanSolo.x+=umHanSolo.vx;
			umHanSolo.dir=-1;
		}
		
		/*
		if (teclas[keyboard.UP])
		umHanSolo.y = umHanSolo.y - umHanSolo.vy < canvas.height - 130 ? canvas.height - 130 : umHanSolo.y - umHanSolo.vy;

			if (teclas[keyboard.DOWN])
			umHanSolo.y = umHanSolo.bottom() + umHanSolo.vy > canvas.height ? canvas.height - umHanSolo.height : umHanSolo.y + umHanSolo.vy;

			
			if (teclas[keyboard.DOWN])
			umHanSolo.y += umHanSolo.vy;

		*/	
			
			if (teclas[keyboard.SPACE]) {
				teclas[keyboard.SPACE]=false;
				umHanSolo.ataque;
				let umLaser = new Laser(gSpriteSheets["assets//Han_Solo.png"], umHanSolo.x+200, umHanSolo.y+umHanSolo.height/2.5,5);
				entities.push(umLaser);
				osLasers.push(umLaser);	
			}

			
			function checkCollisions() {
				for(var i=0; i<osLasers.length; i++){
					if(!umInimigo_Cantina.killed){
					if(umInimigo_Cantina.hitTestRectangle(osLasers[i])&&!umHanSolo.isColliding){
						umInimigo_Cantina.isColliding=true; 
						osLasers[i].active=false;     //faz os lasers desaparecer quando bate no inimigo
						umInimigo_Cantina.vida -= osLasers[i].danolaser;
						barraVidaInimigo_Cantina.update(umInimigo_Cantina.vida);
						
					}} else {
						umInimigo_Cantina.atingido();
						stopGame(); //chama a função quando o inimigo morre
					}
					if(osLasers[i].right()<0|| 
							osLasers[i].left()>canvas.width ||
							osLasers[i].bottom() < 0 ||
							osLasers[i].top()> canvas.height){
						osLasers[i].active=false;
					}
				}
				if(umInimigo_Cantina.blockRectangle(umHanSolo)!=-1){
					if(!umHanSolo.killed){	
					umInimigo_Cantina.atacar();
					umInimigo_Cantina.x-=3;
					umHanSolo.vida -= 100;
					barraVidaHanSolo.update(umHanSolo.vida);
					umHanSolo.morte();
					stopGame(); //chama a função quando a personagem morre
				}}else if(umInimigo_Cantina.andar());
			
			
			}
			

		
		for (var i=0; i< entities.length;i++){
			entities[i].update();
		}

		//var bk3= Math.floor(oBackground.width);

		/*
		if(umAnakin.dir===-1){ 
			if (oBackground.x >=0) oBackground.x = Math.floor((oBackground.width)*-2);

		}else if(umAnakin.dir===1){
			if (oBackground.x <=bk3*(-2)) oBackground.x = 0; 
		}

		if(umAnakin.x < camera.leftInnerBoundary()) {
			umAnakin.x = camera.leftInnerBoundary();
			oBackground.vx=umAnakin.vx/3;
		}

		if(umAnakin.x+umAnakin.width > camera.rightInnerBoundary()) {
			umAnakin.x = camera.rightInnerBoundary()-umAnakin.width;
			oBackground.vx=umAnakin.vx/3*-1;
		}
		*/

		checkCollisions();
		render(); // fazer o render das entidades

		clearArrays(); // limpar os arrays

		animationHandler=window.requestAnimationFrame(update); //Permite mexer o anakin 
    }

}
//	efetua a limpeza dos arrays
	function clearArrays(){


	entities = entities.filter(filterByActiveProp);
	osLasers = osLasers.filter(filterByActiveProp);

	}

	function filterByActiveProp(obj) {
		if (obj.active == true)
			return obj;
	}

	function render(){
            canvases.entities.ctx.clearRect(0, 0, canvas.width, canvas.height); //limpa canvas
    
            for (var i = 1; i < entities.length; i++) {
                var entity = entities[i];
               // var sprite= entities[i].getSprite();  
                //entidades fora do canvas não se desenham
				//entidades fora do canvas não se desenham
                if (entity.right() > 0 && entity.bottom() > 0 && 
                    entity.left() < canvas.width && entity.top() < canvas.height) {
                    entities[i].render(canvases.entities.ctx);
                      if(debugMode)  entities[i].drawColisionBoundaries(canvases.entities.ctx,true,false, "blue","red");
                }
            }
			//camera.drawFrame(drawingSurface, true);

			barraVidaInimigo_Cantina.render();
			barraVidaHanSolo.render();
			gameTimer.render();
        }

    })();
