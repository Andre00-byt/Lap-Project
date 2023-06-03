/*	Narcissa

Aluno 1: 62349, António Salselas 
Aluno 2: 62566, André Soares 

Comentario:

O ficheiro "Narcissa.js" tem de incluir, logo nas primeiras linhas,
um comentÃ¡rio inicial contendo: o nome e nÃºmero dos dois alunos que
realizaram o projeto; indicaÃ§Ã£o de quais as partes do trabalho que
foram feitas e das que nÃ£o foram feitas (para facilitar uma correÃ§Ã£o
sem enganos); ainda possivelmente alertando para alguns aspetos da
implementaÃ§Ã£o que possam ser menos Ã³bvios para o avaliador.

0123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789
*/

// GLOBAL CONSTANTS

const ANIMATION_EVENTS_PER_SECOND = 4;

const IMAGE_NAME_EMPTY = "empty";
const IMAGE_NAME_INVALID = "invalid";
const IMAGE_NAME_SHRUB = "shrub";

const IMAGE_NAME_SNAKE_HEAD = "snakeHead";
const IMAGE_NAME_SNAKE_BODY = "snakeBody";

const BERRY_COLORS = [
	"berryBlue",
	"berryBrown",
	"berryPurple",
	"berryRed",
	"berryOrange",
	"berryGreen",
];

const BERRY_FALL_TIME_MIN = ANIMATION_EVENTS_PER_SECOND;
const BERRY_FALL_TIME_MAX = 11 * ANIMATION_EVENTS_PER_SECOND;
const BERRY_SURVIVAL_TIME_MIN = 20 * ANIMATION_EVENTS_PER_SECOND;
const BERRY_SURVIVAL_TIME_MAX = 100 * ANIMATION_EVENTS_PER_SECOND;

// GLOBAL VARIABLES

let control;// Try not no define more global variables
let start = false;
let pause = false;
let startTime = 0;

// ACTORS

class Actor {
	constructor(x, y, imageName) {
		this.x = x;
		this.y = y;
		this.atime = 0; // This has a very technical role in the control of the animations
		this.imageName = imageName;
		this.show();
	}
	draw(x, y, image) {
		control.ctx.drawImage(image, x * ACTOR_PIXELS_X, y * ACTOR_PIXELS_Y);
	}
	show() {
		this.checkPosition();
		control.world[this.x][this.y] = this;
		this.draw(this.x, this.y, GameImages[this.imageName]);
	}
	hide() {
		control.world[this.x][this.y] = control.getEmpty();
		this.draw(this.x, this.y, GameImages[IMAGE_NAME_EMPTY]);
	}
	move(dx, dy) {
		this.hide();
		this.x += dx;
		this.y += dy;
		this.show();
	}
	animation(x, y) {
		;
	}
	checkPosition() {
		if (this.x < 0) this.x = WORLD_WIDTH - 1;

		if (this.x >= WORLD_WIDTH) this.x = 0;

		if (this.y < 0) this.y = WORLD_HEIGHT - 1;

		if (this.y >= WORLD_HEIGHT) this.y = 0;
	}
}

class Shrub extends Actor {

	constructor(x, y, color) {
		super(x, y, IMAGE_NAME_SHRUB);
		this.time = (20 + rand(80)) * ANIMATION_EVENTS_PER_SECOND;
		this.coords = new Array(0);
	}

	animation(x, y) {
		this.time--;
		let i = 0;
		if (this.time === 0) {
			let boolAux = true;
			if (this.coords.length === 0) {
				while (boolAux && i < 9) {
					let auxX = this.x - 1 + rand(2);
					let auxY = this.y - 1 + rand(2);
					if (auxX < WORLD_WIDTH && auxX > -1 && auxY < WORLD_HEIGHT &&
						auxY > -1 && control.world[auxX][auxY] instanceof Empty) {
						boolAux = false;
						this.coords.push(new ShrubChild(auxX, auxY, IMAGE_NAME_SHRUB));
					}
					i++;
				}
			}
			else {
				while (boolAux) {
					let chosenOne = this.coords[rand(this.coords.length)];
					while (boolAux && i < 9) {
						let auxX = chosenOne.x - 1 + rand(2);
						let auxY = chosenOne.y - 1 + rand(2);
						if (auxX < WORLD_WIDTH && auxX > -1 && auxY < WORLD_HEIGHT &&
							auxY > -1 && control.world[auxX][auxY] instanceof Empty) {
							boolAux = false;
							this.coords.push(new ShrubChild(auxX, auxY, IMAGE_NAME_SHRUB));
							break;
						}
						i++;
					}
					i = 0;
				}
			}
			this.time = (20 + rand(80)) * ANIMATION_EVENTS_PER_SECOND;
		}
	}
}

class ShrubChild extends Actor {
	constructor(x, y, color) {
		super(x, y, IMAGE_NAME_SHRUB);
	}
}

class Empty extends Actor {
	constructor() {
		super(-1, -1, IMAGE_NAME_EMPTY);
		this.atime = Number.MAX_SAFE_INTEGER; // This has a very technical role
	}
	show() { ; }
	hide() { ; }
}

