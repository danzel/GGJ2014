ContactListener = function () {
	Events.create('collision-cat-enemy');
	Events.create('collision-cat-tree');
	Events.create('collision-player-enemy');
};
ContactListener.prototype = {
	BeginContact: function (contact) {
		//cat on cat
		if ((contact.GetFixtureA().userData instanceof Cat) && (contact.GetFixtureB().userData instanceof Cat)) {
			return;
		}

		//Cat vs (enemy or tree) or Player vs Enemy
		if (
			((contact.GetFixtureA().userData instanceof Cat) && (contact.GetFixtureB().userData instanceof Enemy)) ||
			((contact.GetFixtureA().userData instanceof Enemy) && (contact.GetFixtureB().userData instanceof Cat)) ||
			((contact.GetFixtureA().userData instanceof Cat) && (contact.GetFixtureB().userData instanceof Tree)) ||
			((contact.GetFixtureA().userData instanceof Tree) && (contact.GetFixtureB().userData instanceof Cat)) ||
			((contact.GetFixtureA().userData instanceof Player) && (contact.GetFixtureB().userData instanceof Enemy)) ||
			((contact.GetFixtureA().userData instanceof Enemy) && (contact.GetFixtureB().userData instanceof Player))
			) {
			var cat, enemy;
			if ((contact.GetFixtureA().userData instanceof Cat) || (contact.GetFixtureA().userData instanceof Player)) {
				cat = contact.GetFixtureA().userData;
				enemy = contact.GetFixtureB().userData;
			} else {
				cat = contact.GetFixtureA().userData;
				enemy = contact.GetFixtureB().userData;
			}

			//World manifold is fucked in this box 2d, calculate collision point my fucking self.

			var radiusTotal = cat.radius + enemy.radius;
			var catP = cat.radius / radiusTotal;
			var enemyP = enemy.radius / radiusTotal;

			var x = cat.position().x * catP + enemy.position().x * enemyP;
			var y = cat.position().y * catP + enemy.position().y * enemyP;

			var catIs = (contact.GetFixtureA().userData instanceof Cat) ? 'cat' : 'player';
			var enemyIs = (contact.GetFixtureA().userData instanceof Enemy) ? 'enemy' : 'tree';
			Events.publish('collision-' + catIs + '-' + enemyIs, new B2Vec2(x, y), cat, enemy);

			return;
		}

		//console.log('begin', contact);
	},
	EndContact: function (contact) { },
	PreSolve: function (contact, oldManifold) { },
	PostSolve: function (contact, impulse) { }
};