var stage, renderer;

var LayerStageUnderReal;
var LayerStageUnder;
var LayerBackground;
var LayerStage;
var LayerStageOver;
var LayerForeground;
var LayerStaticOverlay;

var ParalaxScroll;

var world = new B2World(B2Vec2.Zero, true);
var gamepad, gamepadStrategy, gamepads = [];
var SIM_SCALE_X = 10;
var SIM_SCALE_Y = 5;

var player;
var playerControls;
var powerMeter;

var cats = [];
var catHerd;

var enemies = [];

var Events = new EventBroker();
var Resources;
var particles;

var GameMode_Menu = 1;
var GameMode_Game = 2;
var GameMode = GameMode_Menu;

var Faces = [];

var parallaxScroll;

Math.sign = Math.sign || function (a) { return a > 0 ? 1 : a < 0 ? -1 : 0; };

function init() {
	stage = new createjs.Stage('canvas');
	createjs.DisplayObject.suppressCrossDomainErrors = true;

	Resources = new createjs.LoadQueue(false);
	Resources.installPlugin(createjs.Sound);
	Resources.on('complete', loadingComplete);
	Resources.on('error', loadingError);

	var resourceArray = [
		{ id: 'rubble/tree_a_big', src: 'imgs/rubble/tree_a_big.png' },
		{ id: 'chara/cat', src: 'imgs/chara/cat_run.png' },
		{ id: 'chara/lion', src: 'imgs/chara/mocks_lion.png' },
		{ id: 'chara/lion_run', src: 'imgs/chara/lion_run.png' },
		{ id: 'chara/doge_run', src: 'imgs/chara/doge_run.png' },
		{ id: 'chara/boss', src: 'imgs/chara/boss.png' },
		{ id: 'chara/catlady', src: 'imgs/chara/main_walk.png' }
	];
	//Add other resources to the array here
	resourceArray = resourceArray.concat(parallaxResources);
	resourceArray = resourceArray.concat(particleResources);
	resourceArray = resourceArray.concat(soundResources);

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

	world.SetContactListener(new ContactListener());
	createWalls();

	//Layers
	LayerBackground = new createjs.Container();
	stage.addChild(LayerBackground);

	var stageContainer = new createjs.Container();
	stage.addChild(stageContainer);

	LayerStageUnderReal = new createjs.Container();
	stageContainer.addChild(LayerStageUnderReal);

	LayerStage = new createjs.Container();
	stageContainer.addChild(LayerStage);
	LayerStageOver = new createjs.Container();
	stageContainer.addChild(LayerStageOver);

	LayerStageUnder = new createjs.Container();
	stageContainer.addChild(LayerStageUnder);

	LayerForeground = new createjs.Container();
	stage.addChild(LayerForeground);

	LayerStaticOverlay = new createjs.Container();
	stage.addChild(LayerStaticOverlay);

	parallaxScroll = new Parallax();


	initCatGlobals();
	initPlayerGlobals();
	initEnemyGlobals();

	playerControls = new PlayerControls();

	player = new Player();
	cats.push(new Cat(05, 45));
	cats.push(new Cat(05, 50));
	cats.push(new Cat(05, 55));
	cats.push(new Cat(10, 45));
	cats.push(new Cat(10, 50));
	cats.push(new Cat(10, 55));
	cats.push(new Cat(15, 45));

	cats.push(new Cat(20+05, 45));
	cats.push(new Cat(20+05, 50));
	cats.push(new Cat(20+05, 55));
	cats.push(new Cat(20+10, 45));
	cats.push(new Cat(20+10, 50));
	cats.push(new Cat(20+10, 55));
	cats.push(new Cat(20+15, 45));


	catHerd = new CatHerd(cats, player);

	powerMeter = new PowerMeter();

	var treeDef = {
		img: Resources.getResult('rubble/tree_a_big'),
		size: new B2Vec2(503, 539).Divide(1.2),
		center: new B2Vec2(200, 460).Divide(1.2),
		radius: 6
	};
	var enemyDef = {
		runSheet: Enemy.runSheet,
		radiusSmall: 2,
		radiusBig: 4,

		densitySmall: 0.2,
		densityBig: 0.05,

		smallW: Enemy.imgW / 3,
		smallH: Enemy.imgH / 3,
		
		bigW: Enemy.imgW,
		bigH: Enemy.imgH,

		maxHealth: 300
	};


	var bossDef = {
		runSheet: Enemy.bossSheet,
		radiusSmall: 4,
		radiusBig: 6,

		densitySmall: 10,
		densityBig: 2,

		smallW: Enemy.imgW / 3,
		smallH: Enemy.imgH / 3,

		bigW: Enemy.imgW,
		bigH: Enemy.imgH,

		maxHealth: 1500
	};

	enemies.push(new Tree(treeDef, 90, 80));
	enemies.push(new Tree(treeDef, 200, 140));
	enemies.push(new Tree(treeDef, 300, 42));
	enemies.push(new Tree(treeDef, 400, 140));
	enemies.push(new Tree(treeDef, 500, 60));

	enemies.push(new Enemy(enemyDef, [
		new B2Vec2(90, 120)
	]));

	enemies.push(new Enemy(enemyDef, [
		new B2Vec2(150, 70).SetRange(20),
		new B2Vec2(150, 120).SetRange(20)
	]));


	enemies.push(new Enemy(enemyDef, [
		new B2Vec2(250, 70).SetRange(20),
		new B2Vec2(300, 120).SetRange(20)
	]));

	enemies.push(new Enemy(enemyDef, [
		new B2Vec2(400, 100).SetRange(60)
	]));
	enemies.push(new Enemy(enemyDef, [
		new B2Vec2(410, 120).SetRange(60)
	]));
	enemies.push(new Enemy(enemyDef, [
		new B2Vec2(400, 140).SetRange(60)
	]));



	enemies.push(new Enemy(bossDef, [
		new B2Vec2(560, 80)
	]));
	enemies[enemies.length - 1].isBoss = true;
	enemies[enemies.length - 1].maxForce *= 100;
	enemies[enemies.length - 1].maxForceSquared *= 100 * 100;

	//enemies.push(new Enemy(100, 40));


	particles = new ParticleEffects();
	SoundManager.init();
}

