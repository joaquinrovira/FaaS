const zmq = require("zeromq");
const DBManagerProxy = require("../lib/DBManagerProxy")


class JQManager {

    constructor(bind_port) {
        this.job_list = [];
        this.bind_port = bind_port || 27445;
    }

    async connect(db_url) {
        const DB_URL = db_url || "tcp://127.0.0.1:27444";
        this.dbm = new DBManagerProxy(DB_URL)
        console.log(`[OK] Connected to DBManager on <${DB_URL}>`)

        this.job_list = (await this.dbm.get_current_jobs()).res;
        await this.init_comms();
        console.log(`[OK] Ready with <${this.job_list.length}> job(s).`)
    }

    close() {
        this.socket.close()
    }

    async queue(u_name, f_name, argv) {
        let response = await this.dbm.add_job(u_name, f_name, argv);
        if (response.error) throw response.res

        // Add job to list
        this.job_list.push(response.res)

        console.log(`[OK] Job for <${f_name}> of <${u_name}> added. (${response.res})`);
        return response.res
    }

    async dequeue(job_id) {
        // Remove job from list
        const index = this.job_list.indexOf(5);
        if (index > -1) this.job_list.splice(index, 1);

        let response = await this.dbm.remove_job(job_id);
        if (response.error) throw response.res

        console.log(`[OK] Job ${job_id} deleted.`);
        return response.res
    }

    get_job() {
        let job = this.job_list.shift()
        console.log(`[OK] Sent ${typeof job === 'undefined' ? 0 : 1}, <${this.job_list.length}> job(s) left.`)
        return job;
    }

    // Communications
    async init_comms() {
        // Bind socket
        this.socket = new zmq.Router();
        await this.socket.bind(`tcp://\*:${this.bind_port}`);
        console.log(`[OK] JQManager listening on port ${this.bind_port}`);

        // Get valid function names
        this.functions = { queue: '', dequeue: '', get_job: '' };

        // Message receive loop
        this.loop_cooms()
    }

    async loop_cooms() {
        // Arrow function to mainain closure
        let process_msg = async (id, _f_name, _argv) => {
            let f_name = _f_name.toString()
            let argv = _argv.map((arg) => arg.toString())
            let response = { error: null, res: null }

            if (!(f_name in this.functions)) {
                response.res = `[ERR] Invalid remote call [${f_name}(${argv})]`
                response.error = true
                console.log(response.res);
            } else {
                console.log(`[OK] Remote call [${f_name}(${argv})]`);
                try {
                    // Execute command
                    response.res = await this[f_name](...argv)
                    response.error = false
                } catch (err) {
                    response.res = err.toString()
                    response.error = true
                }
            }
            this.socket.send([id, '', JSON.stringify(response)])
        }

        for await (const [id, _, _f_name, ..._argv] of this.socket) {
            process_msg(id, _f_name, _argv);
        }
    }
}

module.exports = JQManager

// Execute only if not being require()-d
if (require.main === module) {
    const jq = new JQManager();
    jq.connect("tcp://127.0.0.1:27444")
}
