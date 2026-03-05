const db = require('./src/config/db');

async function clearGeneratedCerts() {
    try {
        console.log('🔄 Clearing generated certificate contents to force re-render with new template...');
        // This table stores the final rendered HTML for specific requests.
        // Clearing it forces the frontend to regenerate it using the new template.
        const result = await db.query('DELETE FROM certificates');
        console.log(`✅ Cleared ${result.rowCount} saved certificates.`);
    } catch (err) {
        console.error('❌ Error clearing certificates:', err);
    } finally {
        await db.pool.end();
    }
}

clearGeneratedCerts();
