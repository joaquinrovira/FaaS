const { exec } = require('child_process');
const child_pty = require('child_pty');
const JQManagerProxy = require("../lib/JQManagerProxy");
const fs = require('fs');

class Scaler {
    constructor(jq_url, kumori_user, kumori_pass) {
        // Connect to the job-queue manager (JQManager) service.
        const JQ_URL = jq_url || "tcp://127.0.0.1:27445";
        this.jqm = new JQManagerProxy(JQ_URL);
        console.log(`[OK] Connected to JQManager on <${JQ_URL}>`)

        this.kumori_user = kumori_user;
        this.kumori_pass = kumori_pass;

        this.stop = false
        this.scaler_loop();

    }

    close() { this.stop = true; }

    async get_queue_length() { return await this.jqm.get_queue_length(); }

    async kumori_login() {
        process.stdout.write(`[OK] Attempting login...`)

        let outside_resolve;
        let outside_reject;

        const promise = new Promise((resolve, reject) => {
            outside_resolve = resolve;
            outside_reject = reject;
        })

        // Login to kumorictl
        const child = child_pty.spawn(`./bin/kumorictl`, ['login', this.kumori_user]);
        child.stdout.on('data', async (data) => {
            // When kumorictl asks for the password
            if (data.toString().includes('Password:')) {
                child.stdin.write(this.kumori_pass);
                child.stdin.write('\r\n');
            }

            // Wait for Login OK.
            if (data.toString().includes('Login OK.')) {
                process.stdout.write(`Done!\n`);
                outside_resolve(0);
            }
        })

        child.on("exit", () => { outside_reject('LOGIN FAILED'); })


        return await promise;
    }

    async get_current_workers() {
        await this.kumori_login();

        let outside_resolve;
        let outside_reject;

        const promise = new Promise((resolve, reject) => {
            outside_resolve = resolve;
            outside_reject = reject;
        })

        // Count 'wokrer' containers
        exec("./bin/kumorictl describe deployment joarosa.faas/faasdep | grep -c worker", (error, stdout, _) => {
            if (error) outside_reject(error.message);
            else outside_resolve(parseInt(stdout) - 1); // -1 because of role with name 'worker'
        });

        return await promise;
    }

    async update_deployment() {
        await this.kumori_login();

        let outside_resolve;
        let outside_reject;

        const promise = new Promise((resolve, reject) => {
            outside_resolve = resolve;
            outside_reject = reject;
        })

        // Update deployment
        exec("./bin/kumorictl update deployment joarosa.faas/faasdep --deployment ./manifests/deployment", (error, stdout, _) => {
            if (error) outside_reject(error.message);
            else outside_resolve();
        });

        return await promise;
    }

    async scaler_loop() {
        const QUEUE_MAX = 32;
        const QUEUE_MIN = 2;

        const WORKER_MAX = 64;
        const WORKER_MIN = 1;

        const MANIFEST_STRING = 'package num_workers\n#NUM_WORKERS:';

        // Control service worker amount
        while (!this.stop) {
            const current_queue_length = parseInt((await this.get_queue_length()).res);
            console.log(`[OK] Job queue length: ${current_queue_length}`);


            const current_workers = await this.get_current_workers();
            console.log('[OK] Current workers:', current_workers);

            if (isFinite(current_queue_length) && current_queue_length < QUEUE_MIN && current_workers > WORKER_MIN) {
                // Half worker pool with min value of 1
                fs.writeFileSync('manifests/variables/num_workers/manifest.cue', `${MANIFEST_STRING} ${parseInt(current_workers / 2)}`);
                await this.update_deployment();

            } else if (isFinite(current_queue_length) && current_queue_length > QUEUE_MAX && current_workers < WORKER_MAX) {
                // Double worker pool with max value of 64
                fs.writeFileSync('manifests/variables/num_workers/manifest.cue', `${MANIFEST_STRING} ${parseInt(current_workers * 2)}`);
                await this.update_deployment();
            }

            // Sleep for 15 seconds
            await (new Promise((resolve) => { setTimeout(resolve, 5000); }));
        }
    }
}

module.exports = Scaler
