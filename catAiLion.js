var CatAiLion = {

	interestDistance: 60,
	interestDistanceSquared: 60 * 60,

	preUpdate: function (dt, cat, cats, player) {

		this.cats = cats;
		this.owner = player;

		if (!cat.aiState) {
			//Is there anything close to us that we can see, try interact with it.
			for (var i = enemies.length - 1; i >= 0; i--) {
				var e = enemies[i];

				var distSqrd = B2Math.DistanceSquared(e.position(), cat.position());

				if (distSqrd < this.interestDistanceSquared) {
					//TODO: cast a ray?

					this.interact(cat, e, dt);
					return;
				}
			}
		} else {
			cat.aiState.handler.call(this, cat, dt);
		}

		return;

		//Work out our behaviours
		var seek = this.steeringBehaviourSeek(cat, this.owner.targetPosition);
		var sep = this.steeringBehaviourSeparation(cat);
		var alg = this.steeringBehaviourAlignment(cat);
		var coh = this.steeringBehaviourCohesion(cat);

		//For visually debugging forces agent.forces = [ff.Copy(), sep.Copy(), alg.Copy(), coh.Copy()];

		cat.forceToApply = seek.Add(sep.Multiply(1.2)).Add(alg.Multiply(0.3)).Add(coh.Multiply(0.05));

		var lengthSquared = cat.forceToApply.LengthSquared();
		if (lengthSquared > cat.maxForceSquared) {
			cat.forceToApply.Multiply(cat.maxForce / Math.sqrt(lengthSquared));
		}
	},

	interact: function (cat, enemy, dt) {

		if (enemy instanceof Tree) {
			cat.aiState = { handler: this.interactTree, tree: enemy, timeWaited: 0 };
		} else if (enemy instanceof Enemy) {
			//TODO
		} else {
			console.log('lions dunno what to do with:');
			console.log(enemy);
		}

		if (cat.aiState) {
			cat.aiState.handler.call(this, cat, dt);
		}
	},

	interactTree: function (cat, dt) {
		var tree = cat.aiState.tree;
		var dist = cat.position().DistanceTo(tree.position());

		if (dist > this.interestDistance / 2) {
			cat.aiState.waiting = false;
			cat.forceToApply = this.steeringBehaviourSeek(cat, tree.position());
		} else {
			cat.aiState.waiting = true;
			cat.aiState.timeWaited += dt;
			if (cat.aiState.timeWaited >= 1) {
				cat.forceToApply = tree.position().Copy().Subtract(cat.position()).Multiply(cat.maxForce * 100);
				cat.forceToApply = this.steeringBehaviourWander(cat, tree.position(), 1, dt).Multiply(cat.maxForce * 100);

				cat.aiState.pounced = true;
			}
		}
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

	steeringBehaviourSeparation: function (agent) {
		var totalForce = new B2Vec2();
		var neighboursCount = 0;

		for (var i = 0; i < this.cats.length; i++) {
			var a = this.cats[i];
			if (a != agent) {
				var distance = agent.position().DistanceTo(a.position());
				if (distance < agent.minSeparation && distance > 0) {
					//Vector to other agent
					var pushForce = agent.position().Copy().Subtract(a.position());
					var length = pushForce.Normalize(); //Normalize returns the original length
					var r = (agent.radius + a.radius);

					totalForce.Add(pushForce.Multiply(1 - ((length - r) / (agent.minSeparation - r))));//agent.minSeparation)));
					//totalForce.Add(pushForce.Multiply(1 - (length / agent.minSeparation)));
					//totalForce.Add(pushForce.Divide(agent.radius));

					neighboursCount++;
				}
			}
		}

		if (neighboursCount == 0) {
			return totalForce; //Zero
		}

		return totalForce.Multiply(agent.maxForce / neighboursCount);
	},

	steeringBehaviourCohesion: function (agent) {
		//Start with just our position
		var centerOfMass = new B2Vec2();
		var neighboursCount = 0;

		for (var i = 0; i < this.cats.length; i++) {
			var a = this.cats[i];
			if (a != agent) {
				var distance = agent.position().DistanceTo(a.position());
				if (distance < agent.maxCohesion) {
					//sum up the position of our neighbours
					centerOfMass.Add(a.position());
					neighboursCount++;
				}
			}
		}

		if (neighboursCount == 0) {
			return new B2Vec2();
		}

		//Get the average position of ourself and our neighbours
		centerOfMass.Divide(neighboursCount);

		//seek that position
		return this.steeringBehaviourSeek(agent, centerOfMass);
	},

	steeringBehaviourAlignment: function (agent) {
		var averageHeading = new B2Vec2();
		var neighboursCount = 0;

		//for each of our neighbours (including ourself)
		for (var i = 0; i < this.cats.length; i++) {
			var a = this.cats[i];
			var distance = agent.position().DistanceTo(a.position());
			//That are within the max distance and are moving
			if (distance < agent.maxCohesion && a.velocity().Length() > 0) {
				//Sum up our headings
				var head = a.velocity().Copy();
				head.Normalize();
				averageHeading.Add(head);
				neighboursCount++;
			}
		}

		if (neighboursCount == 0) {
			return averageHeading; //Zero
		}

		//Divide to get the average heading
		averageHeading.Divide(neighboursCount);

		//Steer towards that heading
		return this.steerTowards(agent, averageHeading);
	},

	steeringBehaviourWander: function (agent, target, diameter, dt) {
		if (agent.aiState._wanderTimer >= 4 || !agent.aiState._wanderPoint || B2Math.DistanceSquared(agent.position(), agent.aiState._wanderPoint) < 5 * 5) {
			agent.aiState._wanderTimer = 0;
			agent.aiState._wanderPoint = target.Copy().Add2((Math.random() - 0.5) * diameter, (Math.random() - 0.5) * diameter);
		}

		agent._wanderTimer += dt;

		return this.steeringBehaviourSeek(agent, agent.aiState._wanderPoint).Multiply(0.2);
	},

	steerTowards: function (agent, desiredDirection) {
		//Multiply our direction by speed for our desired speed
		var desiredVelocity = desiredDirection.Multiply(agent.maxSpeed);

		//The velocity change we want
		var velocityChange = desiredVelocity.Subtract(agent.velocity());
		//Convert to a force
		return velocityChange.Multiply(agent.maxForce / agent.maxSpeed);
	}
};