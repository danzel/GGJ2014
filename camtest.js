var stage, renderer;

var gamepad, gamepadStrategy, gamepads = [];

Math.sign = Math.sign || function (a) { return a > 0 ? 1 : a < 0 ? -1 : 0; };

function init() {
	gamepadStrategy = new Gamepad.UpdateStrategies.ManualUpdateStrategy();
	gamepad = new Gamepad(gamepadStrategy);
	gamepad.deadzone = 0.1;
	if (!gamepad.init()) {
		console.log('fail at gamepad');
	}
	gamepad.bind(Gamepad.Event.CONNECTED, function (device) {
		gamepads.push(device);
	});

	stage = new createjs.Stage('canvas');
	createjs.DisplayObject.suppressCrossDomainErrors = true;

	loadingComplete();
}

function loadingError(target, type, item, error) {
	console.log('loading error: ' + target + ' ' + type + ' ' + item + ' ' + error);
}

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

function loadingComplete() {

	navigator.getUserMedia = (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);
	var videoElement = document.getElementById('webcam');

	var bitmap;

	var faceWidth = 140;
	var faceHeight = 200;

	if (navigator.getUserMedia) {
		// Request access to video only
		navigator.getUserMedia(
			{
				video: true,
				audio: false
			},
			function (stream) {
				// Cross browser checks
				var url = window.URL || window.webkitURL;
				videoElement.src = url ? url.createObjectURL(stream) : stream;
				// Set the video to play
				videoElement.play();

				setTimeout(function () {
					bitmap = new createjs.Bitmap(videoElement);
					bitmap.regX = videoElement.videoWidth;
					bitmap.scaleX = -1;
					stage.addChild(bitmap);

					var maskCanvas = document.createElement('canvas');
					console.log(videoElement.videoWidth);
					maskCanvas.width = videoElement.videoWidth;
					maskCanvas.height = videoElement.videoHeight;
					console.log(maskCanvas.width);

					var maskCtx = maskCanvas.getContext('2d');
					maskCtx.fillStyle = "black";
					maskCtx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);
					maskCtx.globalCompositeOperation = 'xor';
					drawEllipse(maskCtx, (videoElement.videoWidth - faceWidth) / 2, (videoElement.videoHeight - faceHeight) / 2, faceWidth, faceHeight);
					maskCtx.fill();

					var maskBitmap = new createjs.Bitmap(maskCanvas);
					stage.addChild(maskBitmap);
				}, 100);
			},
			function (error) {
				alert('Something went wrong. (error code ' + error.code + ')');
				return;
			}
		);
	}
	else {
		alert('Sorry, the browser you are using doesn\'t support getUserMedia');
		return;
	}


	gamepad.bind(Gamepad.Event.BUTTON_DOWN, function (e) {
		if (e.control == 'FACE_1') {

			//Get the video frame
			var canvas = document.createElement('canvas');
			canvas.width = faceWidth;
			canvas.height = faceHeight;
			var context = canvas.getContext('2d');
			context.drawImage(videoElement, (faceWidth - videoElement.videoWidth) / 2, (faceHeight - videoElement.videoHeight) / 2);

			//Mask it like a badman
			var maskCanvas = document.createElement('canvas');
			console.log(videoElement.videoWidth);
			maskCanvas.width = videoElement.videoWidth;
			maskCanvas.height = videoElement.videoHeight;
			console.log(maskCanvas.width);

			var maskCtx = maskCanvas.getContext('2d');
			maskCtx.fillStyle = "black";
			drawEllipse(maskCtx, 0, 0, faceWidth, faceHeight);
			maskCtx.fill();


			bitmap = new createjs.Bitmap(canvas);
			bitmap.filters = [
				new createjs.AlphaMaskFilter(maskCanvas)
			];
			bitmap.cache(0, 0, canvas.width, canvas.height);
			bitmap.regX = canvas.width;
			bitmap.scaleX = -1;
			stage.addChild(bitmap);

			bitmap.x = 400;
		}
	});

	createjs.Ticker.setFPS(60);
	createjs.Ticker.addEventListener("tick", function () {
		gamepadStrategy.update();
		gameTick(createjs.Ticker.getInterval() / 1000);
		rendererTick();
		stage.update();
	});
}

function gameTick(dt) {

}

function rendererTick() {
}