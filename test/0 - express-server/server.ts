import * as express from 'express';
import routes from './routes';

// eslint-disable-next-line
export const createServer = () => {
  const app = express();

  app.use('/', routes);

  return app;
};

console.log(createServer);
