(function(window){
  var html5Support = !!(window.history && window.history.pushState);

  var navi = {
    version: '0.0.1',
    routes: {},
    options: {
      html5: true
    }
  };

  var lastPath = window.location.pathname;

  var _match = function(pattern, url){
    var match = url.match(pattern.pattern);

    if (!match) return;

    var params = {};

    for (var i = 0, len = match.length; i < len; i++){
      var name = pattern.params[i - 1];

      params[i] = match[i];

      if (name) params[name] = match[i];
    }

    return params;
  };

  navi.match = function(url){
    var routes = this.routes,
      match = false;

    for (var i in routes){
      if (routes[i].pattern.pattern.test(url)){
        match = true;
        break;
      }
    }

    return match;
  };

  navi.route = function(path, fn){
    var route = this.routes[path] = new Route(path);

    if (typeof fn === 'function') route.enter(fn);

    return route;
  };

  navi.navigate = function(path, options){
    if (!options) options = {};
    if (path[0] !== '/') path = '/' + path;

    if (lastPath === path) return;

    navi._dispatch(path);

    if (html5Support){
      if (!navi.options.html5) path = '#' + path;

      if (options.replace){
        window.history.replaceState(null, null, path);
      } else {
        window.history.pushState(null, null, path);
      }
    } else {
      if (options.replace) window.history.back();
      window.location.hash = path;
    }
  };

  navi.forward = navi.go = function(num){
    window.history.go(num || 1);
  };

  navi.back = function(num){
    window.history.go(-num || -1);
  };

  navi._dispatch = function(path){
    if (path[0] !== '/') path = '/' + path;
    if (lastPath === path) return;

    for (var i in this.routes){
      var route = this.routes[i],
        match = _match(route.pattern, path),
        lastMatch = _match(route.pattern, lastPath);

      if (match){
        var stack = route.stack.enter,
          arr = [];

        for (var i = 0, len = stack.length; i < len; i++){
          (function(i){
            arr.push(function(next){
              stack[i](match, next);
            });
          })(i);
        }

        _series(arr);
      }

      if (lastMatch){
        var lastStack = route.stack.exit,
          lastArr = [];

        for (var i = 0, len = lastStack.length; i < len; i++){
          (function(i){
            lastArr.push(function(next){
              lastStack[i](lastMatch, next);
            })
          })(i);
        }

        _series(lastArr);
      }
    }

    lastPath = path;
  };

  var rUrlParam = /(\()?([:\*])(\w*)\)?/g;

  var _compilePath = function(path){
    var params = [];

    var pattern = path.replace(/(\/|\.)/g, '\\$&')
      .replace(rUrlParam, function(match, optional, operator, name){
        params.push(name);

        if (operator === '*'){
          var str = '(.*?)';
        } else {
          var str = '([^\/]+)';
        }

        if (optional) str += '?';

        return str;
      });

    return {
      params: params,
      pattern: new RegExp('^' + pattern + '$')
    };
  };

  var _series = function(stack, callback){
    if (typeof callback !== 'function') callback = function(){};
    if (!stack.length) return callback();

    var completed = 0;

    var iterate = function(){
      stack[completed](function(err){
        if (err){
          callback(err);
          callback = function(){};
        } else {
          completed++;

          if (completed >= stack.length){
            callback();
          } else {
            iterate();
          }
        }
      });
    };

    iterate();
  };

  var Route = function(path){
    this.path = path;
    this.pattern = _compilePath(path);

    this.stack = {
      enter: [],
      exit: []
    };
  };

  var _isArray = function(obj){
    return Object.prototype.toString.call(obj) === "[object Array]";
  };

  Route.prototype.enter = function(fn){
    if (typeof fn === 'function'){
      this.stack.enter.push(fn);
    } else if (_isArray(fn)){
      this.stack.enter = this.stack.enter.concat(fn);
    }

    return this;
  };

  Route.prototype.exit = function(fn){
    if (typeof fn === 'function'){
      this.stack.exit.push(fn);
    } else if (_isArray(fn)){
      this.stack.exit = this.stack.exit.concat(fn);
    }

    return this;
  };

  var onpopstate = function(){
    navi._dispatch(window.location.pathname);
  };

  var onhashchange = function(){
    navi._dispatch(window.location.hash);
  };

  if (html5Support){
    if (window.addEventListener){
      window.addEventListener('popstate', onpopstate, false);
    } else {
      window.onpopstate = onpopstate;
    }
  } else {
    if (window.addEventListener){
      window.addEventListener('hashchange', onhashchange, false);
    } else {
      window.onhashchange = onhashchange;
    }
  }

  if (typeof define !== 'undefined' && define.amd){
    define([], function(){
      return navi;
    });
  } else if (typeof module !== 'undefined' && module.exports){
    module.exports = navi;
  } else {
    window.navi = navi;
  }
})(window);