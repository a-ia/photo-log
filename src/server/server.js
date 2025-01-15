const express = require('express');
const winston = require('winston');
const expressWinston = require('express-winston');
const { authenticateToken, generateToken } = require('./auth');
const bodyParser = require('body-parser');
const path = require('path');
const db = require('./db');
const multer = require('multer');
require('dotenv').config();
const router = express.Router();

// Configure logging first
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: './src/client/uploads/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname)
  }
});

const upload = multer({ storage: storage });

// Middleware
router.use(bodyParser.json());
router.use(express.static(path.join(__dirname, '../client')));

// Authentication middleware
router.use((req, res, next) => {
    // Expanded list of public paths
    const publicPaths = [
        '/api/auth',
        '/auth.html',
        '/css/styles.css',
        '/js/api.js',
        '/favicon.ico'
    ];
    
    // Allow public paths
    if (publicPaths.some(path => req.path.endsWith(path))) {
        return next();
    }

    // Check for authentication
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    // If requesting index.html directly and not authenticated
    if (req.path.endsWith('index.html') && !token) {
        return res.redirect('/log/auth.html');
    }
    
    // For API requests
    if (req.path.startsWith('/api/') && !token) {
        return res.status(401).json({ error: 'Authentication required' });
    }
    
    // For other requests without auth
    if (!token && req.path !== '/auth.html') {
        return res.redirect('/log/auth.html');
    }

    next();
});

// Logging middleware
router.use(expressWinston.logger({
  winstonInstance: logger,
  meta: true,
  msg: 'HTTP {{req.method}} {{req.url}}',
  expressFormat: true
}));

// Health check endpoint (for Docker)
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Root route handler
router.get('/', authenticateToken, (req, res) => {
    res.sendFile(path.join(__dirname, '../client/index.html'));
});

// Authentication route
router.post('/api/auth', (req, res) => {
  const { password } = req.body;
  
  console.log('Auth attempt received');
  console.log('Received password:', password);
  console.log('Expected password:', process.env.ADMINPASS);
  console.log('Password match:', password === process.env.ADMINPASS);
  
  if (password === process.env.ADMINPASS) {
    const token = generateToken('admin');
    console.log('Auth successful, token generated');
    res.json({ token });
  } else {
    console.log('Auth failed - invalid password');
    res.status(401).json({ error: 'Invalid password' });
  }
});

// Public routes
router.get('/api/photos', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;
  const offset = (page - 1) * limit;
  try {
    const photos = db.getPhotos.all({ limit, offset });
    const totalPhotos = db.getTotalPhotos.get().count;
    
    res.json({
      photos,
      totalPages: Math.ceil(totalPhotos / limit),
      currentPage: page
    });
  } catch (error) {
    logger.error('Error getting photos:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/api/photos/tag/:tag', (req, res) => {
  try {
    const tag = req.params.tag;
    const photos = db.getPhotosByTag.all({ tag: `%${tag}%` });
    res.json(photos);
  } catch (error) {
    logger.error('Error getting photos by tag:', error);
    res.status(500).json({ error: error.message });
  }
});

// Protected routes (require authentication)
router.post('/api/photos', authenticateToken, (req, res) => {
    const { title, description, filename, date_created, tags } = req.body;
    
    try {
        const result = db.addPhoto.run({
            title,
            description,
            filename,
            date_created: date_created || new Date().toISOString(),
            tags: Array.isArray(tags) ? tags.join(',') : tags
        });
        
        logger.info('New photo added:', { id: result.lastInsertRowid });
        res.json({
            success: true,
            id: result.lastInsertRowid
        });
    } catch (error) {
        logger.error('Error adding photo:', error);
        res.status(500).json({ error: error.message });
    }
});

router.post('/api/upload', authenticateToken, upload.single('photo'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    logger.info('File uploaded:', { filename: req.file.filename });
    res.json({ filename: req.file.filename });
  } catch (error) {
    logger.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

// Error logging middleware
router.use(expressWinston.errorLogger({
  winstonInstance: logger
}));

module.exports = router;
