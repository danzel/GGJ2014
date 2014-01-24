CatHerd = function (cats, owner) {

	this.cats = cats;
	this.owner = owner;
};
CatHerd.prototype = {
	update: function (dt) {
		var i, agent;
		for (i = this.cats.length - 1; i >= 0; i--) {
			agent = this.cats[i];

			//Work out our behaviours
			var seek = this.steeringBehaviourSeek(agent, this.owner.targetPosition);
			var sep = this.steeringBehaviourSeparation(agent);
			var alg = this.steeringBehaviourAlignment(agent);
			var coh = this.steeringBehaviourCohesion(agent);

			//For visually debugging forces agent.forces = [ff.Copy(), sep.Copy(), alg.Copy(), coh.Copy()];

			agent.forceToApply = seek.Add(sep.Multiply(1.2)).Add(alg.Multiply(0.3)).Add(coh.Multiply(0.05));

			var lengthSquared = agent.forceToApply.LengthSquared();
			if (lengthSquared > agent.maxForceSquared) {
				agent.forceToApply.Multiply(agent.maxForce / Math.sqrt(lengthSquared));
			}
		}

		//Move agents based on forces being applied (aka physics)
		for (i = this.cats.length - 1; i >= 0; i--) {
			agent = this.cats[i];

			//Apply the force
			//console.log(i + ': ' + agent.forceToApply.x + ', ' + agent.forceToApply.y);
			agent.body.ApplyImpulse(agent.forceToApply.Multiply(dt), agent.position());

			//Calculate our new movement angle TODO: Should probably be done after running step
			//Maybe do it off desired direction?
			agent.rotation = agent.velocity().Angle();
		}
	},
	
	steeringBehaviourSeek: function(agent, dest) {

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

	steeringBehaviourSeparation: function(agent) {
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

	steeringBehaviourCohesion: function(agent) {
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

	steeringBehaviourAlignment: function(agent) {
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
	
	steerTowards: function (agent, desiredDirection) {
		//Multiply our direction by speed for our desired speed
			var desiredVelocity = desiredDirection.Multiply(agent.maxSpeed);

		//The velocity change we want
		var velocityChange = desiredVelocity.Subtract(agent.velocity());
		//Convert to a force
		return velocityChange.Multiply(agent.maxForce / agent.maxSpeed);
	}
};