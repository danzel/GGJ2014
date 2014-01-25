CatHerd = function (cats, owner) {

	this.cats = cats;
	this.owner = owner;
};
CatHerd.prototype = {
	update: function (dt) {
		var i, agent;
		for (i = this.cats.length - 1; i >= 0; i--) {
			agent = this.cats[i];
			
			if (agent.isDead()) {
				//nothing :(((((((
			} else if (agent.transforming) {
				CatAiTransforming.preUpdate(dt, agent, this.cats, this.owner);
			} else if (agent.isBig) {
				CatAiLion.preUpdate(dt, agent, this.cats, this.owner);
			} else {
				CatAiKitten.preUpdate(dt, agent, this.cats, this.owner);
			}
		}

		//Move agents based on forces being applied (aka physics)
		for (i = this.cats.length - 1; i >= 0; i--) {
			agent = this.cats[i];

			//Apply the force
			//console.log(i + ': ' + agent.forceToApply.x + ', ' + agent.forceToApply.y);
			agent.body.ApplyImpulse(agent.forceToApply.Multiply(dt), agent.position());
		}
	}
};