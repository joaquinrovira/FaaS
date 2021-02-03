const Worker = require("./Worker");

const DB_URL = process.env.DB_URL;
const JQ_URL = process.env.JQ_URL;

const w = new Worker(DB_URL, JQ_URL);

process.once('SIGINT', function () {
    console.log('SIGKILL received...');
    w.close()
});
process.once('SIGTERM', function () {
    console.log('SIGTERM received...');
    w.close()
});
