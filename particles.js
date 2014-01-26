
var particleResources = [
	//particle sprites
	{id: "dustCloud", src: "imgs/Particles/dustCloud.png"},
	{id: "bloodDrop", src: "imgs/Particles/bloodDrop.png"},
	{id: "heartDrop", src: "imgs/Particles/heartDrop.png"},

	{id: "comment1", src: "imgs/speech/muchbossfight.png"},
	{id: "comment2", src: "imgs/speech/muchreferential.png"},
	{id: "comment3", src: "imgs/speech/sohead.png"},
	{id: "comment4", src: "imgs/speech/suchcrazy.png"},
	{id: "comment5", src: "imgs/speech/verygamejam.png"},
	{id: "comment6", src: "imgs/speech/faceinsky.png"},
];

var ParticleEffects = function(){

	this.swapPoof = function(attachTo, eventMessages){

		return new ParticleEffect({
			attachedTo: attachTo,
			eventMessages: eventMessages,
			emitters: {
				dustCloud: {
					offset: {x:0,y:0},
					rate: new Proton.Rate(new Proton.Span(2, 3), new Proton.Span(0.2, 0.5)),
					textures: [new createjs.Bitmap(Resources.getResult('dustCloud'))],
					position: new Proton.LineZone(-50, 0, 50, 0),
					mass: 1,
					lifeSpan: 0.5,
					velocity: {
						speed: new Proton.Span(0.7,1.2),
						angle: new Proton.Span(-15,15),
						type: 'polar'
					},
					behaviour: [
						new Proton.Alpha(1, 0, 1),
						new Proton.RandomDrift(5, 0, .15),
						new Proton.Scale(new Proton.Span(.5, 1.5), 0.4),
						//new Proton.Rotate(new Proton.Span(0, 360), new Proton.Span([-10, -5, 5, 15, 10]), 'add')
					]
				}
			},

			triggerEmit: function(particleEffect){
				var callEmit = function(pos,object){
						if(!particleEffect.attachedTo.isDead()){
							particleEffect.emit({ALL: 'once'});
						}
						
					}

				for (var i = eventMessages.length - 1; i >= 0; i--) {
					Events.subscribe(
						eventMessages[i],
						callEmit
					);
				};
			}
		});
	};

	this.dogeComments = function(attachTo, eventMessages){

		return new ParticleEffect({
			attachedTo: attachTo,
			eventMessages: eventMessages,
			emitters: {
				comments: {
					offset: {x:0,y:30 * SIM_SCALE_X},

					rate: new Proton.Rate(1, new Proton.Span(0.2, 0.5)),
					textures: [
								new createjs.Bitmap(Resources.getResult('comment1')),
								new createjs.Bitmap(Resources.getResult('comment2')),
								new createjs.Bitmap(Resources.getResult('comment3')),
								new createjs.Bitmap(Resources.getResult('comment4')),
								new createjs.Bitmap(Resources.getResult('comment5')),
								new createjs.Bitmap(Resources.getResult('comment6'))
							],
					position: new Proton.LineZone(-50, 0, 50, 0),
					mass: 1,
					lifeSpan: 0.5,
					velocity: {
						speed: new Proton.Span(0.7,1.2),
						angle: new Proton.Span(-15,15),
						type: 'polar'
					},
					behaviour: [
						new Proton.Alpha(1, 0, 1),
						new Proton.RandomDrift(5, 0, .15),
						new Proton.Scale(new Proton.Span(.5, 1.5), 0.4),
						new Proton.Rotate(new Proton.Span(0, 360), new Proton.Span([-10, -5, 5, 15, 10]), 'add')
					]
				}
			},

			triggerEmit: function(particleEffect){
				particleEffect.emit({comments: 'FOREVER'});
			}
		});
	};

	this.bloodSpurt = function(attachTo, eventMessages){
		attachTo.lastDMG = 60;

		return new ParticleEffect({
			attachedTo: attachTo,
			eventMessages: eventMessages,
			emitters: {
				bloodDrop: {
					offset: {x:0,y:-10},
					rate: new Proton.Rate(new Proton.Span(5,10), new Proton.Span(0.2, 0.5)),
					textures: [new createjs.Bitmap(Resources.getResult('bloodDrop')),
								/*new createjs.Bitmap(Resources.getResult('dustCloud'))*/],
					position: new Proton.LineZone(-25,-5,25,5),
					mass: 1,
					lifeSpan: 2,
					velocity: {
						speed: new Proton.Span(3,4),
						angle: new Proton.Span(-50,50),
						type: 'polar'
					},
					behaviour: [
						new Proton.Alpha(1, 0, 1),
						new Proton.RandomDrift(5, 10, .15),
						new Proton.Scale(new Proton.Span(.3, 1.5), 0.4),
						new Proton.Gravity(4),
						new Proton.Rotate(new Proton.Span(0, 360), new Proton.Span([-10, -5, 5, 15, 10]), 'add')
					]	
				},

				heartDrop: {
					offset: {x:0,y:-20},
					rate: new Proton.Rate(new Proton.Span(5,10), new Proton.Span(0.2, 0.5)),
					textures: [new createjs.Bitmap(Resources.getResult('heartDrop')),
								/*new createjs.Bitmap(Resources.getResult('dustCloud'))*/],
					position: new Proton.LineZone(-25,-5,25,5),
					mass: 1,
					lifeSpan: 2,
					velocity: {
						speed: new Proton.Span(1.4,1.8),
						angle: new Proton.Span(-50,50),
						type: 'polar'
					},
					behaviour: [
						new Proton.Alpha(1, 0, 1),
						new Proton.RandomDrift(20, 5, .15),
						new Proton.Scale(new Proton.Span(.3, 1.5), 0.4),
						//new Proton.Gravity(2),
						//new Proton.Rotate(new Proton.Span(0, 360), new Proton.Span([-10, -5, 5, 15, 10]), 'add')
					]	
				}
			},

			triggerEmit: function(particleEffect){
				var callEmit = function(pos,cat,enemy){
						if(attachTo.lastDMG > 10){
							attachTo.lastDMG = 0;
							particleEffect.attachedTo = {position:function(){return pos}};

							if(enemy === player && !cat.isBig){
								particleEffect.emit({heartDrop: 'once'});
							} else {
								particleEffect.emit({bloodDrop: 'once'});		
							}
						}

						attachTo.lastDMG++;
					}

				for (var i = eventMessages.length - 1; i >= 0; i--) {
					Events.subscribe(
						eventMessages[i],
						callEmit
					);
				};
				
			}

		});
	}

	this.effects = [];
	this.effects.push(this.swapPoof(player,["player-toggle-bigness"]));
	this.effects.push(this.bloodSpurt(player,["collision-player-enemy"])); 
	this.effects.push(this.bloodSpurt({position: function(){return {x:0,y:0}}},["collision-cat-enemy","collision-cat-player"]));

	this.EffectsUpdate = function(){
		for(var i = cats.length - 1;i >= 0;i--){
			var cat = cats[i];
			if(!cat.hasParticle){
				this.effects.push(this.swapPoof(cat,["player-toggle-bigness"]));
				cat.hasParticle = true;
			}
		}

		for (var i = enemies.length - 1; i >= 0; i--) {
			var enemy = enemies[i];
			if(!enemy.hasParticle){
				
				if(enemy.isBoss) {
					this.effects.push(this.dogeComments(enemy, ["collision-cat-enemy"]));
				}
				enemy.hasParticle = true;
			}				
		};
	}

	this.update = function () {
		this.EffectsUpdate();
		for (var i = this.effects.length - 1; i >= 0; i--) {
			this.effects[i].update();
		};
		

		
	};
};

