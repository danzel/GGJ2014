var CatAiKitten = {
	preUpdate: function (dt, cat, cats, player) {

		this.cats = cats;
		this.owner = player;

		//Work out our behaviours
		var seek = this.steeringBehaviourSeekMaybe(cat, this.owner.targetPosition, dt);
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

	steeringBehaviourSeekMaybe: function (agent, dest, dt) {

		if (B2Math.DistanceSquared(agent.position(), dest) < 40 * 40) {
			return this.steeringBehaviourSeek(agent, dest);
		} else {
			return this.steeringBehaviourWander(agent, dt);
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

	steeringBehaviourWander: function (agent, dt) {
		if (agent._wanderTimer >= 4 || !agent._wanderPoint || B2Math.DistanceSquared(agent.position(), agent._wanderPoint) < 5 * 5) {
			agent._wanderTimer = 0;
			agent._wanderPoint = player.position().Copy().Add2((Math.random() - 0.5) * 50, (Math.random() - 0.5) * 50);
		}

		agent._wanderTimer += dt;

		return this.steeringBehaviourSeek(agent, agent._wanderPoint).Multiply(0.2);
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