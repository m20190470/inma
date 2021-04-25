/** 
 * 
 */

const game = {}; // encapsula a informação de jogo. Está vazio mas vai-se preenchendo com definições adicionais.


const sounds = {		// sons do jogo.
	background: null,
	flip: null,
	success: null,
	hide: null
};

cartaID=[]; //array para as 2 cartas escolhidas para fazer comparação do par.

let temporizador = null; //temporizador para controlar a barra de progresso

const carta={
	idCountry:-1,
	face:null,
	sprite:null, //div da carta.
 	pos:null,
	virada:false,
	setup:function(){
		this.sprite=document.createElement("div");
		this.sprite.classList.add("carta");
		console.log(this.sprite);
		this.sprite.style.backgroundPositionX=this.face.x;
		this.sprite.style.backgroundPositionY=this.face.y;
		this.sprite.style.top=this.pos.y+"px";
		this.sprite.style.left=this.pos.x+"px";
		this.esconder();
		this.sprite.onclick=()=>{
			if(!this.virada) {
				this.virar();
				cartaID.push(this);	
				console.log(carta[0],cartaID[1]);					//insere no array cartaID a carta escolhida (a carta clicada).		
				if (cartaID.length == 2) {					//se o array cartaID tiver 2 cartas inseridas (ou seja se existir uma cartaID[0] e uma cartaID[1]).
					if (cartaID[0].sprite.style==cartaID[1].sprite.style) {		//se a 1ª carta clicada for exactamente a mesma que a 2ª clicada 
						cartaID=[];												//o array é novamente criado, pois assim impede que o jogo bloqueie o jogador
					}															//de clicar numa carta 2 vezes seguidas.
					else {														
						setTimeout(carta.comparar, 500)		//ele chama a funçao comparar() para verificar se são iguais.
					}										
				}				
				console.log(cartaID[0],cartaID[1])
			}
			else {
				this.esconder();
			}
		}
	},
	esconder:function(){
		this.sprite.classList.add("escondida");
		game.sounds.hide.play();
		this.virada=false;
	},
	virar:function(){
		this.virada=true;
		this.sprite.classList.remove("escondida");
		game.sounds.flip.play();
	},
	comparar:function(){
		
		if (cartaID[0].face.country == cartaID[1].face.country ) {  	//temos uma condição if em que compara o id da 1ª carta clicada 
			parEncontrado();										//com o id da 2ª carta clicada, se o id for igual chama a 
			
			game.sounds.success.play();								//função parEncontrado().
			console.log("Encontraste um par")
			cartaID[0].sprite.classList.add("matched"); //Faz a animação quando encontrar um par
			cartaID[1].sprite.classList.add("matched"); //
			cartaID[0].sprite.classList.add("evitar-clicks"); //Classe do CSS para prevenir clickar nos que já têm pares
			cartaID[1].sprite.classList.add("evitar-clicks");	//					
			cartaID=[];
			//console.log(cartaID);
		}
		else {
			setTimeout(function(){ 								//se o id for diferente ele chama a função parNãoEncontrado após 500ms.
			}, 500);
			parNaoEncontrado();
			game.sounds.hide.play();
			console.log("Tente novamente");
			cartaID=[];
			//console.log(cartaID);
		} 
	}	
}

const ROWS = 6;	//numero de linhas do tabuleiro.
const COLS = 8;	//numero de colunas do tabuleiro.

game.sounds = sounds; // Adicionar os sons sons do jogo ao objeto game.
game.board  = Array(COLS).fill().map(() => Array(ROWS)); // criação do tabuleiro como um array de 6 linhas x 8 colunas.
 

const face = {			// Representa a imagem de uma carta de um país. Esta definição é apenas um modelo para outros objectos que 
	country: -1,		//sejam criados com esta base através de let umaFace = Object.create(face).
	x: -1,
	y: -1	
};

const CARDSIZE = 100; 	// tamanho da carta (altura e largura).
let faces = []; 		// Array que armazena objectos face que contêm posicionamentos da imagem e códigos dos paises.
 

window.addEventListener("load", init, false);

