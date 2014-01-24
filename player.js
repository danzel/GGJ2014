Player = function () {

	//const
	this.smallRadius = 2;
	this.bigRadius = 6;
	this.smallDensity = 0.5;
	this.bigDensity = 0.1;

	this.laserRange = 20;

	this.forceScale = 10000;

	this.isBig = false;
	this.radius = this.smallRadius;

	this.movementDirection = B2Vec2.Zero;
	this.laserOffset = B2Vec2.Zero;

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
	Events.subscribe('player-toggle-bigness', function (becomeBig) {
		createjs.Tween.get({ radius: self.body.m_fixtureList.m_shape.GetRadius(), density: self.body.m_fixtureList.GetDensity() })
			.to(becomeBig ? { radius: self.bigRadius, density: self.bigDensity } : { radius: self.smallRadius, density: self.smallDensity }, 250, createjs.Ease.circIn)
			.addEventListener('change', function (ev) {
				var radius = ev.target.target.radius;
				var density = ev.target.target.density;
				self.body.m_fixtureList.m_shape.SetRadius(radius);
				self.body.m_fixtureList.SetDensity(density);
				self.body.ResetMassData();
				self.shape.scaleX = self.shape.scaleY = radius;
				console.log(radius + ', ' + density);
			});
		self.isBig = becomeBig;
		console.log(becomeBig);
	});

	Events.subscribe('player-laser-target-move', function (offset) {
		self.laserOffset = offset;
	});

	Events.subscribe('player-movement-direction', function (dir) {
		self.movementDirection = dir;
	});

};
Player.prototype = {
	update: function (dt) {

		this.body.ApplyImpulse(this.movementDirection.Copy().Multiply(this.forceScale * dt), this.body.GetPosition());

		this.targetPosition = this.body.GetPosition().Copy()
			.Add2(this.laserOffset.x, this.laserOffset.y);
	},

	renderUpdate: function () {
		this.shape.x = this.body.GetPosition().x * SIM_SCALE;
		this.shape.y = this.body.GetPosition().y * SIM_SCALE;

		this.shape.rotation = this.body.GetLinearVelocity().Angle();

		this.targetShape.x = this.targetPosition.x * SIM_SCALE;
		this.targetShape.y = this.targetPosition.y * SIM_SCALE;

	}
};