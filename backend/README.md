# BCMS Backend - Barangay Certificate Management System

This is the backend for the Barangay Certificate Management System, built with Node.js, Express, and PostgreSQL (using `pg` client).

## 🚀 Getting Started

### 1. Configure the Environment
Open the `.env` file in the `backend` directory and update the `DATABASE_URL` with your PostgreSQL connection string.

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/bcms_db"
```

### 2. Install Dependencies
```bash
cd backend
npm install
```

### 3. Initialize the Database
Since we are using raw PostgreSQL, you need to manually run the schema. You can use `psql` or a tool like pgAdmin to execute the contents of `schema.sql`:

```bash
psql -U your_username -d bcms_db -f schema.sql
```

### 4. Seed the Database
Run the seeder to create the default Admin account and certificate types:
```bash
npm run seed
```

### 5. Start the Server
```bash
npm run dev
```

The server will be running at `http://localhost:5000`.

---

## 🛠 Features Implemented
- **Raw SQL Queries**: Uses the `pg` pool for maximum performance and control.
- **JWT Auth**: Secure login and resident registration.
- **RBAC**: Different permissions for Residents and Admins.
- **File Uploads**: Multiple file support for certificate requests.
- **Dashboard Stats**: Quick statistics for administrators.

## 🔑 Default Admin Account
- **Email**: `admin@barangay.gov.ph`
- **Password**: `admin123`
