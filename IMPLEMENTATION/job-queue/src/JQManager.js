const zmq = require("zeromq");
const DBManagerProxy = require("../lib/DBManagerProxy")


class JQManager {

    constructor(bind_port) {
        this.job_list = [];                     // Initializes job list to an empty array.
        this.bind_port = bind_port || 27445;    // Sets listening port.
    }

    async connect(db_url) {
        // Connect to the database manager (DBManager) service.
        const DB_URL = db_url || "tcp://127.0.0.1:27444";
        this.dbm = new DBManagerProxy(DB_URL)
        console.log(`[OK] Connected to DBManager on <${DB_URL}>`)

        // Get the current job list from the DBManager. 
        this.job_list = (await this.dbm.get_current_jobs()).res;

        // Setup ZeroMQ listener for requests.
        await this.init_comms();
        console.log(`[OK] Ready with <${this.job_list.length}> job(s).`)
    }

    close() {
        // Once the service finishes, stop the server gracefully.
        this.socket.close()
    }

    // Communications
    async init_comms() {
        // Bind socket
        this.socket = new zmq.Router();
        await this.socket.bind(`tcp://\*:${this.bind_port}`);
        console.log(`[OK] JQManager listening on port ${this.bind_port}`);

        // Valid remote function calls stored as dictionary
        this.functions = { queue: '', dequeue: '', get_job: '' };

        // Message receive loop
        this.loop_cooms()
    }

    async loop_cooms() {
        // Once a message is received, execute the relevant function from this.functions
        // Arrow function to mainain closure
        let process_msg = async (id, _f_name, _argv) => {
            let f_name = _f_name.toString()
            let argv = _argv.map((arg) => arg.toString())
            let response = { error: null, res: null }

            // If function not in the valid functions set, send back an error.
            if (!(f_name in this.functions)) {
                response.res = `[ERR] Invalid remote call [${f_name}(${argv})]`
                response.error = true
                console.log(response.res);
            } else {
                // If it's a valid remote call, execute it
                console.log(`[OK] Remote call [${f_name}(${argv})]`);
                try {
                    // Execute command
                    response.res = await this[f_name](...argv)
                    response.error = false
                } catch (err) {
                    // If any error occurs during function execution, return the message error.
                    response.res = err.toString()
                    response.error = true
                }
            }
            // Send back the result of the function call.
            this.socket.send([id, '', JSON.stringify(response)])
        }

        // For every message received, process it.
        for await (const [id, _, _f_name, ..._argv] of this.socket) {
            process_msg(id, _f_name, _argv);
        }
    }

    //
    //  VALID REMOTE CALLS BELOW
    //

    async queue(u_name, f_name, argv) {
        let response = await this.dbm.add_job(u_name, f_name, argv);
        if (response.error) throw response.res

        // Add job to list
        this.job_list.push(response.res)

        console.log(`[OK] Job for <${f_name}> of <${u_name}> added. (${response.res})`);
        return response.res
    }

    async dequeue(job_id) {
        // Remove job from local list
        const index = this.job_list.indexOf(job_id);
        if (index > -1) this.job_list.splice(index, 1);

        // Remove job from database
        let response = await this.dbm.remove_job(job_id);
        if (response.error) throw response.res

        console.log(`[OK] Job ${job_id} deleted.`);
        return response.res
    }

    async get_job() {
        let job = this.job_list.shift()
        console.log(`[OK] Sent ${typeof job === 'undefined' ? 0 : 1}, <${this.job_list.length}> job(s) left.`)
        return job;
    }
}

module.exports = JQManager

// Execute only if not being require()-d (OPTIONAL)
if (require.main === module) {
    const jq = new JQManager();
    jq.connect("tcp://127.0.0.1:27444")
}
