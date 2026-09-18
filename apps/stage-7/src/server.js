import { createServiceApp } from './app.js';
createServiceApp().listen(Number(process.env.PORT ?? 3006), () => {
  process.stdout.write('stage-7 listening\n');
});
