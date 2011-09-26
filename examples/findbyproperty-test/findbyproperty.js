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


function run_test2 () {
  fbpTime = new Date;
  prop = a.findByProperty({prop1:345});
  fbpTime = (new Date) - fbpTime;
  console.log("fbpTime: ",fbpTime);
  console.log(prop);
}

function run_test3 () {
  fbpTime = new Date;
  prop = a.findByProperty({prop1:345,prop2:583});
  fbpTime = (new Date) - fbpTime;
  console.log("fbpTime: ",fbpTime);
  console.log(prop);
}
