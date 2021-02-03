const Frontend = require("./Frontend")

const DB_URL = process.env.DB_URL;
const JQ_URL = process.env.JQ_URL;
const PORT = process.env.PORT;

const fe = new Frontend(PORT, DB_URL, JQ_URL);

process.once('SIGINT', function () {
    console.log('SIGKILL received...');
    fe.close()
});
process.once('SIGTERM', function () {
    console.log('SIGTERM received...');
    fe.close()
});