class Invalid extends Actor {
	constructor(x, y) {
		super(x, y, IMAGE_NAME_INVALID);
	}
}

class Berry extends Actor {
	constructor(x, y, color) {
		super(x, y, color);
		this.almostDying = false;
		this.hide();

		if (color === IMAGE_NAME_EMPTY)
			this.imageName = BERRY_COLORS[rand(6)];

		this.show();
		this.time = BERRY_SURVIVAL_TIME_MIN +
			rand(BERRY_SURVIVAL_TIME_MAX - BERRY_SURVIVAL_TIME_MIN);
	}
	animation(x, y) {
		this.time--;
		if (this.time === 10 * ANIMATION_EVENTS_PER_SECOND) {
			this.drawCircle(this.x, this.y, "white")
			this.almostDying = true;
		}

		if (this.time === 0) {
			this.hide();
		}
	}

	drawCircle(x, y, color) {
		control.ctx.beginPath();
		control.ctx.arc(
			x * ACTOR_PIXELS_X + ACTOR_PIXELS_X / 2 - 1 / 2,
			y * ACTOR_PIXELS_Y + ACTOR_PIXELS_Y / 2,
			3,
			0,
			2 * Math.PI
		);
		control.ctx.fillStyle = color;
		control.ctx.fill();
	}
}

class Snake extends Actor {
	constructor(x, y) {
		super(x, y, IMAGE_NAME_SNAKE_HEAD);
		[this.movex, this.movey] = [1, 0];
		this.size = 5;
		this.body = new Array(this.size - 1);
		for (let i = 1; i <= this.size - 1; i++) {
			this.body[i - 1] = new SnakeBody(x - i, y, IMAGE_NAME_SNAKE_BODY);
		}
		this.lastColors = new Array(3);
	}
	handleKey() {
		let k = control.getKey();
		if (k === null); // ignore
		else if (typeof k === "string")
			// special command
			mesg("special command == " + k);
		else {
			// change direction
			if (-this.movex != k[0] || -this.movey != k[1]) {
				[this.movex, this.movey] = k;
			}
		}
	}
	animation(x, y) {
		this.handleKey();

		let auxX = this.x;
		let auxY = this.y;

		if (
			this.x + this.movex < WORLD_WIDTH &&
			this.y + this.movey < WORLD_HEIGHT &&
			this.x + this.movex > 0 &&
			this.y + this.movey > 0
		) {
			let element = control.world[this.x + this.movex][this.y + this.movey];
			if (element instanceof Shrub) {
				for (const element of this.body) {
					if (element === undefined) {
						break;
					}
					element.hide();
				}
				control.clearALL();
				this.size = 5;
				mesg("Game Over - shrub");
				start = false;
				pause = false;
				this.hide();
				onLoad();
				control.mins = 0;
				control.seconds = 0;
				control.milliSeconds = 0;
				timeDisplay.innerHTML = "00:00:000";
				return;
			}
			else if (element instanceof Berry) {
				let boolAux = true;
				for (let i = 0; i < this.lastColors.length; i++) {
					if (this.lastColors[i] === element.imageName) {
						this.size = div(this.size, 2);
						if (this.size < 5) {
							this.size = 5;
						}
						for (let j = this.size - 1; j < this.body.length; j++) {
							let aux = this.body.pop();
							aux.hide();
						}
						boolAux = false;
						break;
					}
				}
				if (element.almostDying && boolAux) {
					this.size += 2;
					this.body.push(new SnakeBody(-1, -1, IMAGE_NAME_SNAKE_BODY));
					this.body.push(new SnakeBody(-1, -1, IMAGE_NAME_SNAKE_BODY));
				}
				else if (boolAux) {
					this.size++;
					this.body.push(new SnakeBody(-1, -1, IMAGE_NAME_SNAKE_BODY));
				}

				for (let i = 2; i > 0; i--) {
					this.lastColors[i] = this.lastColors[i - 1];
				}
				this.lastColors[0] = element.imageName;

				this.changeBody(element);
			}

		}

		this.move(this.movex, this.movey);

		for (const element of this.body) {
			let currentSegment = element;
			if (currentSegment === undefined) {
				break;
			}
			if (currentSegment.x == this.x && currentSegment.y == this.y) {
				for (const element of this.body) {
					if (element === undefined) {
						break;
					}
					element.hide();
				}
				control.clearALL();
				this.size = 5;
				mesg("Game Over - Body");
				start = false;
				pause = false;
				onLoad();
				control.mins = 0;
				control.seconds = 0;
				control.milliSeconds = 0;
				timeDisplay.innerHTML = "00:00:000";
				return;
			}
		}

		for (const element of this.body) {
			let currentSegment = element;
			if (currentSegment === undefined) {
				break;
			}
			let oldx = currentSegment.x;
			let oldy = currentSegment.y;
			currentSegment.changePosition(auxX, auxY);
			auxX = oldx;
			auxY = oldy;
		}

		if (this.size >= 300) {
			control.clearALL();
			mesg("Victory Royale");
			this.size = 5;
			pause = false;
			start = false;
			onLoad();
			control.mins = 0;
			control.seconds = 0;
			control.milliSeconds = 0;
			timeDisplay.innerHTML = "00:00:000";
		}
	}

