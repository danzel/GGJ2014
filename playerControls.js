PlayerControls = function () {

	Events.create('player-toggle-bigness');
	Events.create('player-movement-direction');
	Events.create('player-laser-target-move');

	this.laserOffset = new B2Vec2();
	this.movementDirection = new B2Vec2();

	var self = this;
	//Shoulder toggle
	gamepad.bind(Gamepad.Event.BUTTON_DOWN, function (e) {
		if (e.control == 'RIGHT_TOP_SHOULDER') {
			Events.publish('player-toggle-bigness', !player.isBig);
		}
	});

	gamepad.bind(Gamepad.Event.AXIS_CHANGED, function (e) {
		//Right stick move laser
		if (e.axis === 'RIGHT_STICK_X') {
			self.laserOffset.x = player.laserRange * e.value;
			Events.publish('player-laser-target-move', self.laserOffset);
		} else if (e.axis === 'RIGHT_STICK_Y') {
			self.laserOffset.y = player.laserRange * e.value;
			Events.publish('player-laser-target-move', self.laserOffset);
		}
		//TODO: Left stick move player

		if (e.axis === 'LEFT_STICK_X') {
			self.movementDirection.x = e.value;
			Events.publish('player-movement-direction', self.movementDirection);
		} else if (e.axis === 'LEFT_STICK_Y') {
			self.movementDirection.y = e.value;
			Events.publish('player-movement-direction', self.movementDirection);
		}
	});
};
PlayerControls.prototype = {
	update: function (dt) {
	}
};