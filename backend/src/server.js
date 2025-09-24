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

// Enable CORS
const allowedOrigins = [
  'http://localhost:5500',
  'http://127.0.0.1:5500',
  'http://localhost:3001',
  'http://localhost:3000',
  'file://',
  // Add Vercel deployment domains
  /\.vercel\.app$/,
  /\.netlify\.app$/,
  // Add your custom domain if any
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Check string origins
    const stringOrigins = allowedOrigins.filter(o => typeof o === 'string');
    if (stringOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    }
    
    // Check regex origins
    const regexOrigins = allowedOrigins.filter(o => o instanceof RegExp);
    if (regexOrigins.some(regex => regex.test(origin))) {
      return callback(null, true);
    }
    
    // In production, be more permissive for Vercel domains
    if (process.env.NODE_ENV === 'production' && origin.includes('.vercel.app')) {
      return callback(null, true);
    }
    
    const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
    console.warn(msg);
    return callback(new Error(msg), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.options('*', cors()); // Enable pre-flight for all routes

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
