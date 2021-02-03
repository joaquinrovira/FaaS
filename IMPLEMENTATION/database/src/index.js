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

