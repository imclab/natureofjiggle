var canvas = document.createElement('canvas');


var ctx = canvas.getContext('2d');
var path;
var params = {
  disp: 1
};

document.body.appendChild(canvas);

paper.setup(canvas);

var elastic = new Elastic();
var domReadout = document.getElementById('readout');

window.addEventListener('resize', onWindowResize, false);
window.addEventListener('mousemove', onMouseMove, false);

function onMouseMove(e) {
  elastic.mass = rnd.map(e.clientX, 0, window.innerWidth, 0, 1);
  elastic.strength = rnd.map(e.clientY, 0, window.innerHeight, 1, 0);
  domReadout.style.top = e.clientY + 'px';
  domReadout.style.left = e.clientX + 'px';
  plot();
}

function onWindowResize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  paper.view.draw();

}

onWindowResize();

function plot() {

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  elastic.velocity = 0;
  elastic.value = params.disp;

  if (path) path.remove();
  path = new paper.Path();
  path.strokeCap = 'round';
  path.strokeColor = 'blue';
  path.fullySelected = true;
  path.strokeWidth = 5;

  var maxValue = 1;

  var height = canvas.height;
  var width = canvas.width;
  var steps = 100;

  ctx.beginPath();


  for (var i = 0; i < steps; i++) {


    elastic.update();



    var y = rnd.map(elastic.value, elastic.dest, maxValue, 0, -height/2) + height/2;
    var x = rnd.map(i, 0, steps-1, 0, width);

    if (i == 0)
      path.moveTo(new paper.Point(x, y));
    else
      path.lineTo(new paper.Point(x, y));

  }

  path.smooth();

  paper.view.draw();


}

plot();