var EnemyAi = {

	interestDistance: 60,
	interestDistanceSquared: 60 * 60,

	preUpdate: function (dt, enemy, enemies, player) {

		if (enemy.isDead()) {
			enemy.forceToApply = B2Vec2.Zero;
			return;
		}

		this.enemies = enemies;
		this.player = player;

		//Work out our behaviours

		//If we are close to anything, move towards it
		//otherwise do our normal routine

		var closestDist = this.interestDistanceSquared;
		var closest = null;

		for (var i = cats.length - 1; i >= 0; i--) {
			var cat = cats[i];

			var distSqrd = B2Math.DistanceSquared(cat.position(), enemy.position());

			if (distSqrd < closestDist && !cat.isDead()) {
				//TODO: cast a ray?
				closestDist = distSqrd;
				closest = cat;
			}
		}

		var playerDistSqrd = B2Math.DistanceSquared(player.position(), enemy.position());
		if (playerDistSqrd < closestDist) {
			//TODO: cast a ray?
			closestDist = playerDistSqrd;
			closest = player;
		}

		if (closest) {
			enemy.forceToApply = this.steeringBehaviourSeek(enemy, closest.position());
		} else {
			this.preUpdateNormal(dt, enemy);
		}
	},

	preUpdateNormal: function (dt, enemy) {

		if (enemy.position().DistanceTo(enemy.currentInstruction) < 5) {
			enemy.instructionIndex = (enemy.instructionIndex + 1) % enemy.instructions.length;

			enemy.currentInstruction = enemy.instructions[enemy.instructionIndex].Copy();
			var range = enemy.instructions[enemy.instructionIndex].range;
			if (range) {
				enemy.currentInstruction.Add2((Math.random() - 0.5) * range, (Math.random() - 0.5) * range);
			}
		}

		enemy.forceToApply = this.steeringBehaviourSeek(enemy, enemy.currentInstruction);
	},

	steeringBehaviourSeek: function (agent, dest) {

		if (dest.x == agent.position().x && dest.y == agent.position().y) {
			return new B2Vec2();
		}

		//Desired change of location
		var desired = dest.Copy().Subtract(agent.position());
		//Desired velocity (move there at maximum speed)
		desired.Multiply(agent.maxSpeed / desired.Length());
		//The velocity change we want
		var velocityChange = desired.Subtract(agent.velocity());
		//Convert to a force
		return velocityChange.Multiply(agent.maxForce / agent.maxSpeed);
	},

	steeringBehaviourWander: function (agent, dt) {
		if (agent.wanderTimer >= 4 || !agent.wanderPoint || B2Math.DistanceSquared(agent.position(), agent.wanderPoint) < 5 * 5) {
			agent.wanderTimer = 0;
			agent.wanderPoint = player.position().Copy().Add2((Math.random() - 0.5) * 50, (Math.random() - 0.5) * 50);
		}

		agent.wanderTimer += dt;

		return this.steeringBehaviourSeek(agent, agent.wanderPoint).Multiply(0.2);
	}
}; 