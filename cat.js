function initCatGlobals() {

	Events.create('cat-died');

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

	img = Resources.getResult('chara/cat');

	Cat.catImgW = 155;
	Cat.catImgH = 120;

	Cat.catRunSheet = new createjs.SpriteSheet({
		images: [img],
		frames: {
			width: Cat.catImgW,
			height: Cat.catImgH,
			
			regX: Cat.catImgW / 2,
			regY: Cat.catImgH - 10,
			count: 5
		},

		animations: {
			run: [0, 3, 'run'],
			die: [4, 4, 'die']
		}
	});
}

Cat = function (x, y) {
	var self = this;


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

	this.maxHealth = 100;

	//vars
	this.radius = this.smallRadius;
	this.isBig = false;
	this.health = this.maxHealth;

	this.takesDamage = 0;

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
	this.fixture.userData = this;
	this.body.SetPosition(new B2Vec2(x, y));

	this.catW = Cat.catImgW / 2;
	this.catH = Cat.catImgH / 2;

	this.lionW = 160;
	this.lionH = 130;

	//Our shape
	this.container = new createjs.Container();
	LayerStage.addChild(this.container);



	this.catSprite = new createjs.Sprite(Cat.catRunSheet, 'run');
	this.catSprite.scaleX = this.catW / Cat.catImgW;
	this.catSprite.scaleY = this.catH / Cat.catImgH;
	this.catSprite.framerate = 6; //TODO: Set based on speed, idle animation other wise
	this.container.addChild(this.catSprite);

	this.lionSprite = new createjs.Sprite(Cat.lionRunSheet, 'run');
	this.lionSprite.scaleX = this.catW / Cat.lionImgW;
	this.lionSprite.scaleY = this.catH / Cat.lionImgH;
	this.lionSprite.framerate = 6; //TODO: Set based on speed, idle animation other wise
	this.lionSprite.alpha = 0;
	this.container.addChild(this.lionSprite);

	this.healthBar = new Bar(-15, -50, 30, 6, this.maxHealth, function () {
		var p = 1 - self.health / self.maxHealth;
		//green - red
		return 'hsl(' + ((120 - p * 120) | 0) + ',80%, 60%)';
	});
	this.healthBar.update(this.health);
	this.container.addChild(this.healthBar.shape);

	//this.shape = new createjs.Shape();
	//this.shape.graphics.beginStroke('#b44').drawCircle(0, 0, 10);
	//this.shape.scaleX = this.radius * SIM_SCALE_X / 10;
	//this.shape.scaleY = this.radius * SIM_SCALE_Y / 10;
	//this.container.addChild(this.shape);

	this.shadow = Shadow.create(this.bigRadius * SIM_SCALE_X * 2, this.bigRadius * SIM_SCALE_Y * 2, 20);
	this.shadow.scaleX = this.shadow.scaleY = this.radius / this.bigRadius;
	this.container.addChildAt(this.shadow, 0);

	Events.subscribe('player-toggle-bigness', function (becomeBig) {

		if (self.isDead()) {
			return;
		}

		self.setBig(!becomeBig);
	});

};
Cat.prototype = {
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
		Events.publish('cat-died', this.position(), this);
		this.catSprite.y += 10;
		if (this.isBig) {
			this.setBig(false);
		}
	},

	update: function (dt) {

	},

	renderUpdate: function () {
		this.container.x = this.position().x * SIM_SCALE_X;
		this.container.y = this.position().y * SIM_SCALE_Y;

		var sign = Math.sign(this.forceToApply.x) || Math.sign(this.catSprite.scaleX);

		if (this.isDead()) {
			sign = sign || 1;
			this.catSprite.gotoAndPlay('die');
		} else if (this.aiState && this.aiState.waiting && !this.aiState.pounced) {
			sign = this.position().x > this.aiState.target.position().x ? -1 : 1;
			this.lionSprite.gotoAndStop(2);
		} else if (this.aiState && this.aiState.pounced) {
			this.lionSprite.gotoAndStop(1);
		} else if (this.velocity().LengthSquared() < 1) {
			this.lionSprite.gotoAndStop(0);
		} else if (this.lionSprite.paused) {
			this.lionSprite.gotoAndPlay('run');
		}

		this.catSprite.scaleX = Math.abs(this.catSprite.scaleX) * sign;
		this.lionSprite.scaleX = Math.abs(this.lionSprite.scaleX) * sign;
		//this.shape.rotation = this.velocity().Angle();

		this.healthBar.update(this.health);
		this.healthBar.shape.alpha = (this.health < this.maxHealth && this.health > 0) ? 1 : 0;
	},

	setBig: function (becomeBig) {
		var self = this;

		this.transforming = true;
		this.aiState = null;
		self.isBig = becomeBig;

		if (this._tween) {
			createjs.Tween.removeTweens(this._tween._target);
		}
		this._tween = createjs.Tween.get({ p: becomeBig ? 1 : 0, radius: self.body.m_fixtureList.m_shape.GetRadius(), density: self.body.m_fixtureList.GetDensity() })
			.to(becomeBig ? { p: 0, radius: self.bigRadius, density: self.bigDensity } : { p: 1, radius: self.smallRadius, density: self.smallDensity }, 250, createjs.Ease.circIn)
			.call(function () {
				self.transforming = false;
			self._tween = null;
		});
		this._tween.addEventListener('change', function (ev) {

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

			self.catSprite.scaleX = (self.catW * p + self.lionW * pi) / Cat.catImgW;
			self.catSprite.scaleY = (self.catH * p + self.lionH * pi) / Cat.catImgH;

			self.lionSprite.scaleX = (self.catW * p + self.lionW * pi) / Cat.lionImgW;
			self.lionSprite.scaleY = (self.catH * p + self.lionH * pi) / Cat.lionImgH;

			if (self.shadow) {
				self.shadow.scaleX = self.shadow.scaleY = radius / self.bigRadius;
			}

			self.healthBar.shape.y = -50 - 20 * pi;
		});
	}
};