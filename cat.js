Cat = function (x, y) {

	//consts
	this.smallDensity = 0.5;
	this.bigDensity = 0.04;
	this.smallRadius = 1;
	this.bigRadius = 5;

	this.maxForce = 3000;
	this.maxForceSquared = this.maxForce * this.maxForce;

	this.maxSpeed = 100;
	this.maxSpeedSquared = this.maxSpeed * this.maxSpeed;

	this.minSeparation = this.smallRadius * 4; // We'll move away from anyone nearer than this
	this.maxCohesion = this.smallRadius * 10; //We'll move closer to anyone within this bound

	//vars
	this.radius = this.smallRadius;
	this.isBig = false;



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
	this.body.SetPosition(new B2Vec2(x, y));


	//Our shape
	this.shape = new createjs.Shape();
	this.shape.graphics.beginStroke('#b44').drawCircle(0, 0, SIM_SCALE).moveTo(0, 0).lineTo(0, -SIM_SCALE);
	this.shape.scaleX = this.shape.scaleY = this.radius;
	LayerStage.addChild(this.shape);

	var self = this;
	Events.subscribe('player-toggle-bigness', function (becomeBig) {
		becomeBig = !becomeBig;
		self.isBig = becomeBig;

		createjs.Tween.get({ radius: self.body.m_fixtureList.m_shape.GetRadius(), density: self.body.m_fixtureList.GetDensity() })
			.to(becomeBig ? { radius: self.bigRadius, density: self.bigDensity } : { radius: self.smallRadius, density: self.smallDensity }, 250, createjs.Ease.circIn)
			.addEventListener('change', function (ev) {
				var radius = ev.target.target.radius;
				var density = ev.target.target.density;
				self.body.m_fixtureList.m_shape.SetRadius(radius);
				self.body.m_fixtureList.SetDensity(density);
				self.body.ResetMassData();
				self.shape.scaleX = self.shape.scaleY = radius;

				self.radius = radius;
				self.minSeparation = self.radius * 4; // We'll move away from anyone nearer than this
				self.maxCohesion = self.radius * 10; //We'll move closer to anyone within this bound

			});
		self.isBig = becomeBig;
	});

};
Cat.prototype = {
	position: function () {
		return this.body.GetPosition();
	},

	velocity: function () {
		return this.body.GetLinearVelocity();
	},

	update: function (dt) {

	},

	renderUpdate: function () {
		this.shape.x = this.position().x * SIM_SCALE;
		this.shape.y = this.position().y * SIM_SCALE;

		this.shape.rotation = this.velocity().Angle();
	}
};