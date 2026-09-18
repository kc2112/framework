import { createApp } from '@doc-ingest/express-app';
import { validateStorage } from './handlers.js';

export const serviceName = 'stage-6';

export function createServiceApp() {
  const app = createApp(serviceName, (router) => {
    router.post('/stage-6', (req, res, next) => {
      try {
        res.json(validateStorage(req.body ?? {}));
      } catch (err) {
        next(err);
      }
    });
  });
  app.set('service', serviceName);
  return app;
}
