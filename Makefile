# Watch the file system. Re compile when folders change
watch:
	wr "make run" lib examples bin assets index.js

# Start live reload server used in dev
reload:
	live-reload --uri=./doc --delay=200

# Build example
run:
	node ./bin/entry.js --out=doc ./examples/intro.js

# Run http-server to avoid CORS
http:
	http-server doc
