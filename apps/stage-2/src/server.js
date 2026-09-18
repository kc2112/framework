import { createServiceApp } from './app.js';
createServiceApp().listen(Number(process.env.PORT ?? 3002), () => {
  process.stdout.write('stage-2 listening\n');
});
