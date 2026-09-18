import { createApp } from '@doc-ingest/express-app';
import { storeMetadata } from './handlers.js';

export const serviceName = 'stage-3';

export function createServiceApp() {
  const app = createApp(serviceName, (router) => {
    router.post('/stage-3', (req, res, next) => {
      try {
        res.status(201).json(storeMetadata(req.body ?? {}));
      } catch (err) {
        next(err);
      }
    });
  });
  app.set('service', serviceName);
  return app;
}
