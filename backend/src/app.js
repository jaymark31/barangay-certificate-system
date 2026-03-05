const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const path = require('path');
const errorHandler = require('./middleware/errorMiddleware');
const ApiError = require('./utils/errors');

// Import Routes
const authRoutes = require('./routes/authRoutes');
const certificateTypeRoutes = require('./routes/certificateTypeRoutes');
const certificateRoutes = require('./routes/certificateRoutes');
const requestRoutes = require('./routes/requestRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const userRoutes = require('./routes/userRoutes');
const pingRoutes = require('./routes/pingRoutes');
const app = express();

// Security middleware
app.use(helmet());
app.use(cors({ origin: ['http://localhost:8080', 'http://127.0.0.1:8080'], credentials: true }));

// Body parser & cookies (session stored in Postgres, id sent via cookie)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/certificate-types', certificateTypeRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/users', userRoutes);
app.use('/api/ping', pingRoutes);

// Health check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'success', message: 'BCMS API is running' });
});

// Handle undefined routes
app.use((req, res, next) => {
    next(new ApiError(404, `Can't find ${req.originalUrl} on this server!`));
});

// Global error handler
app.use(errorHandler);

module.exports = app;
