Player = function () {

	//const
	this.smallRadius = 2;
	this.bigRadius = 6;
	this.smallDensity = 0.5;
	this.bigDensity = 0.1;

	this.laserRange = 40;

	this.forceScale = 10000;

	this.isBig = true;
	this.radius = this.bigRadius;

	this.movementDirection = B2Vec2.Zero;
	this.laserOffset = B2Vec2.Zero;

	//Create a physics body
	var fixDef = new B2FixtureDef();
	var bodyDef = new B2BodyDef();

	fixDef.density = this.bigDensity;
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
	var img = Resources.getItem('chara/catlady');

	this.container = new createjs.Container();
	LayerStage.addChild(this.container);

	this.smallW = 50;
	this.smallH = 100;
	this.bigW = 150;
	this.bigH = 300;

	this.sprite = new createjs.Bitmap(img.tag);
	this.sprite.scaleX = this.bigW / img.tag.width;
	this.sprite.scaleY = this.bigH / img.tag.height;
	this.sprite.regX = img.tag.width * 0.6; //treeDef.center.x / this.sprite.scaleX;
	this.sprite.regY = img.tag.height * 0.9; //treeDef.center.y / this.sprite.scaleY;
	this.container.addChild(this.sprite);



	this.shape = new createjs.Shape();
	this.shape.graphics.beginStroke('#000').drawCircle(0, 0, 10);
	this.shape.scaleX = this.radius * SIM_SCALE_X / 10;
	this.shape.scaleY = this.radius * SIM_SCALE_Y / 10;
	this.container.addChild(this.shape);



	//Target shape
	this.targetShape = new createjs.Shape();
	this.targetShape.graphics.beginStroke('#f00').drawCircle(0, 0, 1);
	LayerForeground.addChild(this.targetShape);

	var self = this;
	Events.subscribe('player-toggle-bigness', function (becomeBig) {
		createjs.Tween.get({ p: becomeBig ? 1 : 0, radius: self.body.m_fixtureList.m_shape.GetRadius(), density: self.body.m_fixtureList.GetDensity() })
			.to(becomeBig ? { p: 0, radius: self.bigRadius, density: self.bigDensity } : { p: 1, radius: self.smallRadius, density: self.smallDensity }, 250, createjs.Ease.circIn)
			.addEventListener('change', function (ev) {
				var radius = ev.target.target.radius;
				var density = ev.target.target.density;
				self.body.m_fixtureList.m_shape.SetRadius(radius);
				self.body.m_fixtureList.SetDensity(density);
				self.body.ResetMassData();
				self.shape.scaleX = radius * SIM_SCALE_X / 10;
				self.shape.scaleY = radius * SIM_SCALE_Y / 10;

				var p = ev.target.target.p;
				var pi = 1 - p;
				self.sprite.scaleX = (p * self.smallW + self.bigW * pi) / img.tag.width;
				self.sprite.scaleY = (p * self.smallH + self.bigH * pi) / img.tag.height;

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
	position: function () {
		return this.body.GetPosition();
	},

	velocity: function () {
		return this.body.GetLinearVelocity();
	},

	update: function (dt) {

		this.body.ApplyImpulse(this.movementDirection.Copy().Multiply(this.forceScale * dt), this.body.GetPosition());

		this.targetPosition = this.body.GetPosition().Copy()
			.Add2(this.laserOffset.x, this.laserOffset.y);
	},

	renderUpdate: function () {
		this.container.x = this.body.GetPosition().x * SIM_SCALE_X;
		this.container.y = this.body.GetPosition().y * SIM_SCALE_Y;

		//this.shape.rotation = this.body.GetLinearVelocity().Angle();
		this.sprite.scaleX = Math.abs(this.sprite.scaleX) * (Math.sign(this.velocity().x) || Math.sign(this.sprite.scaleX));

		this.targetShape.x = this.targetPosition.x * SIM_SCALE_X;
		this.targetShape.y = this.targetPosition.y * SIM_SCALE_Y;

	}
};