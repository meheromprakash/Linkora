import app from './app.js';
import { connectDB } from './config/db.js';
import { env } from './config/env.js';

const startServer = async () => {
  await connectDB();

  const PORT = env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Linkora Server running in ${env.NODE_ENV} mode on port ${PORT}`);
    console.log(`🔗 API Health: http://localhost:${PORT}/api/v1/health`);
  });
};

startServer();
