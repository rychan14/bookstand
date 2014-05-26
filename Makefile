build: updateDependencies setupDB installMocha
.PHONY: build test updateDependencies setupDB

installMocha: .tmp.mocha

updateDependencies: .tmp.updeps

setupDB: .tmp.setupdb

.tmp.mocha:
	npm -g install mocha
	@touch .tmp.mocha

.tmp.updeps: package.json
	npm install
	@touch .tmp.updeps

.tmp.setupdb: setupDb.js
	mongo bookstand setupDb.js
	@touch .tmp.setupdb

test:
	mocha --reporter=nyan

spec:
	mocha --reporter=spec

clean:
	rm -rf node_modules
	rm .tmp.mocha
	rm .tmp.updeps
	rm .tmp.setupdb
