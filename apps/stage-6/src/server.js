import { createServiceApp } from './app.js';
createServiceApp().listen(Number(process.env.PORT ?? 3005), () => {
  process.stdout.write('stage-6 listening\n');
});
