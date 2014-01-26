function initPlayerGlobals() {
	var img = Resources.getResult('chara/catlady');

	Player.imgW = 430;
	Player.imgH = 685;

	Player.runSheet = new createjs.SpriteSheet({
		images: [img],
		frames: {
			width: Player.imgW,
			height: Player.imgH,

			regX: Player.imgW / 2,
			regY: Player.imgH - 40,
			count: 8
		},

		animations: {
			run: [0, 7, 'run']
		}
	});
}

Player = function () {
	var self = this;

	//const
	this.smallRadius = 2;
	this.bigRadius = 6;
	this.smallDensity = 0.7;
	this.bigDensity = 0.1;
	this.maxHealth = 200;

	this.laserRange = 40;

	this.forceScale = 10000;

	this.isBig = true;
	this.radius = this.bigRadius;

	this.movementDirection = B2Vec2.Zero;
	this.laserPositionOrig = B2Vec2.Zero;
	this.laserPosition = new B2Vec2(50, 50);

	this.health = this.maxHealth / 2;
	this.takesDamage = 0;

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
	this.fixture.userData = this;
	this.body.SetPosition(new B2Vec2(50, 50));
	this.body.mass = 1;

	//Our shape
	this.container = new createjs.Container();
	LayerStage.addChild(this.container);

	this.smallW = Player.imgW / 6;
	this.smallH = Player.imgH / 6;
	this.bigW = Player.imgW / 3;
	this.bigH = Player.imgH / 3;

	this.sprite = new createjs.Sprite(Player.runSheet, 'run');
	this.sprite.scaleX = this.bigW / Player.imgW;
	this.sprite.scaleY = this.bigH / Player.imgH;
	this.container.addChild(this.sprite);
	this.sprite.framerate = 8; //TODO: Set based on speed, idle animation other wise

	this.healthBar = new Bar(-15, -220, 30, 6, this.maxHealth, function () {
		var p = 1 - self.health / self.maxHealth;
		//green - red
		return 'hsl(' + ((120 - p * 120) | 0) + ',80%, 60%)';
	});
	this.healthBar.update(this.health);
	this.container.addChild(this.healthBar.shape);


	//this.shape = new createjs.Shape();
	//this.shape.graphics.beginStroke('#000').drawCircle(0, 0, 10);
	//this.shape.scaleX = this.radius * SIM_SCALE_X / 10;
	//this.shape.scaleY = this.radius * SIM_SCALE_Y / 10;
	//this.container.addChild(this.shape);

	this.shadow = Shadow.create(this.bigRadius * SIM_SCALE_X * 2, this.bigRadius * SIM_SCALE_Y * 2, 20);
	this.container.addChildAt(this.shadow, 0);


	//Target shape
	this.targetShape = new createjs.Shape();
	this.targetShape.graphics.beginFill('#f00').drawCircle(0, 0, 3);
	LayerStageOver.addChild(this.targetShape);

	Events.subscribe('player-toggle-bigness', function (becomeBig) {
		createjs.Tween.get({ p: becomeBig ? 1 : 0, radius: self.body.m_fixtureList.m_shape.GetRadius(), density: self.body.m_fixtureList.GetDensity() })
			.to(becomeBig ? { p: 0, radius: self.bigRadius, density: self.bigDensity } : { p: 1, radius: self.smallRadius, density: self.smallDensity }, 250, createjs.Ease.circIn)
			.addEventListener('change', function (ev) {
				var radius = ev.target.target.radius;
				var density = ev.target.target.density;
				self.body.m_fixtureList.m_shape.SetRadius(radius);
				self.body.m_fixtureList.SetDensity(density);
				self.body.ResetMassData();
				if (self.shape) {
					self.shape.scaleX = radius * SIM_SCALE_X / 10;
					self.shape.scaleY = radius * SIM_SCALE_Y / 10;
				}
				var p = ev.target.target.p;
				var pi = 1 - p;
				self.sprite.scaleX = (p * self.smallW + self.bigW * pi) / Player.imgW;
				self.sprite.scaleY = (p * self.smallH + self.bigH * pi) / Player.imgH;
				if (self.shadow) {
					self.shadow.scaleX = radius / self.bigRadius;
					self.shadow.scaleY = radius / self.bigRadius;
				}

				self.sprite.framerate = self.isBig ? 8 : 16;

				self.healthBar.shape.y = -115 - 105 * pi;

				//console.log(radius + ', ' + density);
			});
		self.isBig = becomeBig;
		console.log(becomeBig);
	});

	Events.subscribe('player-laser-target-move', function (pos) {
		self.laserPositionOrig = pos;
		self.laserPosition = pos.Copy().Add2(-LayerStage.x, 0);
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

	isDead: function () {
		return this.health <= 0;
	},

	updateDamage: function () {
		if (this.takesDamage) {
			this.health -= this.takesDamage * (this.isBig ? 1 : 2);
			this.takesDamage = 0;

			if (this.health > this.maxHealth) {
				this.health = this.maxHealth;
			}
		}
		this.dealtDamage = false;
	},

	update: function (dt) {

		this.body.ApplyImpulse(this.movementDirection.Copy().Multiply(this.forceScale * dt), this.body.GetPosition());
		this.laserPosition = this.laserPositionOrig.Copy().Add2(-LayerStage.x / SIM_SCALE_X, 0);
	},

	renderUpdate: function () {

		if (this.velocity().LengthSquared() < 5 * 5) {
			this.sprite.paused = true;
		} else {
			this.sprite.paused = false;
		}

		this.container.x = this.body.GetPosition().x * SIM_SCALE_X;
		this.container.y = this.body.GetPosition().y * SIM_SCALE_Y;

		//this.shape.rotation = this.body.GetLinearVelocity().Angle();
		this.sprite.scaleX = Math.abs(this.sprite.scaleX) * (Math.sign(this.velocity().x) || Math.sign(this.sprite.scaleX));

		this.targetShape.x = this.laserPosition.x * SIM_SCALE_X;
		this.targetShape.y = this.laserPosition.y * SIM_SCALE_Y;

		this.healthBar.update(this.health);
		this.healthBar.shape.alpha = (this.health < this.maxHealth && this.health > 0) ? 1 : 0;
	}
};