function init() {
	game.stage = document.querySelector("#stage");
	setupAudio(); 		// configurar o audio.
	getFaces(); 		// calcular as faces e guardar no array faces.
	createCountries();	// criar países.
	game.sounds.background.play();
	scrambler();	//baralhar as cartas do jogo
	render();
	
}

document.addEventListener('keyup', function(e) {	//Teste: configurar a tecla R para reiniciar o jogo.
	console.log(e.code)
	if(e.code == 'KeyR') {
		for(let i =0; i<6; i++) {
			for(let j =0; j<8; j++) {
				game.board[i][j].virar();
			}
		}
		
		clearInterval(temporizador);
		document.getElementById("time").value=0;
		scrambler();
		
	}	
})



function createCountries() {	// Cria os paises e coloca-os no tabuleiro de jogo(array board[][]).
   			let count = 0;
			for (let i=0; i<6; i++) {
				for(let j=0; j<8; j++){
					let umaCarta = Object.create(carta); 
					umaCarta.face=faces[count]; 
					umaCarta.pos={}; 
					umaCarta.pos.x=CARDSIZE*j; 
					umaCarta.pos.y=CARDSIZE*i;
					umaCarta.setup(); 
					umaCarta.virar(); 
					game.board[i][j]=umaCarta; 
					count++; 
					if (count>23) count=0; 
					
				}
			}
}


function render() {		// Adicionar as cartas do tabuleiro à stage.
	for (let i=0; i<6; i++) {
		for(let j=0; j<8; j++){
		 game.stage.appendChild(game.board[i][j].sprite);
	 }
	}
}

// baralha as cartas no tabuleiro
function scrambler() {
	let contador=0;
	let maxCount=100;
			 let timeHandler=setInterval(()=>{
				for(let i =0; i<6; i++) {
					for(let j =0; j<8; j++) {
						game.board[i][j].sprite.classList.add("evitar-clicks");		//impede que o jogador clique nas cartas quando existe
					}																//um baralhamento das cartas
				}
				let card1 = game.board[Math.floor(Math.random()*6)][Math.floor(Math.random()*8)];	//é gerada uma carta aleatória e atribuida à variavel card1.
				let card2 = game.board[Math.floor(Math.random()*6)][Math.floor(Math.random()*8)];	//é gerada uma carta aleatória e atribuida à variavel card2.

				//card1.sprite.classList.add("evitar-clicks");
				//card2.sprite.classList.add("evitar-clicks");
				
				let auxx = card1.sprite.style.left;	//os valores de posicionamento da card1 são atribuidos ás variaveis auxx e auxy.
				let auxy = card1.sprite.style.top;
				
				card1.sprite.style.left= card2.sprite.style.left;	//os valores de posicionamento da card2 são atribuidos à card1.
				card1.sprite.style.top= card2.sprite.style.top;
				card2.sprite.style.left= auxx;						//os valores de posicionamento da card1 que foram atribuidos ás 
				card2.sprite.style.top= auxy;						//variáveis auxx e auxy são agora atribuidos á card2.
				contador++;
				if(contador===maxCount) {							//viramos todas as cartas para baixo de forma a ficarem escondidas.
					clearInterval(timeHandler); 
					for(let i =0; i<6; i++) {
						for(let j =0; j<8; j++) {
							game.board[i][j].esconder();
							game.board[i][j].sprite.classList.remove("evitar-clicks");		//volta a permitir o clique do jogador para poder jogar
						}
					}
				
				}
				if (contador==100) tempo();      //a barra de progresso do tempo só é iniciada após as cartas estarem baralhadas. 
			},20)	
}

