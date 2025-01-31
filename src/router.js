var setPrototypeOf = require("setprototypeof");
var parseUrl = require("parseurl");
var Route = require("./Route");
var Layer = require("./Layer");

var proto = (module.exports = function (options) {
  var opts = options || {};

  function router(req, res, next) {
    router.handle(req, res, next);
  }

  setPrototypeOf(router, proto);

  router.params = {};
  router._params = {};
  router.caseSensitive = opts.caseSensitive;
  router.mergeParams = opts.mergeParams;
  router.strict = opts.strict;
  router.stack = [];

  return router;
});

proto.route = function route(path) {
  var route = new Route(path);

  var layer = new Layer(path, {}, route.dispatch.bind(route));

  layer.route = route;

  this.stack.push(layer);

  return route;
};

proto.handle = function handle(req, res, out) {
  var self = this;
  var stack = this.stack;
  var idx = 0;

  next();

  function next() {
    var path = getPathname(req);

    // fix next matching layer
    var layer;
    var match;
    var route;

    while (match !== true && idx < stack.length) {
      layer = stack[idx++];
      match = matchLayer(layer, path);
      route = layer.route;

      if (match !== true) {
        continue;
      }

      if (!route) {
        // process non-route handlers normally
        continue;
      }

      route.stack[0].handle_request(req, res, next);
    }

    //if match but no route - well call `handle_request`
    if (match) {
      layer.handle_request(req, res, next);
    }
  }
};

proto.use = function use(fn) {
  var layer = new Layer("/", {}, fn);

  layer.route = undefined;
  this.stack.push(layer);

  return this;
};

function matchLayer(layer, path) {
  try {
    return layer.match(path);
  } catch (error) {
    console.log("error");
    return error;
  }
}

function getPathname(req) {
  try {
    return parseUrl(req).pathname;
  } catch (error) {
    return undefined;
  }
}
