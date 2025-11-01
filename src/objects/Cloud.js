export default class Cloud {
  
  /*
   * Creates a new cloud object.
  */
  constructor({y = Math.random() * 500 + 100, width = 220, height = 250 }) {
    this.y = y;
    this.visible = true;
    this.opacity = 1;
    this.width = width;
    this.height = height;
  }

   draw(ctx, x, image) {
    if (!this.visible || !image) return;
    ctx.save();
    ctx.globalAlpha = this.opacity;
    const center_x = x - this.width / 2;
    const center_y = this.y - this.height / 2
    ctx.drawImage(image, center_x, center_y, this.width, this.height);
    ctx.restore();
  }

  /*
   * Gradually fades out the cloud by reducing its opacity: when fully transparent, it becomes invisible and resets opacity.
   */
  fadeOut(speed = 0.02) {
    this.opacity -= speed;
    if (this.opacity <= 0) {
      this.visible = false;
      this.opacity = 1;
    }
  }


  /*
   * Moves the cloud to a new random vertical position.
   */
  resetPosition(videoHeight, balloonY, minDistance = 200) {
        let newY;
        do {
        newY = Math.random() * (videoHeight - 200) + 100;
        } 
        while (Math.abs(newY - balloonY) < minDistance);
        this.y = newY;
        this.visible = true;
  }

  
  /*
   * Checks if the cloud is touching the balloon.
   */
  isTouching(balloonY, radius = 30) {
    const distanceY = Math.abs(balloonY - this.y);
    return distanceY < 150 / 2 + radius;
  }
}