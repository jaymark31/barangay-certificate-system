const { pool } = require('./src/config/db');

async function checkCertTypes() {
    try {
        const result = await pool.query('SELECT id, name, template_content FROM certificate_types');
        console.log(JSON.stringify(result.rows, null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        pool.end();
    }
}

checkCertTypes();
