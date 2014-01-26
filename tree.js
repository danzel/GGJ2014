Tree = function (treeDef, x, y) {

	//vars
	this.def = treeDef;
	this.radius = treeDef.radius;
	this.density = 0.2;



	//Create a physics body
	var fixDef = new B2FixtureDef();
	var bodyDef = new B2BodyDef();

	fixDef.shape = new B2CircleShape(this.radius);

	bodyDef.type = B2Body.b2_staticBody;


	//Physics body
	this.body = world.CreateBody(bodyDef);
	this.fixture = this.body.CreateFixture(fixDef);
	this.fixture.userData = this;
	this.body.SetPosition(new B2Vec2(x, y));


	//Our shape
	this.container = new createjs.Container();

	this.sprite = new createjs.Bitmap(treeDef.img);
	this.sprite.scaleX = treeDef.size.x / treeDef.img.width;
	this.sprite.scaleY = treeDef.size.y / treeDef.img.height;
	this.sprite.regX = treeDef.center.x / this.sprite.scaleX;
	this.sprite.regY = treeDef.center.y / this.sprite.scaleY;
	this.container.addChild(this.sprite);

	this.shadow = Shadow.create(3 * this.radius * SIM_SCALE_X * 2, 3 * this.radius * SIM_SCALE_Y, 20);
	this.shadow.y = 20;
	//this.shadow.scaleX = this.shadow.scaleY = this.radius / this.bigRadius;
	this.container.addChildAt(this.shadow, 0);

	//this.shape = new createjs.Shape();
	//this.shape.graphics.beginStroke('#44b').drawCircle(0, 0, 10);
	//this.shape.scaleX = this.radius * SIM_SCALE_X / 10;
	//this.shape.scaleY = this.radius * SIM_SCALE_Y / 10;
	//this.container.addChild(this.shape);

	LayerStage.addChild(this.container);
};
Tree.prototype = {
	position: function () {
		return this.body.GetPosition();
	},

	velocity: function () {
		return this.body.GetLinearVelocity();
	},


	isDead: function () {
		return false;
	},

	updateDamage: function () {
		//TREE DONT CARE
	},

	update: function (dt) {

	},

	renderUpdate: function () {
		this.container.x = this.position().x * SIM_SCALE_X;
		this.container.y = this.position().y * SIM_SCALE_Y;

		if (this.shape) {
			this.shape.rotation = this.velocity().Angle();
		}
	}
};