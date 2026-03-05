const db = require('./src/config/db');

const newTemplate = `<div class="certificate">
  <div class="header">
    <img src="/barangay-logo.jpg" alt="Barangay Logo" class="logo" />
    <div class="header-text">
        <p>Republic of the Philippines</p>
        <p>Province of {{province}}</p>
        <p>Municipality of {{municipality}}</p>
        <h2>{{barangay_name}}</h2>
        <p>Office of the Barangay Captain</p>
    </div>
  </div>

  <h1 class="title">{{certificate_title}}</h1>

  <div class="body">
    <p>
      TO WHOM IT MAY CONCERN:
    </p>

    <p>
      This is to certify that <strong>{{full_name}}</strong>,
      of legal age, and a resident of {{address}},
      is known to be a bona fide resident of this Barangay.
    </p>

    <p>
      This certification is issued upon request of the above-named person
      for the purpose of {{purpose}}.
    </p>

    <p>
      Issued this {{date_issued}} at {{barangay_name}}.
    </p>
  </div>

  <div class="footer">
    <br/><br/>
    <div style="text-align:right;">
      <strong>{{captain_name}}</strong><br/>
      Barangay Captain
    </div>
  </div>
</div>`;

async function updateAllCertTemplates() {
    try {
        console.log('🔄 Updating all certificate types with the official logo template...');
        const result = await db.query(
            'UPDATE certificate_types SET template_content = $1',
            [newTemplate]
        );
        console.log(`✅ Updated ${result.rowCount} certificate types.`);
    } catch (err) {
        console.error('❌ Update error:', err);
    } finally {
        await db.pool.end();
    }
}

updateAllCertTemplates();
