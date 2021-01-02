function assign(object, dict) {
  for (var key in dict) {
    object[key] = dict[key];
  }
}

var getPixelRatio = function(context) {
  var backingStore = context.backingStorePixelRatio ||
      context.webkitBackingStorePixelRatio ||
      context.mozBackingStorePixelRatio ||
      context.msBackingStorePixelRatio ||
      context.oBackingStorePixelRatio ||
      context.backingStorePixelRatio || 1;

  return (window.devicePixelRatio || 1) / backingStore;
};

function cutArray(array, length) {
  array.splice(length, array.length - length);
}

function pow2(number) {
  return number * number;
}

function toFixed(num, precision) {
  return num.toFixed(precision).replace('.', ',');
}

var cos = Math.cos,
    sin = Math.sin,
    tan = Math.tan,
    acos = Math.acos,
    asin = Math.asin,
    atan = Math.atan,
    atan2 = Math.atan2,
    sqrt = Math.sqrt,
    pow = Math.pow,
    round = Math.round,
    abs = Math.abs,
    PI = Math.PI,
    TAU = 2 * Math.PI;


function deg2rad(deg) {
  return deg * TAU / 360;
}

function rad2deg(rad) {
  return rad * 360 / TAU;
}

function normCyclic(val, min, max) {
  if (val >= min) {
    return min + (val - min) % (max - min);
  } else {
    return max - (min - val) % (max - min);
  }
}

function normRad(val) {
  return normCyclic(val, -Math.PI, Math.PI);
}

function imagePromise(url) {
  var image = new Image();
  return new Promise(function (resolve, reject) {
    image.addEventListener('load', resolve);
    image.addEventListener('error', reject);
    image.src = url;
  }).then(function () {
    return image;
  });
}

function loadSprite(name) {
  if (window.devicePixelRatio && window.devicePixelRatio > 1) {
    name = name + '-hidpi';
  }
  return imagePromise('/demos/sprites/' + name + '.png');
}

function ControlFactory(demo, opts) {
  this.opts = opts;
  this.updateFn = function() { demo.optionsUpdated() };
}
assign(ControlFactory.prototype, {
  slider: function slider(label, property, min, max, step, units, precision) {
    var self = this;
    var initialValue = adaptOptionValueToSlider(self.opts[property]);
    if (step == undefined) {
      step = 1;
    }
    if (precision == undefined) {
      precision = 0;
    }
    var bind = {};

    function getOutputContent() {
      var raw = self.opts[property];
      if (!units) {
        return raw;
      } else if (units == '%') {
        return toFixed(raw * 100, precision) + '%';
      } else if (units == 'deg') {
        return toFixed(rad2deg(raw), precision) + '°';
      } else {
        return toFixed(raw, precision) + ' ' + units;
      }
    }

    function adaptOptionValueToSlider(raw) {
      if (units == 'deg') {
        // Convert to degrees
        return rad2deg(raw);
      } else {
        return raw;
      }
    }

    function adaptSliderToOptionValue(raw) {
      if (units == 'deg') {
        // Save in radians
        return deg2rad(raw);
      } else {
        return raw;
      }
    }

    return $('<label/>', {
          html: [
            $('<span/>', {
              html: label
            }),
            $('<input/>', {
              type: 'range',
              min: min,
              max: max,
              step: step,
              value: initialValue,
              on: {
                'input change': function () {
                  // HACK: I use 'change' because IE10 does not support 'input'.
                  // 'input' is triggered while the user is dragging the control,
                  // 'change' only after the mouse is released.
                  if (self.opts[property] != this.value) {
                    // Update property
                    self.opts[property] = adaptSliderToOptionValue(parseFloat(this.value));
                    // Update output field
                    bind.output.html(getOutputContent());
                    // Redraw
                    self.updateFn();
                  }
                }
              }
            }),
            (bind.output = $('<output/>', {
              html: getOutputContent()
            }))
          ]
        });
  },
  checkbox: function checkbox(label, property, customUpdateFn) {
    var self = this;
    var initialValue = self.opts[property];

    if (customUpdateFn) {
      customUpdateFn(initialValue);
    }

    return $('<label/>', {
            html: [
              $('<div/>', {
                'class': 'check-wrapper',
                html:
                  $('<input/>', {
                    type: 'checkbox',
                    checked: initialValue,
                    on: {
                      'input change': function() {
                        if (self.opts[property] != this.checked) {
                          self.opts[property] = this.checked;
                          if (customUpdateFn) {
                            customUpdateFn(self.opts[property]);
                          }
                          self.updateFn();
                        }
                      }
                    }
                })
              }),
              $('<span/>', {html: label, 'class': 'check-label'})
            ]
          });
  }
});

