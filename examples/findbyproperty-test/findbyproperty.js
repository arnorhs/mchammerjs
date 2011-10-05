/* testing performance etc of finding by property */

var a = new MCHammer;
var i = 0; // the counter we're using
function random_value () { return parseInt(Math.random() * 1000, 10); }

function run_test1 () {
  addItemTime = new Date;
  for (var l = i+1000000; i < l; i++) {
    a.addItem(i, {prop1: random_value(), prop2: random_value(), prop3: random_value(), prop4: random_value()});
  }
  // roughly 15/40 of the time is taken calculating the random values
  addItemTime = parseInt(((new Date) - addItemTime) * (25/40), 10);
  console.log("addItemTime: ",addItemTime)

}

// small hack
Array.prototype.average = function () { var sum = 0; for (var i = 0; i < this.length; i++) { sum += this[i]; } return parseInt(sum / this.length, 10); }
Object.prototype.length = function () { l = 0; for (var i in this) { if (this.hasOwnProperty(i)) l++; } return l; }

function run_fbp (func,props) {
  benchmark(func,props.length(),function(){
    prop = a[func](props);
  });
}


function benchmark (name, nr, callback) {
  name = name + '-'+ nr
  if (!window.benchmark) {
    window.benchmark = {};
  }
  if (!window.benchmark[name]) {
    window.benchmark[name] = [];
  }
  var t = new Date;
  callback();
  t = (new Date) - t;

  window.benchmark[name].push(t);
  console.log(name, ": ",t, " average out of ",window.benchmark[name].length,": ",window.benchmark[name].average());

}
