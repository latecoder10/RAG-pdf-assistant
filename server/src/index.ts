import dotenv from 'dotenv';
dotenv.config();

import http from 'http';
import app from './server';

const PORT = Number(process.env.PORT || 4000);
const server = http.createServer(app);

server.listen(PORT, () => {
  console.log(`[server] listening on http://localhost:${PORT}`);
});
