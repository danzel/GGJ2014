
function drawEllipse(ctx, x, y, w, h) {
	var kappa = .5522848,
		ox = (w / 2) * kappa, // control point offset horizontal
		oy = (h / 2) * kappa, // control point offset vertical
		xe = x + w,           // x-end
		ye = y + h,           // y-end
		xm = x + w / 2,       // x-middle
		ym = y + h / 2;       // y-middle

	ctx.beginPath();
	ctx.moveTo(x, ym);
	ctx.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y);
	ctx.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym);
	ctx.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
	ctx.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym);
	ctx.closePath();
	ctx.stroke();
}

function initMenu() {
	var text;

	text = new createjs.Text('Crazy Cat Lady Simulator 2014', '60px Arial', '#000');
	text.x = 400;
	stage.addChild(text);

	text = new createjs.Text('Move with WASD/Arrows', '40px Arial', '#000');
	text.x = 410;
	text.y = 90;
	stage.addChild(text);
	text = new createjs.Text('Mouse to Aim laser pointer', '40px Arial', '#000');
	text.x = 410;
	text.y = 140;
	stage.addChild(text);
	text = new createjs.Text('Kittens chase laser pointer', '40px Arial', '#000');
	text.x = 410;
	text.y = 190;
	stage.addChild(text);
	text = new createjs.Text('Defeat the doge head to win', '40px Arial', '#000');
	text.x = 410;
	text.y = 240;
	stage.addChild(text);

	text = new createjs.Text('Click to start!', '40px Arial', '#000');
	text.x = 610;
	text.y = 360;
	stage.addChild(text);

	text = new createjs.Text('Pro tips: Touch kittens to heal. Kittens can\'t fight. Lions attack nearest thing. Beware of doges. Spacebar to transform early', '20px Arial', '#000');
	text.x = 10;
	text.y = 680;
	stage.addChild(text);


	var sprite = new createjs.Sprite(Player.runSheet, 'run');
	sprite.x = 200;
	sprite.y = 650;
	sprite.framerate = 8;
	stage.addChild(sprite);

	sprite = new createjs.Sprite(Cat.catRunSheet, 'run');
	sprite.x = 630;
	sprite.y = 630;
	sprite.framerate = 8;
	stage.addChild(sprite);

	sprite = new createjs.Sprite(Cat.catRunSheet, 'run');
	sprite.x = 570;
	sprite.y = 590;
	sprite.framerate = 8;
	stage.addChild(sprite);

	sprite = new createjs.Sprite(Cat.catRunSheet, 'run');
	sprite.x = 480;
	sprite.y = 610;
	sprite.framerate = 8;
	stage.addChild(sprite);

	sprite = new createjs.Sprite(Cat.catRunSheet, 'run');
	sprite.x = 530;
	sprite.y = 650;
	sprite.framerate = 8;
	stage.addChild(sprite);



	var menuShowing = true;
	mouse.on('click', function () {
		if (menuShowing) {
			menuToGame();
			menuShowing = false;
		}
	});
}

function menuToGame() {
	stage.removeAllChildren();
	initGame();
	GameMode = GameMode_Game;
}

function menuTick(dt) {

}
function menuRendererTick() {
}