/**
 * This is the frontend service execution entrypoint.
 * It receives API petitions and handles them accordingly.
 * 
 * Connection parameters are passed in via environment variables:
 *
 *      DB_URL: Specifies the location and protocol of the database manager (DBManager) service.
 *              Must be a valid [ZeroMQ](https://zguide.zeromq.org/docs/) connection string.
 * 
 *      JQ_URL: Specifies the location and protocol of the job-queue manager (JQManager) service.
 *              Must be a valid [ZeroMQ](https://zguide.zeromq.org/docs/) connection string.
 * 
 *      PORT:   Specifies the PORT on which the frontend will listen.
 */

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