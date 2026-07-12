const express = require('express');
const os = require('os');
const metrics = require('./metrics');
const app = express();
app.use(express.static('public'));
const PORT = process.env.PORT || 3000;
const START_TIME = new Date();

// Root endpoint - returns basic info about the running instance/container
// Useful to visually confirm which deployment/container is serving the request
app.get('/api', (req, res) => {

  res.json({

    message:'DCO - DevOps-Enabled Cloud Resource Optimizer',

    status:'running',

    hostname: os.hostname(),

    platform: os.platform(),

    uptime_seconds: process.uptime().toFixed(2),

    started_at: START_TIME.toISOString(),

    current_time: new Date().toISOString()

  });

});

// Health check endpoint - used by CI/CD pipeline, load balancers,
// and monitoring tools to verify the app is alive
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    uptime_seconds: process.uptime().toFixed(2),
    memory: process.memoryUsage(),
    timestamp: new Date().toISOString()
  });
});
app.get("/api/system", (req, res) => {

    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();

    res.json({
        hostname: os.hostname(),
        platform: os.platform(),
        cpuCount: os.cpus().length,
        totalMemory: Math.round(totalMemory / 1024 / 1024),
        freeMemory: Math.round(freeMemory / 1024 / 1024),
        usedMemory: Math.round((totalMemory - freeMemory) / 1024 / 1024),
        loadAverage: os.loadavg(),
        uptime: Math.floor(os.uptime())
    });

});
app.get('/metrics', metrics);

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`DCO app listening on port ${PORT}`);
  });
}

module.exports = app;
