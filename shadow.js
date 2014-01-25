Shadow = {
	_cache: {
	},

	create: function (width, height, blurSize) {
		var key = width + '|' + height + '|' + blurSize;

		if (!this._cache[key]){
			var canvas = document.createElement('canvas');
			canvas.width = width + blurSize * 2;
			canvas.height = height + blurSize * 2;

			var ctx = canvas.getContext('2d');
			ctx.fillStyle = "black";
			ctx.strokeStyle = 'transparent';
			drawEllipse(ctx, (canvas.width - width) / 2, (canvas.height - height) / 2, width, height);
			ctx.fill();

			this._cache[key] = canvas;
		}

		var res = new createjs.Bitmap(this._cache[key]);
		res.regX = width / 2 + blurSize;
		res.regY = height / 2 + blurSize;

		res.filters = [new createjs.BlurFilter(blurSize, blurSize, 1)];
		res.cache(0, 0, width + blurSize * 2, height + blurSize * 2);
		res.alpha = 0.3;
		return res;
	}
};