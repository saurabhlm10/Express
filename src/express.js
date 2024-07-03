var proto = require("./app");
var mixin = require("merge-descriptors");

exports = module.exports = function createApplication() {
  var app = function (req, res, next) {
    app.handle(req, res, next);
  };

  mixin(app, proto, false);

  app.init();
  return app;
};
