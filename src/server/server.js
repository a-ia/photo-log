const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const db = require('./db');
require('dotenv').config();

const router = express.Router();

// middleware
router.use(bodyParser.json());
router.use(express.static(path.join(__dirname, '../client')));

// routes
// get photos with its pagination
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
    res.status(500).json({ error: error.message });
  }
});

// add new photo
router.post('/api/photos', (req, res) => {
  const { title, description, filename, tags } = req.body;
  
  try {
    const result = db.addPhoto.run({
      title,
      description,
      filename,
      tags: tags.join(',') // converts tags array to comma-separated string
    });
    
    res.json({ 
      success: true, 
      id: result.lastInsertRowid 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// get photos by its tag
router.get('/api/photos/tag/:tag', (req, res) => {
  try {
    const tag = req.params.tag;
    const photos = db.getPhotosByTag.all({ tag: `%${tag}%` });
    res.json(photos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// file upload
const multer = require('multer');
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname)
  }
});
const upload = multer({ storage: storage });

// add upload endpoint
router.post('/api/upload', upload.single('photo'), (req, res) => {
  res.json({ filename: req.file.filename });
});

module.exports = router;

