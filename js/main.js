var BASE_SCALE = 2;
var STROKE_WEIGHT = 10;
var WINDOW_SCALE = 1;
var MIN_STRENGTH = 0.1;
var MAX_STRENGTH = 3.5;
var MAX_DAMPING = 0.97;
var MIN_DAMPING = 0.65;
var PADDING = 170;
var STEPS = 30;
var TWO_PI = Math.PI*2;

var domReadout = document.getElementById('readout');
var domTest = document.getElementById('test');
var domEssay = document.getElementById('essay');

var canvas = document.createElement('canvas');
var ctx = canvas.getContext('2d');
var elastic = new Elastic();
var elastic2 = new Elastic();
var path;

var x = window.innerWidth/2;
var y = window.innerHeight/2;

var px;
var py;

function playJiggle() {
  framesSinceClick = 0;
  elastic2.value = 0;
}

function touchStart(e) {
  px = e.touches[0].pageX;
  py = e.touches[0].pageY;
}

function drag(e) {

  e.preventDefault();

  if (Modernizr.touch) {
    var cx = e.touches[0].pageX;
    var cy = e.touches[0].pageY;
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

  setSpringParams();

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

  console.log(canvas.width, canvas.height);

  plot();

}



function plot() {

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  elastic.velocity = 0;
  elastic.value = -1;

  if (path) path.remove();
  path = new paper.Path();
  path.strokeCap = 'round';
  path.strokeWidth = 3;
  path.strokeColor = '#666';

  ctx.beginPath();

  for (var i = 0; i < STEPS; i++) {

    var pos = getPos(i, STEPS, elastic.value);

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
  setScale(domEssay, elastic2.value / BASE_SCALE );

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

function getPos(i, STEPS, value) {
  var x = rnd.map(i, 0, STEPS-1, 0, canvas.width);
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

function setSpringParams() {
  elastic2.damping = elastic.damping = yToDamping(y);
  elastic2.strength = elastic.strength = xToStrength(x);
  plot();
}

function suppress() {
  elastic2.dest = 0.95;
  elastic2.value = 0.98;
}

function release() {
  elastic2.dest = 1;
}

$(document.body).prepend(canvas);
paper.setup(canvas);

if (Modernizr.touch) {

  window.addEventListener('touchstart', touchStart, true);
  window.addEventListener('touchstart', suppress, true);

  window.addEventListener('touchmove', drag, true);
  
  window.addEventListener('touchend', playJiggle, true);
  window.addEventListener('touchend', release, true);

} else { 

  window.addEventListener('mousedown', suppress, true);

  window.addEventListener('mousemove', drag, true);

  window.addEventListener('mouseup', playJiggle, false);  
  window.addEventListener('mouseup', release, false);  

}

window.addEventListener('resize', onWindowResize, false);
window.addEventListener('orientationchange', onWindowResize, false);

elastic2.dest = 1;
elastic2.value = 1;

onWindowResize();
setSpringParams();
loop();