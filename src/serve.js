const http = require('http');
const path = require('path');
const fs = require('fs/promises');

const DEFAULT_SERVER_PORT = 3333;

class Server {
  constructor(content, stdout, port) {
    this.port = port || DEFAULT_SERVER_PORT;
    this.content = content;
    this.stdout = stdout;
  }

  start() {
    this.server = http.createServer((req, res) => this.serve(req, res));
    this.server.listen(this.port);
    this.stdout('Server is started on port %o', +this.port, { colors: true });

    const shutdown = () => {
      this.stop();
      process.exit(0);
    };

    process.on('SIGINT', shutdown);
    process.on('SIGQUIT', shutdown);
    process.on('SIGTERM', shutdown);
  }

  stop() {
    this.stdout('\nShutting down server');
    this.server.close();
  }

  static async isRouteValid(filePath) {
    try {
      await fs.stat(filePath);
      return true;
    } catch {
      return false;
    }
  }

  async serve(req, res) {
    const filePath = path.resolve(this.content, req.url.slice(1), 'index.html');

    if (!await Server.isRouteValid(filePath)) {
      res.statusCode = 404;
      res.end('Not found');
      return;
    }

    this.stdout('Request %o', req.url, { colors: true });
    res.end(await fs.readFile(filePath));
  }
}

module.exports = Server;
