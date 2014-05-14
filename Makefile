REQUIRED_FILES=app.js

build: $(REQUIRED_FILES) updateDependencies resetDB

updateDependencies: package.json
	npm install

resetDB: meta/schema.sql
	psql -f meta/schema.sql