var ParticleEffect = function(config){
	this.proton = new Proton();
	this.attachedTo = config.attachedTo;
	this.emitters = {};

	this.emit = function(timeToEmitFor){
		for(key in this.emitters){
			if('ALL' in timeToEmitFor){
				this.emitters[key].emit(timeToEmitFor.ALL)
			} else if(timeToEmitFor[key] === 'FOREVER') {
				this.emitters[key].emit();
			} else if(key in timeToEmitFor){
				this.emitters[key].emit(timeToEmitFor[key]);
			}
		}
	}

	for(key in config.emitters){
		var emitter = new Proton.Emitter();

		var localConfig = config.emitters[key];
		emitter.rate = localConfig.rate;

		emitter.addInitialize(new Proton.ImageTarget(localConfig.textures));
		emitter.addInitialize(new Proton.Position(localConfig.position));
		emitter.addInitialize(new Proton.Mass(localConfig.mass));
		emitter.addInitialize(new Proton.Life(localConfig.lifeSpan));
		emitter.addInitialize(new Proton.Velocity(
			localConfig.velocity.speed,
			localConfig.velocity.angle,
			localConfig.velocity.type));

		for (var i = localConfig.behaviour.length - 1; i; i--) {
			emitter.addBehaviour(localConfig.behaviour[i]);
		}

		//emitter.emit();
		this.proton.addEmitter(emitter);

		emitter.offset = localConfig.offset;
		this.emitters[key] = emitter;
	}

	this.renderer = new Proton.Renderer('easel', this.proton, LayerStageUnder);
	this.renderer.start();
	config.triggerEmit(this,config.eventMessages);

	this.update = function () {
		if (this.proton) {
			this.proton.update();
			for (key in this.emitters) {
				this.emitters[key].p.x = (this.attachedTo.position().x + this.emitters[key].offset.x) * SIM_SCALE_X;
				this.emitters[key].p.y = (this.attachedTo.position().y + this.emitters[key].offset.y) * SIM_SCALE_Y;
			}
		}
	};
}