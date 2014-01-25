var parallaxResources = [
		{id: "farPlane", src: "imgs/Tiles/farPlane.png"},
		{id: "playerPlane", src: "imgs/Tiles/playerPlane.png"},
		{id: "nearPlane", src: "imgs/Sprites/nearPlane.png"}
	];

Parallax = function () {

	//Init
	this.planes = {
		//farPlane: new Plane(LayerBackground, 0 ,"farPlane"),
		//playerPlane: new Plane(1.0,30 ,"playerPlane"),
		nearPlane: new Plane(LayerForeground, stage.canvas.height - Resources.getResult("nearPlane").height, "nearPlane")
	};

	var bgScale = 0.6;
	var fgScale = 1.4;



	this.update = function () {
		for (key in this.planes) {
			this.planes[key].update();
		}


		var minX = player.position().x, maxX = player.position().x;
		for (var i = 0; i < cats.length; i++) {
			var c = cats[i];
			minX = Math.min(minX, c.position().x);
			maxX = Math.max(maxX, c.position().x);


			//TODO: Ignore cats too far from the player
		}

		var midX = (minX + maxX) / 2;

		if (midX < 1280 / 2 / SIM_SCALE_X)
			midX = 1280 / 2/ SIM_SCALE_X;

		var bgDesired = -midX * bgScale * SIM_SCALE_X + 1280 / 2;
		LayerBackground.x = LayerBackground.x * 0.98 + bgDesired * 0.02;

		var desired = -midX * SIM_SCALE_X + 1280 / 2;
		LayerStage.x = LayerStageOver.x = LayerStage.x * 0.98 + desired * 0.02;

		var foreDesired = -midX * fgScale * SIM_SCALE_X + 1280 / 2;
		LayerForeground.x = LayerForeground.x * 0.98 + foreDesired * 0.02;
	};
};

Plane = function(layer, yPos, resource){
	this.resource = Resources.getResult(resource);

	this.tile = new createjs.Shape();
	this.tile.graphics
		.beginBitmapFill(this.resource)
		.drawRect(0, 0, this.resource.width * 3, stage.canvas.height);
	this.tile.y = yPos;

	layer.addChild(this.tile);

	this.update = function () {
		var x = this.tile.x + layer.x;

		if (x < -this.resource.width) {
			this.tile.x += this.resource.width;
		} else if (x > 0) {
			this.tile.x -= this.resource.width;
		}
	};
}