const zmq = require("zeromq");

class JQManagerProxy {
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