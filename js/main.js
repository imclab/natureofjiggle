var BASE_SCALE = 2,
    STROKE_WEIGHT = 10,
    WINDOW_SCALE = 1,
    MIN_STRENGTH = 0.1,
    MAX_STRENGTH = 3.5,
    MAX_DAMPING = 0.97,
    MIN_DAMPING = 0.65,
    PADDING = 170,
    STEPS = 30,
    TWO_PI = Math.PI*2,
    domReadout = document.getElementById('readout'),
    domTest = document.getElementById('test'),
    domEssay = document.getElementById('essay'),
    canvas = document.createElement('canvas'),
    ctx = canvas.getContext('2d'),
    elastic = new Elastic(),
    elastic2 = new Elastic(),
    path,
    x = window.innerWidth/2,
    y = window.innerHeight/2,
    px,
    py;

init();

function init() {

  loadWebFont();
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

}

function playJiggle() {
  elastic2.strength = elastic.strength;
  elastic2.damping = elastic.damping;
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
  elastic.damping = yToDamping(y);
  elastic.strength = xToStrength(x);
  plot();
}

function suppress() {
  elastic2.strength = 0.08;
  elastic2.damping = 0.4;
  elastic2.dest = 0.8;
}

function release(e) {
  setSpringParams();
  elastic2.dest = 1;
}

function loadWebFont() {
  window.WebFontConfig = {
    google: { families: [ 'Cardo:400italic', 'Cardo:400' ] }
  };
  (function() {
    var wf = document.createElement('script');
    wf.src = ('https:' == document.location.protocol ? 'https' : 'http') +
        '://ajax.googleapis.com/ajax/libs/webfont/1/webfont.js';
    wf.type = 'text/javascript';
    wf.async = 'true';
    var s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(wf, s);
  })();
}