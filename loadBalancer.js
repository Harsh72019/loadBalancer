const express = require('express');
const http = require('http');

const app = express();
const PORT = 3000; // Port load balancer listens on

// List of backend servers
const backends = [
  { host: 'localhost', port: 8080 },
  { host: 'localhost', port: 8081 },
  { host: 'localhost', port: 8082 }
];

let healthyBackends = [...backends];
let currentIndex = 0;

const HEALTH_CHECK_PATH = '/';
const HEALTH_CHECK_INTERVAL = 10000; // 10 seconds

// Round-robin algorithm to pick next healthy server
function getNextBackend() {
  if (healthyBackends.length === 0) return null;
  const backend = healthyBackends[currentIndex % healthyBackends.length];
  currentIndex = (currentIndex + 1) % healthyBackends.length;
  return backend;
}

// Forward request to chosen backend server
function forwardRequest(req, res, backend) {
  const options = {
    hostname: backend.host,
    port: backend.port,
    path: req.originalUrl,
    method: req.method,
    headers: req.headers,
  };

  const proxy = http.request(options, (proxyRes) => {
    res.status(proxyRes.statusCode);
    proxyRes.pipe(res, { end: true });
  });

  proxy.on('error', (err) => {
    console.error(`Proxy error: ${err.message}`);
    res.status(502).send('Bad Gateway');
  });

  req.pipe(proxy, { end: true });
}

// Express middleware
app.use((req, res) => {
  const backend = getNextBackend();

  if (!backend) {
    return res.status(503).send('Service Unavailable: No healthy backends');
  }

  console.log(`Forwarding request to ${backend.host}:${backend.port}`);
  forwardRequest(req, res, backend);
});

// Health Check Logic
function performHealthCheck() {
  backends.forEach((backend) => {
    const options = {
      hostname: backend.host,
      port: backend.port,
      path: HEALTH_CHECK_PATH,
      method: 'GET',
      timeout: 2000,
    };

    const req = http.request(options, (res) => {
      if (res.statusCode === 200) {
        if (!healthyBackends.find(b => b.port === backend.port)) {
          healthyBackends.push(backend);
          console.log(`✅ Backend ${backend.port} is back online`);
        }
      } else {
        healthyBackends = healthyBackends.filter(b => b.port !== backend.port);
        console.warn(`❌ Backend ${backend.port} is unhealthy`);
      }
    });

    req.on('error', () => {
      healthyBackends = healthyBackends.filter(b => b.port !== backend.port);
      console.warn(`❌ Backend ${backend.port} is down`);
    });

    req.end();
  });
}

// Start periodic health checks
setInterval(performHealthCheck, HEALTH_CHECK_INTERVAL);

// Start load balancer server
app.listen(PORT, () => {
  console.log(`🚀 Load balancer running on http://localhost:${PORT}`);
});
