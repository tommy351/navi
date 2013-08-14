install:
	npm install

build:
	@./node_modules/.bin/uglifyjs \
		lib/navi.js \
		-o lib/navi.min.js \
		--source-map lib/navi.min.map \
		-c -m

.PHONY: build