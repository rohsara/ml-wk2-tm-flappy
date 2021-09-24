let bird;
let pipes = [];

const modelURL = 'https://teachablemachine.withgoogle.com/models/NkOhdqGZa/';
// the json file (model topology) has a reference to the bin file (model weights)
const checkpointURL = modelURL + "model.json";
// the metatadata json file contains the text labels of your model and additional information
const metadataURL = modelURL + "metadata.json";

const size = 200;
const flip = true; // whether to flip the webcam
let webcam;
let model;
let totalClasses;
let myCanvas;
let ctx;
let sfx;

async function load() {
	model = await tmPose.load(checkpointURL, metadataURL);
	totalClasses = model.getTotalClasses();
	console.log("Number of classes, ", totalClasses);
}

async function loadWebcam() {
	webcam = new tmPose.Webcam(size, size, flip); // can change width and height
	await webcam.setup(); // request access to the webcam
	await webcam.play();
	window.requestAnimationFrame(loopWebcam);
}

async function setup() {
	/* flappy bird part */
	// soundFormats('mp3', 'ogg');
	sfx = loadSound('sfx-flying-8bit.mp3');

	myCanvas = createCanvas(700, 600);
	ctx = myCanvas.elt.getContext("2d");

	bird = new Bird();
	pipes.push(new Pipe());

	// Call the load function, wait until it finishes loading
	await load();
	await loadWebcam();
}

async function loopWebcam(timestamp) {
  webcam.update(); // update the webcam frame
  await predict();
  window.requestAnimationFrame(loopWebcam);
}

async function predict() {
	// Prediction #1: run input through posenet
	// predict can take in an image, video or canvas html element
	const flipHorizontal = false;
	const { pose, posenetOutput } = await model.estimatePose(
	  webcam.canvas,
	  flipHorizontal
	);
	// Prediction 2: run input through teachable machine classification model
	const prediction = await model.predict(
	  posenetOutput,
	  flipHorizontal,
	  totalClasses
	);
  
	// console.log('prediction: ', prediction);
	// Sort prediction array by probability
	// So the first classname will have the highest probability
	const sortedPrediction = prediction.sort((a, b) => - a.probability + b.probability);
  
	// Show the result
	const res = select('#res'); // select <span id="res">
	res.html(sortedPrediction[0].className);
	// console.log(sortedPrediction[0].className)
  
	// Show the probability
	const prob = select('#prob'); // select <span id="prob">
	prob.html(sortedPrediction[0].probability.toFixed(2));

	console.log(sortedPrediction[0].className)

	if (sortedPrediction[0].className.search("fly") === 0) {
		bird.up();
		console.log("up");
		if (!sfx.isPlaying()) sfx.play();

	}
}
  
function drawPose(pose) {
	if (webcam.canvas) {
		ctx.drawImage(webcam.canvas, 0, 0);
		// draw the keypoints and skeleton
		if (pose) {
			const minPartConfidence = 0.5;
			tmPose.drawKeypoints(pose.keypoints, minPartConfidence, ctx);
			tmPose.drawSkeleton(pose.keypoints, minPartConfidence, ctx);
		}
	}
}

// Flappy
function draw() {
	background(0);

	for(let i = pipes.length-1; i >= 0; i--){
		pipes[i].show();
		pipes[i].update();

		if(pipes[i].hits(bird)){
			// console.log("HIT");
		}

		if(pipes[i].offscreen()){
			pipes.splice(i, 1);
		}
	}

	bird.update();
	bird.show();

	if(frameCount % 130 === 0){
		pipes.push(new Pipe()); 		
	}
}

function keyPressed(){
	if(key === ' '){
		// console.log("Spacebar")
		bird.up();
	}
}