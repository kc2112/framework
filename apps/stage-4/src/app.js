import { createApp } from '@doc-ingest/express-app';
import { storeAclData } from './handlers.js';

export const serviceName = 'stage-4';

export function createServiceApp() {
  const app = createApp(serviceName, (router) => {
    router.post('/stage-4', (req, res, next) => {
      try {
        res.status(201).json(storeAclData(req.body ?? {}));
      } catch (err) {
        next(err);
      }
    });
  });
  app.set('service', serviceName);
  return app;
}
