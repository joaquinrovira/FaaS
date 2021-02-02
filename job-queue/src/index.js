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

