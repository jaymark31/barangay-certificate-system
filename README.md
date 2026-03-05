# BCMS: Barangay Certificate Management System

A full-stack web application designed for barangay administration to manage residential records, streamline certificate requests, and standardize document generation.

## 🛠 Prerequisites

Before transferring or running this project on a new laptop, you MUST download and install the following software:

1.  **Node.js (v18 or higher)**
    *   **Download:** [https://nodejs.org/en/download](https://nodejs.org/en/download)
    *   Make sure to install the "LTS" (Long Term Support) version.
    *   This includes `npm` (Node Package Manager) which is required to install dependencies.

2.  **PostgreSQL (v14 or higher)**
    *   **Download:** [https://www.postgresql.org/download/](https://www.postgresql.org/download/)
    *   *Important:* Remember the password you set for the default `postgres` user during installation (e.g., `033105`).
    *   Make sure to keep the default port `5432`.

3.  **Git (Optional but recommended)**
    *   **Download:** [https://git-scm.com/downloads](https://git-scm.com/downloads)
    *   Used for version control.

4.  **A Code Editor**
    *   **Download:** VS Code [https://code.visualstudio.com/](https://code.visualstudio.com/)

---

## 🚀 Step-by-Step Setup Guide for a New Laptop

Once you have copied the `barangay-connect-portal` folder to your new laptop, follow these steps in order:

### Step 1: Set Up the Database

1.  Open **pgAdmin 4** (installed along with PostgreSQL).
2.  Login with the password you created during installation.
3.  Right-click on **Databases** > **Create** > **Database...**
4.  Name the database: `bcms_db` (or whatever name you prefer).
5.  Click **Save**.

### Step 2: Configure the Backend Environment

1.  Open the project folder in VS Code.
2.  Navigate to the `backend` folder.
3.  Open the `.env` file (if it doesn't exist, create it inside the `/backend/` folder).
4.  Update the connection string to match your new laptop's PostgreSQL password.

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration (Update 'your_postgres_password' here!)
# Format: postgresql://[user]:[password]@localhost:5432/[database_name]
DATABASE_URL="postgresql://postgres:your_postgres_password@localhost:5432/bcms_db"

# Authentication
JWT_SECRET="23456789"
JWT_EXPIRES_IN="7d"

# File Upload
UPLOAD_PATH="uploads/"
MAX_FILE_SIZE=5242880
```

### Step 3: Install Backend Dependencies & Seed Database

Open a terminal in VS Code (`Terminal -> New Terminal`).

```bash
# Move into the backend directory
cd backend

# Install required node modules
npm install

# Run the database schema creation script
node alter_db.js

# Seed the database with initial data (Admin account & Default Templates)
node seed.js

# Push the official logo HTML templates into the DB
node update_templates.js

# Note: You can also reset generated certs if needed:
# node reset_generated_certs.js
```

### Step 4: Install Frontend Dependencies

Open a **SECOND** new terminal in VS Code (Keep the backend terminal open).

```bash
# Make sure you are in the root directory (barangay-connect-portal)
# If you are in backend, go back one directory: cd ..

# Install frontend dependencies
npm install
```

---

## 💻 Running the Application

To run the application locally, you need to start BOTH the backend and the frontend servers simultaneously.

**1. Start the Backend:**
In your first terminal (inside the `backend` folder):
```bash
npm run dev
```
*It should say: "Server running on port 5000" and "Database connected at..."*

**2. Start the Frontend:**
In your second terminal (inside the main project folder root):
```bash
npm run dev
```
*It will give you a local host URL (e.g., http://localhost:8080). `Ctrl + Click` it to open your browser.*

---

## 🔑 Default Accounts

If you ran `node seed.js` successfully, you can login with:

**Admin Account**
*   **Email:** `admin@barangay.gov.ph`
*   **Password:** `admin123`

---

## 🛠 Built With

*   **Frontend:** React, TypeScript, Vite, Tailwind CSS, Shadcn UI
*   **Backend:** Node.js, Express, PostgreSQL, `pg` driver
*   **Authentication:** JWT (JSON Web Tokens)
*   **File Handling:** Multer (Local storage)
