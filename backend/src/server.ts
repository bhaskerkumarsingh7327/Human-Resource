import app from './app';
import { env } from './config/env';
import { testConnection } from './config/db';

async function bootstrap() {
  try {
    await testConnection();
    app.listen(env.port, () => {
      console.log(`🚀 HRMS API running on http://localhost:${env.port} [${env.nodeEnv}]`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
}

bootstrap();
