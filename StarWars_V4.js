(function(){ //não apagar

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

   const msg={
	   msg:"",
	   pos:{x:0, y:0},
	   visible:false,
	   textColor:"white",
	   width:100,
	   height:50,
	   msgbox:null,
	   create:function(msg){
		this.msgbox=document.createElement("div");
		this.msgbox.style.height=this.height+"px";
		this.msgbox.style.width=this.width+"px";
		this.msgbox.style.display="none";
		this.msgbox.style.position="absolute";
		this.msgbox.style.zIndex="1000";
		this.msgbox.style.backgroundColor="yellow";
		this.msgbox.style.border="1px solid red";
		this.msgbox.style.cursor="pointer";

		this.msgbox.addEventListener("click",()=>this.hide());
		console.log(this.msgbox);
		document.body.appendChild(this.msgbox);
		if(msg!=undefined)this.setMessage(msg);
	   },
	   show:function(){
		   this.msgbox.style.display="block";

	   },
	   hide:function(){
		  
		   this.msgbox.style.display="none";
	   },
	   setMessage:function(msg){
		   this.msg=msg;
		   this.msgbox.innerHTML=this.msg;
	   }	

	
   }

    var entities = [];
	var teclas = new Array(255);
	var umPadawan = undefined;
	var umHanSolo = undefined;
	//var drawingSurface;
	var umNemoidian = undefined;
	var umInimigo_Cantina = undefined;
	var osLancamentos=[]; //array para os lançamentos do lightsaber
	var osLasers=[]; //array para os Lasers
	var debugMode = true;
	//var andou = false;
	var animationHandler;
	var barraVidaPadawan = undefined;
	var barraVidaHanSolo = undefined;
	var barraVidaNemoidian = undefined;
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
		spBackground.load("assets//background2.png", "assets//Background2.json", loaded);
		assets.push(spBackground);

		/*var spBackground2 = new SpriteSheet();
		spBackground2.load("assets//Background2.png", "assets//Background2.json", loaded);
		assets.push(spBackground2);
			
		var spPadawan = new SpriteSheet();
		spPadawan.load("assets//Padawan.png", "assets//Padawan.json", loaded);
		assets.push(spPadawan);*/

		var spHanSolo = new SpriteSheet();
		spHanSolo.load("assets//Han_Solo.png", "assets//Han_Solo.json", loaded);
		assets.push(spHanSolo);

		/*var spNemoidian = new SpriteSheet();
		spNemoidian.load("assets//Nemoidian_Guard.png", "assets//Nemoidian_Guard.json", loaded);
		assets.push(spNemoidian);*/

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

	//Parte do código da versão inicial comentada
	/*
	assets.push(GameSounds.AMBIENTE.INTRO);

		gSoundManager.loadAsync("sounds/Som_Fundo.mp3", function (so) {
		GameSounds.AMBIENTE.FUNDO = so;
		loaded("sounds/Som_Fundo.mp3")
	});
	assets.push(GameSounds.AMBIENTE.FUNDO);

		gSoundManager.loadAsync("sounds/Final.mp3", function (so) {
		GameSounds.AMBIENTE.FINAL = so;
		loaded("sounds/Final.mp3")
	});
	assets.push(GameSounds.AMBIENTE.FINAL);

	gSoundManager.loadAsync("sounds/Nivel2_Fundo.mp3", function (so) {
		GameSounds.AMBIENTE.FUNDO = so;
		loaded("sounds/Nivel2_Fundo.mp3")
	});
	assets.push(GameSounds.AMBIENTE.FUNDO);

	/* gSoundManager.loadAsync("sounds/Tiro_HanSolo.mp3", function (so) {
		GameSounds.HAN_SOLO.Ataque = so;
		loaded("sounds/Tiro_HanSolo.mp3")


	});*/

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

		GameSounds.AMBIENTE.INTRO.play(true, 1);
        window.addEventListener("keypress",setupGame,false); // espera por uma tecla pressionada para começar

		//document.getElementById("charPadawan").addEventListener("mousedown", setupGame);
		//document.getElementById("charHan").addEventListener("mousedown", setupGame2);
	}

    function setupGame(){
	 
		window.removeEventListener("keypress",setupGame,false);
		
		loadInfo.classList.toggle("hidden"); // esconder a informaçao de loading
	
		oBackground = new Background(gSpriteSheets['assets//Background2.png'], 0, 0);
		//oBackground.x=Math.floor((oBackground.width/3)*-2);
		entities.push(oBackground);
		
		 
		// ajustar os canvas ao tamanho da janela
		canvases.background.canvas.width = window.innerWidth-10;
		canvases.background.canvas.height = window.innerHeight;
		canvases.entities.canvas.width = window.innerWidth-10;
		canvases.entities.canvas.height = window.innerHeight;
		canvases.components.canvas.width = window.innerWidth;
		canvases.components.canvas.height = window.innerHeight;
		
		oBackground.y=oBackground.height-window.innerHeight;
		canvases.background.canvas.style.backgroundColor = "#DEF4FE";

		/* Primeiro tinha-se de fazer o push da entidade background e de seguida o da personagem  */

        // criar as entidades

		umPadawan = new Padawan(gSpriteSheets['assets//Padawan.png'], canvas.width - 1500, canvas.height - 200);
		entities.push(umPadawan);

		umNemoidian = new Nemoidian(gSpriteSheets['assets//Nemoidian_Guard.png'], canvas.width - 200, canvas.height - 150);
		entities.push(umNemoidian);

		//criar os componentes informativos e temporizadores
		barraVidaPadawan = new EnergyBar(5, 5, 120, 12, canvases.components.ctx, 'Vida do Padawan', "black", "black", "purple");
		
		barraVidaNemoidian = new EnergyBar(canvas.width - 135, 5, 120, 12, canvases.components.ctx, 'Vida do Nemoidian', "black", "black", "blue");
		gameTimer = new GameTimer((canvas.width >> 1) - 25, 5, 50, 50, canvases.components.ctx, '', "blue", "black", "white", update, stopGame);

        // aplicar efeitos gráficos ao canvas. Teste os vários filtros
        oBackground.render(canvases.background.ctx);

        canvases.background.canvas.fadeIn(1000);

		gSoundManager.stopAll();

		GameSounds.AMBIENTE.FUNDO.play(true, 0.5);

        gameState = GameStates.RUNNING

		gameTimer.start();
       
		window.addEventListener("keydown", keyDownHandler, false);
		window.addEventListener("keyup", keyUpHandler, false);
		let newMsg= Object.create(msg);
		newMsg.create("ola mundo");
		newMsg.show();
		update();

	}

	function setupGame2(){
		
		loadInfo.classList.toggle("hidden"); // esconder a informaçao de loading
	
		oBackground2 = new Background(gSpriteSheets['assets//Background2.png'], 0, 0);
		//oBackground.x=Math.floor((oBackground.width/3)*-2);
		entities.push(oBackground2);
		
		 
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
		gameTimer = new GameTimer((canvas.width >> 1) - 25, 5, 50, 50, canvases.components.ctx, '', "green", "black", "white", update2, stopGame2);

        // aplicar efeitos gráficos ao canvas. Teste os vários filtros
        oBackground2.render(canvases.background.ctx);

        canvases.background.canvas.fadeIn(1000);

		GameSounds.AMBIENTE.FUNDO.play(true, 0.3);

        gameState = GameStates.RUNNING

		gameTimer.start();
       
		window.addEventListener("keydown", keyDownHandler, false);
		window.addEventListener("keyup", keyUpHandler2, false);
		update2();

	}

	//função que para o jogo. É chamada pelo timer, quando a contagem chega a zero
	function stopGame() {
		cancelAnimationFrame(animationHandler);
		gameState = GameStates.STOPED;
		gameTimer.stop();
		gSoundManager.stopAll();
		GameSounds.AMBIENTE.FINAL.play(true, 0.4);
	
		canvases.background.canvas.colorize("#614719");
		canvases.entities.canvas.colorize("#614719");
		canvases.components.canvas.grayScale();
		canvases.components.canvas.fadeOut(2000);
	}

	function stopGame2() {
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
				umPadawan.vx = umPadawan.vy += 3;
				break;
			case keyboard.KPAD_MINUS:
				umPadawan.vx = umPadawan.vy -= 3;
				break;
				case keyboard.LCTRL :
					umPadawan.podeLancar = true;
					break;
			}
			umPadawan.parado();
		}

		function keyUpHandler2(e){
			var codTecla=e.keyCode;
			teclas[codTecla]=false;  
	
			switch (codTecla) {
				case keyboard.KPAD_PLUS:
					umHanSolo.vx = umHanSolo.vy += 3;
					break;
				case keyboard.KPAD_MINUS:
					umHanSolo.vx = umHanSolo.vy -= 3;
					break;
					case keyboard.LCTRL :
						umHanSolo.podeDisparar = true;
						break;
				}
				umHanSolo.inativo();
			}
	

    function update(){
		//Create the animation loop
    if (gameState == GameStates.RUNNING) {

		if(teclas[keyboard.LEFT]) 	{
			umPadawan.andar();
			umPadawan.x-=umPadawan.vx;
			umPadawan.dir=1;
		}
		if(teclas[keyboard.RIGHT]) 	{
			umPadawan.andar();
			umPadawan.x+=umPadawan.vx;
			umPadawan.dir=-1;
		}
		
		/*
		if (teclas[keyboard.UP])
				umPadawan.y = umPadawan.y - umPadawan.vy < canvas.height - 130 ? canvas.height - 130 : umPadawan.y - umPadawan.vy;

			if (teclas[keyboard.DOWN])
			umPadawan.y = umPadawan.bottom() + umPadawan.vy > canvas.height ? canvas.height - umPadawan.height : umPadawan.y + umPadawan.vy;

			
			if (teclas[keyboard.DOWN])
			umPadawan.y += umPadawan.vy;

		*/	
			if (teclas[keyboard.LCTRL]) {
				teclas[keyboard.LCTRL]=false;
				umPadawan.ataque;
				let umLanca = new Lanca(gSpriteSheets["assets//Padawan.png"], umPadawan.x+200, umPadawan.y+umPadawan.height/2.5,5);
				entities.push(umLanca);
				osLancamentos.push(umLanca);	
			}

			if (teclas[keyboard.SPACE]) {
               umPadawan.saltar();
                umPadawan.vy -= 3;
            }

			

			
			function checkCollisions() {
				for(var i=0; i<osLancamentos.length; i++){
					if(!umNemoidian.killed){
					if(umNemoidian.hitTestRectangle(osLancamentos[i])&&!umPadawan.isColliding){
						umNemoidian.isColliding=true; 
						osLancamentos[i].active=false;     //faz os lasers desaparecer quando bate no inimigo
						umNemoidian.vida -= osLancamentos[i].danolightsaber;
						barraVidaNemoidian.update(umNemoidian.vida);
						
					}} else {
						umNemoidian.atingido();
						stopGame(); //chama a função quando o inimigo morre
						
						
					}
					if(osLancamentos[i].right()<0|| 
						osLancamentos[i].left()>canvas.width ||
						osLancamentos[i].bottom() < 0 ||
						osLancamentos[i].top()> canvas.height){
						osLancamentos[i].active=false;
					}
				}

				if(umNemoidian.blockRectangle(umPadawan)!=-1){
					if(!umPadawan.killed){	
					umNemoidian.ataque();
					umNemoidian.x-=3;
					umPadawan.vida -= 100;
					barraVidaPadawan.update(umPadawan.vida);
					umPadawan.morte();
					stopGame(); //chama a função quando a personagem morre
				}}else if(umNemoidian.andar());
				
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

		animationHandler=window.requestAnimationFrame(update); //Permite mexer todas as animações do nível 
    }

}

function update2(){
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

			
			function checkCollisions2() {
				for(var i=0; i<osLasers.length; i++){
					if(!umInimigo_Cantina.killed){
					if(umInimigo_Cantina.hitTestRectangle(osLasers[i])&&!umHanSolo.isColliding){
						umInimigo_Cantina.isColliding=true; 
						osLasers[i].active=false;     //faz os lasers desaparecer quando bate no inimigo
						umInimigo_Cantina.vida -= osLasers[i].danolaser;
						barraVidaInimigo_Cantina.update2(umInimigo_Cantina.vida);
						
					}} else {
						umInimigo_Cantina.atingido();
						stopGame2(); //chama a função quando o inimigo morre
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
					barraVidaHanSolo.update2(umHanSolo.vida);
					umHanSolo.morte();
					stopGame2(); //chama a função quando a personagem morre
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

		checkCollisions2();
		render2(); // fazer o render das entidades

		clearArrays2(); // limpar os arrays

		animationHandler=window.requestAnimationFrame(update2); 
    }

}


//	efetua a limpeza dos arrays
	function clearArrays(){

	entities = entities.filter(filterByActiveProp);
	osLancamentos = osLancamentos.filter(filterByActiveProp);

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

			barraVidaPadawan.render();
			barraVidaNemoidian.render();
			gameTimer.render();
        }

		function clearArrays2(){


			entities = entities.filter(filterByActiveProp);
			osLasers = osLasers.filter(filterByActiveProp);
		
			}
		
			function filterByActiveProp(obj) {
				if (obj.active == true)
					return obj;
			}
		
			function render2(){
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
		
					barraVidaInimigo_Cantina.render2();
					barraVidaHanSolo.render2();
					gameTimer.render2();
				}

    })();
