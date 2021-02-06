/**
 * This is the scaler service execution entrypoint.
 * It measures the overall service load and scales worker appropriately.
 * 
 * !!! START NOTE
 * A KUMORI_CREDENTIALS file must be located where the program is run. 
 * It should be created after deployment and it must follow the format "<KUMORI_USER>\n<KUMORI_PASS>".
 * !!! END NOTE
 *
 * Connection parameters are passed in via environment variables:
 *
 *      JQ_URL: Specifies the location and protocol of the job-queue manager (JQManager) service.
 *              Must be a valid [ZeroMQ](https://zguide.zeromq.org/docs/) connection string.
 */

const Scaler = require("./Scaler");
const fs = require("fs");

// Async wrapper to use async/await
const run = async () => {
    const JQ_URL = process.env.JQ_URL;

    // Wait for KUMORI_CRETENTIALS file
    let data;
    while (!data) {
        try {
            data = fs.readFileSync('KUMORI_CREDENTIALS');
        } catch (error) {
            console.log(`[ERR] Unable to read KUMORI_CREDENTIALS, retrying...`);
            await (new Promise((resolve) => { setTimeout(resolve, 1000); }));
        }
    }

    // Get user and password from the cretenials file
    const [KUMORI_USER, KUMORI_PASS] = data.toString().split('\n');
    console.log(`[OK] Read credentials -  user:${KUMORI_USER}, pass:${KUMORI_PASS}`);

    // Start the auto-scaler
    const s = new Scaler(JQ_URL, KUMORI_USER, KUMORI_PASS);

    process.once('SIGINT', function () {
        console.log('SIGKILL received...');
        s.close()
    });
    process.once('SIGTERM', function () {
        console.log('SIGTERM received...');
        s.close()
    });

}
run()