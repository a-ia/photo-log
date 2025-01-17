const express = require('express');
const winston = require('winston');
const expressWinston = require('express-winston');
const { authenticateToken, generateToken } = require('./auth');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const db = require('./db');
const multer = require('multer');
require('dotenv').config();
const router = express.Router();

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

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../client/uploads/'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }
});

router.use(bodyParser.json());
router.use('/uploads', express.static(path.join(__dirname, '../client/uploads')));
router.use(express.static(path.join(__dirname, '../client')));

router.use((req, res, next) => {
    const publicPaths = [
        '/api/auth',
        '/auth.html',
        '/css/styles.css',
        '/js/api.js',
        '/favicon.ico',
        '/uploads' 
    ];
    
    if (publicPaths.some(path => req.path.startsWith(path))) {
        return next();
    }

    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (req.path.endsWith('index.html') && !token) {
        return res.redirect('/log/auth.html');
    }
    
    if (req.path.startsWith('/api/') && !token) {
        return res.status(401).json({ error: 'Authentication required' });
    }
    
    if (!token && req.path !== '/auth.html') {
        return res.redirect('/log/auth.html');
    }

    next();
});

router.use(expressWinston.logger({
  winstonInstance: logger,
  meta: true,
  msg: 'HTTP {{req.method}} {{req.url}}',
  expressFormat: true
}));

router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

router.get('/', authenticateToken, (req, res) => {
    res.sendFile(path.join(__dirname, '../client/index.html'));
});

router.post('/api/auth', (req, res) => {
  const { password } = req.body;
  
  if (password === process.env.ADMINPASS) {
    const token = generateToken('admin');
    res.json({ token });
  } else {
    res.status(401).json({ error: 'Invalid password' });
  }
});

router.get('/api/photos', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;
  const offset = (page - 1) * limit;
  try {
    const photos = db.getPhotos.all({ limit, offset });
    const totalPhotos = db.getTotalPhotos.get().count;
    
    const photosWithUrls = photos.map(photo => ({
      ...photo,
      filename: photo.filename.startsWith('/uploads') ? photo.filename : `/log/uploads/${photo.filename}`
    }));
    
    res.json({
      photos: photosWithUrls,
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
    
    const photosWithUrls = photos.map(photo => ({
      ...photo,
      filename: photo.filename.startsWith('/uploads') ? photo.filename : `/log/uploads/${photo.filename}`
    }));
    
    res.json(photosWithUrls);
  } catch (error) {
    logger.error('Error getting photos by tag:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/api/photos', authenticateToken, (req, res) => {
    const { title, description, filename, date_created, tags } = req.body;
    
    try {
        const cleanFilename = filename.replace('/log/uploads/', '').replace('/uploads/', '');
        
        const result = db.addPhoto.run({
            title,
            description,
            filename: cleanFilename,
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

router.delete('/api/photos/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  
  try {
    const photo = db.getPhotoById.get({ id });
    
    if (!photo) {
      return res.status(404).json({ error: 'Photo not found' });
    }
    
    const filePath = path.join(__dirname, '../client/uploads/', photo.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    db.deletePhoto.run({ id });
    
    logger.info('Photo deleted:', { id });
    res.json({ success: true });
  } catch (error) {
    logger.error('Error deleting photo:', error);
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

router.use(expressWinston.errorLogger({
  winstonInstance: logger
}));

module.exports = router;
