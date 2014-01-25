
Bar = function (x, y, w, h, maxValue, colorFn) {
	this.w = w;
	this.h = h;
	this.maxValue = maxValue;
	this.colorFn = colorFn;

	this.shape = new createjs.Shape();
	this.shape.x = x;
	this.shape.y = y;

	this.update(0);
};

Bar.prototype = {
	update: function (value) {

		this.shape.graphics
			.clear()
			.beginFill('#000')
			.drawRect(0, 0, this.w, this.h)
			.beginFill('rgba(255, 255, 255, 0.5)')
			//.beginFill('#fff')
			.beginFill(this.colorFn(value, this.maxValue))
			.drawRect(1, 1, (this.w - 2) * value / this.maxValue, this.h - 2);
	}
};
