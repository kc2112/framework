import { createServiceApp } from './app.js';
createServiceApp().listen(Number(process.env.PORT ?? 3003), () => {
  process.stdout.write('stage-3 listening\n');
});
