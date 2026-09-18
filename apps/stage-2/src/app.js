import { createApp } from '@doc-ingest/express-app';
import { storeDocument } from './handlers.js';

export const serviceName = 'stage-2';

export function createServiceApp() {
  const app = createApp(serviceName, (router) => {
    router.post('/stage-2', (req, res, next) => {
      try {
        res.status(201).json(storeDocument(req.body ?? {}));
      } catch (err) {
        next(err);
      }
    });
  });
  app.set('service', serviceName);
  return app;
}
