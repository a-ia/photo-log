const Database = require('better-sqlite3');
const path = require('path');
require('dotenv').config();

const db = new Database(process.env.DB_PATH || './photo_log.db');

function initializeDatabase() {
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

initializeDatabase();

module.exports = {
  addPhoto: db.prepare(`
    INSERT INTO photos (title, description, filename, date_created, tags)
    VALUES (@title, @description, @filename, @date_created, @tags)
  `),

  getPhotos: db.prepare(`
    SELECT * FROM photos 
    ORDER BY date_created DESC 
    LIMIT @limit 
    OFFSET @offset
  `),

  getPhotosByTag: db.prepare(`
    SELECT * FROM photos 
    WHERE tags LIKE @tag
    ORDER BY date_created DESC
  `),

  getTotalPhotos: db.prepare(`
    SELECT COUNT(*) as count FROM photos
  `),

  getPhotoById: db.prepare(`
    SELECT * FROM photos WHERE id = @id
  `),

  deletePhoto: db.prepare(`
    DELETE FROM photos WHERE id = @id
  `)
};
