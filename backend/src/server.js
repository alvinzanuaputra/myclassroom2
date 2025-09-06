require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const assessmentRoutes = require('./routes/assessments');
const teacherRoutes = require('./routes/teachers');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-frontend-domain.com'] 
    : ['http://localhost:5500', 'http://127.0.0.1:5500', 'http://localhost:3001', 'file://']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/assessments', assessmentRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/classes', (req, res) => {
  res.json({
    success: true,
    data: ['3A', '3B', '4A', '4B', '5A', '5B']
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'MyClassroom API berjalan dengan baik',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint tidak ditemukan'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Terjadi kesalahan server internal'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 MyClassroom API berjalan di port ${PORT}`);
  console.log(`📚 Environment: ${process.env.NODE_ENV || 'development'}`);
});
