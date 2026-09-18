import { createApp } from '@doc-ingest/express-app';
import { validateDocument } from './handlers.js';

export const serviceName = 'stage-1';

export function createServiceApp() {
  const app = createApp(serviceName, (router) => {
    router.post('/stage-1', (req, res, next) => {
      try {
        res.json(validateDocument(req.body ?? {}));
      } catch (err) {
        next(err);
      }
    });
  });
  app.set('service', serviceName);
  return app;
}
