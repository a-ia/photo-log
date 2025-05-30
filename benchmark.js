const Database = require('better-sqlite3');
const path = require('path');
const { performance } = require('perf_hooks');
const fs = require('fs');
require('dotenv').config();

// Create a test database file
const TEST_DB_PATH = path.join(__dirname, 'benchmark-test.db');

// Remove existing test database if it exists
if (fs.existsSync(TEST_DB_PATH)) {
  fs.unlinkSync(TEST_DB_PATH);
}

// Create a fresh database connection
const db = new Database(TEST_DB_PATH);

// Initialize the database with your schema
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

// Generate sample data
const sampleData = [];
const now = new Date().toISOString();
for (let i = 0; i < 1000; i++) {
  sampleData.push({
    title: `Photo ${i}`,
    description: `Description for photo ${i}`,
    filename: `photo_${i}.jpg`,
    date_created: now,
    tags: `tag1,tag${i % 10}`
  });
}

// Test 1: Non-prepared statement approach
console.log('Running benchmark for non-prepared statements...');
const startNonPrepared = performance.now();

for (const photo of sampleData) {
  db.exec(`
    INSERT INTO photos (title, description, filename, date_created, tags)
    VALUES (
      '${photo.title}', 
      '${photo.description}', 
      '${photo.filename}', 
      '${photo.date_created}', 
      '${photo.tags}'
    )
  `);
}

const endNonPrepared = performance.now();
const nonPreparedTime = endNonPrepared - startNonPrepared;

// Clear database for the next test
db.exec('DELETE FROM photos');

// Test 2: Prepared statement approach (similar to your current implementation)
console.log('Running benchmark for prepared statements...');
const startPrepared = performance.now();

const addPhoto = db.prepare(`
  INSERT INTO photos (title, description, filename, date_created, tags)
  VALUES (@title, @description, @filename, @date_created, @tags)
`);

for (const photo of sampleData) {
  addPhoto.run(photo);
}

const endPrepared = performance.now();
const preparedTime = endPrepared - startPrepared;

// Test 3: Prepared statement with transaction
console.log('Running benchmark for prepared statements with transaction...');
const startTransaction = performance.now();

const insertMany = db.transaction((photos) => {
  const stmt = db.prepare(`
    INSERT INTO photos (title, description, filename, date_created, tags)
    VALUES (@title, @description, @filename, @date_created, @tags)
  `);
  
  for (const photo of photos) {
    stmt.run(photo);
  }
});

insertMany(sampleData);

const endTransaction = performance.now();
const transactionTime = endTransaction - startTransaction;

// Calculate improvements
const baselineTime = nonPreparedTime;
const preparedImprovement = ((baselineTime - preparedTime) / baselineTime) * 100;
const transactionImprovement = ((baselineTime - transactionTime) / baselineTime) * 100;

// Print results
console.log('\nBenchmark Results:');
console.log('------------------');
console.log(`Non-prepared execution time: ${nonPreparedTime.toFixed(2)} ms`);
console.log(`Prepared statements execution time: ${preparedTime.toFixed(2)} ms`);
console.log(`Prepared with transaction execution time: ${transactionTime.toFixed(2)} ms`);
console.log(`\nPerformance Improvements:`);
console.log(`Prepared statements improvement: ${preparedImprovement.toFixed(2)}%`);
console.log(`Transaction improvement: ${transactionImprovement.toFixed(2)}%`);

// Read performance test
console.log('\nRunning read performance tests...');

// Insert data for read tests
insertMany(sampleData);

// Test 4: Non-prepared read
const startReadNonPrepared = performance.now();

for (let i = 0; i < 100; i++) {
  const randomId = Math.floor(Math.random() * 1000) + 1;
  db.exec(`SELECT * FROM photos WHERE id = ${randomId}`);
}

const endReadNonPrepared = performance.now();
const readNonPreparedTime = endReadNonPrepared - startReadNonPrepared;

// Test 5: Prepared read
const startReadPrepared = performance.now();
const getPhotoById = db.prepare('SELECT * FROM photos WHERE id = @id');

for (let i = 0; i < 100; i++) {
  const randomId = Math.floor(Math.random() * 1000) + 1;
  getPhotoById.get({ id: randomId });
}

const endReadPrepared = performance.now();
const readPreparedTime = endReadPrepared - startReadPrepared;

// Calculate read improvements
const readImprovement = ((readNonPreparedTime - readPreparedTime) / readNonPreparedTime) * 100;

console.log('\nRead Operation Results:');
console.log('----------------------');
console.log(`Non-prepared read time: ${readNonPreparedTime.toFixed(2)} ms`);
console.log(`Prepared read time: ${readPreparedTime.toFixed(2)} ms`);
console.log(`Read operation improvement: ${readImprovement.toFixed(2)}%`);

// Close database and clean up
db.close();
fs.unlinkSync(TEST_DB_PATH);
console.log('\nBenchmark completed and test database removed.');
