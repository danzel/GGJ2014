ContactListener = function () {
	Events.create('collision-cat-enemy');
	Events.create('collision-cat-tree');
	Events.create('collision-player-enemy');
};
ContactListener.prototype = {

	identify: function (fix) {
		var ud = fix.userData;

		if (ud instanceof Cat)
			return 'cat';
		if (ud instanceof Enemy)
			return 'enemy';
		if (ud instanceof Player)
			return 'player';
		if (ud instanceof Tree)
			return 'tree';

		return 'unknown';
	},

	getCollisionPoint: function (contact) {

		var a = contact.GetFixtureA().userData;
		var b = contact.GetFixtureB().userData;

		var radiusTotal = a.radius + b.radius;
		var aP = a.radius / radiusTotal;
		var bP = b.radius / radiusTotal;

		var x = a.position().x * aP + b.position().x * bP;
		var y = a.position().y * aP + b.position().y * bP;
		return new B2Vec2(x, y);
	},

	PreSolve: function (contact, oldManifold) {

		if ((contact.m_flags & B2Contact.e_touchingFlag) == 0) {
			return;
		}

		//cat on cat
		if ((contact.GetFixtureA().userData instanceof Cat) && (contact.GetFixtureB().userData instanceof Cat)) {
			return;
		}

		var a = contact.GetFixtureA().userData;
		var b = contact.GetFixtureB().userData;

		var aType = this.identify(contact.GetFixtureA());
		var bType = this.identify(contact.GetFixtureB());

		var cat, enemy, tree;

		if ((aType == 'cat' && bType == 'enemy') ||
			(aType == 'enemy' && bType == 'cat')) {

			cat = aType == 'cat' ? a : b;
			enemy = aType == 'enemy' ? a : b;

			Events.publish('collision-cat-enemy', this.getCollisionPoint(contact), cat, enemy);

			cat.takesDamage = true;
			enemy.takesDamage = true;

			return;
		}

		if ((aType == 'player' && bType == 'enemy') ||
			(aType == 'enemy' && bType == 'player')) {

			enemy = aType == 'enemy' ? a : b;

			Events.publish('collision-player-enemy', this.getCollisionPoint(contact), player, enemy);

			player.takesDamage = true;
			enemy.takesDamage = true;

			return;
		}

		if ((aType == 'cat' && bType == 'tree') ||
			(aType == 'tree' && bType == 'cat')) {

			cat = aType == 'cat' ? a : b;
			tree = aType == 'tree' ? a : b;

			Events.publish('collision-cat-tree', this.getCollisionPoint(contact), cat, tree);

			//cat.takesDamage = true;
			//enemy.takesDamage = true;

			return;
		}

		//console.log('begin', contact);
	},
	EndContact: function (contact) { },
	BeginContact: function (contact) { },
	PostSolve: function (contact, impulse) { }
};