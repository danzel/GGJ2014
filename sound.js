var soundResources = [
	{ id: 'alert', src: 'sound/alert.mp3' }
];

SafeSound = function (soundNames, delay) {
	this.sounds = soundNames;

	this.delay = delay * 1000;

	this.lastPlayed = 0;
};

SafeSound.prototype = {
	play: function () {

		var now = (+new Date);
		if (this.lastPlayed + this.delay < now) {
			createjs.Sound.play(this.sounds[(Math.random() * this.sounds.length) | 0]);
			this.lastPlayed = now;
		}
	}
}


SoundManager = {
	init: function () {
		var self = this;
		this._alert = new SafeSound(['alert'], 0.2);

		Events.create('cat-started-waiting');


		Events.subscribe('cat-started-waiting', function () {
			self._alert.play();
		});
	}
}