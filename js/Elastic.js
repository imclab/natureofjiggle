var domStrength = document.getElementById('strength');
var domMass = document.getElementById('mass');
var domDamping = document.getElementById('damping');

var Elastic = function() {

  this.value = 0;
  this.dest = 0;
  this.velocity = 0;

  var strength;
  var mass;
  var damping;


  Object.defineProperty(this, 'mass', {
    get: function() {
      return mass;
    },
    set: function(v) {
      mass = v;
      domMass.innerHTML = v;
    }
  });

  Object.defineProperty(this, 'strength', {
    get: function() {
      return strength;
    },
    set: function(v) {
      strength = v;
      domStrength.innerHTML = v;
    }
  });

  Object.defineProperty(this, 'damping', {
    get: function() {
      return damping;
    },
    set: function(v) {
      damping = v;
      domDamping.innerHTML = v;
    }
  });

  this.strength = 1;
  this.mass = 1;
  this.damping = 0.9;

};

Elastic.prototype.update = function() {
  var force = -this.strength*(this.value-this.dest);
  var acc = force/this.mass;
  this.velocity += acc;
  this.velocity *= this.damping;
  this.value += this.velocity;
};