function createWalls() {

	var screenHeight = 720 / SIM_SCALE_Y;

	//Create a physics body
	var fixDef = new B2FixtureDef();
	var bodyDef = new B2BodyDef();
	bodyDef.type = B2Body.b2_staticBody;


	//Left wall
	fixDef.shape = B2PolygonShape.AsBox(1, screenHeight / 2);
	var body = world.CreateBody(bodyDef);
	body.CreateFixture(fixDef);
	body.SetPosition(new B2Vec2(-1, screenHeight / 2));

	for (var i = 1; i <= 10; i++) {
		//bottom wall
		fixDef.shape = B2PolygonShape.AsBox(100, 1);
		body = world.CreateBody(bodyDef);
		body.CreateFixture(fixDef);
		body.SetPosition(new B2Vec2(100 * i, screenHeight + 2));


		//top wall
		fixDef.shape = B2PolygonShape.AsBox(100, 1);
		body = world.CreateBody(bodyDef);
		body.CreateFixture(fixDef);
		body.SetPosition(new B2Vec2(100 * i, 40));
	}

	fixDef.shape = B2PolygonShape.AsBox(1, screenHeight / 2);
	body = world.CreateBody(bodyDef);
	body.CreateFixture(fixDef);
	body.SetPosition(new B2Vec2(600, screenHeight / 2));

}

function gameTick(dt) {

	playerControls.update();

	player.update(dt);
	catHerd.update(dt);

	for (i = enemies.length - 1; i >= 0; i--) {
		if (!(enemies[i] instanceof Tree)) {
			EnemyAi.preUpdate(dt, enemies[i], enemies, player);
		}
	}
	//Move agents based on forces being applied (aka physics)
	for (i = this.enemies.length - 1; i >= 0; i--) {
		var agent = this.enemies[i];

		if (agent.forceToApply) {
			//Apply the force
			//console.log(i + ': ' + agent.forceToApply.x + ', ' + agent.forceToApply.y);
			agent.body.ApplyImpulse(agent.forceToApply.Multiply(dt), agent.position());
		}
	}

	world.Step(dt, 10, 10);
	world.ClearForces();

	player.updateDamage();

	var i;

	for (i = cats.length - 1; i >= 0; i--) {
		cats[i].updateDamage();
	}

	for (i = enemies.length - 1; i >= 0; i--) {
		enemies[i].updateDamage();
	}

	powerMeter.update(dt);


	if ((player.isDead() || enemies[enemies.length - 1].isDead()) && !playerIsDead) {
	//if (!playerIsDead) {
		playerIsDead = true;

		player.forceScale = 0;

		var black = new createjs.Shape();
		black.graphics.beginFill('#000').drawRect(0, 0, 1280, 720);
		stage.addChild(black);

		black.alpha = 0;
		createjs.Tween.get(black)
			.to({ alpha: 0.75 }, 5000);

		SoundManager._gg.play();

		var text = player.isDead() ? 'YOU HAVE DIED :(' : 'THE DOGE ARE DEFEAT';

		var deadText = new createjs.Text(text, '60px Arial', '#fff');
		deadText.x = 400 + 2;
		deadText.y = 200 + 2;
		stage.addChild(deadText);

		deadText = new createjs.Text(text, '60px Arial', '#fff');
		deadText.x = 400 - 2;
		deadText.y = 200 - 2;
		stage.addChild(deadText);

		deadText = new createjs.Text(text, '60px Arial', '#fff');
		deadText.x = 400 + 2;
		deadText.y = 200 - 2;
		stage.addChild(deadText);

		deadText = new createjs.Text(text, '60px Arial', '#fff');
		deadText.x = 400 - 2;
		deadText.y = 200 + 2;
		stage.addChild(deadText);

		deadText = new createjs.Text(text, '60px Arial', '#000');
		deadText.x = 400;
		deadText.y = 200;
		stage.addChild(deadText);
	}

}

var playerIsDead = false;

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