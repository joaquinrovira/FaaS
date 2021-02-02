const zmq = require("zeromq");

class DBManagerProxy {
    constructor(url) {
        this._socket = new zmq.Request();
        this._socket.connect(url)
    }

    // TODO: socket pool for managing multiple calls
    async _remote_call_function(params) {
        await this._socket.send(params);
        let response = await this._socket.receive()
        try {
            response = JSON.parse(response.toString())
        } catch (err) {
            console.log(`[ERR] Error parsing ${response.toString()} - ${err}`)
        }
        return response
    }
    // User calls
    async add_user(u_name) {
        return this._remote_call_function(['add_user', u_name]);
    }
    async remove_user(u_name) {
        return this._remote_call_function(['remove_user', u_name]);
    }

    // Function calls
    async get_user_functions(u_name) {
        return this._remote_call_function(['get_user_functions', u_name]);
    }
    async get_user_function(u_name, f_name) {
        return this._remote_call_function(['get_user_function', u_name, f_name]);
    }
    async add_user_function(u_name, f_name, src) {
        return this._remote_call_function(['add_user_function', u_name, f_name, src]);
    }
    async remove_user_function(u_name, f_name) {
        return this._remote_call_function(['remove_user_function', u_name, f_name]);
    }

    // Job calls
    async add_job(u_name, f_name, argv) {
        return this._remote_call_function(['add_job', u_name, f_name, argv]);
    }
    async get_current_jobs() {
        return this._remote_call_function(['get_current_jobs']);
    }
    async get_job(job_id) {
        return this._remote_call_function(['get_job', job_id]);
    }
    async remove_job(job_id) {
        return this._remote_call_function(['remove_job', job_id]);
    }
    async get_job_status(job_id) {
        return this._remote_call_function(['get_job_status', job_id]);
    }
    async set_job_status(job_id, status) {
        return this._remote_call_function(['set_job_status', job_id, status]);
    }
    async get_job_result(job_id) {
        return this._remote_call_function(['get_job_result', job_id]);
    }
    async set_job_result(job_id, result) {
        return this._remote_call_function(['set_job_result', job_id, result]);
    }
    async set_job(job_id, status, result) {
        return this._remote_call_function(['set_job', job_id, status, result]);
    }


}

module.exports = DBManagerProxy