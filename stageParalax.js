var paralaxResources = [
		{id: "farPlane", src: "imgs/Tiles/farPlane.png"},
		{id: "playerPlane", src: "imgs/Tiles/playerPlane.png"},
		{id: "nearPlane", src: "imgs/Sprites/nearPlane.png"}
	];

Paralax = function () {

	//Init
	this.planes = {
		//farPlane: new Plane(0.7,0 ,"farPlane"),
		//playerPlane: new Plane(1.0,30 ,"playerPlane"),
		nearPlane: new Plane(LayerForeground, 1.2, stage.canvas.height - Resources.getResult("nearPlane").height, "nearPlane")
	};

	this.update = function (dt) {
		for (key in this.planes) {
			this.planes[key].update(dt);
		}
	};
};

Plane = function(layer, speedScale, yPos, resource){
	this.speedScale = speedScale;
	this.yPos = yPos;
	this.resource = Resources.getResult(resource);

	this.tile = new createjs.Shape();
	this.tile.graphics
		.beginBitmapFill(this.resource)
		.drawRect(0, 0, this.resource.width * 3, stage.canvas.height);

	layer.addChild(this.tile);

	this.update = function (dt) {
		this.tile.x -= (dt * this.speedScale);

		if (this.tile.x < -1 * this.resource.width) {
			this.tile.x = 0;
		} else if (this.tile.x > 0) {
			this.tile.x = -1 * this.resource.width;
		}

		this.tile.y = this.yPos;
	};
}