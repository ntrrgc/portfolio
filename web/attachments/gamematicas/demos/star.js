'use strict';
demo('star', [], function(demo, canvas, controlsContainer, sprites, canvasWidth, canvasHeight) {

  var ctx = canvas.getContext('2d');
  var radius;

  var widgetRadius = 3;
  var opts = {
    numStarPoints: 5,
    starStep: 2,
    numPointsSegment: 15,
    offsetArc: 3 * TAU / 4,
    offsetSegment: 0,
    rotSpeed: 9,
    offsetSpeed: 2,
    animate: true
  };
  if (demo.tag == 'polygon') {
    opts.starStep = 1;
  }
  if (demo.tag != 'star-animation') {
    opts.rotSpeed = opts.offsetSpeed = 0;
  }

  demo.segments = [];
  demo.points = [];

  function Segment(ax, ay, bx, by) {
    this.ax = ax;
    this.ay = ay;
    this.bx = bx;
    this.by = by;
    this.length = sqrt(pow2(bx - ax) + pow2(by - ay));
  }

  function drawWidget(ctx, x, y) {
    ctx.beginPath();
    ctx.arc(x, y, widgetRadius, 0, TAU);
    ctx.closePath();
    ctx.fillStyle = '#7aca5c';
    ctx.fill();
    ctx.strokeStyle = '#6ca655';
    ctx.stroke();
  }

  function generatePoints(centerX, centerY, radius) {
    // Recorta arary hasta numStarPoints
    cutArray(demo.points, opts.numStarPoints);

    var angInterval = TAU / opts.numStarPoints;
    // Resta 90 grados al offset para que se empiece a
    // trazar desde arriba (la parte superior de la
    // pantalla está en las y negativas)
    var angOffset = opts.offsetArc;
    for (var i = 0; i < opts.numStarPoints; i++) {
      var x = centerX + Math.cos(i * angInterval + angOffset) * radius;
      var y = centerY + Math.sin(i * angInterval + angOffset) * radius;
      demo.points[i] = {x: x, y: y};
    }
  }

  function generateSegments() {
    var numSegments = 2 * opts.numStarPoints;
    cutArray(demo.segments, numSegments);

    var startingPoint = 0;
    var pointAIx = 0;
    for (var i = 0; i < numSegments; i++) {
      var pointBIx = (pointAIx + opts.starStep) % demo.points.length;

      var a = demo.points[pointAIx],
          b = demo.points[pointBIx];

      demo.segments[i] = new Segment(a.x, a.y, b.x, b.y);

      // El punto de fin de este segmento es el punto
      // de inicio del siguiente.
      pointAIx = pointBIx;

      // Si volvemos al punto de inicio y todavía quedan más
      // pasos, estamos ante una estrella desconectada.
      // Deberemos repetir el proceso empezando a dibujar por
      // el punto siguiente.
      if (pointAIx == startingPoint) {
        startingPoint = (pointAIx + 1) % demo.points.length;
        pointAIx = startingPoint;
      }
    }
  }

  function drawSegment(ctx, segment, numPoints, offset) {
    // Calculamos el alto y ancho del segmento
    var w = segment.bx - segment.ax;
    var h = segment.by - segment.ay;

    // Calculamos el alto y ancho de las partes
    var numParts = numPoints - 1;
    var partW = w / numParts;
    var partH = h / numParts;

    // Para i entre 0 y `numPoints - 1` (no incluido).
    // El último punto no se coloca (se deja al
    // siguiente segmento)
    for (var i = 0; i < numPoints - 1; i++) {
      // Añadimos un nuevo punto que será A sumado i
      // veces el ancho y alto de la parte.
      drawWidget(ctx,
          segment.ax + partW * (i + offset),
          segment.ay + partH * (i + offset));
    }
  }

  demo.draw = function draw(ctx) {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    generatePoints(canvasWidth / 2, canvasHeight / 2,
        canvasHeight / 2 - widgetRadius / 2 - 10);
    generateSegments();

    for (var i = 0; i < this.segments.length; i++) {
      var segment = this.segments[i];
      drawSegment(ctx, segment, opts.numPointsSegment, opts.offsetSegment);
    }
  }

  demo.update = function update(timeElapsed) {
    this.setActive(opts.animate);

    if (opts.animate) {
      opts.offsetArc = normRad(opts.offsetArc + opts.rotSpeed * TAU / 60 * timeElapsed);
      opts.offsetSegment = normCyclic(opts.offsetSegment + opts.offsetSpeed * timeElapsed, 0, 1);
    }
  }

  function setUp(container) {
    var controls = new ControlFactory(demo, opts);
    if (demo.tag == 'polygon') {
      $(container).append([
        controls.slider('Num. lados', 'numStarPoints', 3, 35, 1),
        controls.slider('Puntos segmento', 'numPointsSegment', 1, 30, 1),
        controls.slider('Rotación', 'offsetArc', 0, 360, 1, 'deg'),
      ]);
    } else {
      $(container).append([
        controls.slider('Num. puntas', 'numStarPoints', 1, 35, 1),
        controls.slider('Puntos segmento', 'numPointsSegment', 1, 30, 1),
        controls.slider('Paso', 'starStep', 1, 10, 1),
      ]);
    }

    if (demo.tag == 'star-construction') {
      $(container).append([
        controls.slider('Ángulo estrella', 'offsetArc', 0, 360, 1, 'deg'),
        controls.slider('Despl. segmento', 'offsetSegment', 0, 1, 0.01, '%')
      ]);
    } else if (demo.tag == 'star-animation') {
      $(container).append([
        controls.slider('Vel. rotación', 'rotSpeed', 0, 200, 1, 'rpm'),
        controls.slider('Vel. despl.', 'offsetSpeed', 0, 9, 0.1, 'partes/s', 1),
        controls.checkbox('Reproducir animación', 'animate'),
      ]);
    }
  }

  setUp(controlsContainer);

});