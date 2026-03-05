const { pool } = require('./src/config/db');

async function alterDb() {
    try {
        await pool.query(`
      ALTER TABLE certificate_types 
      ADD COLUMN IF NOT EXISTS template_content TEXT, 
      ADD COLUMN IF NOT EXISTS template_fields JSONB;
    `);
        console.log("Migration successful");
    } catch (err) {
        console.error("Migration failed:", err);
    } finally {
        pool.end();
    }
}

alterDb();
