var soundResources = [
	{ id: 'alert', src: 'sound/alert.mp3' },
	{ id: 'meow1', src: 'sound/cclsounds/kittenmeow1.mp3' },
	{ id: 'meow2', src: 'sound/cclsounds/kittenmeow2.mp3' },
	{ id: 'meow3', src: 'sound/cclsounds/kittenmeow3.mp3' },
	{ id: 'meow4', src: 'sound/cclsounds/kittenmeow4.mp3' },
	{ id: 'meow5', src: 'sound/cclsounds/kittenmeow5.mp3' },
	{ id: 'meow6', src: 'sound/cclsounds/kittenmeow6.mp3' },
	{ id: 'meow7', src: 'sound/cclsounds/kittenmeow7.mp3' }
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
};


SoundManager = {
	init: function () {
		var self = this;
		this._alert = new SafeSound(['alert'], 0.2);
		this._meow = new SafeSound([
			'meow1',
			'meow2',
			'meow3',
			'meow4',
			'meow5',
			'meow6',
			'meow7'
		], 0);

		Events.create('cat-started-waiting');


		Events.subscribe('cat-started-waiting', function () {
			self._alert.play();
		});

		Events.subscribe('cat-died', function () {
			self._meow.play();
		});
	}
}