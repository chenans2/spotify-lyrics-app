const fs = require('fs');
const path = require('path');

module.exports = app => {
  // loops through all of the files in the /routes/api folder,
  // and for each file it finds, requires it.
  fs.readdirSync('./routes/api/').forEach(file => {
    require(`./api/${file.substr(0, file.indexOf('.'))}`)(app);
  });
};
