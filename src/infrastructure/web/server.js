import http from 'http';
import url from 'url';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { CheckParImparUseCase } from '../../application/use-cases/CheckParImparUseCase.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class HttpServer {
  constructor() {
    this.useCase = new CheckParImparUseCase();
    this.server = http.createServer(this.requestListener.bind(this));
  }

  async requestListener(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    const parsedUrl = url.parse(req.url, true);
    // Serve Swagger JSON
    if (parsedUrl.pathname === '/swagger.json' && req.method === 'GET') {
      const swaggerPath = path.join(__dirname, 'swagger.json');
      fs.readFile(swaggerPath, (err, data) => {
        if (err) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'No se pudo cargar swagger.json' }));
        } else {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(data);
        }
      });
      return;
    }
    // Serve Swagger UI static files
    if (parsedUrl.pathname.startsWith('/docs')) {
      let filePath = path.join(__dirname, 'swagger-ui', parsedUrl.pathname === '/docs' ? 'index.html' : parsedUrl.pathname.replace('/docs/', ''));
      if (parsedUrl.pathname === '/docs') {
        filePath = path.join(__dirname, 'swagger-ui', 'index.html');
      }
      fs.readFile(filePath, (err, data) => {
        if (err) {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('Not found');
        } else {
          const ext = path.extname(filePath);
          const contentType = ext === '.html' ? 'text/html' : ext === '.css' ? 'text/css' : ext === '.js' ? 'application/javascript' : 'application/octet-stream';
          res.writeHead(200, { 'Content-Type': contentType });
          res.end(data);
        }
      });
      return;
    }
    // Endpoint principal
    if (parsedUrl.pathname === '/check-parity' && req.method === 'GET') {
      const { number } = parsedUrl.query;
      try {
        const result = this.useCase.execute(number);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
      return;
    }
    // Not found
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
  }

  start(port = 3000, hostname = '127.0.0.1') {
    this.server.listen(port, hostname, () => {
      console.log(`Servidor escuchando en http://${hostname}:${port}`);
      console.log(`Swagger UI disponible en http://${hostname}:${port}/docs`);
    });
  }
}
