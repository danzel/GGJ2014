Player = function () {

	//const
	this.smallRadius = 2;
	this.bigRadius = 6;
	this.smallDensity = 0.5;
	this.bigDensity = 0.1;

	this.forceScale = 10000;

	this.isBig = false;
	this.radius = this.smallRadius;

	//Create a physics body
	var fixDef = new B2FixtureDef();
	var bodyDef = new B2BodyDef();

	fixDef.density = this.smallDensity;
	fixDef.friction = 0.0;
	fixDef.restitution = 0.0;
	fixDef.shape = new B2CircleShape(this.radius);

	bodyDef.type = B2Body.b2_dynamicBody;
	bodyDef.linearDamping = 20;


	//Physics body
	this.body = world.CreateBody(bodyDef);
	this.fixture = this.body.CreateFixture(fixDef);
	this.body.SetPosition(new B2Vec2(50, 50));
	this.body.mass = 1;

	//Our shape
	this.shape = new createjs.Shape();
	this.shape.graphics.beginStroke('#000').drawCircle(0, 0, SIM_SCALE).moveTo(0, 0).lineTo(0, - SIM_SCALE);
	this.shape.scaleX = this.shape.scaleY = this.radius;
	stage.addChild(this.shape);

	//Target shape
	this.targetShape = new createjs.Shape();
	this.targetShape.graphics.beginStroke('#f00').drawCircle(0, 0, 1);
	stage.addChild(this.targetShape);

	var self = this;
	gamepad.bind(Gamepad.Event.BUTTON_DOWN, function (e) {
		if (e.gamepad.index === 0 && e.control == 'RIGHT_TOP_SHOULDER') {
			createjs.Tween.get({ radius: self.body.m_fixtureList.m_shape.GetRadius(), density: self.body.m_fixtureList.GetDensity() })
				.to(self.isBig ? { radius: self.smallRadius, density: self.smallDensity } : { radius: self.bigRadius, density: self.bigDensity }, 250, createjs.Ease.circIn)
				.addEventListener('change', function (ev) {
					var radius = ev.target.target.radius;
					var density = ev.target.target.density;
					self.body.m_fixtureList.m_shape.SetRadius(radius);
					self.body.m_fixtureList.SetDensity(density);
					self.body.ResetMassData();
					self.shape.scaleX = self.shape.scaleY = radius;
					console.log(radius + ', ' + density);
				});
			self.isBig = !self.isBig;
			console.log(e.control);
		}
	});
};
Player.prototype = {
	update: function (dt) {

		if (gamepads.length > 0) {
			var gpState = gamepads[0].state;
			this.body.ApplyImpulse(new B2Vec2(gpState.LEFT_STICK_X, gpState.LEFT_STICK_Y).Multiply(this.forceScale * dt), this.body.GetPosition());
			//body.m_fixtureList.m_shape.SetRadius(2 + (1 - gpState.RIGHT_STICK_Y) * 4);

			this.targetPosition = this.body.GetPosition().Copy()
				.Add2(gpState.RIGHT_STICK_X * CAT_RANGE, gpState.RIGHT_STICK_Y * CAT_RANGE);

			//console.log(body.GetLinearVelocity());
		}
	},

	renderUpdate: function () {
		this.shape.x = this.body.GetPosition().x * SIM_SCALE;
		this.shape.y = this.body.GetPosition().y * SIM_SCALE;

		this.shape.rotation = this.body.GetLinearVelocity().Angle();

		this.targetShape.x = this.targetPosition.x * SIM_SCALE;
		this.targetShape.y = this.targetPosition.y * SIM_SCALE;

	}
};