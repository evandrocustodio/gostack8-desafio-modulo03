import express from 'express';
import router from './app/router';

import './database';

class App {
  constructor() {
    this.server = express();
    this.applyMiddlewares();
    this.applyRoutes();
  }

  applyMiddlewares() {
    this.server.use(express.json());
  }

  applyRoutes() {
    this.server.use(router);
  }
}

export default new App().server;
