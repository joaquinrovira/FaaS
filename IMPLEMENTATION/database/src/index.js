/**
 * This is the database manager service execution entrypoint.
 * It receives remote calls from the frontend, job-queue and workers and executes them against the MongoDB database and returns the result.
 *
 * Connection parameters are passed in via environment variables:
 *
 *      DB_URL: Specifies the location database (MongoDB) service.
 *              Must be a valid [MongoDB](https://docs.mongodb.com/manual/reference/connection-string/) connection string.
 *
 *      PORT:   Specifies the PORT on which the database manager will listen for ZeroMQ connections.
 */

const DBManager = require("./DBManager")

const DB_URL = process.env.DB_URL;
const PORT = process.env.PORT;

const dbm = new DBManager(PORT);
dbm.connect(DB_URL)

process.once('SIGINT', function () {
    console.log('SIGKILL received...');
    dbm.close();
});
process.once('SIGTERM', function () {
    console.log('SIGTERM received...');
    dbm.close();
});

