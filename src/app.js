var methods = require("methods");
var http = require("http");
var Router = require("./router");
var middleware = require("./middleware/init");

var app = (exports = module.exports = {});

app.init = function () {
  this.cache = {};
  this.engines = {};
  this.settings = {};

  this._router = undefined;
};

app.lazyrouter = function lazyrouter() {
  if (!this._router) {
    this._router = new Router({});
  }

  this._router.use(middleware.init(this));
};

app.listen = function listen() {
  var server = http.createServer(this);
  return server.listen.apply(server, arguments);
};

app.handle = function handle(req, res, callback) {
  var router = this._router;

  router.handle(req, res);
};

var slice = Array.prototype.slice;

methods.forEach(function (method) {
  app[method] = function (path) {
    this.lazyrouter();

    var route = this._router.route(path);

    route[method].apply(route, slice.call(arguments, 1));
    return this;
  };
});
