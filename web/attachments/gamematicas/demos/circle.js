'use strict';
demo('circle', [], function (demo, canvas, controlsContainer, sprites, canvasWidth, canvasHeight) {

    var ctx = canvas.getContext('2d');

    var widgetRadius = 3;
    var opts = {
        numWidgets: 20,
        offset: 0
    };

    function drawWidget(ctx, x, y) {
        ctx.beginPath();
        ctx.arc(x, y, widgetRadius, 0, TAU);
        ctx.closePath();
        ctx.fillStyle = '#7aca5c';
        ctx.fill();
        ctx.strokeStyle = '#6ca655';
        ctx.stroke();
    }

    function drawWidgetsAroundCircumference(ctx, centerX, centerY, radius) {
        var ang_interval = TAU / opts.numWidgets;
        var ang_offset = ang_interval * opts.offset;
        for (var i = 0; i < opts.numWidgets; i++) {
            var x = centerX + Math.cos(i * ang_interval + ang_offset) * radius;
            var y = centerY + Math.sin(i * ang_interval + ang_offset) * radius;
            drawWidget(ctx, x, y);
        }
    }

    demo.draw = function draw(ctx) {
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        drawWidgetsAroundCircumference(ctx, canvasWidth / 2, canvasHeight / 2,
            canvasHeight / 2 - widgetRadius / 2 - 10);
    }

    function setUp(container) {
        var controls = new ControlFactory(demo, opts);
        $(container).append([
            controls.slider('Num. objetos', 'numWidgets', 2, 50, 1),
            controls.slider('Desplazamiento', 'offset', 0, 1, 0.01, '%'),
        ])
    }

    setUp(controlsContainer);

});