function Demo(canvas, controls, tag, name, spritesRequested, demoDefinition) {
  if (!(this instanceof Demo)) {
    return new Demo(name, spritesRequested, demoDefinition);
  }
  this.canvas = canvas;
  this.controls = controls;
  this.tag = tag;
  this.ctx = this.canvas.getContext('2d');

  // Resize for HiDPI displays
  var canvasHeight = this.canvas.height;
  var canvasWidth = this.canvas.width;
  var ratio = getPixelRatio(this.ctx);
  this.canvas.width = this.canvas.width * ratio;
  this.canvas.height = this.canvas.height * ratio;
  this.canvas.style.width = canvasWidth + 'px';
  this.canvas.style.height = canvasHeight + 'px';

  this.ctx.scale(ratio, ratio);

  // Used when painting images
  this.spriteRatio = window.devicePixelRatio || 1;

  this.active = false; // will call update() and draw periodically if true
  this.updateInterval = 1 / 60; // 60 update frames per second
  this.frameTimer = null;
  var self = this;

  self.startedPromise = Promise.map(spritesRequested, function(spriteName) {
    return loadSprite(spriteName);
  }).then(function (sprites) {
    var spriteDict = {};
    for (var i = 0; i < sprites.length; i++) {
      var key = spritesRequested[i];
      var val = sprites[i];
      spriteDict[key] = val;
    }
    self.sprites = spriteDict;
    demoDefinition.call(self, self, self.canvas, self.controls, self.sprites,
        canvasWidth, canvasHeight);

    // First update and draw
    self.update(0);
    self.draw(self.ctx);
  }).done();
}
assign(Demo.prototype, {
  update: function(timeElapsed) {},
  draw: function(ctx) {},
  setActive: function(active) {
    var self = this;

    if (!self.active && active) {
      self.active = true;

      // Draw cycles
      function requestFrame() {
        if (self.active) {
          self.draw(self.ctx);
          requestAnimationFrame(requestFrame);
        }
      }
      requestAnimationFrame(requestFrame);

      // Update cycles
      self.frameTimer = setInterval(function() {
        self.update(self.updateInterval);
      }, this.updateInterval * 1000);
    } else if (this.active && !active) {
      self.active = false;
      clearInterval(self.frameTimer);
      self.frameTimer = null;
    }
  },
  optionsUpdated: function () {
    if (!this.active) {
      this.update(0);
      this.draw(this.ctx);
    }
  }
});

var demoClassesByName = {}
function demo(name, spritesRequested, demoDefinition) {
  demoClassesByName[name] = function (canvas, controls, tag) {
    return new Demo(canvas, controls, tag, name, spritesRequested, demoDefinition);
  }
}
$(function () {
  // Find and launch demos
  $('.demo').each(function (i, e) {
    var name = e.getAttribute("data-demo-name");
    var tag = e.getAttribute("data-demo-tag");

    var canvas = $('canvas', e)[0];
    var controls = $('.demo-controls', e)[0];

    var DemoClass = demoClassesByName[name];
    new DemoClass(canvas, controls, tag);
  })
})
