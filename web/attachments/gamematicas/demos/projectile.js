'use strict';
demo('projectile', ['arrow', 'aBox'], function(demo, canvas, controlsContainer, sprites, canvasWidth, canvasHeight) {

  var ctx = canvas.getContext('2d');

  var tau = 2 * Math.PI;

  var mockArrow;
  var shotArrows = [];
  var opts = {
    tilt: 30,
    shootingSpeed: 100,
    gravity: 9,
    shooting: false
  };

  function degtorad(deg) {
    return deg / 360 * tau;
  }

  function drawSpriteRotated(sprite, posX, posY, rotation) {
    var width = sprite.width / demo.spriteRatio;
    var height = sprite.height / demo.spriteRatio;
    ctx.save();
    ctx.translate(posX, posY);
    ctx.rotate(rotation);
    ctx.scale(1 / demo.spriteRatio, 1 / demo.spriteRatio);
    ctx.drawImage(sprite, -sprite.width / 2, -sprite.height / 2);
    ctx.restore();
  }

  function Arrow() {
    this.posX = 0;
    this.posY = 0;
    this.velX = 0;
    this.velY = 0;
    this.rotation = Math.PI / 4;
    this.lastUpdate = new Date().getTime();
  }

  Arrow.prototype.draw = function(ctx) {
    drawSpriteRotated(sprites.arrow, this.posX, this.posY, this.rotation);
    ctx.beginPath();
    ctx.arc(this.posX, this.posY, 3, 0, tau);
    ctx.closePath();
    ctx.fillStyle = '#C6B13E';
    ctx.fill();
    ctx.strokeStyle = '#7F6C06';
    ctx.stroke();
  };

  Arrow.prototype.update = function () {
    var timeNow = new Date().getTime();
    var timeElapsed = (timeNow - this.lastUpdate) * 0.001;
    this.lastUpdate = timeNow;

    // Affected by gravity
    this.velY += opts.gravity * timeElapsed;

    // Rotation is calculated from velocity
    this.rotation = Math.atan2(this.velY, this.velX);

    // Velocity moves the object
    this.posX += this.velX * timeElapsed;
    this.posY += this.velY * timeElapsed;
  };

  Arrow.prototype.isVisible = function() {
    return this.posX > -100 && this.posX < canvasWidth + 100 &&
            this.posY > -100 && this.posY < canvasHeight + 100;
  };

  function updateMockArrow() {
    mockArrow.rotation = -degtorad(opts.tilt);
  }

  demo.update = function update() {
    updateMockArrow();

    for (var i = 0; i < shotArrows.length; i++) {
      var arrow = shotArrows[i];
      arrow.update();

      if (!arrow.isVisible()) {
        // Delete this arrow
        shotArrows.splice(i, 1);
        i--;
      }
    }

    demo.setActive(shotArrows.length > 0);
  }

  demo.draw = function draw(ctx) {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    mockArrow.draw(ctx);

    for (var i = 0; i < shotArrows.length; i++) {
      var arrow = shotArrows[i];
      arrow.draw(ctx);
    }
  }

  function setUp(container) {
    mockArrow = new Arrow();
    mockArrow.posX = 30;
    mockArrow.posY = 150;
    updateMockArrow();

    var controls = new ControlFactory(demo, opts);
    $(container).append([
      controls.slider('Inclinación', 'tilt', -90, 90, 1, 'º'),
      controls.slider('Vel. lanzamiento', 'shootingSpeed', 1, 500, 0.2, 'px/s'),
      controls.slider('Gravedad', 'gravity', 0, 100, 0.3, 'px/s²'),
      controls.checkbox('Lanzar flechas', 'shooting', function(shooting) {
        if (shooting) {
          launchArrow();
          demo.shootingTimer = setInterval(launchArrow, 500);
        } else {
          clearInterval(demo.shootingTimer);
          demo.shootingTimer = null;
        }
      })
    ]);
  }

  function launchArrow() {
    var arrow = new Arrow();
    arrow.posX = mockArrow.posX;
    arrow.posY = mockArrow.posY;
    arrow.rotation = mockArrow.rotation;
    arrow.velX = opts.shootingSpeed * Math.cos(-degtorad(opts.tilt));
    arrow.velY = opts.shootingSpeed * Math.sin(-degtorad(opts.tilt));

    shotArrows.push(arrow);
    demo.setActive(true);
  }

  setUp(controlsContainer);

});