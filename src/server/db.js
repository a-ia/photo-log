const Database = require('better-sqlite3');
const path = require('path');
require('dotenv').config();

const db = new Database(process.env.DB_PATH || './photo_log.db');

// Initialize database with tables
function initializeDatabase() {
  // Create photos table
  db.exec(`
    CREATE TABLE IF NOT EXISTS photos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      filename TEXT NOT NULL,
      date_created DATETIME DEFAULT CURRENT_TIMESTAMP,
      tags TEXT
    );
  `);
}

// Initialize the database
initializeDatabase();

// Export database methods
module.exports = {
  // Add a new photo log
  addPhoto: db.prepare(`
    INSERT INTO photos (title, description, filename, tags)
    VALUES (@title, @description, @filename, @tags)
  `),

  // Get photos with pagination
  getPhotos: db.prepare(`
    SELECT * FROM photos 
    ORDER BY date_created DESC 
    LIMIT @limit 
    OFFSET @offset
  `),

  // Get photos by tag
  getPhotosByTag: db.prepare(`
    SELECT * FROM photos 
    WHERE tags LIKE @tag
    ORDER BY date_created DESC
  `),

  // Get total count of photos
  getTotalPhotos: db.prepare(`
    SELECT COUNT(*) as count FROM photos
  `)
};
