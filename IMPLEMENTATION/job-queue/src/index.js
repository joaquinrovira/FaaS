/**
 * This is the job-queue manager service execution entrypoint.
 * It receives remote calls from the frontend and workers and handles the accordingly.
 *
 * Connection parameters are passed in via environment variables:
 *
 *      DB_URL: Specifies the location and protocol of the database manager (DBManager) service.
 *              Must be a valid [ZeroMQ](https://zguide.zeromq.org/docs/) connection string.
 *
 *      PORT:   Specifies the PORT on which the database manager will listen for ZeroMQ connections.
 */

const JQManager = require("./JQManager");

const DB_URL = process.env.DB_URL;
const PORT = process.env.PORT;

const jqm = new JQManager(PORT);
jqm.connect(DB_URL);

process.once('SIGINT', function () {
    console.log('SIGKILL received...');
    jqm.close()
});
process.once('SIGTERM', function () {
    console.log('SIGTERM received...');
    jqm.close()
});

