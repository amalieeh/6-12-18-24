#!/usr/bin/env node

// Simple database initialization script
import { initializeDatabaseWithData } from './app/models/database.server.ts';

console.log('🚀 Starting database initialization...');

initializeDatabaseWithData()
  .then(() => {
    console.log('✅ Database initialization completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  });
