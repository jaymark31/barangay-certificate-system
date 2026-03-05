require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 5000;

// Log env checks on startup so CMD shows what might be wrong
console.log('Backend starting...');
console.log('  PORT:', PORT);
console.log('  DATABASE_URL:', process.env.DATABASE_URL ? '✓ set' : '✗ MISSING (set in backend/.env)');
console.log('  JWT_SECRET:', process.env.JWT_SECRET ? '✓ set' : '✗ MISSING (set in backend/.env)');

const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}. API: http://localhost:${PORT}/api`);
});

// Handle unhandled rejections
process.on('unhandledRejection', (err) => {
    console.log('UNHANDLED REJECTION! 💥 Shutting down...');
    console.log(err.name, err.message);
    server.close(() => {
        process.exit(1);
    });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
    console.log(err.name, err.message);
    process.exit(1);
});
