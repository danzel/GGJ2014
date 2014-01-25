
var particleResources = [
	//particle sprites
	{id: "dustCloud", src: "imgs/Particles/dustCloud.png"},
	{id: "bloodDrop", src: "imgs/Particles/bloodDrop.png"}
];

var ParticleEffects = function(){

	this.swapPoof = new ParticleEffect({
		emitters: {
			dustCloud: {
				attachedTo: player,
				rate: new Proton.Rate(new Proton.Span(3, 5), new Proton.Span(.05, 0.2)),
				textures: [Resources.getResult('dustCloud')],
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

	this.update = function(){
		this.swapPoof.update();
	}
};

var ParticleEffect = function(config){
	this.proton = new Proton();

	for(key in config.emitters){
		var emitter = new Proton.Emitter();

		emitter.rate = config.emitters[key].rate;

		emitter.addInitialize(new Proton.ImageTarget(config.textures));
		emitter.addInitialize(new Proton.Position(config.position));
		emitter.addInitialize(new Proton.Mass(config.mass));
		emitter.addInitialize(new Proton.Life(config.lifeSpan));
		emitter.addInitialize(new Proton.Velocity(
			config.emitters[key].velocity.speed, 
			config.emitters[key].velocity.angle, 
			config.emitters[key].velocity.type));

		for(var i = config.emitters[key].behaviour.length - 1;i;i--){
			emitter.addBehaviour(config.emitters[key].behaviour[i]);
		}

		emitter.emit();
		this.proton.addEmitter(emitter);
	}

	this.renderer = new Proton.Renderer('easel', this.proton, LayerStageUnder);
	this.renderer.start();

	this.update = function(){
		if(this.proton){
			this.proton.update();
			for(key in this.emitters){
				this.emitters[key].p.x = this.emitters[key].attachedTo.position().x;
				this.emitters[key].p.y = this.emitters[key].attachedTo.position().y;
			}				
		}
	}
}