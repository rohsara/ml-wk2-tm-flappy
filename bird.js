function Bird() {
    this.y = height/2;
    this.x = 64;

    this.show = function(){
        fill(255);
        ellipse(this.x, this.y, 32, 32);
    }
}
