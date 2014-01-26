ContactListener = function () {
	Events.create('collision-cat-enemy');
	Events.create('collision-cat-tree');
	Events.create('collision-cat-player');
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

		var a = contact.GetFixtureA().userData;
		var b = contact.GetFixtureB().userData;

		if (!a || !b) {
			return;
		}

		var aType = this.identify(contact.GetFixtureA());
		var bType = this.identify(contact.GetFixtureB());

		//cat on cat
		if (aType == Cat && bType == 'cat') {
			return;
		}

		var cat, enemy, tree;

		if ((aType == 'cat' && bType == 'enemy') ||
			(aType == 'enemy' && bType == 'cat')) {

			cat = aType == 'cat' ? a : b;
			enemy = aType == 'enemy' ? a : b;

			if (!cat.isDead() && !enemy.isDead()) {

				Events.publish('collision-cat-enemy', this.getCollisionPoint(contact), cat, enemy);

				cat.takesDamage += (!enemy.dealtDamage) ? 1 : 0;

				if (cat.isBig && !cat.isDead()) {
					enemy.takesDamage += (!cat.dealtDamage) ? 1 : 0;
				}

				enemy.dealtDamage = true;
				cat.dealtDamage = true;
			}
			return;
		}

		if ((aType == 'player' && bType == 'enemy') ||
			(aType == 'enemy' && bType == 'player')) {

			enemy = aType == 'enemy' ? a : b;

			if (!enemy.isDead()) {

				Events.publish('collision-player-enemy', this.getCollisionPoint(contact), player, enemy);

				player.takesDamage += (!enemy.dealtDamage) ? 1 : 0;
				//enemy.takesDamage = true;

				enemy.dealtDamage = true;
			}
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


		if ((aType == 'cat' && bType == 'player') ||
			(aType == 'player' && bType == 'cat')) {

			cat = aType == 'cat' ? a : b;

			if (!cat.isDead()) {
				Events.publish('collision-cat-player', this.getCollisionPoint(contact), cat, player);

				if (cat.isBig) {
					player.takesDamage += 0.4;
				} else {
					player.takesDamage--; //HEALZ
				}
			}
			return;
		}



		//console.log('begin', contact);
	},
	EndContact: function (contact) { },
	BeginContact: function (contact) { },
	PostSolve: function (contact, impulse) { }
};