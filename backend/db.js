const sqlite3 = require('@libsql/sqlite3').verbose();
const path = require('path');
require('dotenv').config();

let dbPath = process.env.TURSO_DATABASE_URL;
if (dbPath && process.env.TURSO_AUTH_TOKEN) {
  dbPath += '?authToken=' + process.env.TURSO_AUTH_TOKEN;
} else if (!dbPath) {
  dbPath = path.resolve(__dirname, 'crm.db');
}

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database ', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    db.serialize(() => {
      db.run(`CREATE TABLE IF NOT EXISTS leads (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        inquiry_id TEXT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT NOT NULL,
        program TEXT NOT NULL,
        status TEXT DEFAULT 'In Progress',
        nextFollowUp TEXT,
        notes TEXT DEFAULT ''
      )`, (err) => {
        if (!err) {
          db.run(`ALTER TABLE leads ADD COLUMN emailSentAt TEXT`, () => {});
          db.run(`ALTER TABLE leads ADD COLUMN inquiry_id TEXT`, () => {});
        }
      });

      db.run(`CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        lead_id INTEGER,
        title TEXT NOT NULL,
        dueDate TEXT NOT NULL,
        status TEXT DEFAULT 'Pending'
      )`);

      db.run(`CREATE TABLE IF NOT EXISTS customers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        lead_id INTEGER,
        name TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        program TEXT NOT NULL,
        total_fees REAL NOT NULL,
        payment_type TEXT NOT NULL,
        payment_status TEXT NOT NULL,
        emi_amount REAL,
        num_emis INTEGER,
        remaining_balance REAL NOT NULL,
        created_at TEXT NOT NULL
      )`, () => {
        db.run(`ALTER TABLE customers ADD COLUMN emi_status TEXT DEFAULT 'Not Started'`, () => {});
        db.run(`ALTER TABLE customers ADD COLUMN emi_loan_id TEXT`, () => {});
        db.run(`ALTER TABLE customers ADD COLUMN emi_screenshot TEXT`, () => {});
      });

      db.run(`CREATE TABLE IF NOT EXISTS payments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_id INTEGER NOT NULL,
        type TEXT NOT NULL,
        amount REAL NOT NULL,
        payment_date TEXT,
        status TEXT NOT NULL,
        due_date TEXT
      )`);

      db.run(`CREATE TABLE IF NOT EXISTS targets (
        month TEXT PRIMARY KEY,
        target_amount REAL NOT NULL
      )`);

      db.run(`CREATE TABLE IF NOT EXISTS analytics (
        page_name TEXT PRIMARY KEY,
        view_count INTEGER DEFAULT 0
      )`, (err) => {
        if (!err) {
          db.run(`INSERT OR IGNORE INTO analytics (page_name, view_count) VALUES ('register', 0)`);
        }
      });

      db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE,
        phone TEXT UNIQUE,
        password TEXT,
        name TEXT,
        picture TEXT,
        role TEXT DEFAULT 'user',
        created_at TEXT
      )`, (err) => {
        // If the table already exists, try adding the columns
        if (!err) {
          db.run(`ALTER TABLE users ADD COLUMN phone TEXT UNIQUE`, () => {});
          db.run(`ALTER TABLE users ADD COLUMN password TEXT`, () => {});
        }
      });
    });
  }
});

module.exports = db;
