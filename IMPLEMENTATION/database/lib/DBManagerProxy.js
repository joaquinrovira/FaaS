/**
 * DBManagerProxy implementation with ZeroMQ.
 * 
 * The proxy presents an asynchronous method interface of the DBManager.
 * Every remote method sends the request and parameters as a ZMQ message
 * and awaits response via the common function _remote_call_function(params)
 * 
 * In order to execute calls in parallel it implements a socket pool.
 */

const zmq = require("zeromq");
const genericPool = require("generic-pool");

class DBManagerProxy {
    constructor(url) {
        // The constructor sets up a socket pool
        // https://github.com/coopernurse/node-pool
        const factory = {
            create: () => {
                const socket = new zmq.Request();
                socket.connect(url);
                return socket;
            },

            destroy: (socket) => { socket.disconnect() }
        }

        const opts = { max: 10, min: 2 }

        this._socket_pool = genericPool.createPool(factory, opts);
    }

    async _remote_call_function(params) {
        const socket = await this._socket_pool.acquire(); // Acquire socket from pool

        // Request remote execution and await result
        await socket.send(params);
        let response = await socket.receive();

        this._socket_pool.release(socket); // Release socket to pool

        // Parse response as JSON and return
        try {
            response = JSON.parse(response.toString())
        } catch (err) {
            console.log(`[ERR] Error parsing ${response.toString()} - ${err}`)
        }
        return response
    }

    // User calls
    async add_user(u_name) { return await this._remote_call_function(['add_user', u_name]); }
    async remove_user(u_name) { return await this._remote_call_function(['remove_user', u_name]); }
    async add_execution_time(u_name, execution_time_ms) { return await this._remote_call_function(['add_execution_time_ms', u_name, execution_time_ms]); }
    async get_execution_time_ms(u_name) { return await this._remote_call_function(['get_execution_time_ms', u_name]); }

    // Function calls
    async get_user_functions(u_name) { return await this._remote_call_function(['get_user_functions', u_name]); }
    async get_user_function(u_name, f_name) { return await this._remote_call_function(['get_user_function', u_name, f_name]); }
    async add_user_function(u_name, f_name, src) { return await this._remote_call_function(['add_user_function', u_name, f_name, src]); }
    async remove_user_function(u_name, f_name) { return await this._remote_call_function(['remove_user_function', u_name, f_name]); }

    // Job calls
    async add_job(u_name, f_name, argv) { return await this._remote_call_function(['add_job', u_name, f_name, argv]); }
    async get_current_jobs() { return await this._remote_call_function(['get_current_jobs']); }
    async get_job(job_id) { return await this._remote_call_function(['get_job', job_id]); }
    async remove_job(job_id) { return await this._remote_call_function(['remove_job', job_id]); }
    async get_job_status(job_id) { return await this._remote_call_function(['get_job_status', job_id]); }
    async set_job_status(job_id, status) { return await this._remote_call_function(['set_job_status', job_id, status]); }
    async get_job_result(job_id) { return await this._remote_call_function(['get_job_result', job_id]); }
    async set_job_result(job_id, result) { return await this._remote_call_function(['set_job_result', job_id, result]); }
    async set_job(job_id, status, result) { return await this._remote_call_function(['set_job', job_id, status, result]); }
}

module.exports = DBManagerProxy