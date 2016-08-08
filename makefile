.PHONY: server deploy

BIN=node_modules/.bin

SRC_DIR=src
PUBLIC_DIR=public

JS_SRC=$(SRC_DIR)/js
JS_BUNDLE=$(PUBLIC_DIR)/assets/js
BROWSERIFY_DEPS=$(wildcard $(JS_SRC)/main.js $(JS_SRC)/*.js $(JS_SRC)/**/*.js)

SASS_DIR=$(SRC_DIR)/scss
CSS_DIR=$(PUBLIC_DIR)/assets/css
SASS_DEPS=$(wildcard $(SASS_DIR)/styles.scss $(SASS_DIR)/*.scss)

server:
	@ruby -run -e httpd ./public -p 8000

setup: ./package.json
	@npm install

assets: $(JS_BUNDLE)/bundle.js $(CSS_DIR)/styles.css

develop: $(SRC_DIR)
	@$(BIN)/watch "make assets" $<

$(JS_BUNDLE)/bundle.js: $(BROWSERIFY_DEPS)
	@$(BIN)/browserify $< -o $@

$(CSS_DIR)/styles.css: $(SASS_DEPS)
	@$(BIN)/node-sass $< -o $(CSS_DIR)
	@$(BIN)/postcss --use autoprefixer $@ -o $@

deploy:
	@git subtree push --prefix $(PUBLIC_DIR) origin gh-pages
