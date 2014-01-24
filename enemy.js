Enemy = function (x, y) {

	//vars
	this.radius = 3;
	this.density = 0.2;



	//Create a physics body
	var fixDef = new B2FixtureDef();
	var bodyDef = new B2BodyDef();

	fixDef.density = this.density;
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
	this.shape.graphics.beginStroke('#44b').drawCircle(0, 0, SIM_SCALE).moveTo(0, 0).lineTo(0, -SIM_SCALE);
	this.shape.scaleX = this.shape.scaleY = this.radius;
	LayerStage.addChild(this.shape);
};
Enemy.prototype = {
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