install:
	npm install

build:
	@./node_modules/.bin/uglifyjs \
		lib/navi.js \
		-o lib/navi.min.js \
		-c -m

.PHONY: build