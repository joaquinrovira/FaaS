const vm = require("vm");
const DBManagerProxy = require("../lib/DBManagerProxy");
const JQManagerProxy = require("../lib/JQManagerProxy");

class Worker {
    constructor(db_url, jq_url) {
        // Connect to the database manager (DBManager) service.
        const DB_URL = db_url || "tcp://127.0.0.1:27444";
        this.dbm = new DBManagerProxy(DB_URL);
        console.log(`[OK] Connected to DBManager on <${DB_URL}>`)

        // Connect to the job-queue manager (JQManager) service.
        const JQ_URL = jq_url || "tcp://127.0.0.1:27445";
        this.jqm = new JQManagerProxy(JQ_URL);
        console.log(`[OK] Connected to JQManager on <${JQ_URL}>`)

        // Initialize the worker loop
        this.stop = false;
        this.work_loop()
    }

    close() {
        this.stop = true;
    }

    async work_loop() {
        const dbm = this.dbm;
        const jqm = this.jqm;
        while (!this.stop) {
            // Request job from JQManager
            let response = await jqm.get_job();
            console.log('## Received job.')
            console.log("GET_JOB_JQ:", response)

            // If there are no jobs in queue, sleep and restart loop.
            if (typeof response.res === 'undefined') {
                await (new Promise((resolve) => { setTimeout(resolve, 2000); }));
                continue;
            }

            // Request job details from the DBManager
            const job_id = response.res;
            response = await dbm.get_job(job_id);
            console.log("GET_JOB_DB:", response)
            const job = response.res;// Job has format { _id, u_name, f_name }

            // Request function source from the DBManager
            response = await dbm.get_user_function(job.u_name, job.f_name);
            console.log("GET_FN:", response)
            const src = response.res.src

            // Execute job
            let result
            let [time_start_seconds, time_start_nano] = process.hrtime();// Measure execution time
            try {
                const vm_add_ons = { setTimeout, setTimeout, setInterval }
                const context = { argv: job.argv, result: undefined, promise: undefined, ...vm_add_ons };

                const script = new vm.Script(`
                const fn = ${src};
                promise = new Promise( async (resolve, reject)=>{
                    try{
                        result = await fn(...argv);
                        resolve(result)
                    } catch (error) { reject(error) }
                });
                `);

                //!!! NOTE: Does NOT run code securely
                script.runInNewContext(context, { timeout: 900000 });
                //!!! END NOTE

                await context.promise
                result = context.result;
            } catch (err) {
                result = err
            }
            let [time_end_seconds, time_end_nano] = process.hrtime();// Measure execution time
            let total_time = 1000 * (time_end_seconds - time_start_seconds) + (time_end_nano - time_start_nano) / 1000;
            dbm.set_job(job._id, 1, result);
            dbm.add_execution_time(job.u_name, total_time);
        }
    }
}

module.exports = Worker

// Execute only if not being require()-d (OPTIONAL)
if (require.main === module) {
    const w = new Worker();
}
