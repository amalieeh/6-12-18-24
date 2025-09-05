// Deploy initialization script for Render
// This script runs database initialization when deploying to production

import { initializeDatabaseWithData } from './build/server/app/models/database.server.js';

console.log('🚀 Starting production database initialization...');

try {
  await initializeDatabaseWithData();
  console.log('✅ Production database initialization completed successfully');
  process.exit(0);
} catch (error) {
  console.error('❌ Production database initialization failed:', error);
  process.exit(1);
}
