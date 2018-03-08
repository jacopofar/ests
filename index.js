const http = require('http');
const fs = require('fs');
const port = 59742;
const maxLoggedRequestsPerMinute = 30;
const logFolder = 'log'
//could be a const, but I find it confusing
let requestCount = {};

setInterval(function resetRequestCount(){
  requestCount = {};
}, 60 * 1000);

const msToMidnight = () => {
  const now = new Date();
  // Date object for the next midnight
  const midNightDate = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
    0, 0, 0
  );
  return midNightDate.getTime() - now.getTime();
};

let logStream = null;

//close the log file, open a new one for a new day, every midnight
const changeLogfile = () => {
  if (logStream) logStream.end();
  const logFileName = logFolder + '/' + new Date().toISOString().substr(0, 10) + '.jsons'
  console.log(`Opening new log file ${logFileName}`);
  logStream = fs.createWriteStream(logFileName, { flags: 'a' });
  setTimeout(changeLogfile, msToMidnight());
};

changeLogfile();

const truncate = (str) => {
  if (!str) return undefined;
  if (str.length > 160)
    return str.substr(0, 160) + '...';
  else
    return str;
};

const requestHandler = (request, response) => {
  // Host, User-Agent, Referer, Accept-Language
  const ts = new Date().toISOString();
  const ip = request.headers["x-real-ip"] || request.connection.remoteAddress;
  if (typeof requestCount[ip] === 'undefined')
    requestCount[ip] = 1;
  else
    requestCount[ip]++;
  if (requestCount[ip] > maxLoggedRequestsPerMinute) {
    response.statusCode = 429;
    response.end('Too many requests');
    return;
  }
  const eventData = {
    ip,
    ts,
    url: truncate(request.url),
    host: truncate(request.headers["host"]),
    ua: truncate(request.headers["user-agent"]),
    ref: truncate(request.headers["referer"]),
    lang: truncate(request.headers["accept-language"]),
  };
  logLine = JSON.stringify(eventData);
  logStream.write(logLine + "\n");
  console.log(logLine);
  response.end('Hello');
};

const server = http.createServer(requestHandler)
console.log(`
---------------------------------------------------------
Welcome in ESTS - Embarrassingly Simple Tracking Service
---------------------------------------------------------
Will save logs in ${logFolder}, a file per day
Only ${maxLoggedRequestsPerMinute} requests per minute from the same IP will be accepted
Attempting to start the server at ${new Date().toISOString()}...
`);
server.listen(port, (err) => {
  if (err) {
    return console.error('Error starting the server:', err);
  }
  console.log(`Server is running and listening on ${port} 👍`);
});
