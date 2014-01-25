
PowerMeter = function () {
	this.value = 0;

	this.bar = new Bar(0, 0, 400, 30, PowerMeter.max, this.colorFn);

	this.container = new createjs.Container();
	LayerStaticOverlay.addChild(this.container);

	this.container.addChild(this.bar.shape);

	this.textContainer = new createjs.Container();
	this.container.addChild(this.textContainer);
	this.textContainer.x = 160;
	this.textContainer.y = 4;

	this.textContainer.alpha = 0;

	var text = new createjs.Text('READY!', '20px Arial', '#fff');
	text.x = text.y = 1;
	this.textContainer.addChild(text);
	text = new createjs.Text('READY!', '20px Arial', '#000');
	this.textContainer.addChild(text);

	this.container.addChild(this.text);


	var self = this;
	Events.subscribe('player-toggle-bigness', function () {
		self.value = 0;
	});

};

PowerMeter.required = 100;
PowerMeter.max = 150;

PowerMeter.prototype = {
	update: function (dt) {
		this.value += dt * 40;

		if (this.value >= PowerMeter.max) {
			Events.publish('player-toggle-bigness', !player.isBig);
		}

		this.textContainer.alpha = (this.value >= PowerMeter.required) ? 1 : 0;

		this.bar.update(this.value);
	},

	isReady: function () {
		return this.value >= PowerMeter.required;
	},

	colorFn: function (value, maxValue) {
		var p, pi;
		if (value < PowerMeter.required) {
			p = value / PowerMeter.required;
			pi = 1 - p;
			//Fade between blue - green

			return 'hsl(' + ((240 - p * 120) | 0) + ',80%, 60%)';
			//return 'rgb(0,' + ((p * 255)|0) + ',' + ((pi * 255)|0) + ')';

		} else {
			p = (value - PowerMeter.required) / (PowerMeter.max - PowerMeter.required);
			//green - red
			return 'hsl(' + ((120 - p * 120) | 0) + ',80%, 60%)';
		}
	}
};
