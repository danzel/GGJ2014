PlayerControls = function () {

	Events.create('player-toggle-bigness');
	Events.create('player-movement-direction');
	Events.create('player-laser-target-move');

	this.laserOffset = new B2Vec2();
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
			Events.publish('player-toggle-bigness', !player.isBig);
	});


	mouse.on('move', function (e) {

		//Calculate player screen pos

		var p = player.container.localToGlobal(0, 0);
		var p2 = player.position();

		self.laserOffset.x = (this.x - p.x) / SIM_SCALE_X;
		self.laserOffset.y = (this.y - p.y) / SIM_SCALE_Y;

		console.log(self.laserOffset);
		Events.publish('player-laser-target-move', self.laserOffset);
	});
	return;
};
PlayerControls.prototype = {
	update: function (dt) {
	}
};