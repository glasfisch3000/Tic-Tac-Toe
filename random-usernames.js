const fs = require("fs");
const logger = require(__dirname + "/logger.js");
const dir = __dirname + "/data/random-usernames.txt";

var usernames = [];
fs.readFile(dir, (err, data) => {
  if(err) {
    logger.log("error while reading '" + dir + "': " + err);
    process.exit();
    return;
  }

  data = "" + (data || "");
  var lines = data.split(/\n/g) || [];

  for(var line of lines) {
    if(line && !usernames.includes(line)) {
      usernames.push(line);
    }
  }
  logger.log(usernames.length + " default/random usernames found");
});

module.exports = usernames;