function scramblerEscondidas() {
	let contador=0;
	let maxCount=100;
			let timeHandler=setInterval(()=>{
				for(let i =0; i<6; i++) {
					for(let j =0; j<8; j++) {
						game.board[i][j].sprite.classList.add("evitar-clicks");		//impede que o jogador clique nas cartas quando existe
					}																//um baralhamento das cartas
				}
				let card1 = game.board[Math.floor(Math.random()*6)][Math.floor(Math.random()*8)];	
				let card2 = game.board[Math.floor(Math.random()*6)][Math.floor(Math.random()*8)];	
				
				if (card1.virada==false && card2.virada==false) {	//o baralhamento só será feito nas cartas geradas que estejam viradas para baixo
					let auxx = card1.sprite.style.left;				//ou seja, só acontece o baralhamento se a card1 e a card2 estiverem ambas escondidas
					let auxy = card1.sprite.style.top;
				
					card1.sprite.style.left= card2.sprite.style.left;	
					card1.sprite.style.top= card2.sprite.style.top;
					card2.sprite.style.left= auxx;						 
					card2.sprite.style.top= auxy;						
				}
					contador++;
					if (contador==maxCount) {
						clearInterval(timeHandler);
						for(let i =0; i<6; i++) {
							for(let j =0; j<8; j++) {
								if(game.board[i][j].virada==false) {
									game.board[i][j].sprite.classList.remove("evitar-clicks");		//volta a permitir o clique do jogador para poder jogar
								}
							}
						}
					}
				if (contador==100) tempo();      
				 		
			},20)
}

function parEncontrado() {		//função que vira as 2 cartas clicadas, ou seja, o par foi encontrado logo as imagens dos paises  
								//ficam visiveis.
	cartaID[0].virar();
	console.log(cartaID[0]);
	cartaID[1].virar();
	console.log(cartaID[1]);
}

function parNaoEncontrado() {	//função oposta a parEncontrado, as 2 cartas clicadas como não eram par ficam agora viradas para baixo.

	cartaID[0].esconder();
	cartaID[1].esconder();

}



function tempo(){		//função que controla a nossa barra de progresso, utiliza um total de 60 segundos (maxCount) para o seu ciclo. 
	let contador=0;		
	let maxCount=60;
	 temporizador=null;
	if (temporizador != null) clearInterval(temporizador)	
	else 
	temporizador=setInterval(()=>{
		contador++;
		document.getElementById("time").value=contador;
		if(contador===maxCount-5)document.getElementById("time").classList.add("warning"); 	//quando faltam 5 segundos para terminar 
		if(contador===maxCount) {															//o ciclo, é visivel um aviso com cor 
			clearInterval(temporizador);													//vermelha a piscar.
			document.getElementById("time").classList.remove("warning");					//quando o ciclo termina o aviso é retirado
			scramblerEscondidas();															//e a função scramblerEscondidas() - baralhar 																		//iniciada.
		} 																					//os pares não encontrados - é executada
	},1000)
	
}


/* ------------------------------------------------------------------------------------------------  
 ** /!\ NÃO MODIFICAR ESTAS FUNÇÕES /!\
-------------------------------------------------------------------------------------------------- */
 
// configuração do audio
function setupAudio() {
	game.sounds.background = document.querySelector("#backgroundSnd");
	game.sounds.success = document.querySelector("#successSnd");
	game.sounds.flip = document.querySelector("#flipSnd");
	game.sounds.hide = document.querySelector("#hideSnd");
	game.sounds.win = document.querySelector("#goalSnd");

	// definições de volume;
	game.sounds.background.volume=0.05;  // o volume varia entre 0 e 1

	// nesta pode-se mexer se for necessário acrescentar ou configurar mais sons

}

// calcula as coordenadas das imagens da selecao de cada país e atribui um código único
function getFaces() {
/* NÂO MOFIFICAR ESTA FUNCAO */
	let offsetX = 1;
	let offsetY = 1;
	for (let i = 0; i < 5; i++) {
		offsetX = 1;
		for (let j = 0; j < 5; j++) {
			let countryFace = Object.create(face); 				// criar um objeto com base no objeto face
			countryFace.x = -(j * CARDSIZE + offsetX) + "px";   // calculo da coordenada x na imagem
			countryFace.y = -(i * CARDSIZE + offsetY) + "px";   // calculo da coordenada y na imagem
			countryFace.country = "" + i + "" + j; 			    // criação do código do país
			faces.push(countryFace); 					        // guardar o objeto no array de faces
			offsetX += 2;
		}
		offsetY += 2;
	}
}

/* ------------------------------------------------------------------------------------------------  
 ** /!\ NÃO MODIFICAR ESTAS FUNÇÕES /!\
-------------------------------------------------------------------------------------------------- */
