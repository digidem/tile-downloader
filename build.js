var fs = require("fs");
var browserify = require("browserify");
browserify("./src/index.js")
  .transform("babelify", {presets: ["es2015", "react"]})
    .bundle()
    .pipe(fs.createWriteStream("public/bundle.js"));
