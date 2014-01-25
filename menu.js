var faceWidth = 140;
var faceHeight = 200;

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
navigator.getUserMedia = (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);

var videoStream;

function initMenu() {
	var videoElement = document.getElementById('webcam');

	var bitmap;


	var maskCanvas = document.createElement('canvas');
	maskCanvas.width = 1280;
	maskCanvas.height = 720;

	var maskCtx = maskCanvas.getContext('2d');
	maskCtx.fillStyle = "black";
	maskCtx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);
	maskCtx.globalCompositeOperation = 'xor';
	drawEllipse(maskCtx, (1280 - faceWidth) / 2, (720 - faceHeight) / 2, faceWidth, faceHeight);
	maskCtx.fill();

	var maskBitmap = new createjs.Bitmap(maskCanvas);
	stage.addChild(maskBitmap);

	var currentText = new createjs.Text('waiting...', '40px Arial', '#fff');
	currentText.textBaseline = 'alphabetic';
	currentText.x = 380;
	currentText.y = 680;
	stage.addChild(currentText);

	var text = new createjs.Text(' ^^ GET YO FACE IN THE GAME', '40px Arial', '#fff');
	text.textBaseline = 'alphabetic';
	text.x = 380;
	text. y = 50;
	stage.addChild(text);
	text = new createjs.Text('BE A CRAZY CAT LADY', '40px Arial', '#fff');
	text.textBaseline = 'alphabetic';
	text.x = 380;
	text.y = 120;
	stage.addChild(text);

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
				videoStream = stream;

				setTimeout(function () {
					bitmap = new createjs.Bitmap(videoElement);
					bitmap.regX = videoElement.videoWidth;
					bitmap.scaleX = -1;
					stage.addChildAt(bitmap, 0);
					bitmap.x = (1280 - videoElement.videoWidth) / 2;
					bitmap.y = (720 - videoElement.videoHeight) / 2;

					currentText.text = 'SHOW US YOUR ANGRY FACE (hit a)';
					//var gfx = new createjs.Shape();
					//gfx.graphics.beginFill('#00f').drawRect(0, 0, 500, 500);
					//stage.addChild(gfx);
				}, 100);
			},
			function (error) {
				//alert('Something went wrong. (error code ' + error.code + ')');
				menuToGame();
				return;
			}
		);
	}
	else {
		menuToGame();
		//alert('Sorry, the browser you are using doesn\'t support getUserMedia');
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

			Faces.push(canvas);

			var container = new createjs.Container();
			stage.addChild(container);

			bitmap = new createjs.Bitmap(canvas);
			bitmap.filters = [
				new createjs.AlphaMaskFilter(maskCanvas)
			];
			bitmap.cache(0, 0, canvas.width, canvas.height);
			//bitmap.x = 10;
			bitmap.regX = canvas.width / 2;
			bitmap.regY = canvas.height / 2;
			bitmap.scaleX = -1;
			container.addChild(bitmap);

			if (Faces.length == 1) {
				//bitmap.y = 10;
				text = new createjs.Text('SO ANGER', '40px Arial', '#fff');
				text.textBaseline = 'alphabetic';
				text.x = -100;
				text.y = 130;
				container.addChild(text);

				container.x = 80;
				container.y = 120;

				currentText.text = 'SHOW US YOUR FEEBLE FACE (hit a)';
			} else if (Faces.length == 2) {
				text = new createjs.Text('MUCH FEEBLE', '40px Arial', '#fff');
				text.textBaseline = 'alphabetic';
				text.x = -100;
				text.y = 130;
				container.addChild(text);

				container.x = 900;
				container.y = 320;

				currentText.text = 'SHOW US YOUR PAIN FACE (hit a)';
			} else if (Faces.length == 3) {
				text = new createjs.Text('VERY PAIN', '40px Arial', '#fff');
				text.textBaseline = 'alphabetic';
				text.x = -100;
				text.y = 130;
				container.addChild(text);

				container.x = 200;
				container.y = 500;

				currentText.text = 'OK LETS GO (hit start)';


			}
		} else if (e.control == 'START_FORWARD' && Faces.length == 3) {
			menuToGame();
		}
	});
}

function menuToGame() {
	if (videoStream) {
		videoStream.stop();
	}
	gamepad.unbind(Gamepad.Event.BUTTON_DOWN);
	stage.removeAllChildren();
	initGame();
	GameMode = GameMode_Game;
}

function menuTick(dt) {

}
function menuRendererTick() {
}