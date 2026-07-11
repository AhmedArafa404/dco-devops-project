const test = require('node:test');
const assert = require('node:assert');
const http = require('node:http');
const app = require('../index.js');

test('GET /api/health returns 200 and status healthy', async () => {
  const server = app.listen(0);
  const { port } = server.address();

  await new Promise((resolve, reject) => {
    http.get(`http://127.0.0.1:${port}/api/health`, { agent: false }, (res) => {
      let data = '';

      res.on('data', (chunk) => (data += chunk));

      res.on('end', () => {
        try {
          assert.strictEqual(res.statusCode, 200);

          const body = JSON.parse(data);

          assert.strictEqual(body.status, 'healthy');

          resolve();
        } catch (err) {
          reject(err);
        } finally {
          server.close();
        }
      });
    }).on('error', reject);
  });
});

test('GET /api returns app info', async () => {
  const server = app.listen(0);
  const { port } = server.address();

  await new Promise((resolve, reject) => {
    http.get(`http://127.0.0.1:${port}/api`, { agent: false }, (res) => {
      let data = '';

      res.on('data', (chunk) => (data += chunk));

      res.on('end', () => {
        try {
          assert.strictEqual(res.statusCode, 200);

          const body = JSON.parse(data);

          assert.strictEqual(body.status, 'running');

          resolve();
        } catch (err) {
          reject(err);
        } finally {
          server.close();
        }
      });
    }).on('error', reject);
  });
});
