import http from 'http';
import app from './app';
import { env } from './config/env';
import { setupSocketServer } from './realtime/socket-server';

const server = http.createServer(app);
setupSocketServer(server);

const startServer = () => {
  server.listen(env.PORT, () => {
    console.log(`🚀 Server with Socket.IO ready at http://localhost:${env.PORT}`);
  });
};

startServer();

