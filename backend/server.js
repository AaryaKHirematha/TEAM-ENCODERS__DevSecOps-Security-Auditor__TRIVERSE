const express = require("express");
const cors = require("cors");
const scanRoutes = require("./routes/scanRoutes");
const { healthCheckService } = require('./src/monitoring/HealthCheckService');
const { queueService } = require('./src/queue/QueueService');
const { env } = require('./config/env');

const app = express();
const PORT = env.PORT || process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Global shutdown state
let isShuttingDown = false;

// Routes
app.use("/api", scanRoutes);

// Liveness Probe
app.get("/health/liveness", (_req, res) => {
  res.json({ status: "ok" });
});

// Readiness Probe
app.get("/health/readiness", async (_req, res) => {
  if (isShuttingDown) {
    return res.status(503).json({ status: "not_ready" });
  }

  // 1. Check Infrastructure
  const sysHealth = await healthCheckService.getSystemHealth();
  if (sysHealth.status === 'Unavailable') {
    return res.status(503).json({ status: "not_ready", details: sysHealth });
  }

  // 2. Evaluate Queue Backpressure
  const threshold = env.READINESS_QUEUE_THRESHOLD || process.env.READINESS_QUEUE_THRESHOLD || 0;
  if (threshold > 0) {
    const q = queueService.getQueue('scan');
    if (q) {
      const stats = await q.getStats();
      if (stats.queued >= threshold) {
         return res.status(503).json({ status: "not_ready" });
      }
    }
  }

  res.json({ status: "ready" });
});

// Legacy Health check (Keep for backward compatibility)
app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "SecAudit DevSecOps Scanner", uptime: process.uptime() });
});

// 404
app.use((_req, res) => {
  res.status(404).json({ error: "Endpoint not found" });
});

// Global error handler
app.use((err, _req, res, _next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

const server = app.listen(PORT, () => {
  console.log(`\n  SecAudit Backend running on http://localhost:${PORT}`);
  console.log(`  POST /api/scan — Submit a repo URL or ZIP for scanning`);
  console.log(`  GET  /health   — Health check\n`);
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.log(`⚠️  Port ${PORT} is busy, trying ${+PORT + 1}...`);
    server.listen(+PORT + 1);
  } else {
    console.error("Server error:", err);
    process.exit(1);
  }
});

// Graceful shutdown
const performShutdown = () => {
  if (isShuttingDown) return;
  isShuttingDown = true;
  console.log(`\n[server.js] Shutdown received. Closing server...`);
  server.close(() => {
    console.log('Server closed.');
  });
};

process.on('SIGINT', performShutdown);
process.on('SIGTERM', performShutdown);

module.exports = app;
