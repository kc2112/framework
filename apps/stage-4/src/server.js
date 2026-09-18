import { createServiceApp } from './app.js';
createServiceApp().listen(Number(process.env.PORT ?? 3004), () => {
  process.stdout.write('stage-4 listening\n');
});
