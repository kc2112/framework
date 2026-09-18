import { createApp } from '@doc-ingest/express-app';
import { buildResponse } from './handlers.js';

export const serviceName = 'stage-7';

export function createServiceApp() {
  const app = createApp(serviceName, (router) => {
    router.post('/stage-7', (req, res, next) => {
      try {
        res.json(buildResponse(req.body ?? {}));
      } catch (err) {
        next(err);
      }
    });
  });
  app.set('service', serviceName);
  return app;
}
