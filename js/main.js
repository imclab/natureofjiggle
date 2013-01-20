
var STROKE_WEIGHT = 10;

var canvas = document.createElement('canvas');
var ctx = canvas.getContext('2d');
var elastic = new Elastic();
var elastic2 = new Elastic();
var domReadout = document.getElementById('readout');
var domTest = document.getElementById('test');
var framesSinceClick = 0;
var clicked = false;
var TWO_PI = Math.PI*2;
var values = [];
var path;
var params = {
  disp: -1,
  STROKE_WEIGHT: 2,
  STROKE_COLOR: '#135478',
  DOT_COLOR: '#f0194c',
  CIRCLE_COLOR: '#f2f0e4'
};


// var gui = new dat.GUI();
// gui.addColor(params, 'STROKE_COLOR');
// gui.add(params, 'STROKE_WEIGHT', 0, 10);
// gui.addColor(params, 'DOT_COLOR');
// gui.addColor(params, 'CIRCLE_COLOR');


$(document.body).append(canvas);

paper.setup(canvas);

if (Modernizr.touch) {
  document.body.style.height = '90000px';
  window.scrollTo(0, 1);

  window.addEventListener('touchstart', setSpringParams, true);
  window.addEventListener('touchmove', setSpringParams, true);
  window.addEventListener('touchend', previewJiggle, true);
} else { 
  window.addEventListener('resize', onWindowResize, false);
  window.addEventListener('mousemove', setSpringParams, true);
  window.addEventListener('mousedown', previewJiggle, false);  
}


elastic2.dest = 1;
elastic2.value = 1;

function previewJiggle() {
  framesSinceClick = 0;
  clicked = true;
  elastic2.value = 0;
}

function setSpringParams(e) {

  e.preventDefault();

  var x = Modernizr.touch ? event.touches[0].pageX : e.clientX;
  var y = Modernizr.touch ? event.touches[0].pageY : e.clientY;


  elastic2.damping = elastic.damping = Math.pow(rnd.map(y, 0, window.innerHeight, 1, 0), 0.33);
  elastic2.strength = elastic.strength = rnd.map(x, 0, window.innerWidth, 3, 0);
  plot();
}

function onWindowResize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  plot();

}

onWindowResize();

function plot() {

  elastic.velocity = 0;
  elastic.value = params.disp;

  if (path) path.remove();
  values.length = 0;
  path = new paper.Path();
  path.strokeCap = 'round';
  path.strokeColor = params.STROKE_COLOR;
  path.strokeWidth = Math.max(2, Math.min(canvas.width, canvas.height)/300);


  var steps = 100;

  ctx.beginPath();

  for (var i = 0; i < steps; i++) {

    values.push(elastic.value);

    var pos = getPos(i, steps, elastic.value);

    if (i == 0)
      path.moveTo(new paper.Point(pos.x, pos.y));
    else
      path.lineTo(new paper.Point(pos.x, pos.y));

    elastic.update();

  }

  path.smooth();

}

plot();

function loop() {
  
  requestAnimationFrame(loop);
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  elastic2.update();
  
  framesSinceClick++;

  paper.view.draw();

  ctx.fillStyle = params.CIRCLE_COLOR;
  ctx.globalAlpha = 0.95;
  ctx.save();
  ctx.translate(canvas.width/2, canvas.height/2);
  ctx.scale(elastic2.value, elastic2.value);
  circle(0, 0, Math.min(canvas.width, canvas.height)/3);
  ctx.restore();
  ctx.globalAlpha = 1;



  // if (clicked && framesSinceClick < values.length) {
  //   var pos = getPos(framesSinceClick, values.length, values[framesSinceClick]);
  //   ctx.fillStyle = params.DOT_COLOR;
  //   circle(pos.x, pos.y, params.STROKE_WEIGHT); 
  // }

}

loop();

function circle(x, y, d) {
  ctx.beginPath();
  ctx.arc(x, y, d/2, 0, TWO_PI, false);
  ctx.fill();
}

function getPos(i, steps, value) {
    var x = rnd.map(i, 0, steps-1, 0, canvas.width);
    var y = rnd.map(value, elastic.dest, 1, 0, -canvas.height/2) + canvas.height/2;
    return { 
      x: x,
      y: y
    };
}