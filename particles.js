
var particleResources = [
	//particle sprites
	{id: "dustCloud", src: "imgs/Particles/dustCloud.png"},
	{id: "bloodDrop", src: "imgs/Particles/bloodDrop.png"}
];

var ParticleEffects = function(){

	this.swapPoof = function(attachTo){

		return new ParticleEffect({
			attachedTo: attachTo,

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
						new Proton.Scale(new Proton.Span(.3, .5), 0.4),
						new Proton.Rotate(new Proton.Span(0, 360), new Proton.Span([-10, -5, 5, 15, 10]), 'add')
					]
				}
			},

			triggerEmit: function(particleEffect){
				Events.subscribe(
					"player-toggle-bigness",
					function(){
						particleEffect.emit({ALL: 'once'});
					}
				);
			}
		});
	};

	this.bloodSpurt = function(attachTo){
		return new ParticleEffect({
			attachedTo: attachTo,

			emitters: {
				bloodDrop: {
					offset: {x:0,y:0},
					rate: new Proton.Rate(new Proton.Span(5,10), new Proton.Span(0.2, 0.5)),
					textures: [new createjs.Bitmap(Resources.getResult('bloodDrop'))],
					position: new Proton.LineZone(-25,-5,25,5),
					mass: 20,
					lifeSpan: 1,
					velocity: {
						speed: new Proton.Span(0.3,0.7),
						angle: new Proton.Span(-50,50),
						type: 'polar'
					},
					behaviour: [
						new Proton.Alpha(1, 0, 1),
						new Proton.RandomDrift(5, 0, .15),
						new Proton.Scale(new Proton.Span(.3, .5), 0.4),
						//new Proton.Rotate(new Proton.Span(0, 360), new Proton.Span([-10, -5, 5, 15, 10]), 'add')
					]	
				}
			},

			triggerEmit: function(particleEffect){
				Events.subscribe(
					"collision-cat-enemy",
					function(){
						particleEffect.emit({ALL: 'once'});
					}
				);
			}

		});
	}

	this.effects = [];
	this.effects.push(this.swapPoof(player));

	this.EffectsUpdate = function(){
		for(var i = cats.length - 1;i >= 0;i--){
			var cat = cats[i];
			if(!cat.hasParticle){
				this.effects.push(this.swapPoof(cat));
				cat.hasParticle = true;
			}
		}

		for (var i = enemies.length - 1; i >= 0; i--) {
			var enemy = enemies[i];
			if(!enemy.hasParticle){
				this.effects.push(this.bloodSpurt(enemy));
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
			}else if(key in timeToEmitFor){
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
	config.triggerEmit(this);

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