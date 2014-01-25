var stage, renderer;

var LayerStageUnder;
var LayerBackground;
var LayerStage;
var LayerStageOver;
var LayerForeground;

var ParalaxScroll;

var world = new B2World(B2Vec2.Zero, true);
var gamepad, gamepadStrategy, gamepads = [];
var SIM_SCALE_X = 10;
var SIM_SCALE_Y = 5;

var player;
var playerControls;

var cats = [];
var catHerd;

var enemies = [];

var Events = new EventBroker();
var Resources;

var GameMode_Menu = 1;
var GameMode_Game = 2;
var GameMode = GameMode_Menu;

var Faces = [];

var parallaxScroll;

Math.sign = Math.sign || function (a) { return a > 0 ? 1 : a < 0 ? -1 : 0; };

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

	Resources = new createjs.LoadQueue(false);
	Resources.installPlugin(createjs.Sound);
	Resources.on('complete', loadingComplete);
	Resources.on('error', loadingError);

	var resourceArray = [
		{ id: 'rubble/tree_a_big', src: 'imgs/rubble/tree_a_big.png' },
		{ id: 'chara/cat', src: 'imgs/chara/mocks_cat.png' },
		{ id: 'chara/lion', src: 'imgs/chara/mocks_lion.png' },
		{ id: 'chara/lion_run', src: 'imgs/chara/lion_run.png' },
		{ id: 'chara/catlady', src: 'imgs/chara/mocks_main_large.png' }
	];
	//Add other resources to the array here
	resourceArray = resourceArray.concat(parallaxResources);
	resourceArray = resourceArray.concat(particleResources);

	Resources.loadManifest(resourceArray);
}

function loadingError(target, type, item, error) {
	console.log('loading error: ' + target + ' ' + type + ' ' + item + ' ' + error);
}

function loadingComplete() {

	initMenu();

	//createjs.Ticker.timingMode = createjs.Ticker.RAF;
	createjs.Ticker.setFPS(60);
	createjs.Ticker.addEventListener("tick", function (e) {
		gamepadStrategy.update();
		if (GameMode == GameMode_Menu) {
			menuTick(createjs.Ticker.getInterval() / 1000);
			menuRendererTick();
		} else {
			gameTick(createjs.Ticker.getInterval() / 1000);
			rendererTick(createjs.Ticker.getInterval() / 1000);
		}
		stage.update(e);
	});
}

function initGame() {

	//Layers
	LayerBackground = new createjs.Container();
	stage.addChild(LayerBackground);

	var stageContainer = new createjs.Container();
	stage.addChild(stageContainer);

	LayerStageUnder = new createjs.Container();
	stageContainer.addChild(LayerStageUnder);
	LayerStage = new createjs.Container();
	stageContainer.addChild(LayerStage);
	LayerStageOver = new createjs.Container();
	stageContainer.addChild(LayerStageOver);

	LayerForeground = new createjs.Container();
	stage.addChild(LayerForeground);

	parallaxScroll = new Parallax();
	particles = new ParticleEffects();


	initCatGlobals();

	playerControls = new PlayerControls();

	player = new Player();
	cats.push(new Cat(1, 1));
	cats.push(new Cat(1, 2));
	cats.push(new Cat(1, 3));
	cats.push(new Cat(2, 1));
	cats.push(new Cat(2, 2));
	cats.push(new Cat(2, 3));
	cats.push(new Cat(3, 1));

	catHerd = new CatHerd(cats, player);

	var treeDef = {
		img: Resources.getResult('rubble/tree_a_big'),
		size: new B2Vec2(503, 539).Divide(1.2),
		center: new B2Vec2(200, 460).Divide(1.2),
		radius: 6
	};

	enemies.push(new Tree(treeDef, 90, 80));
	//enemies.push(new Enemy(90, 20));
	//enemies.push(new Enemy(100, 40));
}

function gameTick(dt) {

	playerControls.update();

	player.update(dt);
	catHerd.update(dt);

	world.Step(dt, 10, 10);
	world.ClearForces();
}

function rendererTick(dt) {
	var i;
	player.renderUpdate();
	parallaxScroll.update(dt);
	particles.update();

	for (i = cats.length - 1; i >= 0; i--) {
		cats[i].renderUpdate();
	}

	for (i = enemies.length - 1; i >= 0; i--) {
		enemies[i].renderUpdate();
	}

	//Sort the stage elements by y position
	LayerStage.sortChildren(function (obj1, obj2) {
		if (obj1.y > obj2.y) {
			return 1;
		}
		if (obj1.y < obj2.y) {
			return -1;
		}
		return 0;
	});
}