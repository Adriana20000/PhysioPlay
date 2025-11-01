export default class Star {
  
  constructor(img, size, speed, canvasWidth, startY, side) {
    this.img = img;
    this.size = size;
    this.speed = speed;
    this.y = startY;
    this.startY = startY;
    this.canvasWidth = canvasWidth;
    this.opacity = 1;

    this.setX(side);
  }

  /*
   * Chooses the horizontal (X) position of the star:
   * - Stars appear either on the left or right side of the screen.
   * - Avoids the center area (forbiddenZone).
   */
  setX(side) {
    const forbiddenZone = 0.2;
    const sideWidth = 0.15;    

    if (side === "left") {
      const leftMin = this.canvasWidth * (0.5 - forbiddenZone / 2 - sideWidth);
      const leftMax = this.canvasWidth * (0.5 - forbiddenZone / 2);
      this.x = leftMin + Math.random() * (leftMax - leftMin);
    } else {
      const rightMin = this.canvasWidth * (0.5 + forbiddenZone / 2);
      const rightMax = this.canvasWidth * (0.5 + forbiddenZone / 2 + sideWidth);
      this.x = rightMin + Math.random() * (rightMax - rightMin);
    }
  }

  /*
   * Resets the star to its starting position.
   */
  reset(canvasWidth, side) {
    this.canvasWidth = canvasWidth;
    this.y = this.startY;
    this.opacity = 1;
    this.setX(side);
  }
  

  draw(ctx, wrongExtension = false) {
    if (this.img.complete) {
      ctx.save();
      ctx.globalAlpha = wrongExtension ? 0.5 : this.opacity;
      ctx.drawImage(
        this.img,
        this.x - this.size / 2,
        this.y - this.size / 2,
        this.size,
        this.size
      );
      ctx.restore();
    }
  }

  /*
   * Updates the star’s position and checksif it collides with the player’s hands.
   *
   */
  update(ctx, manoDX, manoDY, manoSX, manoSY, canvasHeight, canvasWidth, redLineY) {
    this.y += this.speed;
   
    if (this.y + this.size / 2 >= redLineY) this.opacity = 0;
   
    const distanzaDX = Math.hypot(this.x - manoDX, this.y - manoDY);
    const distanzaSX = Math.hypot(this.x - manoSX, this.y - manoSY);

    const collisionRadius = this.size * 0.75;
    if ((distanzaDX < collisionRadius || distanzaSX < collisionRadius) && this.opacity > 0) {
      const touchX = distanzaDX < collisionRadius ? manoDX : manoSX;
      const touchY = distanzaDX < collisionRadius ? manoDY : manoSY;
      const hand = distanzaDX < collisionRadius ? "right" : "left";
      return { rigenera: true, raccolta: true, touchX, touchY, hand };
    }

    
    if (this.y > canvasHeight || this.opacity <= 0) return { rigenera: true, raccolta: false };

    
    this.draw(ctx);
    return { rigenera: false, raccolta: false };
  }
}
