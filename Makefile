REQUIRED_FILES=app.js

build: $(REQUIRED_FILES) updateDependencies
  
serve: build
	node app.js

updateDependencies: package.json
	npm install

