var BASE_SCALE = 2;
var STROKE_WEIGHT = 10;
var WINDOW_SCALE = 1;
var MIN_STRENGTH = 0.1;
var MAX_STRENGTH = 3;
var MAX_DAMPING = 1;
var MIN_DAMPING = 0.01;
var PADDING = 100;
var canvas = document.createElement('canvas');
var ctx = canvas.getContext('2d');
var elastic = new Elastic();
var elastic2 = new Elastic();
var domReadout = document.getElementById('readout');
var domTest = document.getElementById('test');
var domEssay = document.getElementById('essay');
var framesSinceClick = 0;
var clicked = false;
var TWO_PI = Math.PI*2;
var values = [];
var path;
var x = 0, y = 0, px, py;


$(document.body).prepend(canvas);

paper.setup(canvas);

if (Modernizr.touch) {
  // document.body.style.height = '90000px';
  // window.scrollTo(-1, 0);
  window.addEventListener('touchstart', touchStart, true);
  window.addEventListener('touchmove', setSpringParams, true);
  window.addEventListener('touchend', previewJiggle, true);
} else { 
  window.addEventListener('mousemove', setSpringParams, true);
  window.addEventListener('mousedown', previewJiggle, false);  
}

window.addEventListener('resize', onWindowResize, false);
window.addEventListener('orientationchange', onWindowResize, false);

elastic2.dest = 1;
elastic2.value = 1;

function previewJiggle() {
  framesSinceClick = 0;
  clicked = true;
  elastic2.value = 0;
}

function touchStart(e) {

  px = event.touches[0].pageX;
  py = event.touches[0].pageY;

}

function setSpringParams(e) {

  e.preventDefault();

  if (Modernizr.touch) {
    var cx = event.touches[0].pageX;
    var cy = event.touches[0].pageY;
    x += cx - px;
    y += cy - py;
    x = constrain(x, 0, window.innerWidth);
    y = constrain(y, 0, window.innerHeight);
    px = cx;
    py = cy;
  } else { 
    x = e.clientX;
    y = e.clientY;
  }

  elastic2.damping = elastic.damping = yToDamping(y);
  elastic2.strength = elastic.strength = xToStrength(x);
  plot();

}



function onWindowResize() {

  setScale(domEssay, 1);
  setScale(domEssay.firstElementChild, 1);

  var essayRect = domEssay.getBoundingClientRect();
  var w = essayRect.width + PADDING;
  WINDOW_SCALE = Math.min(window.innerWidth, window.innerHeight) / w;

  setScale(domEssay, WINDOW_SCALE/BASE_SCALE);
  setScale(domEssay.firstElementChild, WINDOW_SCALE * BASE_SCALE);

  domEssay.style.marginTop = -(w-PADDING)/2 - 6 + 'px'; // Because it sits on a line all weird.
  domEssay.style.marginLeft = -(w-PADDING)/2 + 'px';

  var ratio = url.boolean('usePixelRatio', true) ? window.devicePixelRatio || 1 : 1;

  canvas.width = Math.ceil(ratio*window.innerWidth);
  canvas.height = Math.ceil(ratio*window.innerHeight);

  plot();

}



function plot() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  elastic.velocity = 0;
  elastic.value = -1;

  if (path) path.remove();
  values.length = 0;
  path = new paper.Path();
  path.strokeCap = 'round';
  path.strokeWidth = 1.5 * window.devicePixelRatio;
  path.strokeColor = '#333';

  var steps = 100;

  ctx.beginPath();

  for (var i = 0; i < steps; i++) {

    values.push(elastic.value);

    var pos = getPos(i, steps, elastic.value);

    if (i == 0)
      path.moveTo(new paper.Point(pos.x, Math.floor(pos.y)));
    else
      path.lineTo(new paper.Point(pos.x, Math.floor(pos.y)));

    elastic.update();

  }


  path.smooth();
  paper.view.draw();


}


function loop() {
  
  requestAnimationFrame(loop);
  

  elastic2.update();
  
  // framesSinceClick++;
  // ctx.fillStyle = params.CIRCLE_COLOR;
  // ctx.globalAlpha = 0.95;
  // ctx.save();
  // ctx.translate(canvas.width/2, canvas.height/2);
  // ctx.scale(elastic2.value, elastic2.value);
  // circle(0, 0, Math.min(canvas.width, canvas.height)/3);
  // ctx.restore();
  // ctx.globalAlpha = 1;

  setScale(domEssay, elastic2.value / BASE_SCALE );


  // console.log(elastic2.value);

  // if (clicked && framesSinceClick < values.length) {
  //   var pos = getPos(framesSinceClick, values.length, values[framesSinceClick]);
  //   ctx.fillStyle = params.DOT_COLOR;
  //   circle(pos.x, pos.y, params.STROKE_WEIGHT); 
  // }

}


function constrain(v, min, max) {
  if (v > max) return max;
  if (v < min) return min;
  return v;
}

function setScale(elem, s) {
  elem.style.webkitTransform  = 'scale('+s+')';
  elem.style.mozTransform     = 'scale('+s+')';
  elem.style.msTransform      = 'scale('+s+')';
  elem.style.oTransform       = 'scale('+s+')';
  elem.style.transform        = 'scale('+s+')';
}

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

function yToDamping(y) {
  return Math.pow(rnd.map(y, 0, window.innerHeight, MAX_DAMPING, MIN_DAMPING), 2);
}

function xToStrength(x) {
  return rnd.map(x, 0, window.innerWidth, MAX_STRENGTH, MIN_STRENGTH);
}

onWindowResize();
plot();
loop();