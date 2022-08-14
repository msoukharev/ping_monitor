const express = require('express');
const ping = require('ping');

const app = express();

const port = 3002;

app.get('/:host', async (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    const start = Date.now();
    const result = await ping.promise.probe(req.params.host);
    if (result.alive) {
        res.send({ 'alive': true, 'latency': (result.time), 'timestamp': start });
    } else {
        res.send({ 'alive': false })
    }
});

app.listen(port, () => {
    console.log(`Running ping server on port ${port}`);
});
