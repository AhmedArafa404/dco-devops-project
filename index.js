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
// Resource Optimization endpoint
app.get('/api/optimization', async (req, res) => {
  try {
    const prometheusUrl = 'http://prometheus:9090/api/v1/query';

    async function queryPrometheus(query) {
      const response = await fetch(
        `${prometheusUrl}?query=${encodeURIComponent(query)}`
      );

      const data = await response.json();

      if (!data.data.result.length) {
        throw new Error('No data returned from Prometheus');
      }

      return parseFloat(data.data.result[0].value[1]);
    }

    // EC2 CPU Usage
    const cpu = await queryPrometheus(
      '100 - (avg(rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)'
    );

    // EC2 Memory Usage
    const memory = await queryPrometheus(
      '100 * (1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes))'
    );

    // EC2 Disk Usage
    const disk = await queryPrometheus(
      '100 * (1 - (node_filesystem_avail_bytes{device="/dev/root",mountpoint="/"} / node_filesystem_size_bytes{device="/dev/root",mountpoint="/"}))'
    );

    let status = 'OPTIMAL';
    let recommendation = 'Current resource allocation looks appropriate.';

    if (cpu < 20 && memory < 50) {
      status = 'OVER_PROVISIONED';
      recommendation =
        'CPU and memory usage are low. Consider using a smaller EC2 instance to reduce cloud cost.';
    } else if (cpu > 80 || memory > 85) {
      status = 'UNDER_PROVISIONED';
      recommendation =
        'Resource utilization is high. Consider upgrading the EC2 instance.';
    } else if (cpu < 20 && memory >= 50) {
      status = 'MEMORY_CONSTRAINED';
      recommendation =
        'CPU usage is low but memory usage is significant. Downsizing is not currently recommended.';
    }

    res.json({
      status,
      metrics: {
        cpu_usage_percent: Number(cpu.toFixed(2)),
        memory_usage_percent: Number(memory.toFixed(2)),
        disk_usage_percent: Number(disk.toFixed(2))
      },
      recommendation,
      analyzed_at: new Date().toISOString()
    });

  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`DCO app listening on port ${PORT}`);
  });
}

module.exports = app;
