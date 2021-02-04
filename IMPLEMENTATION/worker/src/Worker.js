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

            // If there are no jobs in queue, sleep for 1 second and restart loop.
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
                const fn = this.parseFunction(src);
                const context = { fn, argv: job.argv, result: undefined };
                const script = new vm.Script('result = fn(...argv)');
                script.runInNewContext(context);
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

    // https://gist.github.com/lamberta/3768814
    /* Parse a string function definition and return a function object. Does not use eval.
     * @param {string} str
     * @return {function}
     *
     * Example:
     *  var f = function (x, y) { return x * y; };
     *  var g = parseFunction(f.toString());
     *  g(33, 3); //=> 99
     */
    parseFunction(str) {
        var fn_body_idx = str.indexOf('{'),
            fn_body = str.substring(fn_body_idx + 1, str.lastIndexOf('}')),
            fn_declare = str.substring(0, fn_body_idx),
            fn_params = fn_declare.substring(fn_declare.indexOf('(') + 1, fn_declare.lastIndexOf(')')),
            args = fn_params.split(',');

        args.push(fn_body);

        function Fn() {
            //return Function.apply(this, args);
            return Function.apply(undefined, args); // Remove context from call
        }
        Fn.prototype = Function.prototype;

        return new Fn();
    }
}

module.exports = Worker

// Execute only if not being require()-d (OPTIONAL)
if (require.main === module) {
    const w = new Worker();
}
