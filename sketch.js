let bird;

function setup() {
	createCanvas(400, 600);
	bird = new Bird();
}

function draw() {
	background(0);
	bird.show();
}
