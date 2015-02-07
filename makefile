js:
	node_modules/.bin/browserify -t riotify \
	  public/javascripts/main.js > public/javascripts/bundle.js

.PHONY: js
