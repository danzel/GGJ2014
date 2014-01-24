Player = function () {

	this.radius = 1;
	this.isBig = false;

	//Create a physics body
	var fixDef = new B2FixtureDef();
	var bodyDef = new B2BodyDef();

	fixDef.density = 0.5;
	fixDef.friction = 0.0;
	fixDef.restitution = 0.0;
	fixDef.shape = new B2CircleShape(radius);

	bodyDef.type = B2Body.b2_dynamicBody;
	bodyDef.linearDamping = 20;


	//Physics body
	this.body = world.CreateBody(bodyDef);
	this.fixture = body.CreateFixture(fixDef);
	this.body.SetPosition(new B2Vec2(50, 50));


	//Our shape
	this.shape = new createjs.Shape();
	this.shape.graphics.beginStroke('#000').drawCircle(0, 0, radius * SIM_SCALE).moveTo(0, 0).lineTo(0, -SIM_SCALE);
	stage.addChild(this.shape);

	//Target shape
	this.targetShape = new createjs.Shape();
	this.targetShape.graphics.beginStroke('#f00')
		.moveTo(-10, -10).lineTo(10, 10)
		.moveTo(10, -10).lineTo(-10, 10);
	stage.addChild(this.targetShape);

	var self = this;
	gamepad.bind(Gamepad.Event.BUTTON_DOWN, function (e) {
		if (e.gamepad.index === 0 && e.control == 'RIGHT_TOP_SHOULDER') {
			createjs.Tween.get({ scale: body.m_fixtureList.m_shape.GetRadius() })
				.to({ scale: self.isBig ? 1 : 4 }, 250, createjs.Ease.circIn)
				.addEventListener('change', function (ev) {
					var scale = ev.target.target.scale;
					self.body.m_fixtureList.m_shape.SetRadius(scale);
					self.shape.scaleX = self.shape.scaleY = scale;
					console.log(ev.target.target.scale);
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
			this.body.ApplyImpulse(new B2Vec2(gpState.LEFT_STICK_X, gpState.LEFT_STICK_Y).Multiply(3000 * dt), body.GetPosition());
			//body.m_fixtureList.m_shape.SetRadius(2 + (1 - gpState.RIGHT_STICK_Y) * 4);

			this.targetPosition = this.body.GetPosition().Copy()
				.Multiply(SIM_SCALE)
				.Add2(gpState.RIGHT_STICK_X * CAT_RANGE, gpState.RIGHT_STICK_Y * CAT_RANGE);

			//console.log(body.GetLinearVelocity());
		}
	},

	renderUpdate: function () {
		this.shape.x = this.body.GetPosition().x * SIM_SCALE;
		this.shape.y = this.body.GetPosition().y * SIM_SCALE;

		this.targetShape.x = this.targetPosition.x;
		this.targetShape.y = this.targetPosition.y;

	}
};