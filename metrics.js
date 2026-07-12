const client = require("prom-client");

// Collect default Node.js metrics
client.collectDefaultMetrics();

const register = client.register;

module.exports = async (req, res) => {
    res.set("Content-Type", register.contentType);
    res.end(await register.metrics());
};
