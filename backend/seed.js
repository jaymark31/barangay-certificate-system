const db = require('./src/config/db');
const bcrypt = require('bcrypt');

async function seed() {
    console.log('🌱 Seeding database with raw PG...');

    try {
        // 1. Create Admin
        const adminPassword = await bcrypt.hash('admin123', 10);
        const adminEmail = 'admin@barangay.gov.ph';

        // UPSERT style with raw SQL
        await db.query(`
      INSERT INTO users (full_name, email, password, role, contact_number, address)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (email) DO NOTHING
    `, ['System Administrator', adminEmail, adminPassword, 'ADMIN', '09123456789', 'Barangay Hall, Center City']);

        console.log('✅ Admin user checked/created');

        // 2. Certificate Types
        const types = [
            {
                name: 'Barangay Clearance',
                description: 'Used for general purposes like employment, identification, etc.',
                requiredFields: [
                    { name: 'purpose', type: 'string', label: 'Purpose of Request' },
                    { name: 'yearsOfResidency', type: 'number', label: 'Years of Residency' }
                ]
            },
            {
                name: 'Certificate of Residency',
                description: 'Proof of residency in the barangay.',
                requiredFields: [{ name: 'purpose', type: 'string', label: 'Purpose of Request' }]
            },
            {
                name: 'Certificate of Indigency',
                description: 'For individuals belonging to low-income families.',
                requiredFields: [{ name: 'purpose', type: 'string', label: 'Purpose of Request' }]
            },
            {
                name: 'Business Clearance',
                description: 'Requirement for business permits.',
                requiredFields: [
                    { name: 'businessName', type: 'string', label: 'Business Name' },
                    { name: 'businessAddress', type: 'string', label: 'Business Address' },
                    { name: 'typeOfBusiness', type: 'string', label: 'Type of Business' }
                ]
            },
            {
                name: 'Certificate of Good Moral',
                description: 'Proof of good standing as a resident.',
                requiredFields: [{ name: 'purpose', type: 'string', label: 'Purpose of Request' }]
            }
        ];

        for (const type of types) {
            await db.query(`
        INSERT INTO certificate_types (name, description, required_fields)
        VALUES ($1, $2, $3)
        ON CONFLICT DO NOTHING
      `, [type.name, type.description, JSON.stringify(type.requiredFields)]);
        }

        console.log('✅ Certificate types seeding complete');
        console.log('✨ Seeding finished successfully');
    } catch (err) {
        console.error('❌ Seeding error:', err);
    } finally {
        await db.pool.end();
    }
}

seed();
