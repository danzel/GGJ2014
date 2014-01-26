function initEnemyGlobals() {

	Events.create('enemy-died');

	var img = Resources.getResult('chara/doge_run');

	Enemy.imgW = 1946 / 7;
	Enemy.imgH = 230;

	Enemy.runSheet = new createjs.SpriteSheet({
		images: [img],
		frames: {
			width: Enemy.imgW,
			height: Enemy.imgH,

			regX: Enemy.imgW / 2,
			regY: Enemy.imgH - 40,
			count: 7
		},

		animations: {
			run: [0, 5, 'run'],
			die: [6, 6, 'die']
		}
	});
};

Enemy = function (def, x, y, instructions) {
	var self = this;

	this.def = def;

	this.instructionIndex = 0;
	this.instructions = instructions;
	this.currentInstruction = instructions[0];

	this.smallW = def.smallW;
	this.smallH = def.smallH;

	this.bigW = def.bigW;
	this.bigH = def.bigH;

	this.bigRadius = def.radiusBig;
	this.smallRadius = def.radiusSmall;

	this.maxHealth = def.maxHealth;


	this.maxForce = 3000;
	this.maxForceSquared = this.maxForce * this.maxForce;

	this.maxSpeed = 100;
	this.maxSpeedSquared = this.maxSpeed * this.maxSpeed;


	//vars
	this.radius = def.radiusSmall;
	this.density = def.densitySmall;
	this.isBig = false;
	this.health = this.maxHealth;

	this.takesDamage = 0;

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
	this.container = new createjs.Container();
	LayerStage.addChild(this.container);

	this.sprite = new createjs.Sprite(Enemy.runSheet, 'run');
	this.sprite.scaleX = this.smallW / Enemy.imgW;
	this.sprite.scaleY = this.smallH / Enemy.imgH;
	this.container.addChild(this.sprite);
	this.sprite.framerate = 6; //TODO: Set based on speed, idle animation other wise

	//this.shape = new createjs.Shape();
	//this.shape.graphics.beginStroke('#44b').drawCircle(0, 0, 10);
	//this.shape.scaleX = this.radius * SIM_SCALE_X / 10;
	//this.shape.scaleY = this.radius * SIM_SCALE_Y / 10;
	//this.container.addChild(this.shape);

	this.shadow = Shadow.create(this.bigRadius * SIM_SCALE_X * 2, this.bigRadius * SIM_SCALE_Y * 2, 20);
	this.shadow.scaleX = this.shadow.scaleY = this.radius / this.bigRadius;
	this.container.addChildAt(this.shadow, 0);

	this.healthBar = new Bar(-15, -50, 30, 6, this.maxHealth, function () {
		var p = 1 - self.health / self.maxHealth;
		//green - red
		return 'hsl(' + ((120 - p * 120) | 0) + ',80%, 60%)';
	});
	this.healthBar.update(this.health);
	this.container.addChild(this.healthBar.shape);


	Events.subscribe('player-toggle-bigness', function (becomeBig) {

		if (self.isDead()) {
			return;
		}

		self.setBig(!becomeBig);
	});

};
Enemy.prototype = {
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
		var wasDead = this.isDead();

		if (this.takesDamage) {
			this.health -= this.takesDamage * (this.isBig ? 1 : 2);
			this.takesDamage = 0;
		}

		if (this.isDead()) {
			if (!wasDead) {
				this.die();
			}
			//deadies don't deal damage
			this.dealtDamage = true;
		} else {
			this.dealtDamage = false;
		}
	},
	die: function () {
		Events.publish('enemy-died', this.position(), this);
		//this.catSprite.y += 10;
		if (this.isBig) {
			this.setBig(false);
		}
	},

	update: function (dt) {

	},

	renderUpdate: function () {
		this.container.x = this.position().x * SIM_SCALE_X;
		this.container.y = this.position().y * SIM_SCALE_Y;

		var sign = Math.sign(this.forceToApply.x) || Math.sign(-this.sprite.scaleX);

		//if (this._target) {
		//	sign = this.position().x > this._target.position().x ? -1 : 1;
		//}

		//this.shape.rotation = this.velocity().Angle();
		if (this.isDead()) {
			sign = sign || 1;
			this.sprite.gotoAndPlay('die');
		} else if (this.velocity().LengthSquared() < 1) {
			this.sprite.gotoAndStop(0);
		} else if (this.sprite.paused) {
			this.sprite.gotoAndPlay('run');
		}

		this.sprite.scaleX = Math.abs(this.sprite.scaleX) * -sign;

		this.healthBar.update(this.health);
		this.healthBar.shape.alpha = (this.health < this.maxHealth && this.health > 0) ? 1 : 0;
	},

	setBig: function (becomeBig) {
		var self = this;

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

				self.sprite.scaleX = (self.smallW * p + self.bigW * pi) / Enemy.imgW;
				self.sprite.scaleY = (self.smallH * p + self.bigH * pi) / Enemy.imgH;

				//self.lionSprite.scaleX = (self.catW * p + self.lionW * pi) / Cat.lionImgW;
				//self.lionSprite.scaleY = (self.catH * p + self.lionH * pi) / Cat.lionImgH;

				if (self.shadow) {
					self.shadow.scaleX = self.shadow.scaleY = radius / self.bigRadius;
				}
			});
		self.isBig = becomeBig;
	}
};