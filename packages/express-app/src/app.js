import express from 'express';

/**
 * @param {string} name
 * @param {(router: import('express').Router) => void} mount
 */
export function createApp(name, mount) {
  const app = express();
  app.use(express.json({ limit: '64kb' }));
  app.get('/health', (_req, res) => {
    res.json({ ok: true, service: name });
  });
  const router = express.Router();
  mount(router);
  app.use(router);
  app.use((err, _req, res, _next) => {
    const status = err.statusCode ?? 500;
    res.status(status).json({
      error: status === 500 ? 'Internal server error' : err.message,
      service: name,
    });
  });
  return app;
}

export function listen(app, port) {
  return app.listen(port, () => {
    process.stdout.write(`${app.get('service') ?? 'api'} listening on ${port}\n`);
  });
}
