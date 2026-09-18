import { createServiceApp } from './app.js';
createServiceApp().listen(Number(process.env.PORT ?? 3007), () => {
  process.stdout.write('stage-5 listening\n');
});
