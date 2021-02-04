/**
 * JQManagerProxy implementation with ZeroMQ.
 *
 * The proxy presents an asynchronous method interface of the JQManager.
 * Every remote method sends the request and parameters as a ZMQ message
 * and awaits response via the common function _remote_call_function(params)
 *
 * In order to execute calls in parallel it implements a socket pool.
 */

const zmq = require("zeromq");
const genericPool = require("generic-pool");

class JQManagerProxy {
    constructor(url) {
        // The constructor sets up a socket pool
        // https://github.com/coopernurse/node-pool
        const factory = {
            create: () => {
                const socket = new zmq.Request();
                socket.connect(url);
                return socket;
            },

            destroy: (socket) => { socket.disconnect(); }
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

    async queue(u_name, f_name, argv) { return await this._remote_call_function(['queue', u_name, f_name, argv]); }
    async dequeue(job_id) { return await this._remote_call_function(['dequeue', job_id]); }
    async get_job() { return await this._remote_call_function(['get_job']); }
}

module.exports = JQManagerProxy