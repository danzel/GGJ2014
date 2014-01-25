
var particleResources = [
	//particle sprites
	{id: "dustCloud", src: "imgs/Particles/dustCloud.png"},
	//{id: "bloodDrop", src: "imgs/Particles/bloodDrop.png"}
];

var ParticleEffects = function(){

	this.swapPoof = new ParticleEffect({
		emitters: {
			dustCloud: {
				attachedTo: player,
				rate: new Proton.Rate(new Proton.Span(3, 5), new Proton.Span(.05, 0.2)),
				textures: [new createjs.Bitmap(Resources.getResult('dustCloud'))],
				position: new Proton.LineZone(0, -40, 0, 40),
				mass: 1,
				lifeSpan: 30,
				velocity: {
					speed: new Proton.Span(3,5),
					angle: new Proton.Span(-45,45),
					type: 'polar'
				},
				behaviour: [
					new Proton.Alpha(1, 0),
					new Proton.RandomDrift(5, 0, .15),
					new Proton.Scale(new Proton.Span(.3, .5), 0.2),
					new Proton.Rotate(new Proton.Span(0, 360), new Proton.Span([-10, -5, 5, 15, 10]), 'add')
				]
			}
		}
	});

	this.update = function () {
		this.swapPoof.update();
	};
};

var ParticleEffect = function(config){
	this.proton = new Proton();

	var emitters = {};

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

		emitter.emit();
		this.proton.addEmitter(emitter);

		emitter.attachedTo = localConfig.attachedTo;
		emitters[key] = emitter;
	}

	this.renderer = new Proton.Renderer('easel', this.proton, LayerStageUnder);
	this.renderer.start();

	this.update = function () {
		if (this.proton) {
			this.proton.update();
			for (key in emitters) {
				emitters[key].p.x = emitters[key].attachedTo.position().x;
				emitters[key].p.y = emitters[key].attachedTo.position().y;
			}
		}
	};
}