//jshint eversion:6

module.exports=getArDay;

function getArDay() {

  var today = new Date();
  var options = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };
  return today.toLocaleDateString("ar-FR-u-ca-islamic", options);
}
