var domStrength = document.getElementById('strength');
var domMass = document.getElementById('mass');
var domDamping = document.getElementById('damping');

var Elastic = function() {

  this.value = 0;
  this.dest = 0;
  this.velocity = 0;
  this.strength = 1;
  this.damping = 0.9;

};

Elastic.prototype.update = function() {
  var force = -this.strength*(this.value-this.dest);
  this.velocity += force;
  this.velocity *= this.damping;
  this.value += this.velocity;
};
