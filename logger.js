const colors = require("colors");
colors.setTheme({
  warn: 'yellow',
  error: 'red',
  time: 'green'
});

function getDateString(date) {
  if(!date) return "" + date;

  var day = "" + date.getDate();      if(day.length<2) day = "0" + day;
  var mth = "" + (date.getMonth()+1); if(mth.length<2) mth = "0" + mth;
  var year = "" + date.getFullYear();
  var hrs = "" + date.getHours();     if(hrs.length<2) hrs = "0" + hrs;
  var min = "" + date.getMinutes();   if(min.length<2) min = "0" + min;
  var sec = "" + date.getSeconds();   if(sec.length<2) sec = "0" + sec;
  var msec = "" + date.getMilliseconds();   if(msec.length<2) msec = "0" + msec; if(msec.length<3) msec = "0" + msec; if(msec.length<4) msec = "0" + msec;

  var text = "";
  text += year + "-";
  text += mth + "-";
  text += day + " ";
  text += hrs + ":";
  text += min + ":";
  text += sec + ".";
  text += msec;
  return text;
}

function getCurrentDateString() {
  return getDateString(new Date());
}

function log(msg) {
  var text = "";
  text += getCurrentDateString().time;
  text += " ";
  text += msg;

  console.log(text);
}

function warn(msg) {
  log(("" + msg).warn);
}

function error(msg) {
  log(("" + msg).error);
}

module.exports.log = log;
module.exports.warn = warn;
module.exports.error = error;
module.exports.getDateString = getDateString;
module.exports.getCurrentDateString = getCurrentDateString;
