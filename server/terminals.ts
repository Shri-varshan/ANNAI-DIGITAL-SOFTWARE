import http from 'http';

export interface TerminalConfig {
  port: number;
  role: string;
  name: string;
  path: string;
}

export const TERMINALS: TerminalConfig[] = [
  { port: 3001, role: 'DESIGNER', name: 'Designer 01 (Dinesh - System 01)', path: '/designer-1' },
  { port: 3002, role: 'BILLING_OPERATOR', name: 'Cashier Counter (Praveen - Kallaa)', path: '/cashier' },
  { port: 3003, role: 'PRODUCTION_STAFF', name: 'Production Floor (Suresh - Machine RIP)', path: '/production' },
  { port: 3004, role: 'DESIGNER', name: 'Designer 02 (Anand - System 02)', path: '/designer-2' },
];

let terminalServers: http.Server[] = [];

export function startMultiTerminalListeners(targetPort = 3000) {
  // If already running, do not re-bind
  if (terminalServers.length > 0) return;

  console.log('\n======================================================');
  console.log('   ANNAI DIGITAL PRINTING — MULTI-TERMINAL NETWORK     ');
  console.log('======================================================');
  console.log(`   👑 Owner Dashboard:      http://localhost:${targetPort}/`);

  TERMINALS.forEach((term) => {
    try {
      const server = http.createServer((req, res) => {
        const options: http.RequestOptions = {
          hostname: '127.0.0.1',
          port: targetPort,
          path: req.url,
          method: req.method,
          headers: req.headers,
        };

        const proxyReq = http.request(options, (proxyRes) => {
          res.writeHead(proxyRes.statusCode || 200, proxyRes.headers);
          proxyRes.pipe(res, { end: true });
        });

        proxyReq.on('error', (err) => {
          res.writeHead(502, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end(`
            <div style="font-family: system-ui, sans-serif; padding: 40px; text-align: center; color: #1e293b;">
              <h2>Annai Digital Terminal: ${term.name}</h2>
              <p>Connecting to primary server at http://localhost:${targetPort}... (${err.message})</p>
              <p style="color: #64748b;">Please wait for the Vite dev server to finish starting.</p>
            </div>
          `);
        });

        req.pipe(proxyReq, { end: true });
      });

      // WebSocket Upgrade Proxy (for Vite HMR on all ports)
      server.on('upgrade', (req, socket, head) => {
        const proxyReq = http.request({
          hostname: '127.0.0.1',
          port: targetPort,
          path: req.url,
          method: req.method,
          headers: req.headers,
        });

        proxyReq.on('upgrade', (proxyRes, proxySocket, proxyHead) => {
          socket.write(
            `HTTP/1.1 101 Switching Protocols\r\n` +
              Object.entries(proxyRes.headers)
                .map(([k, v]) => `${k}: ${v}`)
                .join('\r\n') +
              '\r\n\r\n'
          );
          if (proxyHead && proxyHead.length) {
            socket.unshift(proxyHead);
          }
          proxySocket.pipe(socket);
          socket.pipe(proxySocket);
        });

        proxyReq.on('error', () => {
          socket.destroy();
        });

        proxyReq.end();
      });

      server.listen(term.port, '0.0.0.0', () => {
        console.log(`   🖥️  ${term.name.padEnd(40)} -> http://localhost:${term.port}/`);
      });

      server.on('error', (err: any) => {
        if (err.code === 'EADDRINUSE') {
          console.warn(`[Terminal] Port ${term.port} already in use; skipping.`);
        } else {
          console.error(`[Terminal] Error on port ${term.port}:`, err);
        }
      });

      terminalServers.push(server);
    } catch (err) {
      console.warn(`Failed to bind terminal port ${term.port}:`, err);
    }
  });

  console.log('======================================================\n');
}

export function stopMultiTerminalListeners() {
  terminalServers.forEach((srv) => srv.close());
  terminalServers = [];
}
