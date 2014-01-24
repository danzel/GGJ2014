Cat = function (x, y) {

	this.radius = 1;
	this.isBig = false;

	this.maxForce = 3000;
	this.maxForceSquared = this.maxForce * this.maxForce;

	this.maxSpeed = 100;
	this.maxSpeedSquared = this.maxSpeed * this.maxSpeed;

	this.minSeparation = this.radius * 4; // We'll move away from anyone nearer than this
	this.maxCohesion = this.radius * 10; //We'll move closer to anyone within this bound


	//Create a physics body
	var fixDef = new B2FixtureDef();
	var bodyDef = new B2BodyDef();

	fixDef.density = 0.5;
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
	stage.addChild(this.shape);
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