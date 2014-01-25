PlayerControls = function () {

	Events.create('player-toggle-bigness');
	Events.create('player-movement-direction');
	Events.create('player-laser-target-move');

	this.laserPosition = new B2Vec2();
	this.movementDirection = new B2Vec2();

	var self = this;

	//http://robertwhurst.github.io/KeyboardJS/

	var left, right, up, down;

	function updateMove() {
		self.movementDirection.x = left ? -1 : right ? 1 : 0;
		self.movementDirection.y = up ? -1 : down ? 1 : 0;

		Events.publish('player-movement-direction', self.movementDirection);
	}

	KeyboardJS.on('w,up', function () {
		up = true;
		updateMove();
	}, function () {
		up = false;
		updateMove();
	});

	KeyboardJS.on('s,down', function () {
		down = true;
		updateMove();
	}, function () {
		down = false;
		updateMove();
	});

	KeyboardJS.on('a,left', function () {
		left = true;
		updateMove();
	}, function () {
		left = false;
		updateMove();
	});
	KeyboardJS.on('d,right', function () {
		right = true;
		updateMove();
	}, function () {
		right = false;
		updateMove();
	});

	KeyboardJS.on('spacebar', function () {
		if (powerMeter.isReady()) {
			Events.publish('player-toggle-bigness', !player.isBig);
		}
	});


	mouse.on('move', function (e) {

		//todo: scroll care
		self.laserPosition.x = this.x / SIM_SCALE_X;
		self.laserPosition.y = this.y / SIM_SCALE_Y;

		console.log(self.laserPosition);
		Events.publish('player-laser-target-move', self.laserPosition);
	});
	return;
};
PlayerControls.prototype = {
	update: function (dt) {
	}
};