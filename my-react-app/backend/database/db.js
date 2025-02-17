const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Create SQLite database (or connect if it already exists)
const db = new sqlite3.Database(path.join(__dirname, 'test.db'), (err) => {
  if (err) {
    console.error("Error opening database:", err);
  } else {
    console.log("Connected to SQLite database!");
  }
});

// Create Tables (Employees, Skills, Batches, Assignments, etc.)
const createTables = () => {
  db.serialize(() => {
    // Employee Table
    db.run(`
      CREATE TABLE IF NOT EXISTS Employee (
        employee_id INTEGER PRIMARY KEY AUTOINCREMENT,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        phone TEXT UNIQUE,
        role TEXT CHECK(role IN ('Admin', 'Manager', 'Trainer', 'Trainee')) NOT NULL,
        manager_id INTEGER,
        is_trainer INTEGER DEFAULT 0,
        is_trainee INTEGER DEFAULT 0,
        FOREIGN KEY (manager_id) REFERENCES Employee(employee_id) ON DELETE SET NULL
      );
    `);

    // User Table
    db.run(`
    CREATE TABLE IF NOT EXISTS User (
      employee_id INTEGER NOT NULL,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      FOREIGN KEY (employee_id) REFERENCES Employee(employee_id) ON DELETE CASCADE
    );
  `);

    // Batch Table
    db.run(`
      CREATE TABLE IF NOT EXISTS Batch (
        batch_id INTEGER PRIMARY KEY AUTOINCREMENT,
        batch_name TEXT NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL
      );
    `);

    // Batch Assignments Table (Assign Trainees to Batches)
    db.run(`
      CREATE TABLE IF NOT EXISTS Batch_Assignments (
        batch_assignment_id INTEGER PRIMARY KEY AUTOINCREMENT,
        batch_id INTEGER NOT NULL,
        trainee_id INTEGER NOT NULL,
        FOREIGN KEY (batch_id) REFERENCES Batch(batch_id) ON DELETE CASCADE,
        FOREIGN KEY (trainee_id) REFERENCES Employee(employee_id) ON DELETE CASCADE
      );
    `);

    // Trainer Assignments Table (Assign Trainers to Batches)
    db.run(`
      CREATE TABLE IF NOT EXISTS Trainer_Assignments (
        trainer_assignment_id INTEGER PRIMARY KEY AUTOINCREMENT,
        batch_id INTEGER NOT NULL,
        trainer_id INTEGER NOT NULL,
        FOREIGN KEY (batch_id) REFERENCES Batch(batch_id) ON DELETE CASCADE,
        FOREIGN KEY (trainer_id) REFERENCES Employee(employee_id) ON DELETE CASCADE
      );
    `);

    // Training Table
    db.run(`
      CREATE TABLE IF NOT EXISTS Training (
        training_id INTEGER PRIMARY KEY AUTOINCREMENT,
        training_name TEXT NOT NULL,
        description TEXT,
        documentation_url TEXT,
        created_by INTEGER NOT NULL,
        FOREIGN KEY (created_by) REFERENCES Employee(employee_id) ON DELETE CASCADE
      );
    `);

    // Enrollment Table (Tracks Training Requests & Approvals)
    db.run(`
      CREATE TABLE IF NOT EXISTS Enrollment (
        enrollment_id INTEGER PRIMARY KEY AUTOINCREMENT,
        employee_id INTEGER NOT NULL,
        training_id INTEGER NOT NULL,
        status TEXT CHECK(status IN ('Pending', 'Approved', 'Rejected')) DEFAULT 'Pending',
        requested_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        approved_by INTEGER,
        approved_on TIMESTAMP,
        FOREIGN KEY (employee_id) REFERENCES Employee(employee_id) ON DELETE CASCADE,
        FOREIGN KEY (training_id) REFERENCES Training(training_id) ON DELETE CASCADE,
        FOREIGN KEY (approved_by) REFERENCES Employee(employee_id) ON DELETE SET NULL
      );
    `);

    // Certification Table
    db.run(`
      CREATE TABLE IF NOT EXISTS Certification (
        cert_id INTEGER PRIMARY KEY AUTOINCREMENT,
        employee_id INTEGER NOT NULL,
        certification_name TEXT NOT NULL,
        issued_by TEXT NOT NULL,
        issue_date DATE NOT NULL,
        expiry_date DATE,
        FOREIGN KEY (employee_id) REFERENCES Employee(employee_id) ON DELETE CASCADE
      );
    `);

    // Feedback Table
    db.run(`
      CREATE TABLE IF NOT EXISTS Feedback (
        feedback_id INTEGER PRIMARY KEY AUTOINCREMENT,
        training_id INTEGER NOT NULL,
        employee_id INTEGER NOT NULL,
        rating INTEGER CHECK(rating BETWEEN 1 AND 5),
        comments TEXT,
        submitted_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (training_id) REFERENCES Training(training_id) ON DELETE CASCADE,
        FOREIGN KEY (employee_id) REFERENCES Employee(employee_id) ON DELETE CASCADE
      );
    `);

    // Document Table
    db.run(`
      CREATE TABLE IF NOT EXISTS Document (
        document_id INTEGER PRIMARY KEY AUTOINCREMENT,
        employee_id INTEGER NOT NULL,
        document_type TEXT CHECK(document_type IN ('Marksheet', 'Certification', 'Other')) NOT NULL,
        document_url TEXT NOT NULL,
        uploaded_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (employee_id) REFERENCES Employee(employee_id) ON DELETE CASCADE
      );
    `);

    //Table to assign training to a batch
    db.run(`
        CREATE TABLE IF NOT EXISTS Batch_Training (
        batch_training_id INTEGER PRIMARY KEY AUTOINCREMENT,
        batch_id INTEGER NOT NULL,
        training_id INTEGER NOT NULL,
        FOREIGN KEY (batch_id) REFERENCES Batch(batch_id) ON DELETE CASCADE,
        FOREIGN KEY (training_id) REFERENCES Training(training_id) ON DELETE CASCADE
      );
    `);

    db.run(`
    CREATE TABLE IF NOT EXISTS employee_marks (
        mark_id INTEGER PRIMARY KEY AUTOINCREMENT,
        employee_id INTEGER NOT NULL UNIQUE,  -- 🔹 Make employee_id UNIQUE
        sql INTEGER DEFAULT 0,
        tosca INTEGER DEFAULT 0,
        FOREIGN KEY (employee_id) REFERENCES Employee(employee_id) ON DELETE CASCADE
    );
  `);

    db.run(`
    CREATE TABLE IF NOT EXISTS Project (
      project_id INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_id INTEGER,
      project_name TEXT NOT NULL,
      description TEXT,
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      FOREIGN KEY (employee_id) REFERENCES Employee(employee_id) ON DELETE CASCADE
    );
  `);
  });
};
// Create tables if they don't exist
createTables();

// Export the database connection
module.exports = db;
