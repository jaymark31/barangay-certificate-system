/**
 * Run a SQL migration file. Usage: node run-migration.js [migration-file]
 * Example: node run-migration.js migrations/001_create_uploaded_files.sql
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { pool } = require('./src/config/db');

const file = process.argv[2] || 'migrations/001_create_uploaded_files.sql';
const filePath = path.resolve(__dirname, file);

if (!fs.existsSync(filePath)) {
  console.error('File not found:', filePath);
  process.exit(1);
}

const sql = fs.readFileSync(filePath, 'utf8');

pool
  .query(sql)
  .then(() => {
    console.log('✅ Migration completed:', file);
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  })
  .finally(() => pool.end());
