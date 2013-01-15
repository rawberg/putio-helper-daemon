## Test Runner
MOCHA_OPTS= -t 5000
REPORTER = spec

check: test

test:
	@NODE_ENV=test \
	./node_modules/.bin/mocha \
		--reporter $(REPORTER) \
		$(MOCHA_OPTS)

.PHONY: test