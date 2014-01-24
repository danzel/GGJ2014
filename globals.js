var stage, renderer;
var world = new B2World(B2Vec2.Zero, true);
var gamepad, gamepadStrategy, gamepads = [];
var SIM_SCALE = 10;

var cats = [];
var catHerd;

function init() {
	gamepadStrategy = new Gamepad.UpdateStrategies.ManualUpdateStrategy();
	gamepad = new Gamepad(gamepadStrategy);
	gamepad.deadzone = 0.1;
	if (!gamepad.init()) {
		console.log('fail at gamepad');
	}
	gamepad.bind(Gamepad.Event.CONNECTED, function (device) {
		gamepads.push(device);
	});

	stage = new createjs.Stage('canvas');
	createjs.DisplayObject.suppressCrossDomainErrors = true;

	//todo load res

	loadingComplete();
}

var player;
var body, fixture;

var playerShape, targetShape;

function loadingComplete() {

	player = new Player();
	cats.push(new Cat(1, 1));
	cats.push(new Cat(1, 2));
	cats.push(new Cat(1, 3));
	cats.push(new Cat(2, 1));
	cats.push(new Cat(2, 2));
	cats.push(new Cat(2, 3));
	cats.push(new Cat(3, 1));

	catHerd = new CatHerd(cats, player);

	createjs.Ticker.setFPS(60);
	createjs.Ticker.addEventListener("tick", function () {
		gamepadStrategy.update();
		gameTick(createjs.Ticker.getInterval() / 1000);
		rendererTick();
		stage.update();
	});
}

var CAT_RANGE = 20;

function gameTick(dt) {

	player.update(dt);
	catHerd.update(dt);

	world.Step(dt, 10, 10);
	world.ClearForces();

}

function rendererTick() {

	player.renderUpdate();

	for (var i = cats.length - 1; i >= 0; i--) {
		cats[i].renderUpdate();
	}
}