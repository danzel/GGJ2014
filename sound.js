var soundResources = [
	{ id: 'alert', src: 'sound/alert.mp3' },
	{ id: 'meow1', src: 'sound/cclsounds/kittenmeow1.mp3' },
	{ id: 'meow2', src: 'sound/cclsounds/kittenmeow2.mp3' },
	{ id: 'meow3', src: 'sound/cclsounds/kittenmeow3.mp3' },
	{ id: 'meow4', src: 'sound/cclsounds/kittenmeow4.mp3' },
	{ id: 'meow5', src: 'sound/cclsounds/kittenmeow5.mp3' },
	{ id: 'meow6', src: 'sound/cclsounds/kittenmeow6.mp3' },
	{ id: 'meow7', src: 'sound/cclsounds/kittenmeow7.mp3' },
	{ id: 'gg', src: 'sound/gg.mp3' },

	{ id: 'attack1', src: 'sound/cclsounds/bigcatgrowl.mp3' },
	{ id: 'attack2', src: 'sound/cclsounds/bigcatgrowl2.mp3' },
	{ id: 'attack3', src: 'sound/cclsounds/bigcatgrowl3.mp3' },
	{ id: 'attack4', src: 'sound/cclsounds/bigcatgrowl4.mp3' },
	{ id: 'attack5', src: 'sound/cclsounds/bigcatgrowl5.mp3' },
	{ id: 'attack6', src: 'sound/cclsounds/catgrowl1.mp3' },
	{ id: 'attack7', src: 'sound/cclsounds/catgrowl2.mp3' },
	{ id: 'attack8', src: 'sound/cclsounds/cathiss1.mp3' },
	{ id: 'attack9', src: 'sound/cclsounds/cathiss2.mp3' },

	{ id: 'purr1', src: 'sound/purr1.mp3' },
	{ id: 'purr2', src: 'sound/purr2.mp3' }


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
		this._gg = new SafeSound(['gg'], 1);


		this._attack = new SafeSound([
			'attack1',
			'attack2',
			'attack3',
			'attack4',
			'attack5',
			'attack6',
			'attack7',
			'attack8',
			'attack9'
		], 1);

		this._purr = new SafeSound([
			'purr1',
			'purr2'
		], 1.3);

		Events.create('cat-started-waiting');


		Events.subscribe('cat-started-waiting', function () {
			self._alert.play();
		});

		Events.subscribe('cat-died', function () {
			self._meow.play();
		});

		Events.subscribe('collision-cat-tree', function (a, cat) {
			if (cat.isBig) {
				self._attack.play();
			}
		});
		Events.subscribe('collision-cat-enemy', function (a, cat) {
			if (cat.isBig) {
				self._attack.play();
			}
		});

		Events.subscribe('collision-cat-player', function (a, cat) {
			if (cat.isBig) {
				self._attack.play();
			} else {
				self._purr.play();
			}
		});
	}
}