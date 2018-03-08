# ESTS - Embarrassingly Simple Tracking Service
This small Node.js script without dependencies will log every HTTP request it get in a daily file, storing the IP, the URL, the timestamp and a bunch of headers(referral, language, host and user agent).

It will not log requests coming from the same IP if there are too many in a short time.

## How to run
Any version of Node.js after 6.0 should be OK. No dependencies, everythign sues the standard library.

`npm start` or `node index.js`, is the same.

There is no configuration, logs will be saved in the `log` folder and it listens on port __59742__

## How to run with Docker

For example to listen on port 9999
`docker run -p9999:59742 -v /your/log/folder:/opt/ests/log --name ests jacopofar/ests`

## FAQ

### Why this?
For when I want to track something very simple (page visitors, backend events) with the minimum hassle

### Can I configure it?
Nope