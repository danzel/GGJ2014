
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

	var text = new createjs.Text('Move with WASD/Arrows', '40px Arial', '#000');
	text.x = 10;
	stage.addChild(text);
	text = new createjs.Text('Mouse to Aim laser pointer', '40px Arial', '#000');
	text.x = 10;
	text.y = 50;
	stage.addChild(text);
	text = new createjs.Text('Kittens chase laser pointer', '40px Arial', '#000');
	text.x = 10;
	text.y = 100;
	stage.addChild(text);
	text = new createjs.Text('Defeat the doge head to win', '40px Arial', '#000');
	text.x = 10;
	text.y = 150;
	stage.addChild(text);

	text = new createjs.Text('Click to start!', '40px Arial', '#000');
	text.x = 10;
	text.y = 240;
	stage.addChild(text);

	text = new createjs.Text('Pro tips: Touch kittens to heal. Kittens can\'t fight. Lions attack nearest thing. Beware of doges. Spacebar to transform early', '20px Arial', '#000');
	text.x = 10;
	text.y = 600;
	stage.addChild(text);

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