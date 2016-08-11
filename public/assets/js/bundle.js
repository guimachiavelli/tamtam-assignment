(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){


//
// Generated on Tue Dec 16 2014 12:13:47 GMT+0100 (CET) by Charlie Robbins, Paolo Fragomeni & the Contributors (Using Codesurgeon).
// Version 1.2.6
//

(function (exports) {

/*
 * browser.js: Browser specific functionality for director.
 *
 * (C) 2011, Charlie Robbins, Paolo Fragomeni, & the Contributors.
 * MIT LICENSE
 *
 */

var dloc = document.location;

function dlocHashEmpty() {
  // Non-IE browsers return '' when the address bar shows '#'; Director's logic
  // assumes both mean empty.
  return dloc.hash === '' || dloc.hash === '#';
}

var listener = {
  mode: 'modern',
  hash: dloc.hash,
  history: false,

  check: function () {
    var h = dloc.hash;
    if (h != this.hash) {
      this.hash = h;
      this.onHashChanged();
    }
  },

  fire: function () {
    if (this.mode === 'modern') {
      this.history === true ? window.onpopstate() : window.onhashchange();
    }
    else {
      this.onHashChanged();
    }
  },

  init: function (fn, history) {
    var self = this;
    this.history = history;

    if (!Router.listeners) {
      Router.listeners = [];
    }

    function onchange(onChangeEvent) {
      for (var i = 0, l = Router.listeners.length; i < l; i++) {
        Router.listeners[i](onChangeEvent);
      }
    }

    //note IE8 is being counted as 'modern' because it has the hashchange event
    if ('onhashchange' in window && (document.documentMode === undefined
      || document.documentMode > 7)) {
      // At least for now HTML5 history is available for 'modern' browsers only
      if (this.history === true) {
        // There is an old bug in Chrome that causes onpopstate to fire even
        // upon initial page load. Since the handler is run manually in init(),
        // this would cause Chrome to run it twise. Currently the only
        // workaround seems to be to set the handler after the initial page load
        // http://code.google.com/p/chromium/issues/detail?id=63040
        setTimeout(function() {
          window.onpopstate = onchange;
        }, 500);
      }
      else {
        window.onhashchange = onchange;
      }
      this.mode = 'modern';
    }
    else {
      //
      // IE support, based on a concept by Erik Arvidson ...
      //
      var frame = document.createElement('iframe');
      frame.id = 'state-frame';
      frame.style.display = 'none';
      document.body.appendChild(frame);
      this.writeFrame('');

      if ('onpropertychange' in document && 'attachEvent' in document) {
        document.attachEvent('onpropertychange', function () {
          if (event.propertyName === 'location') {
            self.check();
          }
        });
      }

      window.setInterval(function () { self.check(); }, 50);

      this.onHashChanged = onchange;
      this.mode = 'legacy';
    }

    Router.listeners.push(fn);

    return this.mode;
  },

  destroy: function (fn) {
    if (!Router || !Router.listeners) {
      return;
    }

    var listeners = Router.listeners;

    for (var i = listeners.length - 1; i >= 0; i--) {
      if (listeners[i] === fn) {
        listeners.splice(i, 1);
      }
    }
  },

  setHash: function (s) {
    // Mozilla always adds an entry to the history
    if (this.mode === 'legacy') {
      this.writeFrame(s);
    }

    if (this.history === true) {
      window.history.pushState({}, document.title, s);
      // Fire an onpopstate event manually since pushing does not obviously
      // trigger the pop event.
      this.fire();
    } else {
      dloc.hash = (s[0] === '/') ? s : '/' + s;
    }
    return this;
  },

  writeFrame: function (s) {
    // IE support...
    var f = document.getElementById('state-frame');
    var d = f.contentDocument || f.contentWindow.document;
    d.open();
    d.write("<script>_hash = '" + s + "'; onload = parent.listener.syncHash;<script>");
    d.close();
  },

  syncHash: function () {
    // IE support...
    var s = this._hash;
    if (s != dloc.hash) {
      dloc.hash = s;
    }
    return this;
  },

  onHashChanged: function () {}
};

var Router = exports.Router = function (routes) {
  if (!(this instanceof Router)) return new Router(routes);

  this.params   = {};
  this.routes   = {};
  this.methods  = ['on', 'once', 'after', 'before'];
  this.scope    = [];
  this._methods = {};

  this._insert = this.insert;
  this.insert = this.insertEx;

  this.historySupport = (window.history != null ? window.history.pushState : null) != null

  this.configure();
  this.mount(routes || {});
};

Router.prototype.init = function (r) {
  var self = this
    , routeTo;
  this.handler = function(onChangeEvent) {
    var newURL = onChangeEvent && onChangeEvent.newURL || window.location.hash;
    var url = self.history === true ? self.getPath() : newURL.replace(/.*#/, '');
    self.dispatch('on', url.charAt(0) === '/' ? url : '/' + url);
  };

  listener.init(this.handler, this.history);

  if (this.history === false) {
    if (dlocHashEmpty() && r) {
      dloc.hash = r;
    } else if (!dlocHashEmpty()) {
      self.dispatch('on', '/' + dloc.hash.replace(/^(#\/|#|\/)/, ''));
    }
  }
  else {
    if (this.convert_hash_in_init) {
      // Use hash as route
      routeTo = dlocHashEmpty() && r ? r : !dlocHashEmpty() ? dloc.hash.replace(/^#/, '') : null;
      if (routeTo) {
        window.history.replaceState({}, document.title, routeTo);
      }
    }
    else {
      // Use canonical url
      routeTo = this.getPath();
    }

    // Router has been initialized, but due to the chrome bug it will not
    // yet actually route HTML5 history state changes. Thus, decide if should route.
    if (routeTo || this.run_in_init === true) {
      this.handler();
    }
  }

  return this;
};

Router.prototype.explode = function () {
  var v = this.history === true ? this.getPath() : dloc.hash;
  if (v.charAt(1) === '/') { v=v.slice(1) }
  return v.slice(1, v.length).split("/");
};

Router.prototype.setRoute = function (i, v, val) {
  var url = this.explode();

  if (typeof i === 'number' && typeof v === 'string') {
    url[i] = v;
  }
  else if (typeof val === 'string') {
    url.splice(i, v, s);
  }
  else {
    url = [i];
  }

  listener.setHash(url.join('/'));
  return url;
};

//
// ### function insertEx(method, path, route, parent)
// #### @method {string} Method to insert the specific `route`.
// #### @path {Array} Parsed path to insert the `route` at.
// #### @route {Array|function} Route handlers to insert.
// #### @parent {Object} **Optional** Parent "routes" to insert into.
// insert a callback that will only occur once per the matched route.
//
Router.prototype.insertEx = function(method, path, route, parent) {
  if (method === "once") {
    method = "on";
    route = function(route) {
      var once = false;
      return function() {
        if (once) return;
        once = true;
        return route.apply(this, arguments);
      };
    }(route);
  }
  return this._insert(method, path, route, parent);
};

Router.prototype.getRoute = function (v) {
  var ret = v;

  if (typeof v === "number") {
    ret = this.explode()[v];
  }
  else if (typeof v === "string"){
    var h = this.explode();
    ret = h.indexOf(v);
  }
  else {
    ret = this.explode();
  }

  return ret;
};

Router.prototype.destroy = function () {
  listener.destroy(this.handler);
  return this;
};

Router.prototype.getPath = function () {
  var path = window.location.pathname;
  if (path.substr(0, 1) !== '/') {
    path = '/' + path;
  }
  return path;
};
function _every(arr, iterator) {
  for (var i = 0; i < arr.length; i += 1) {
    if (iterator(arr[i], i, arr) === false) {
      return;
    }
  }
}

function _flatten(arr) {
  var flat = [];
  for (var i = 0, n = arr.length; i < n; i++) {
    flat = flat.concat(arr[i]);
  }
  return flat;
}

function _asyncEverySeries(arr, iterator, callback) {
  if (!arr.length) {
    return callback();
  }
  var completed = 0;
  (function iterate() {
    iterator(arr[completed], function(err) {
      if (err || err === false) {
        callback(err);
        callback = function() {};
      } else {
        completed += 1;
        if (completed === arr.length) {
          callback();
        } else {
          iterate();
        }
      }
    });
  })();
}

function paramifyString(str, params, mod) {
  mod = str;
  for (var param in params) {
    if (params.hasOwnProperty(param)) {
      mod = params[param](str);
      if (mod !== str) {
        break;
      }
    }
  }
  return mod === str ? "([._a-zA-Z0-9-%()]+)" : mod;
}

function regifyString(str, params) {
  var matches, last = 0, out = "";
  while (matches = str.substr(last).match(/[^\w\d\- %@&]*\*[^\w\d\- %@&]*/)) {
    last = matches.index + matches[0].length;
    matches[0] = matches[0].replace(/^\*/, "([_.()!\\ %@&a-zA-Z0-9-]+)");
    out += str.substr(0, matches.index) + matches[0];
  }
  str = out += str.substr(last);
  var captures = str.match(/:([^\/]+)/ig), capture, length;
  if (captures) {
    length = captures.length;
    for (var i = 0; i < length; i++) {
      capture = captures[i];
      if (capture.slice(0, 2) === "::") {
        str = capture.slice(1);
      } else {
        str = str.replace(capture, paramifyString(capture, params));
      }
    }
  }
  return str;
}

function terminator(routes, delimiter, start, stop) {
  var last = 0, left = 0, right = 0, start = (start || "(").toString(), stop = (stop || ")").toString(), i;
  for (i = 0; i < routes.length; i++) {
    var chunk = routes[i];
    if (chunk.indexOf(start, last) > chunk.indexOf(stop, last) || ~chunk.indexOf(start, last) && !~chunk.indexOf(stop, last) || !~chunk.indexOf(start, last) && ~chunk.indexOf(stop, last)) {
      left = chunk.indexOf(start, last);
      right = chunk.indexOf(stop, last);
      if (~left && !~right || !~left && ~right) {
        var tmp = routes.slice(0, (i || 1) + 1).join(delimiter);
        routes = [ tmp ].concat(routes.slice((i || 1) + 1));
      }
      last = (right > left ? right : left) + 1;
      i = 0;
    } else {
      last = 0;
    }
  }
  return routes;
}

var QUERY_SEPARATOR = /\?.*/;

Router.prototype.configure = function(options) {
  options = options || {};
  for (var i = 0; i < this.methods.length; i++) {
    this._methods[this.methods[i]] = true;
  }
  this.recurse = options.recurse || this.recurse || false;
  this.async = options.async || false;
  this.delimiter = options.delimiter || "/";
  this.strict = typeof options.strict === "undefined" ? true : options.strict;
  this.notfound = options.notfound;
  this.resource = options.resource;
  this.history = options.html5history && this.historySupport || false;
  this.run_in_init = this.history === true && options.run_handler_in_init !== false;
  this.convert_hash_in_init = this.history === true && options.convert_hash_in_init !== false;
  this.every = {
    after: options.after || null,
    before: options.before || null,
    on: options.on || null
  };
  return this;
};

Router.prototype.param = function(token, matcher) {
  if (token[0] !== ":") {
    token = ":" + token;
  }
  var compiled = new RegExp(token, "g");
  this.params[token] = function(str) {
    return str.replace(compiled, matcher.source || matcher);
  };
  return this;
};

Router.prototype.on = Router.prototype.route = function(method, path, route) {
  var self = this;
  if (!route && typeof path == "function") {
    route = path;
    path = method;
    method = "on";
  }
  if (Array.isArray(path)) {
    return path.forEach(function(p) {
      self.on(method, p, route);
    });
  }
  if (path.source) {
    path = path.source.replace(/\\\//ig, "/");
  }
  if (Array.isArray(method)) {
    return method.forEach(function(m) {
      self.on(m.toLowerCase(), path, route);
    });
  }
  path = path.split(new RegExp(this.delimiter));
  path = terminator(path, this.delimiter);
  this.insert(method, this.scope.concat(path), route);
};

Router.prototype.path = function(path, routesFn) {
  var self = this, length = this.scope.length;
  if (path.source) {
    path = path.source.replace(/\\\//ig, "/");
  }
  path = path.split(new RegExp(this.delimiter));
  path = terminator(path, this.delimiter);
  this.scope = this.scope.concat(path);
  routesFn.call(this, this);
  this.scope.splice(length, path.length);
};

Router.prototype.dispatch = function(method, path, callback) {
  var self = this, fns = this.traverse(method, path.replace(QUERY_SEPARATOR, ""), this.routes, ""), invoked = this._invoked, after;
  this._invoked = true;
  if (!fns || fns.length === 0) {
    this.last = [];
    if (typeof this.notfound === "function") {
      this.invoke([ this.notfound ], {
        method: method,
        path: path
      }, callback);
    }
    return false;
  }
  if (this.recurse === "forward") {
    fns = fns.reverse();
  }
  function updateAndInvoke() {
    self.last = fns.after;
    self.invoke(self.runlist(fns), self, callback);
  }
  after = this.every && this.every.after ? [ this.every.after ].concat(this.last) : [ this.last ];
  if (after && after.length > 0 && invoked) {
    if (this.async) {
      this.invoke(after, this, updateAndInvoke);
    } else {
      this.invoke(after, this);
      updateAndInvoke();
    }
    return true;
  }
  updateAndInvoke();
  return true;
};

Router.prototype.invoke = function(fns, thisArg, callback) {
  var self = this;
  var apply;
  if (this.async) {
    apply = function(fn, next) {
      if (Array.isArray(fn)) {
        return _asyncEverySeries(fn, apply, next);
      } else if (typeof fn == "function") {
        fn.apply(thisArg, (fns.captures || []).concat(next));
      }
    };
    _asyncEverySeries(fns, apply, function() {
      if (callback) {
        callback.apply(thisArg, arguments);
      }
    });
  } else {
    apply = function(fn) {
      if (Array.isArray(fn)) {
        return _every(fn, apply);
      } else if (typeof fn === "function") {
        return fn.apply(thisArg, fns.captures || []);
      } else if (typeof fn === "string" && self.resource) {
        self.resource[fn].apply(thisArg, fns.captures || []);
      }
    };
    _every(fns, apply);
  }
};

Router.prototype.traverse = function(method, path, routes, regexp, filter) {
  var fns = [], current, exact, match, next, that;
  function filterRoutes(routes) {
    if (!filter) {
      return routes;
    }
    function deepCopy(source) {
      var result = [];
      for (var i = 0; i < source.length; i++) {
        result[i] = Array.isArray(source[i]) ? deepCopy(source[i]) : source[i];
      }
      return result;
    }
    function applyFilter(fns) {
      for (var i = fns.length - 1; i >= 0; i--) {
        if (Array.isArray(fns[i])) {
          applyFilter(fns[i]);
          if (fns[i].length === 0) {
            fns.splice(i, 1);
          }
        } else {
          if (!filter(fns[i])) {
            fns.splice(i, 1);
          }
        }
      }
    }
    var newRoutes = deepCopy(routes);
    newRoutes.matched = routes.matched;
    newRoutes.captures = routes.captures;
    newRoutes.after = routes.after.filter(filter);
    applyFilter(newRoutes);
    return newRoutes;
  }
  if (path === this.delimiter && routes[method]) {
    next = [ [ routes.before, routes[method] ].filter(Boolean) ];
    next.after = [ routes.after ].filter(Boolean);
    next.matched = true;
    next.captures = [];
    return filterRoutes(next);
  }
  for (var r in routes) {
    if (routes.hasOwnProperty(r) && (!this._methods[r] || this._methods[r] && typeof routes[r] === "object" && !Array.isArray(routes[r]))) {
      current = exact = regexp + this.delimiter + r;
      if (!this.strict) {
        exact += "[" + this.delimiter + "]?";
      }
      match = path.match(new RegExp("^" + exact));
      if (!match) {
        continue;
      }
      if (match[0] && match[0] == path && routes[r][method]) {
        next = [ [ routes[r].before, routes[r][method] ].filter(Boolean) ];
        next.after = [ routes[r].after ].filter(Boolean);
        next.matched = true;
        next.captures = match.slice(1);
        if (this.recurse && routes === this.routes) {
          next.push([ routes.before, routes.on ].filter(Boolean));
          next.after = next.after.concat([ routes.after ].filter(Boolean));
        }
        return filterRoutes(next);
      }
      next = this.traverse(method, path, routes[r], current);
      if (next.matched) {
        if (next.length > 0) {
          fns = fns.concat(next);
        }
        if (this.recurse) {
          fns.push([ routes[r].before, routes[r].on ].filter(Boolean));
          next.after = next.after.concat([ routes[r].after ].filter(Boolean));
          if (routes === this.routes) {
            fns.push([ routes["before"], routes["on"] ].filter(Boolean));
            next.after = next.after.concat([ routes["after"] ].filter(Boolean));
          }
        }
        fns.matched = true;
        fns.captures = next.captures;
        fns.after = next.after;
        return filterRoutes(fns);
      }
    }
  }
  return false;
};

Router.prototype.insert = function(method, path, route, parent) {
  var methodType, parentType, isArray, nested, part;
  path = path.filter(function(p) {
    return p && p.length > 0;
  });
  parent = parent || this.routes;
  part = path.shift();
  if (/\:|\*/.test(part) && !/\\d|\\w/.test(part)) {
    part = regifyString(part, this.params);
  }
  if (path.length > 0) {
    parent[part] = parent[part] || {};
    return this.insert(method, path, route, parent[part]);
  }
  if (!part && !path.length && parent === this.routes) {
    methodType = typeof parent[method];
    switch (methodType) {
     case "function":
      parent[method] = [ parent[method], route ];
      return;
     case "object":
      parent[method].push(route);
      return;
     case "undefined":
      parent[method] = route;
      return;
    }
    return;
  }
  parentType = typeof parent[part];
  isArray = Array.isArray(parent[part]);
  if (parent[part] && !isArray && parentType == "object") {
    methodType = typeof parent[part][method];
    switch (methodType) {
     case "function":
      parent[part][method] = [ parent[part][method], route ];
      return;
     case "object":
      parent[part][method].push(route);
      return;
     case "undefined":
      parent[part][method] = route;
      return;
    }
  } else if (parentType == "undefined") {
    nested = {};
    nested[method] = route;
    parent[part] = nested;
    return;
  }
  throw new Error("Invalid route context: " + parentType);
};



Router.prototype.extend = function(methods) {
  var self = this, len = methods.length, i;
  function extend(method) {
    self._methods[method] = true;
    self[method] = function() {
      var extra = arguments.length === 1 ? [ method, "" ] : [ method ];
      self.on.apply(self, extra.concat(Array.prototype.slice.call(arguments)));
    };
  }
  for (i = 0; i < len; i++) {
    extend(methods[i]);
  }
};

Router.prototype.runlist = function(fns) {
  var runlist = this.every && this.every.before ? [ this.every.before ].concat(_flatten(fns)) : _flatten(fns);
  if (this.every && this.every.on) {
    runlist.push(this.every.on);
  }
  runlist.captures = fns.captures;
  runlist.source = fns.source;
  return runlist;
};

Router.prototype.mount = function(routes, path) {
  if (!routes || typeof routes !== "object" || Array.isArray(routes)) {
    return;
  }
  var self = this;
  path = path || [];
  if (!Array.isArray(path)) {
    path = path.split(self.delimiter);
  }
  function insertOrMount(route, local) {
    var rename = route, parts = route.split(self.delimiter), routeType = typeof routes[route], isRoute = parts[0] === "" || !self._methods[parts[0]], event = isRoute ? "on" : rename;
    if (isRoute) {
      rename = rename.slice((rename.match(new RegExp("^" + self.delimiter)) || [ "" ])[0].length);
      parts.shift();
    }
    if (isRoute && routeType === "object" && !Array.isArray(routes[route])) {
      local = local.concat(parts);
      self.mount(routes[route], local);
      return;
    }
    if (isRoute) {
      local = local.concat(rename.split(self.delimiter));
      local = terminator(local, self.delimiter);
    }
    self.insert(event, local, routes[route]);
  }
  for (var route in routes) {
    if (routes.hasOwnProperty(route)) {
      insertOrMount(route, path.slice(0));
    }
  }
};



}(typeof exports === "object" ? exports : window));
},{}],2:[function(require,module,exports){
/*!
 * Jump.js 1.0.1 - A small, modern, dependency-free smooth scrolling library.
 * Copyright (c) 2016 Michael Cavalea - https://github.com/callmecavs/jump.js
 * License: MIT
 */

!function(o,n){"object"==typeof exports&&"undefined"!=typeof module?module.exports=n():"function"==typeof define&&define.amd?define(n):o.Jump=n()}(this,function(){"use strict";var o=function(o,n,e,t){return o/=t/2,o<1?e/2*o*o+n:(o--,-e/2*(o*(o-2)-1)+n)},n="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(o){return typeof o}:function(o){return o&&"function"==typeof Symbol&&o.constructor===Symbol?"symbol":typeof o},e=function(){function e(){return window.scrollY||window.pageYOffset}function t(o){return o.getBoundingClientRect().top+d}function i(o){v||(v=o),b=o-v,p=s(b,d,y,m),window.scrollTo(0,p),b<m?requestAnimationFrame(i):r()}function r(){window.scrollTo(0,d+y),c&&l&&(c.setAttribute("tabindex","-1"),c.focus()),"function"==typeof w&&w(),v=!1}function u(r){var u=arguments.length<=1||void 0===arguments[1]?{}:arguments[1];switch(m=u.duration||1e3,a=u.offset||0,w=u.callback,s=u.easing||o,l=u.a11y||!1,d=e(),"undefined"==typeof r?"undefined":n(r)){case"number":c=void 0,l=!1,f=d+r;break;case"object":c=r,f=t(c);break;case"string":c=document.querySelector(r),f=t(c)}switch(y=f-d+a,n(u.duration)){case"number":m=u.duration;break;case"function":m=u.duration(y)}requestAnimationFrame(i)}var c=void 0,d=void 0,f=void 0,a=void 0,s=void 0,l=void 0,y=void 0,m=void 0,v=void 0,b=void 0,p=void 0,w=void 0;return u},t=e();return t});
},{}],3:[function(require,module,exports){
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else {
		var a = factory();
		for(var i in a) (typeof exports === 'object' ? exports : root)[i] = a[i];
	}
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(1);


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; /* globals jQuery */

	exports.lory = lory;

	var _detectPrefixes = __webpack_require__(2);

	var _detectPrefixes2 = _interopRequireDefault(_detectPrefixes);

	var _dispatchEvent = __webpack_require__(3);

	var _dispatchEvent2 = _interopRequireDefault(_dispatchEvent);

	var _defaults = __webpack_require__(5);

	var _defaults2 = _interopRequireDefault(_defaults);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var slice = Array.prototype.slice;

	function lory(slider, opts) {
	    var position = void 0;
	    var slidesWidth = void 0;
	    var frameWidth = void 0;
	    var slides = void 0;

	    /**
	     * slider DOM elements
	     */
	    var frame = void 0;
	    var slideContainer = void 0;
	    var prevCtrl = void 0;
	    var nextCtrl = void 0;
	    var prefixes = void 0;
	    var transitionEndCallback = void 0;

	    var index = 0;
	    var options = {};

	    /**
	     * if object is jQuery convert to native DOM element
	     */
	    if (typeof jQuery !== 'undefined' && slider instanceof jQuery) {
	        slider = slider[0];
	    }

	    /**
	     * private
	     * set active class to element which is the current slide
	     */
	    function setActiveElement(slides, currentIndex) {
	        var _options = options;
	        var classNameActiveSlide = _options.classNameActiveSlide;


	        slides.forEach(function (element, index) {
	            if (element.classList.contains(classNameActiveSlide)) {
	                element.classList.remove(classNameActiveSlide);
	            }
	        });

	        slides[currentIndex].classList.add(classNameActiveSlide);
	    }

	    /**
	     * private
	     * setupInfinite: function to setup if infinite is set
	     *
	     * @param  {array} slideArray
	     * @return {array} array of updated slideContainer elements
	     */
	    function setupInfinite(slideArray) {
	        var _options2 = options;
	        var infinite = _options2.infinite;


	        var front = slideArray.slice(0, infinite);
	        var back = slideArray.slice(slideArray.length - infinite, slideArray.length);

	        front.forEach(function (element) {
	            var cloned = element.cloneNode(true);

	            slideContainer.appendChild(cloned);
	        });

	        back.reverse().forEach(function (element) {
	            var cloned = element.cloneNode(true);

	            slideContainer.insertBefore(cloned, slideContainer.firstChild);
	        });

	        slideContainer.addEventListener(prefixes.transitionEnd, onTransitionEnd);

	        return slice.call(slideContainer.children);
	    }

	    /**
	     * [dispatchSliderEvent description]
	     * @return {[type]} [description]
	     */
	    function dispatchSliderEvent(phase, type, detail) {
	        (0, _dispatchEvent2.default)(slider, phase + '.lory.' + type, detail);
	    }

	    /**
	     * translates to a given position in a given time in milliseconds
	     *
	     * @to        {number} number in pixels where to translate to
	     * @duration  {number} time in milliseconds for the transistion
	     * @ease      {string} easing css property
	     */
	    function translate(to, duration, ease) {
	        var style = slideContainer && slideContainer.style;

	        if (style) {
	            style[prefixes.transition + 'TimingFunction'] = ease;
	            style[prefixes.transition + 'Duration'] = duration + 'ms';

	            if (prefixes.hasTranslate3d) {
	                style[prefixes.transform] = 'translate3d(' + to + 'px, 0, 0)';
	            } else {
	                style[prefixes.transform] = 'translate(' + to + 'px, 0)';
	            }
	        }
	    }

	    /**
	     * slidefunction called by prev, next & touchend
	     *
	     * determine nextIndex and slide to next postion
	     * under restrictions of the defined options
	     *
	     * @direction  {boolean}
	     */
	    function slide(nextIndex, direction) {
	        var _options3 = options;
	        var slideSpeed = _options3.slideSpeed;
	        var slidesToScroll = _options3.slidesToScroll;
	        var infinite = _options3.infinite;
	        var rewind = _options3.rewind;
	        var rewindSpeed = _options3.rewindSpeed;
	        var ease = _options3.ease;
	        var classNameActiveSlide = _options3.classNameActiveSlide;


	        var duration = slideSpeed;

	        var nextSlide = direction ? index + 1 : index - 1;
	        var maxOffset = Math.round(slidesWidth - frameWidth);

	        dispatchSliderEvent('before', 'slide', {
	            index: index,
	            nextSlide: nextSlide
	        });

	        if (typeof nextIndex !== 'number') {
	            if (direction) {
	                nextIndex = index + slidesToScroll;
	            } else {
	                nextIndex = index - slidesToScroll;
	            }
	        }

	        nextIndex = Math.min(Math.max(nextIndex, 0), slides.length - 1);

	        if (infinite && direction === undefined) {
	            nextIndex += infinite;
	        }

	        var nextOffset = Math.min(Math.max(slides[nextIndex].offsetLeft * -1, maxOffset * -1), 0);

	        if (rewind && Math.abs(position.x) === maxOffset && direction) {
	            nextOffset = 0;
	            nextIndex = 0;
	            duration = rewindSpeed;
	        }

	        /**
	         * translate to the nextOffset by a defined duration and ease function
	         */
	        translate(nextOffset, duration, ease);

	        /**
	         * update the position with the next position
	         */
	        position.x = nextOffset;

	        /**
	         * update the index with the nextIndex only if
	         * the offset of the nextIndex is in the range of the maxOffset
	         */
	        if (slides[nextIndex].offsetLeft <= maxOffset) {
	            index = nextIndex;
	        }

	        if (infinite && (Math.abs(nextOffset) === maxOffset || Math.abs(nextOffset) === 0)) {
	            if (direction) {
	                index = infinite;
	            }

	            if (!direction) {
	                index = slides.length - infinite * 2;
	            }

	            position.x = slides[index].offsetLeft * -1;

	            transitionEndCallback = function transitionEndCallback() {
	                translate(slides[index].offsetLeft * -1, 0, undefined);
	            };
	        }

	        if (classNameActiveSlide) {
	            setActiveElement(slice.call(slides), index);
	        }

	        dispatchSliderEvent('after', 'slide', {
	            currentSlide: index
	        });
	    }

	    /**
	     * public
	     * setup function
	     */
	    function setup() {
	        dispatchSliderEvent('before', 'init');

	        prefixes = (0, _detectPrefixes2.default)();
	        options = _extends({}, _defaults2.default, opts);

	        var _options4 = options;
	        var classNameFrame = _options4.classNameFrame;
	        var classNameSlideContainer = _options4.classNameSlideContainer;
	        var classNamePrevCtrl = _options4.classNamePrevCtrl;
	        var classNameNextCtrl = _options4.classNameNextCtrl;
	        var enableMouseEvents = _options4.enableMouseEvents;
	        var classNameActiveSlide = _options4.classNameActiveSlide;


	        frame = slider.getElementsByClassName(classNameFrame)[0];
	        slideContainer = frame.getElementsByClassName(classNameSlideContainer)[0];
	        prevCtrl = slider.getElementsByClassName(classNamePrevCtrl)[0];
	        nextCtrl = slider.getElementsByClassName(classNameNextCtrl)[0];

	        position = {
	            x: slideContainer.offsetLeft,
	            y: slideContainer.offsetTop
	        };

	        if (options.infinite) {
	            slides = setupInfinite(slice.call(slideContainer.children));
	        } else {
	            slides = slice.call(slideContainer.children);
	        }

	        reset();

	        if (classNameActiveSlide) {
	            setActiveElement(slides, index);
	        }

	        if (prevCtrl && nextCtrl) {
	            prevCtrl.addEventListener('click', prev);
	            nextCtrl.addEventListener('click', next);
	        }

	        slideContainer.addEventListener('touchstart', onTouchstart);

	        if (enableMouseEvents) {
	            slideContainer.addEventListener('mousedown', onTouchstart);
	            slideContainer.addEventListener('click', onClick);
	        }

	        options.window.addEventListener('resize', onResize);

	        dispatchSliderEvent('after', 'init');
	    }

	    /**
	     * public
	     * reset function: called on resize
	     */
	    function reset() {
	        var _options5 = options;
	        var infinite = _options5.infinite;
	        var ease = _options5.ease;
	        var rewindSpeed = _options5.rewindSpeed;


	        slidesWidth = slideContainer.getBoundingClientRect().width || slideContainer.offsetWidth;
	        frameWidth = frame.getBoundingClientRect().width || frame.offsetWidth;

	        if (frameWidth === slidesWidth) {
	            slidesWidth = slides.reduce(function (previousValue, slide) {
	                return previousValue + slide.getBoundingClientRect().width || slide.offsetWidth;
	            }, 0);
	        }

	        index = 0;

	        if (infinite) {
	            translate(slides[index + infinite].offsetLeft * -1, 0, null);

	            index = index + infinite;
	            position.x = slides[index].offsetLeft * -1;
	        } else {
	            translate(0, rewindSpeed, ease);
	        }
	    }

	    /**
	     * public
	     * slideTo: called on clickhandler
	     */
	    function slideTo(index) {
	        slide(index);
	    }

	    /**
	     * public
	     * returnIndex function: called on clickhandler
	     */
	    function returnIndex() {
	        return index - options.infinite || 0;
	    }

	    /**
	     * public
	     * prev function: called on clickhandler
	     */
	    function prev() {
	        slide(false, false);
	    }

	    /**
	     * public
	     * next function: called on clickhandler
	     */
	    function next() {
	        slide(false, true);
	    }

	    /**
	     * public
	     * destroy function: called to gracefully destroy the lory instance
	     */
	    function destroy() {
	        dispatchSliderEvent('before', 'destroy');

	        // remove event listeners
	        slideContainer.removeEventListener(prefixes.transitionEnd, onTransitionEnd);
	        slideContainer.removeEventListener('touchstart', onTouchstart);
	        slideContainer.removeEventListener('touchmove', onTouchmove);
	        slideContainer.removeEventListener('touchend', onTouchend);
	        slideContainer.removeEventListener('mousemove', onTouchmove);
	        slideContainer.removeEventListener('mousedown', onTouchstart);
	        slideContainer.removeEventListener('mouseup', onTouchend);
	        slideContainer.removeEventListener('mouseleave', onTouchend);
	        slideContainer.removeEventListener('click', onClick);

	        options.window.removeEventListener('resize', onResize);

	        if (prevCtrl) {
	            prevCtrl.removeEventListener('click', prev);
	        }

	        if (nextCtrl) {
	            nextCtrl.removeEventListener('click', next);
	        }

	        dispatchSliderEvent('after', 'destroy');
	    }

	    // event handling

	    var touchOffset = void 0;
	    var delta = void 0;
	    var isScrolling = void 0;

	    function onTransitionEnd() {
	        if (transitionEndCallback) {
	            transitionEndCallback();

	            transitionEndCallback = undefined;
	        }
	    }

	    function onTouchstart(event) {
	        var _options6 = options;
	        var enableMouseEvents = _options6.enableMouseEvents;

	        var touches = event.touches ? event.touches[0] : event;

	        if (enableMouseEvents) {
	            slideContainer.addEventListener('mousemove', onTouchmove);
	            slideContainer.addEventListener('mouseup', onTouchend);
	            slideContainer.addEventListener('mouseleave', onTouchend);
	        }

	        slideContainer.addEventListener('touchmove', onTouchmove);
	        slideContainer.addEventListener('touchend', onTouchend);

	        var pageX = touches.pageX;
	        var pageY = touches.pageY;


	        touchOffset = {
	            x: pageX,
	            y: pageY,
	            time: Date.now()
	        };

	        isScrolling = undefined;

	        delta = {};

	        dispatchSliderEvent('on', 'touchstart', {
	            event: event
	        });
	    }

	    function onTouchmove(event) {
	        var touches = event.touches ? event.touches[0] : event;
	        var pageX = touches.pageX;
	        var pageY = touches.pageY;


	        delta = {
	            x: pageX - touchOffset.x,
	            y: pageY - touchOffset.y
	        };

	        if (typeof isScrolling === 'undefined') {
	            isScrolling = !!(isScrolling || Math.abs(delta.x) < Math.abs(delta.y));
	        }

	        if (!isScrolling && touchOffset) {
	            event.preventDefault();
	            translate(position.x + delta.x, 0, null);
	        }

	        // may be
	        dispatchSliderEvent('on', 'touchmove', {
	            event: event
	        });
	    }

	    function onTouchend(event) {
	        /**
	         * time between touchstart and touchend in milliseconds
	         * @duration {number}
	         */
	        var duration = touchOffset ? Date.now() - touchOffset.time : undefined;

	        /**
	         * is valid if:
	         *
	         * -> swipe attempt time is over 300 ms
	         * and
	         * -> swipe distance is greater than 25px
	         * or
	         * -> swipe distance is more then a third of the swipe area
	         *
	         * @isValidSlide {Boolean}
	         */
	        var isValid = Number(duration) < 300 && Math.abs(delta.x) > 25 || Math.abs(delta.x) > frameWidth / 3;

	        /**
	         * is out of bounds if:
	         *
	         * -> index is 0 and delta x is greater than 0
	         * or
	         * -> index is the last slide and delta is smaller than 0
	         *
	         * @isOutOfBounds {Boolean}
	         */
	        var isOutOfBounds = !index && delta.x > 0 || index === slides.length - 1 && delta.x < 0;

	        var direction = delta.x < 0;

	        if (!isScrolling) {
	            if (isValid && !isOutOfBounds) {
	                slide(false, direction);
	            } else {
	                translate(position.x, options.snapBackSpeed);
	            }
	        }

	        touchOffset = undefined;

	        /**
	         * remove eventlisteners after swipe attempt
	         */
	        slideContainer.removeEventListener('touchmove', onTouchmove);
	        slideContainer.removeEventListener('touchend', onTouchend);
	        slideContainer.removeEventListener('mousemove', onTouchmove);
	        slideContainer.removeEventListener('mouseup', onTouchend);
	        slideContainer.removeEventListener('mouseleave', onTouchend);

	        dispatchSliderEvent('on', 'touchend', {
	            event: event
	        });
	    }

	    function onClick(event) {
	        if (delta.x) {
	            event.preventDefault();
	        }
	    }

	    function onResize(event) {
	        reset();

	        dispatchSliderEvent('on', 'resize', {
	            event: event
	        });
	    }

	    // trigger initial setup
	    setup();

	    // expose public api
	    return {
	        setup: setup,
	        reset: reset,
	        slideTo: slideTo,
	        returnIndex: returnIndex,
	        prev: prev,
	        next: next,
	        destroy: destroy
	    };
	}

/***/ },
/* 2 */
/***/ function(module, exports) {

	/* WEBPACK VAR INJECTION */(function(global) {'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.default = detectPrefixes;
	/**
	 * Detecting prefixes for saving time and bytes
	 */
	function detectPrefixes() {
	    var transform = void 0;
	    var transition = void 0;
	    var transitionEnd = void 0;
	    var hasTranslate3d = void 0;

	    (function () {
	        var el = document.createElement('_');
	        var style = el.style;

	        var prop = void 0;

	        if (style[prop = 'webkitTransition'] === '') {
	            transitionEnd = 'webkitTransitionEnd';
	            transition = prop;
	        }

	        if (style[prop = 'transition'] === '') {
	            transitionEnd = 'transitionend';
	            transition = prop;
	        }

	        if (style[prop = 'webkitTransform'] === '') {
	            transform = prop;
	        }

	        if (style[prop = 'msTransform'] === '') {
	            transform = prop;
	        }

	        if (style[prop = 'transform'] === '') {
	            transform = prop;
	        }

	        document.body.insertBefore(el, null);
	        style[transform] = 'translate3d(0, 0, 0)';
	        hasTranslate3d = !!global.getComputedStyle(el).getPropertyValue(transform);
	        document.body.removeChild(el);
	    })();

	    return {
	        transform: transform,
	        transition: transition,
	        transitionEnd: transitionEnd,
	        hasTranslate3d: hasTranslate3d
	    };
	}
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.default = dispatchEvent;

	var _customEvent = __webpack_require__(4);

	var _customEvent2 = _interopRequireDefault(_customEvent);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	/**
	 * dispatch custom events
	 *
	 * @param  {element} el         slideshow element
	 * @param  {string}  type       custom event name
	 * @param  {object}  detail     custom detail information
	 */
	function dispatchEvent(target, type, detail) {
	    var event = new _customEvent2.default(type, {
	        bubbles: true,
	        cancelable: true,
	        detail: detail
	    });

	    target.dispatchEvent(event);
	}

/***/ },
/* 4 */
/***/ function(module, exports) {

	/* WEBPACK VAR INJECTION */(function(global) {
	var NativeCustomEvent = global.CustomEvent;

	function useNative () {
	  try {
	    var p = new NativeCustomEvent('cat', { detail: { foo: 'bar' } });
	    return  'cat' === p.type && 'bar' === p.detail.foo;
	  } catch (e) {
	  }
	  return false;
	}

	/**
	 * Cross-browser `CustomEvent` constructor.
	 *
	 * https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent.CustomEvent
	 *
	 * @public
	 */

	module.exports = useNative() ? NativeCustomEvent :

	// IE >= 9
	'function' === typeof document.createEvent ? function CustomEvent (type, params) {
	  var e = document.createEvent('CustomEvent');
	  if (params) {
	    e.initCustomEvent(type, params.bubbles, params.cancelable, params.detail);
	  } else {
	    e.initCustomEvent(type, false, false, void 0);
	  }
	  return e;
	} :

	// IE <= 8
	function CustomEvent (type, params) {
	  var e = document.createEventObject();
	  e.type = type;
	  if (params) {
	    e.bubbles = Boolean(params.bubbles);
	    e.cancelable = Boolean(params.cancelable);
	    e.detail = params.detail;
	  } else {
	    e.bubbles = false;
	    e.cancelable = false;
	    e.detail = void 0;
	  }
	  return e;
	}

	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 5 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = {
	  /**
	   * slides scrolled at once
	   * @slidesToScroll {Number}
	   */
	  slidesToScroll: 1,

	  /**
	   * time in milliseconds for the animation of a valid slide attempt
	   * @slideSpeed {Number}
	   */
	  slideSpeed: 300,

	  /**
	   * time in milliseconds for the animation of the rewind after the last slide
	   * @rewindSpeed {Number}
	   */
	  rewindSpeed: 600,

	  /**
	   * time for the snapBack of the slider if the slide attempt was not valid
	   * @snapBackSpeed {Number}
	   */
	  snapBackSpeed: 200,

	  /**
	   * Basic easing functions: https://developer.mozilla.org/de/docs/Web/CSS/transition-timing-function
	   * cubic bezier easing functions: http://easings.net/de
	   * @ease {String}
	   */
	  ease: 'ease',

	  /**
	   * if slider reached the last slide, with next click the slider goes back to the startindex.
	   * use infinite or rewind, not both
	   * @rewind {Boolean}
	   */
	  rewind: false,

	  /**
	   * number of visible slides or false
	   * use infinite or rewind, not both
	   * @infinite {number}
	   */
	  infinite: false,

	  /**
	   * class name for slider frame
	   * @classNameFrame {string}
	   */
	  classNameFrame: 'js_frame',

	  /**
	   * class name for slides container
	   * @classNameSlideContainer {string}
	   */
	  classNameSlideContainer: 'js_slides',

	  /**
	   * class name for slider prev control
	   * @classNamePrevCtrl {string}
	   */
	  classNamePrevCtrl: 'js_prev',

	  /**
	   * class name for slider next control
	   * @classNameNextCtrl {string}
	   */
	  classNameNextCtrl: 'js_next',

	  /**
	   * class name for current active slide
	   * if emptyString then no class is set
	   * @classNameActiveSlide {string}
	   */
	  classNameActiveSlide: 'active',

	  /**
	   * enables mouse events for swiping on desktop devices
	   * @enableMouseEvents {boolean}
	   */
	  enableMouseEvents: false,

	  /**
	   * window instance
	   * @window {object}
	   */
	  window: window
	};

/***/ }
/******/ ])
});
;
},{}],4:[function(require,module,exports){
(function (global){
; var __browserify_shim_require__=require;(function browserifyShim(module, exports, require, define, browserify_shim__define__module__export__) {
/* 
 * Copyright (c) 2013-2016 David Jenkins (validatinator) 
 * See the file license.txt for copying permission. 
 * 
 * Simple, yet effective, vanilla JavaScript form validation "plugin." Validatinator is based off 
 * of one of PHP's most famous framework, Laravel.  Using Validatinator is as easy as instantiating 
 * a Validatinator object, calling the passes or fails methods and if there are failed validations then grabbing 
 * those validations from the errors property on the main object. 
 * 
 * Latest Update: 1.3.3 (05/16/2016) 
 */ 
(function(window, undefined) {function Validatinator(a,b){if(!(this instanceof Validatinator))throw new Error("Whoops!  Validatinator must be called with the new keyword!");this.validationInformation=void 0!==a?this.utils.convertFieldValidationsToArray(a):{},this.errors={},this.currentForm,this.currentField,this.validations.parent=this,this.messages.parent=this,this.validations.utils=this.utils,this.messages.utils=this.utils,void 0!==b&&this.messages.overwriteAndAddNewMessages(b)}Validatinator.prototype={fails:function(a){return!this.startValidations(a)},passes:function(a){return this.startValidations(a)},startValidations:function(a){var b,c,d,e;this.currentForm=a,this.errors={};for(var f in this.validationInformation[a])for(this.currentField=f,b=this.validationInformation[a][f],c=this.utils.getFieldsValue(this.currentForm,this.currentField),e=0;e<b.length;e++){var g,h=[];d=this.getValidationMethodAndParameters(b[e]),g=d[0],2===d.length&&(h=d[1]),this.callValidationMethodWithParameters(g,h,c)||(h.shift(),this.messages.addValidationErrorMessage(g,h))}return this.utils.isEmptyObject(this.errors)},getValidationMethodAndParameters:function(a){var b,c;return a.contains(":")?(b=a.split(":"),c=b.shift(),[c,this.prepareParameters(b)]):[a]},prepareParameters:function(a){for(var b=0,c=0;b<a.length;b++)if(a[b].contains(","))for(a[b]=a[b].split(",");c<a[b].length;c++)a[b][c]=this.utils.convertStringToBoolean(a[b][c].trim());else a[b]=this.utils.convertStringToBoolean(a[b].trim());return a},callValidationMethodWithParameters:function(a,b,c){if(!(a in this.validations))throw new Error("Validation does not exist: "+a);return b?(b.unshift(c),this.validations[a].apply(this.validations,b)):this.validations[a](c)}},"object"==typeof window&&"object"==typeof window.document&&(window.Validatinator=Validatinator),Validatinator.prototype.messages={validationMessages:{accepted:"This field must be accepted.",alpha:"This field only allows alpha characters.",alphaDash:"This field only allows alpha, dash and underscore characters.",alphaNum:"This field only allows alpha, dash, underscore and numerical characters.",between:"This field must be between {$0}",betweenLength:"This field must be between {$0} characters long.",confirmed:"This field must be the same as {$0}.",contains:"This field must be one of the following values, {$0}.",dateBefore:"This field must be a date before {$0}.",dateAfter:"This field must be a date after {$0}.",different:"This field must not be the same as {$0}.",digitsLength:"This field must be a numerical value and {$0} characters long.",digitsLengthBetween:"This field must be a numerical value and between {$0} characters long.",email:"This field only allows valid email addresses.",ipvFour:"This field only allows valid ipv4 addresses.",max:"This field must be equal to or less than {$0}.",maxLength:"This field must be {$0} or less characters long.",min:"This field must be equal to or more than {$0}.",minLength:"This field must be {$0} or more characters long.",notIn:"This field must not be contained within the following values, {$0}.",number:"This field only allows valid numerical values.",required:"This field is required.",requiredIf:"This field is required if the value of {$0} equals {$1}.",requiredIfNot:"This field is required if the value of {$0} does not equal {$1}.",same:"This field must be the same value as {$0}.",url:"This field only allows valid urls."},overwriteAndAddNewMessages:function(a){var b;for(b in a)this.validationMessages[b]=a[b]},addCurrentFormAndField:function(){this.parent.errors.hasOwnProperty(this.parent.currentForm)||(this.parent.errors[this.parent.currentForm]={}),this.parent.errors[this.parent.currentForm].hasOwnProperty(this.parent.currentField)||(this.parent.errors[this.parent.currentForm][this.parent.currentField]={})},addValidationErrorMessage:function(a,b){var c=this.parent.currentForm,d=this.parent.currentField,e=this.getValidationErrorMessage(a);this.addCurrentFormAndField(),b.length>0&&(e=this.replaceCurlyBracesWithValues(e,b)),this.parent.errors[c][d][a]=e},getValidationErrorMessage:function(a){var b,c=this.parent.currentForm,d=this.parent.currentField;try{b=this.validationMessages[c][d][a]}catch(e){}return b||(b=this.validationMessages[a]),b},replaceCurlyBracesWithValues:function(a,b){for(var c,d,e=0;e<b.length;e++)c=b[e],d="{$"+e+"}",(a.contains(d)||null!==c||void 0!==c)&&(a=this.utils.isValueAnArray(b[e])?a.split(d).join(this.utils.convertArrayValuesToEnglishString(c)):a.split(d).join(c));return a}},String.prototype.contains||(String.prototype.contains=function(a,b){return-1!==String.prototype.indexOf.call(this,a,b)}),Array.prototype.indexOf||(Array.prototype.indexOf=function(a,b){if(void 0===this||null===this)throw new TypeError('"this" is null or not defined');var c=this.length>>>0;for(b=+b||0,Math.abs(b)===1/0&&(b=0),0>b&&(b+=c,0>b&&(b=0));c>b;b++)if(this[b]===a)return b;return-1}),Validatinator.prototype.utils={convertFieldValidationsToArray:function(a){var b;for(var c in a)for(var d in a[c])b=a[c][d],a[c][d]=b.contains("|")?b.split("|"):[b];return a},convertStringToBoolean:function(a){return"string"!=typeof a?a:"false"===a.toLowerCase()?!1:"true"===a.toLowerCase()?!0:a},convertArrayValuesToEnglishString:function(a){for(var b,c=0,d="";c<a.length;c++)b=c+1,d+=b===a.length?" and "+a[c]:0===c?a[c]:", "+a[c];return d},isValueFalsyInNature:function(a,b){return(void 0===b||null===b)&&(b=!0),void 0===a||null===a||""===a?!0:b?!a:a===!1},isValueAnArray:function(a){return"[object Array]"===Object.prototype.toString.call(a)},isEmptyObject:function(a){var b;for(b in a)return!1;return!0},getFieldsValue:function(a,b){var c,d,e,f=0;for(c=document.getElementsByName(b);f<c.length;f++)if(e=c[f],e.form.name===a){if(!("radio"!=e.type&&"checkbox"!=e.type||d)){if(e.checked){d=e.value;break}d="";continue}d=e.value;break}if(!d&&""!==d)throw new Error("Couldn't find the field element "+b+" for the form "+a+".");return d}},Validatinator.prototype.validations={accepted:function(a){return document.getElementsByName(this.parent.currentField)[0].checked},alpha:function(a){var b=/^[a-zA-Z]+$/;return this.utils.isValueFalsyInNature(a)?!1:b.test(a)},alphaDash:function(a){var b=/^[a-zA-Z-_]+$/;return this.utils.isValueFalsyInNature(a)?!1:b.test(a)},alphaNum:function(a){var b=/^[a-zA-Z-_0-9]+$/;return this.utils.isValueFalsyInNature(a)?!1:b.test(a)},between:function(a,b){var c=Number(b[0]),d=Number(b[1]);if(isNaN(c)||isNaN(d))throw new Error("min and max must both be numbers in the `between` validation.");return a>=c&&d>=a},betweenLength:function(a,b){var c=Number(b[0]),d=Number(b[1]),e=String(a).length;if(isNaN(c)||isNaN(d))throw new Error("min and max must both be numbers in the `betweenLength` validation.");return e>=c&&d>=e},contains:function(a,b){return-1!==b.indexOf(a)},dateBefore:function(a,b){return Date.parse(a)<Date.parse(b)},dateAfter:function(a,b){return!this.dateBefore(a,b)},different:function(a,b,c){return!this.same(a,b,c)},digitsLength:function(a,b){var c=String(a).length,b=Number(b);if(isNaN(b))throw new Error("length must be of numerical value in the `digitsLength` validation.");return this.number(a)?c===b:!1},digitsLengthBetween:function(a,b){var c=Number(b[0]),d=Number(b[1]),e=String(a).length;if(isNaN(c)||isNaN(d))throw new Error("minLength and maxLength must both be numerical values in the `digitsLengthBetween` validation.");return this.number(a)?e>=c&&d>=e:!1},email:function(a){var b=/[^\s@]+@[^\s@]+\.[^\s@]+/;return b.test(a)},ipvFour:function(a){var b,c=255;return b=a.match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/),null!==b&&b[1]<=c&&b[2]<=c&&b[3]<=c&&b[4]<=c},max:function(a,b){if(b=Number(b),isNaN(b))throw new Error("max must be of numerical value in the `max` validation.");return this.between(a,[-(1/0),b])},maxLength:function(a,b){if(b=Number(b),isNaN(b))throw new Error("max must be a numerical value in the `max` validation.");return this.betweenLength(a,[-(1/0),b])},min:function(a,b){if(b=Number(b),isNaN(b))throw new Error("min must be of numerical value in the `min` validation.");return this.between(a,[b,1/0])},minLength:function(a,b){if(b=Number(b),isNaN(b))throw new Error("min must be a numerical value in the `minLength` validation.");return this.betweenLength(a,[b,1/0])},notIn:function(a,b){return!this.contains(a,b)},number:function(a){return null===a||void 0===a?!1:(a=Number(a),!isNaN(a))},required:function(a){return!this.utils.isValueFalsyInNature(a,!1)},_required_if:function(a,b,c,d){var e=this.utils.getFieldsValue(this.parent.currentForm,b);return d&&e!==c||!d&&e===c?this.required(a):!0},requiredIf:function(a,b,c){return this._required_if(a,b,c,!1)},requiredIfNot:function(a,b,c){return this._required_if(a,b,c,!0)},same:function(a,b,c){var d=this.utils.getFieldsValue(this.parent.currentForm,b);return(void 0===c||null===c)&&(c=!0),a=String(a),d=String(d),c?a===d:a.toLowerCase()===d.toLowerCase()},url:function(a){var b=/^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;return b.test(a)}};})(window);
; browserify_shim__define__module__export__(typeof Validatinator != "undefined" ? Validatinator : window.Validatinator);

}).call(global, undefined, undefined, undefined, undefined, function defineExport(ex) { module.exports = ex; });

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],5:[function(require,module,exports){
'use strict';

var jump = require('jump.js');

var anchorScroll = {
    init: function(el) {
        if (!el) {
            return;
        }

        this.el = el;
        this.target = this.targetFromHREF(el.href);
        this.bind();
    },

    bind: function() {
        this.el.addEventListener('click', this.onAnchorClick.bind(this));
    },

    targetFromHREF: function(href) {
        href = href.split('#');

        return '#' + href[1];
    },

    onAnchorClick: function(event) {
        var target;

        event.preventDefault();

        jump(this.target);
    },
};

module.exports = anchorScroll;

},{"jump.js":2}],6:[function(require,module,exports){
var feed, config;

config = {
    clientID: '8ae6c35f38634fbbac2278fd90ca3631',
    accessToken: '10295251.8ae6c35.fce720fb2265433293e4a550a943cecf',
    endpoint: 'https://api.instagram.com/v1/users/176412031/media/recent/',
    count: 6
};

feed = {
    init: function(el) {
        var request, URL;

        if (!el) {
            return;
        }

        URL = config.endpoint + '?access_token=' + config.accessToken;
        URL += '&count=' + config.count;
        URL += '&callback=onFeedFetchSuccess';

        this.el = el;

        this.requestJSONP(URL);
    },

    requestJSONP: function(URL) {
        var el;

        el = document.createElement('script');
        el.src = URL;
        el.id = 'instagram-request';
        document.head.appendChild(el);
    },

    onFeedFetchSuccess: function(response) {
        var self = feed;

        if (response.meta.code !== 200) {
            self.onFeedFetchError(response.meta);
            return;
        }

        if (!response.data.length || response.data.length < 1) {
            return;
        }

        if (response.data.length === 2) {
            response.data.push(response.data[0]);
        }

        if (response.data.length === 1) {
            response.data.push(response.data[0]);
            response.data.push(response.data[0]);
        }

        self.parse(response.data);
    },

    onFeedFetchError: function(err) {
        console.warn(err);
    },

    parse: function(data) {
        var el;
        data = this.parsedData(data);
        el = this.template(data);
        this.render(el);
    },

    render: function(el) {
        this.el.appendChild(el);
    },

    parsedData: function(data) {
        return data.map(this.simplifiedDatum);
    },

    simplifiedDatum: function(datum) {
        var caption, image;
        caption = datum.caption;
        image = datum.images;

        caption = caption ? caption.text : '';
        image = image.standard_resolution.url;

        return {
            text: caption,
            image: image
        };
    },

    template: function(photos) {
        var el, self;

        self = this;

        el = document.createElement('ol');
        el.className = 'pics__list';

        photos.forEach(function(photo) {
            el.appendChild(self.photoWithCaption(photo));
        });

        return el;
    },

    photoWithCaption: function(photo) {
        var el, figure;

        el = document.createElement('li');
        el.className = 'pic';

        figure = document.createElement('figure');
        figure.className = 'pic__figure';

        figure.appendChild(this.image(photo.image));
        figure.appendChild(this.caption(photo.text));

        el.appendChild(figure);

        return el;
    },

    image: function(image) {
        var img;
        img = document.createElement('img');
        img.className = 'pic__image';
        img.src = image;
        return img;
    },

    caption: function(text) {
        var caption, paragraph;
        paragraph = document.createElement('p');
        paragraph.innerHTML = text;

        caption = document.createElement('div');
        caption.className = 'pic__caption';
        caption.appendChild(paragraph);

        return caption;
    }

};

window.onFeedFetchSuccess = feed.onFeedFetchSuccess;

module.exports = feed;

},{}],7:[function(require,module,exports){
'use strict';

var Validatinator = require('validatinator');

var form = {
    init: function(el, formName) {
        var configs = {};

        if (!el) {
            return;
        }

        this.el = el;
        this.messageEl = el.querySelector('.form-message');
        this.name = formName;

        configs[formName] = {
            'first-name': 'required|alpha',
            'last-name': 'required|alpha',
            'email': 'required|email',
            'message': 'required'
        };

        this.validator = new Validatinator(configs);
        this.bind();
    },

    bind: function() {
        this.el.addEventListener('submit', this.onSubmit.bind(this));
    },

    onSubmit: function(event) {
        event.preventDefault();

        if (this.validator.fails(this.name)) {
            this.onError(this.validator.validationInformation[this.name],
                         this.validator.errors[this.name]);
            return;
        }

        this.onSuccess();
    },

    onError: function(fields, errors) {
        var field, fieldEl;

        for (field in fields) {
            if (!fields.hasOwnProperty(field)) {
                continue;
            }

            fieldEl = document.querySelector('[name=' + field + ']');
            fieldEl = fieldEl.parentNode;

            if (errors[field]) {
                fieldEl.classList.add('contact-form__label--invalid');
                fieldEl.classList.remove('contact-form__label--valid');
            } else {
                fieldEl.classList.remove('contact-form__label--invalid');
                fieldEl.classList.add('contact-form__label--valid');
            }
        }

        this.el.classList.add('contact-form--invalid');
    },

    onSuccess: function() {
        this.el.classList.remove('contact-form--invalid');
        this.el.classList.add('contact-form--valid');

        this.el.removeChild(this.el.querySelector('.contact-form__container'));
    }

};

module.exports = form;

},{"validatinator":4}],8:[function(require,module,exports){
'use strict';

var director = require('director');

var slider = require('./slider'),
    nav = require('./nav'),
    feed = require('./feed'),
    form = require('./form'),
    anchorScroll = require('./anchor-scroll');

var app = {

    init: function() {
        var routes, router, self = this;

        routes = {
            '/': this.home.bind(this),
            '/contact': this.contact.bind(this)
        };

        nav.init(document.querySelector('.site-nav'));

        router = director.Router(routes);
        router.init('/');
    },


    home: function() {
        this.load('home', function() {
            nav.activateItem(document.querySelector('.nav-item--home'));
            slider.init(document.querySelector('.hero'));
            anchorScroll.init(document.querySelector('.hero__scroll-anchor'));
            feed.init(document.querySelector('.pics'));
        });
    },

    contact: function() {
        this.load('contact', function() {
            nav.activateItem(document.querySelector('.nav-item--contact'));
            form.init(document.querySelector('.contact-form'), 'contact-form');
        });
    },

    load: function(page, callback) {
        var request;

        callback = callback || function() {};
        request = new XMLHttpRequest();
        request.open('GET', './' + page + '.html');
        request.onload = this.onLoadSuccess.bind(this, request, callback);

        document.body.classList.add('is-loading');
        document.querySelector('.site-content').innerHTML = '';

        request.send();
        nav.hide();
    },

    onLoadSuccess: function(request, callback) {
        if (request.status !== 200) {
            this.onFetchError();
            return;
        }

        var fragment = document.createElement('div');
        fragment.innerHTML = request.responseText;
        fragment = fragment.querySelector('.site-content');

        document.body.classList.remove('is-loading');
        document.querySelector('.site-content').innerHTML = fragment.innerHTML;
        callback();
    }


};

app.init();


},{"./anchor-scroll":5,"./feed":6,"./form":7,"./nav":9,"./slider":10,"director":1}],9:[function(require,module,exports){
'use strict';

var nav = {
    init: function(el) {
        this.el = el;
        this.button = el.querySelector('.site-nav__toggle');
        this.menu = el.querySelector('.site-nav__items');
        this.bind();
    },

    bind: function() {
        this.button.addEventListener('click', this.toggle.bind(this));
    },

    toggle: function() {
        this.el.classList.toggle('site-nav--visible');
        document.body.classList.toggle('has-open-menu');
    },

    hide: function() {
        this.el.classList.remove('site-nav--visible');
        document.body.classList.remove('has-open-menu');
    },

    activateItem: function(item) {
        var currentActive = document.querySelector('.nav-item--active');

        if (currentActive) {
            currentActive.classList.remove('nav-item--active');
        }

        item.classList.add('nav-item--active');
    }
};

module.exports = nav;

},{}],10:[function(require,module,exports){
'use strict';

var lory = require('lory.js').lory;

var slider = {
    init: function(el) {
        var frame;

        if (!el) {
            return;
        }

        this.el = el;
        this.lastScroll = Date.now();

        frame = el.querySelector('.hero__slider');
        frame.className += ' hero__slider--active';

        el.style.height = window.innerHeight + 'px';

        lory(el, {
            infinite: 1,
            classNameFrame: 'hero__slider',
            classNameSlideContainer: 'cases',
            classNamePrevCtrl: 'slider-nav__button--previous ',
            classNameNextCtrl: 'slider-nav__button--next '
        });
    },

    bind: function() {
        window.addEventListener('resize', this.onResize.bind(this));
    },

    onResize: function(event) {
        var current = Date.now();

        if (current - this.lastResize < 100) {
            return;
        }

        this.lastResize = current;
        this.el.style.height = window.innerHeight + 'px';
    }
};

module.exports = slider;

},{"lory.js":3}]},{},[8]);
