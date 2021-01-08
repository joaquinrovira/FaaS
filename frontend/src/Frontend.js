const express = require("express");
const DBManagerProxy = require("../lib/DBManagerProxy")
const JQManagerProxy = require("../lib/JQManagerProxy")

class Frontend {
    constructor(port, db_url, jq_url) {
        const DB_URL = db_url || "tcp://127.0.0.1:27444";
        this.dbm = new DBManagerProxy(DB_URL)
        console.log(`[OK] Connected to DBManager on <${DB_URL}>`)

        const JQ_URL = jq_url || "tcp://127.0.0.1:27445";
        this.jqm = new JQManagerProxy(JQ_URL)
        console.log(`[OK] Connected to JQManager on <${JQ_URL}>`)

        const PORT = port || 8080;
        const app = express();
        this.app = app;
        this.app.use((req, res, next) => {
            console.log(req.originalUrl);
            next()
        })
        this.init_routes()
        this.server = app.listen(PORT, () => {
            console.log(`Frontend listening on port ${PORT}`);
        })
    }

    close() {
        this.server.close()
    }

    init_routes() {
        const dbm = this.dbm;
        const jqm = this.jqm
        const app = this.app;

        app.use('/u/:u_name/fn/:f_name', express.text({ type: '*/*' }))
        app.use('/u/:u_name/fn/:f_name/run', express.json({ type: '*/*' }))

        // User routes
        app.post('/u/:u_name', async function (req, res) {
            let response = await dbm.add_user(req.params.u_name);
            res.send(response);
        });
        app.delete('/u/:u_name', async function (req, res) {
            let response = await dbm.remove_user(req.params.u_name);
            res.send(response);
        });

        // Function routes
        app.get('/u/:u_name/fn', async function (req, res) {
            let response = await dbm.get_user_functions(req.params.u_name);
            res.send(response);
        })
        app.get('/u/:u_name/fn/:f_name', async function (req, res) {
            let response = await dbm.get_user_function(req.params.u_name, req.params.f_name);
            res.send(response);
        })
        app.post('/u/:u_name/fn/:f_name', async function (req, res) {
            let response = await dbm.add_user_function(req.params.u_name, req.params.f_name, req.body);
            res.send(response);
        })
        app.delete('/u/:u_name/fn/:f_name', async function (req, res) {
            let response = await dbm.remove_user_function(req.params.u_name, req.params.f_name);
            res.send(response);

        })

        // Job routes
        app.post('/u/:u_name/fn/:f_name/run', async function (req, res) {
            let response = await jqm.queue(req.params.u_name, req.params.f_name, req.body);
            res.send(response);
        })
        app.get('/j/:job_id', async function (req, res) {
            let response = await dbm.get_job_status(req.params.job_id);
            res.send(response);
        })
        app.get('/j/:job_id/res', async function (req, res) {
            let response = await dbm.get_job_result(req.params.job_id);
            res.send(response);
        })
        app.delete('/j/:job_id', async function (req, res) {
            let response = await jqm.dequeue(req.params.job_id);
            res.send(response);
        })

        // If no route, send 404
        app.use(function (_, res) {
            res.sendStatus(404);
        });
    }
}

module.exports = Frontend

// Execute only if not being require()-d
if (require.main === module) {
    const fe = new Frontend();
}