	changeBody(element) {
		for (let i = 2; i > 0; i--) {
			this.body[i].imageName = this.body[i - 1].imageName;
		}

		this.body[0].imageName = element.imageName;
	}
}

class SnakeBody extends Actor {
	constructor(x, y, imageName) {
		super(x, y, imageName);
	}
	changePosition(x, y) {
		this.hide();
		this.x = x;
		this.y = y;
		this.show();
	}
}

// GAME CONTROL

class GameControl {
	constructor() {
		control = this; // setup global var
		this.key = 0;
		this.time = 0;
		this.ctx = document.getElementById("canvas1").getContext("2d");
		this.empty = new Empty(); // only one empty actor needed, global var
		this.world = this.createWorld();
		this.loadLevel(1);
		this.setupEvents();
		this.timeToAdd = rand(10 * ANIMATION_EVENTS_PER_SECOND) +
			1 * ANIMATION_EVENTS_PER_SECOND;
		this.score = 0;
		this.mins = 0;
		this.seconds = 0;
		this.milliSeconds = 0;
	}
	getEmpty() {
		return this.empty;
	}
	createWorld() {
		// matrix needs to be stored by columns
		let world = new Array(WORLD_WIDTH);
		for (let x = 0; x < WORLD_WIDTH; x++) {
			let a = new Array(WORLD_HEIGHT);
			for (let y = 0; y < WORLD_HEIGHT; y++) a[y] = this.empty;
			world[x] = a;
		}
		return world;
	}
	loadLevel(level) {
		if (level < 1 || level > MAPS.length) fatalError("Invalid level " + level);
		let map = MAPS[level - 1]; // -1 because levels start at 1
		for (let x = 0; x < WORLD_WIDTH; x++)
			for (let y = 0; y < WORLD_HEIGHT; y++) {
				// x/y reversed because map is stored by lines
				GameFactory.actorFromCode(map[y][x], x, y);
			}
	}
	getKey() {
		let k = this.key;
		this.key = 0;
		switch (k) {
			case 37:
			case 79:
			case 74:
				return [-1, 0]; // LEFT, O, J
			case 38:
			case 81:
			case 73:
				return [0, -1]; // UP, Q, I
			case 39:
			case 80:
			case 76:
				return [1, 0]; // RIGHT, P, L
			case 40:
			case 65:
			case 75:
				return [0, 1]; // DOWN, A, K
			case 0:
				return null;
			default:
				return String.fromCharCode(k);
			// http://www.cambiaresearch.com/articles/15/javascript-char-codes-key-codes
		}
	}
	setupEvents() {
		addEventListener("keydown", (e) => this.keyDownEvent(e), false);
		addEventListener("keyup", (e) => this.keyUpEvent(e), false);
		setInterval(
			() => this.animationEvent(),
			1000 / ANIMATION_EVENTS_PER_SECOND
		);
	}
	animationEvent() {
		if (pause) {
			this.time++;
			this.updateClock();
			timeDisplay.innerHTML = this.mins + ":" + this.seconds + ":" + this.milliSeconds;
			for (let x = 0; x < WORLD_WIDTH; x++) {
				for (let y = 0; y < WORLD_HEIGHT; y++) {
					let a = this.world[x][y];
					if (a.atime < this.time) {
						a.atime = this.time;
						a.animation(x, y);
						if (a instanceof Snake) {
							this.score = a.size;
							scorebox.innerHTML = "Score: " + this.score;
						}
					}
				}
			}

			this.timeToAdd--;
			if (this.timeToAdd === 0) {
				this.addBeries();
				this.timeToAdd = rand(10 * ANIMATION_EVENTS_PER_SECOND) +
					1 * ANIMATION_EVENTS_PER_SECOND;
			}
		}

	}
	addBeries() {
		let nBerriesToAdd = rand(4) + 1;
		while (nBerriesToAdd > 0) {
			let x = rand(WORLD_WIDTH);
			let y = rand(WORLD_HEIGHT);
			if (this.world[x][y] instanceof Empty) {
				this.world[x][y] = new Berry(x, y, "empty");
				nBerriesToAdd--;
			}
		}
	}
	keyDownEvent(e) {
		this.key = e.keyCode;
	}
	keyUpEvent(e) {
		;
	}

	clearALL() {
		for (let x = 0; x < WORLD_WIDTH; x++)
			for (let y = 0; y < WORLD_HEIGHT; y++) {
				this.world[x][y].hide();
			}
	}

	updateClock() {
		this.milliSeconds += 250;

		if (this.milliSeconds >= 1000) {
			this.seconds++;
			this.milliSeconds = 0;
		}

		if (this.seconds >= 60) {
			this.mins++;
			this.seconds = 0;
		}
	}
}

// Functions called from the HTML page

function onLoad() {
	// Asynchronously load the images an then run the game
	GameImages.loadAll(() => new GameControl());
}

function pauseFun() {
	pause = !pause;
}
function startFun() {
	if (!start) {
		pause = true;
		start = true;
		startTime = Date.now();
	}
}