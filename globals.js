var stage, renderer;
var world = new B2World(B2Vec2.Zero, true);
var gamepad, gamepadStrategy, gamepads = [];
var SIM_SCALE = 10;

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

	createjs.Ticker.setFPS(60);
	createjs.Ticker.addEventListener("tick", function () {
		gamepadStrategy.update();
		gameTick(createjs.Ticker.getInterval() / 1000);
		rendererTick();
		stage.update();
	});
}

var CAT_RANGE = 200;

function gameTick(dt) {

	player.update();

	world.Step(dt, 10, 10);
	world.ClearForces();

}

function rendererTick() {

	player.renderUpdate();
}