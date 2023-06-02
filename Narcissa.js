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

const BERRY_FALL_TIME_MIN = 1000; // 1 second
const BERRY_FALL_TIME_MAX = 11000; // 11 seconds
const BERRY_SURVIVAL_TIME_MIN = 20000; // 20 seconds
const BERRY_SURVIVAL_TIME_MAX = 100000; // 100 seconds
const BERRY_WARNING_TIME = 10000; // 10 seconds

// GLOBAL VARIABLES

let control; // Try not no define more global variables

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
	animation(x, y) { }
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
	}
}

class Empty extends Actor {
	constructor() {
		super(-1, -1, IMAGE_NAME_EMPTY);
		this.atime = Number.MAX_SAFE_INTEGER; // This has a very technical role
	}
	show() { }
	hide() { }
}

class Invalid extends Actor {
	constructor(x, y) {
		super(x, y, IMAGE_NAME_INVALID);
	}
}

class Berry extends Actor {
	constructor(x, y, color) {
		super(x, y, color);
		this.hide();
		this.imageName = BERRY_COLORS[rand(6)];
		this.show();
		this.maxTime = rand(11);
	}
	animation(x, y) { }
}

class Snake extends Actor {
	constructor(x, y) {
		super(x, y, IMAGE_NAME_SNAKE_HEAD);
		[this.movex, this.movey] = [1, 0];
		this.size = 6;
		this.body = new Array(this.size - 1);
		for (let i = 1; i <= this.size - 1; i++) {
			this.body[i - 1] = new SnakeBody(x - i, y);
		}
	}
	handleKey() {
		let k = control.getKey();
		if (k === null);
		else if (typeof k === "string")
			// ignore
			// special command
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
			if (
				control.world[this.x + this.movex][this.y + this.movey] instanceof Shrub
			) {
				for (const element of this.body) {
					if (element === undefined) {
						break;
					}
					element.hide();
				}
				mesg("Game Over - shrub");
				this.hide();
				onLoad();
				return;
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
				mesg("Game Over - tempo");
				onLoad();
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
	}

	addBody(x, y) { }
}

class SnakeBody extends Actor {
	constructor(x, y) {
		super(x, y, IMAGE_NAME_SNAKE_BODY);
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
		let c = document.getElementById("canvas1");
		control = this; // setup global var
		this.key = 0;
		this.time = 0;
		this.ctx = document.getElementById("canvas1").getContext("2d");
		this.empty = new Empty(); // only one empty actor needed, global var
		this.world = this.createWorld();
		this.loadLevel(1);
		this.setupEvents();
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
		this.time++;
		for (let x = 0; x < WORLD_WIDTH; x++)
			for (let y = 0; y < WORLD_HEIGHT; y++) {
				let a = this.world[x][y];
				if (a.atime < this.time) {
					a.atime = this.time;
					a.animation(x, y);
				}
			}
	}

	keyDownEvent(e) {
		this.key = e.keyCode;
	}
	keyUpEvent(e) { }
}

// Functions called from the HTML page

function onLoad() {
	// Asynchronously load the images an then run the game
	GameImages.loadAll(() => new GameControl());
}

function b1() {
	mesg("button1");
}
function b2() {
	mesg("button2");
}
