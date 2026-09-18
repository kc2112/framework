import { createApp } from '@doc-ingest/express-app';
import { storeHeaderData } from './handlers.js';

export const serviceName = 'stage-5';

export function createServiceApp() {
  const app = createApp(serviceName, (router) => {
    router.post('/stage-5', (req, res, next) => {
      try {
        res.status(201).json(storeHeaderData(req.body ?? {}));
      } catch (err) {
        next(err);
      }
    });
  });
  app.set('service', serviceName);
  return app;
}
