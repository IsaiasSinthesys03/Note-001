import { HttpServer } from './infrastructure/web/server.js';

const hostname = '127.0.0.1';
const port = 3000;

const server = new HttpServer();
server.start(port, hostname);
