build: updateDependencies resetDB installMocha
.PHONY: build test updateDependencies resetDB

installMocha: .tmp.mocha

updateDependencies: .tmp.updeps

resetDB: .tmp.resetdb

.tmp.mocha:
	npm -g install mocha
	@touch .tmp.mocha

.tmp.updeps: package.json
	npm install
	@touch .tmp.updeps

.tmp.resetdb: meta/schema.sql
	psql -f meta/schema.sql
	@touch .tmp.resetdb

test: test/test.js
	mocha

clean:
	rm -rf node_modules
	rm .tmp.mocha
	rm .tmp.updeps
	rm .tmp.resetdb
