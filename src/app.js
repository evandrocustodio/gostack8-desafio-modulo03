import express from 'express';
import router from './app/router';
import path from 'path';

import './database';

class App {
  constructor() {
    this.server = express();
    this.applyMiddlewares();
    this.applyRoutes();
  }

  applyMiddlewares() {
    this.server.use(express.json());

    this.server.use(
      '/files',
      express.static(path.resolve(__dirname, '..', 'tmp', 'files'))
    );
  }

  applyRoutes() {
    this.server.use(router);
  }
}

export default new App().server;
