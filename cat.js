function initCatGlobals() {
	var img = Resources.getResult('chara/lion_run');

	Cat.lionImgW = 1020 / 3;
	Cat.lionImgH = 226;

	Cat.lionRunSheet = new createjs.SpriteSheet({
		images: [img],
		frames: {
			width: Cat.lionImgW,
			height: Cat.lionImgH,

			regX: Cat.lionImgW / 2,
			regY: Cat.lionImgH - 40,
			count: 3
		},

		animations: {
			run: [0, 2, 'run']
		}
	});
}

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

	this.minSeparation = this.smallRadius * 8; // We'll move away from anyone nearer than this
	this.maxCohesion = this.smallRadius * 15; //We'll move closer to anyone within this bound

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

	var catImg = Resources.getResult('chara/cat');

	this.catW = 100;
	this.catH = 50;

	this.lionW = 160;
	this.lionH = 130;

	//Our shape
	this.container = new createjs.Container();
	LayerStage.addChild(this.container);



	this.catSprite = new createjs.Bitmap(catImg);
	this.catSprite.scaleX = this.catW / catImg.width;
	this.catSprite.scaleY = this.catH / catImg.height;
	this.catSprite.regX = catImg.width / 2;
	this.catSprite.regY = catImg.height;
	this.container.addChild(this.catSprite);

	this.lionSprite = new createjs.Sprite(Cat.lionRunSheet, 'run');
	this.lionSprite.scaleX = this.catW / Cat.lionImgW;
	this.lionSprite.scaleY = this.catH / Cat.lionImgH;
	//this.lionSprite.regX = Cat.lionImgW / 2;
	//this.lionSprite.regY = Cat.lionImgH;
	this.lionSprite.framerate = 6; //TODO: Set based on speed, idle animation other wise
	this.lionSprite.alpha = 0;
	this.container.addChild(this.lionSprite);



	//this.shape = new createjs.Shape();
	//this.shape.graphics.beginStroke('#b44').drawCircle(0, 0, 10);
	//this.shape.scaleX = this.radius * SIM_SCALE_X / 10;
	//this.shape.scaleY = this.radius * SIM_SCALE_Y / 10;
	//this.container.addChild(this.shape);

	this.shadow = Shadow.create(this.bigRadius * SIM_SCALE_X * 2, this.bigRadius * SIM_SCALE_Y * 2, 20);
	this.shadow.scaleX = this.shadow.scaleY = this.radius / this.bigRadius;
	this.container.addChildAt(this.shadow, 0);

	var self = this;
	Events.subscribe('player-toggle-bigness', function (becomeBig) {
		becomeBig = !becomeBig;
		self.isBig = becomeBig;
		self.transforming = true;
		self.aiState = null;

		createjs.Tween.get({ p: becomeBig ? 1 : 0, radius: self.body.m_fixtureList.m_shape.GetRadius(), density: self.body.m_fixtureList.GetDensity() })
			.to(becomeBig ? { p: 0, radius: self.bigRadius, density: self.bigDensity } : { p: 1, radius: self.smallRadius, density: self.smallDensity }, 250, createjs.Ease.circIn)
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
				self.minSeparation = self.radius * 4; // We'll move away from anyone nearer than this
				self.maxCohesion = self.radius * 10; //We'll move closer to anyone within this bound

				var p = ev.target.target.p;
				var pi = 1 - ev.target.target.p;
				self.lionSprite.alpha = pi;
				self.catSprite.alpha = p;

				self.catSprite.scaleX = (self.catW * p + self.lionW * pi) / catImg.width;
				self.catSprite.scaleY = (self.catH * p + self.lionH * pi) / catImg.height;

				self.lionSprite.scaleX = (self.catW * p + self.lionW * pi) / Cat.lionImgW;
				self.lionSprite.scaleY = (self.catH * p + self.lionH * pi) / Cat.lionImgH;

				if (self.shadow) {
					self.shadow.scaleX = self.shadow.scaleY = radius / self.bigRadius;
				}
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
		this.container.x = this.position().x * SIM_SCALE_X;
		this.container.y = this.position().y * SIM_SCALE_Y;

		this.catSprite.scaleX = Math.abs(this.catSprite.scaleX) * (Math.sign(this.forceToApply.x) || Math.sign(this.catSprite.scaleX));
		this.lionSprite.scaleX = Math.abs(this.lionSprite.scaleX) * (Math.sign(this.forceToApply.x) || Math.sign(this.lionSprite.scaleX));

		if (this.aiState && this.aiState.waiting && !this.aiState.pounced) {
			this.lionSprite.gotoAndStop(2);
		} else if (this.aiState && this.aiState.pounced) {
			this.lionSprite.gotoAndStop(1);
		} else if (this.velocity().LengthSquared() < 1) {
			this.lionSprite.gotoAndStop(0);
		} else if (this.lionSprite.paused) {
			this.lionSprite.gotoAndPlay('run');
		}
		//this.shape.rotation = this.velocity().Angle();
	}
};