//This file just deals with drawing things.
//It is probably cludgy as, don't look in here for good coding advice! :)s

var stage, renderer;

var world = new B2World(B2Vec2.Zero, true);
var gamepad, gamepadStrategy, gamepads = [];

var SIM_SCALE = 10;

function init() {
	gamepadStrategy = new Gamepad.UpdateStrategies.ManualUpdateStrategy();
	gamepad = new Gamepad(gamepadStrategy);
	gamepad.deadzone = 0.1;
	if (!gamepad.init()) {
		console.log('fail at ggamepad');
	}
	gamepad.bind(Gamepad.Event.CONNECTED, function(device) {
		gamepads.push(device);
	});
	
	stage = new createjs.Stage('canvas');
	createjs.DisplayObject.suppressCrossDomainErrors = true;

	//todo load res

	loadingComplete();
}

var body, fixture;

var playerShape, targetShape;

function loadingComplete() {

	//Create a physics body for the agent
	var fixDef = new B2FixtureDef();
	var bodyDef = new B2BodyDef();

	var radius = 1;

	fixDef.density = 0.5;
	fixDef.friction = 0.0;
	fixDef.restitution = 0.0;
	fixDef.shape = new B2CircleShape(radius);

	bodyDef.type = B2Body.b2_dynamicBody;
	bodyDef.linearDamping = 20;
	//bodyDef.position.SetV(pos);

	body = world.CreateBody(bodyDef);
	fixture = body.CreateFixture(fixDef);
	body.SetPosition(new B2Vec2(50, 50));

	playerShape = new createjs.Shape();
	playerShape.graphics.beginStroke('#000').drawCircle(0, 0, radius * SIM_SCALE).moveTo(0, 0).lineTo(0, -SIM_SCALE);
	
	stage.addChild(playerShape);


	targetShape = new createjs.Shape();
	targetShape.graphics.beginStroke('#f00')
		.moveTo(-10, -10).lineTo(10, 10)
		.moveTo(10, -10).lineTo(-10, 10);
	targetShape.x = 50;
	targetShape.y = 50;
	stage.addChild(targetShape);


	var playerBig = false;
	gamepad.bind(Gamepad.Event.BUTTON_DOWN, function (e) {
		if (e.gamepad.index === 0 && e.control == 'RIGHT_TOP_SHOULDER') {
			createjs.Tween.get({ scale: body.m_fixtureList.m_shape.GetRadius() })
				.to({ scale: playerBig ? 1 : 4 }, 250, createjs.Ease.circIn)
				.addEventListener('change', function (ev) {
					var scale = ev.target.target.scale;
					body.m_fixtureList.m_shape.SetRadius(scale);
					playerShape.scaleX = playerShape.scaleY = scale;
					console.log(ev.target.target.scale);
				});
			playerBig = !playerBig;
			console.log(e.control);
		}
	});


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

	if (gamepads.length > 0) {
		var gpState = gamepads[0].state;
		body.ApplyImpulse(new B2Vec2(gpState.LEFT_STICK_X, gpState.LEFT_STICK_Y).Multiply(3000 * dt), body.GetPosition());
		//body.m_fixtureList.m_shape.SetRadius(2 + (1 - gpState.RIGHT_STICK_Y) * 4);

		var playerPos = body.GetPosition().Copy().Multiply(SIM_SCALE);
		playerPos.Add2(gpState.RIGHT_STICK_X * CAT_RANGE, gpState.RIGHT_STICK_Y * CAT_RANGE);
		targetShape.x = playerPos.x;
		targetShape.y = playerPos.y;

		//console.log(body.GetLinearVelocity());
	}

	world.Step(dt, 10, 10);
	world.ClearForces();

}

function rendererTick() {

	playerShape.x = body.GetPosition().x * SIM_SCALE;
	playerShape.y = body.GetPosition().y * SIM_SCALE;

	//playerShape.scaleY = playerShape.scaleX = body.m_fixtureList.m_shape.GetRadius() * SIM_SCALE;

}