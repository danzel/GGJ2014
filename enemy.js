Enemy = function (def, x, y) {

	this.def = def;

	//vars
	this.radius = def.radiusSmall;
	this.density = def.densitySmall;
	this.isBig = false;

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
	this.fixture.userData = this;
	this.body.SetPosition(new B2Vec2(x, y));


	//Our shape
	this.shape = new createjs.Shape();
	this.shape.graphics.beginStroke('#44b').drawCircle(0, 0, 10);
	this.shape.scaleX = this.radius * SIM_SCALE_X / 10;
	this.shape.scaleY = this.radius * SIM_SCALE_Y / 10;

	LayerStage.addChild(this.shape);

	var self = this;
	Events.subscribe('player-toggle-bigness', function (becomeBig) {
		becomeBig = !becomeBig;
		self.isBig = becomeBig;
		self.transforming = true;
		self.aiState = null;

		createjs.Tween.get({ p: becomeBig ? 1 : 0, radius: self.body.m_fixtureList.m_shape.GetRadius(), density: self.body.m_fixtureList.GetDensity() })
			.to(becomeBig ? { p: 0, radius: self.def.radiusBig, density: self.def.densityBig } : { p: 1, radius: self.def.radiusSmall, density: self.def.densitySmall }, 250, createjs.Ease.circIn)
			.call(function () {
				self.transforming = false;
			}).addEventListener('change', function (ev) {
				var radius = ev.target.target.radius;
				var density = ev.target.target.density;
				self.body.m_fixtureList.m_shape.SetRadius(radius);
				self.body.m_fixtureList.SetDensity(density);
				self.body.ResetMassData();
				if (self.shape) {
					self.shape.scaleX = radius * SIM_SCALE_X / 10;
					self.shape.scaleY = radius * SIM_SCALE_Y / 10;
				}
				self.radius = radius;

				var p = ev.target.target.p;
				var pi = 1 - ev.target.target.p;

				//self.lionSprite.alpha = pi;
				//self.catSprite.alpha = p;

				//self.catSprite.scaleX = (self.catW * p + self.lionW * pi) / catImg.width;
				//self.catSprite.scaleY = (self.catH * p + self.lionH * pi) / catImg.height;

				//self.lionSprite.scaleX = (self.catW * p + self.lionW * pi) / Cat.lionImgW;
				//self.lionSprite.scaleY = (self.catH * p + self.lionH * pi) / Cat.lionImgH;

				if (self.shadow) {
					self.shadow.scaleX = self.shadow.scaleY = radius / self.bigRadius;
				}
			});
		self.isBig = becomeBig;
	});

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
		this.shape.x = this.position().x * SIM_SCALE_X;
		this.shape.y = this.position().y * SIM_SCALE_Y;

		//this.shape.rotation = this.velocity().Angle();
	}
};