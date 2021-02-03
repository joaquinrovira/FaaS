const zmq = require("zeromq");

class JQManagerProxy {
    constructor(url) {
        const factory = {
            create: () => {
                const socket = new zmq.Request();
                socket.connect(url);
                return socket;
            },

            destroy: (socket) => {
                socket.disconnect();
            }
        }

        const opts = {
            max: 10,
            min: 2
        }

        this._socket_pool = genericPool.createPool(factory, opts);
    }

    // TODO: socket pool for managing multiple calls
    async _remote_call_function(params) {
        const socket = await this._socket_pool.acquire(); // Acquire socket from pool

        await socket.send(params);
        let response = await socket.receive(); // Release socket to pool 

        this._socket_pool.release(socket);
        try {
            response = JSON.parse(response.toString())
        } catch (err) {
            console.log(`[ERR] Error parsing ${response.toString()} - ${err}`)
        }
        return response
    }
    // User calls
    async queue(u_name, f_name, argv) {
        return this._remote_call_function(['queue', u_name, f_name, argv]);
    }
    async dequeue(job_id) {
        return this._remote_call_function(['dequeue', job_id]);
    }
    async get_job() {
        return this._remote_call_function(['get_job']);
    }
}

module.exports = JQManagerProxy