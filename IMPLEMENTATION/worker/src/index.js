/**
 * This is the worker service execution entrypoint.
 * It receives API petitions and handles them accordingly.
 *
 * Connection parameters are passed in via environment variables:
 *
 *      DB_URL: Specifies the location and protocol of the database manager (DBManager) service.
 *              Must be a valid [ZeroMQ](https://zguide.zeromq.org/docs/) connection string.
 *
 *      JQ_URL: Specifies the location and protocol of the job-queue manager (JQManager) service.
 *              Must be a valid [ZeroMQ](https://zguide.zeromq.org/docs/) connection string.
 */

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
