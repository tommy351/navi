# Navi

Navi is a simple client-side routing library.

## Examples

``` js
navi.route('/posts/:id').enter(function(params, next){
	console.log('enter: ' + params[0]);
	next();
)).exit(function(params, next){
	console.log('exit: ' + params[0]);
	next();
});
```

## Download

- **Development:** [navi.js](https://github.com/tommy351/navi/raw/master/lib/navi.js) - 5.12KB uncompressed
- **Production:** [navi.min.js](https://github.com/tommy351/navi/raw/master/lib/navi.min.js) - 1.03KB minified and gzipped

## Documentation

### Options

**Default options:**

``` js
navi.options = {
	html5: true
}
```

- `html5`: Uses HTML5 PushState.

### route(path, [fn])

Creates a route. The `path` argument can be a routing string or regular expression. If the `fn` argument is provided, it'll be the first enter function.

``` js
// Matches /posts/25
navi.route('/posts/:id/');

// Matches /assets/img/cat.jpg
navi.route('/assets/*path');

// Matches /zh-tw/landing
navi.route(/^\/(.*?)\/landing$/);
```

### navigate(path, [options])

Redirects to the given `path`.

**Options:**

- `replace` - Replaces the current state.

### forward([num])

Goes to the next page.

**Alias**: *go*

### back([num])

Goes to the previous page.

### match(url)

Checks whether the `url` is matched with the registered routes.

### Class: Route

When users entering an URL, Navi'll trigger the matching route's enter stacks and so as exiting.

Each function in the stack is invoked with 2 parameters: `(params, next)`. The `params` includes properties mapped to the route.

``` js
// Enters /posts/25
navi.route('/posts/:id', function(params, next){
	console.log(params.id);
	// => "25"
});
```

The functions in the stack are executed in series. The next function won't be executed unless the previous function called `next()`.

``` js
navi.route('/posts/:id', function(params, next){
	next();
}).enter(function(params, next){
	// This function will be executed
}).enter(function(params, next){
	// This function won't be executed
});
```

#### route.enter(fn)

Adds the `fn` to the enter stack.

#### route.exit(fn)

Adds the `fn` to the exit stack.