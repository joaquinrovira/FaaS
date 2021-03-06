const { MongoClient, ObjectID } = require("mongodb");
const zmq = require("zeromq");

class DBManager {

    constructor(bind_port) { this.bind_port = bind_port || 27444; }// Sets listening port.

    async connect(uri) {
        // Configure MongoClient location.
        this.uri = uri || 'mongodb://127.0.0.1:27017'
        this.client = new MongoClient(this.uri, { useUnifiedTopology: true });

        // If connection fails, retry until successful.
        while (!this.client.isConnected()) {
            try { await this.client.connect() }
            catch (err) { console.log(`[ERR] ${err.errmsg}, retrying...`) }
        }
        console.log(`[OK] Connected to MongoDB on <${this.uri}>`);

        // On successful connection, get references to tables and collections.
        const db = this.client.db('faas');
        this.users = db.collection('users');
        this.jobs = db.collection('jobs');

        // Setup ZeroMQ listener for requests.
        await this.init_comms();
    }

    close() {
        // Once the service finishes, stop the server gracefully.
        if (this.connected) this.client.close()
        this.socket.close()
    }

    // Setup communications
    async init_comms() {
        // Bind socket
        this.socket = new zmq.Router();
        await this.socket.bind(`tcp://\*:${this.bind_port}`);
        console.log(`[OK] DBManager listening on port ${this.bind_port}`);

        // Get valid function names, filtering out invalid function calls.
        const filter_out = ['constructor', 'connect', 'init_comms', 'loop_cooms', 'functions', '_validate_job_id']
        let functions = Object.getOwnPropertyNames(DBManager.prototype);
        functions = functions.filter((e) => !(filter_out.includes(e))).reduce((acc, curr) => (acc[curr] = 0, acc), {});// Convert to dict
        this.functions = functions;

        // Start message receive loop
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
            await process_msg(id, _f_name, _argv);
        }
    }

    //
    //  VALID REMOTE CALLS BELOW
    //

    // User calls
    async add_user(u_name) {
        const query = { name: u_name };
        const update = { $set: { name: u_name, functions: {}, execution_time_ms: 0 } };
        const options = { upsert: true };// Create new if not exists

        let res = await this.users.updateOne(query, update, options);
        console.log(`[OK] User <${u_name}> added.`)
        return res.result.ok
    }
    async remove_user(u_name) {
        const query = { name: u_name };

        let res = await this.users.deleteOne(query);
        console.log(`[OK] User <${u_name}> removed.`)
        return res.result.ok
    }
    async add_execution_time_ms(u_name, _execution_time_ms) {
        const execution_time_ms = parseFloat(_execution_time_ms);
        const query = { name: u_name };
        const update = { $inc: { execution_time_ms } };

        let res = await this.users.updateOne(query, update);
        console.log(`[OK] User <${u_name}> added <${execution_time_ms}>ms.`)
        return res.result.ok
    }
    async get_execution_time_ms(u_name) {
        const query = { name: u_name };

        let res = await this.users.findOne(query);
        if (!res) throw `[ERR] User <${u_name}> does not exist.`
        console.log(`[OK] User <${u_name}>'s functions found.`)
        return res && res.execution_time_ms
    }

    // Function calls
    async get_user_functions(u_name) {
        const query = { name: u_name };

        let res = await this.users.findOne(query);
        if (!res) throw `[ERR] User <${u_name}> does not exist.`
        console.log(`[OK] User <${u_name}>'s functions found.`)
        return res && res.functions

    }

    async get_user_function(u_name, f_name) {
        await this.get_user_functions(u_name);// Verify user exists.

        const query = { name: u_name, [`functions.${f_name}`]: { $exists: true } };

        let res = await this.users.findOne(query);
        if (!res) throw `[ERR] User function <${f_name}> does not exist.`
        console.log(`[OK] User <${u_name}>'s functions found.`)
        return res && { name: f_name, src: res.functions[f_name] }
    }

    async add_user_function(u_name, f_name, src) {
        await this.get_user_functions(u_name);// Verify user exists.

        const query = { name: u_name };
        const update = { $set: { [`functions.${f_name}`]: src } }

        let res = await this.users.updateOne(query, update);
        console.log(`[OK] Function <${f_name}> of user <${u_name}> added.`);
        return res.result.ok
    }

    async remove_user_function(u_name, f_name) {
        await this.get_user_functions(u_name);// Verify user exists.

        const query = { name: u_name };
        const update = { $unset: { [`functions.${f_name}`]: '' } }

        let res = await this.users.updateOne(query, update);
        console.log(`[OK] Function <${f_name}> of user <${u_name}> removed.`);
        return res.result.ok
    }

    // Job calls
    async add_job(u_name, f_name, _argv) {
        await this.get_user_function(u_name, f_name) // Verify user and function exist.
        let argv
        try {
            argv = Array.isArray(_argv) ? _argv : JSON.parse(_argv)
        } catch (err) {
            throw `[ERR] Invalid argv (${_argv}) - invalid JSON`
        }

        if (!Array.isArray(argv)) throw `[ERR] Invalid argv (${_argv}) - not an array`

        let res = await this.jobs.insertOne({ u_name, f_name, argv, status: 0, timestamp: Date.now() })
        if (!res.result.ok) console.log(`[ERR] Job for <${f_name}> of <${u_name}> not added.`)
        else console.log(`[OK] Job for <${f_name}> of <${u_name}> added. (${res.insertedId})`);
        return res.insertedId
    }
    async get_current_jobs() {
        const query = { status: 0 }
        let res = await this.jobs.find(query);
        return res.toArray()
    }

    _validate_job_id(job_id) {
        try {
            if (typeof job_id === 'undefined') throw 0;
            return ObjectID(job_id)
        } catch (err) { throw `[ERR] Invalid job_id (${job_id})` }
    }
    async get_job(job_id) {
        const id = this._validate_job_id(job_id)

        const query = { _id: id };
        let res = await this.jobs.findOne(query);
        if (!res) console.log(`[ERR] Job ${job_id} not found.`)
        else console.log(`[OK] Job ${job_id} found.`);
        return res
    }
    async remove_job(job_id) {
        const id = this._validate_job_id(job_id)

        const query = { _id: id };
        let res = await this.jobs.deleteOne(query);
        if (!res.result.ok) console.log(`[ERR] Job ${job_id} not deleted.`)
        else console.log(`[OK] Job ${job_id} deleted.`);
        return res.result.n
    }
    async get_job_status(job_id) {
        const id = this._validate_job_id(job_id)

        let job = await this.get_job(id);
        if (job) return job.status;
    }
    async get_job_result(job_id) {
        const id = this._validate_job_id(job_id)

        let job = await this.get_job(id);
        if (job) return job.result;
    }
    async set_job_result(job_id, result) {
        const id = this._validate_job_id(job_id)

        const query = { _id: id };
        const update = { $set: { result, timestamp: Date.now() } }

        let res = await this.jobs.updateOne(query, update);
        if (!res) console.log(`[ERR] Job ${job_id} not updated.`)
        else console.log(`[OK] Job ${job_id} updated.`);
        return res.result.nModified;
    }
    async set_job_status(job_id, status) {
        const id = this._validate_job_id(job_id)

        const query = { _id: id };
        const update = { $set: { status: Number(status), timestamp: Date.now() } }

        let res = await this.jobs.updateOne(query, update);
        if (!res) console.log(`[ERR] Job ${job_id} not updated.`)
        else console.log(`[OK] Job ${job_id} updated.`);
        return res.result.nModified;
    }
    async set_job(job_id, status, result) {
        const id = this._validate_job_id(job_id)

        const query = { _id: id };
        const update = { $set: { status: Number(status), result, timestamp: Date.now() } }

        let res = await this.jobs.updateOne(query, update);
        if (!res) console.log(`[ERR] Job ${job_id} not updated.`)
        else console.log(`[OK] Job ${job_id} updated.`);
        return res.result.nModified;
    }
    async reset_db() {
        await this.users.drop()
        await this.jobs.drop()
        console.log(`[OK] All collections deleted.`)
        return 1;
    }
}

module.exports = DBManager

// Execute only if not being require()-d (OPTIONAL)
if (require.main === module) {
    const dbm = new DBManager();
    dbm.connect()
}
