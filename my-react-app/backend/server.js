const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./database/db');  // Import the database connection

const multer = require("multer");
const path = require("path");

const app = express();
const port = 3001;

// Middleware
app.use(cors());  // Enable CORS for all origins
app.use(bodyParser.json());  // To parse JSON request bodies

// API Routes

// Create a new employee (trainer/trainee)
app.post('/employees', (req, res) => {
    const { first_name, last_name, email, phone, role, manager_id } = req.body;

    const query = 'INSERT INTO Employee (first_name, last_name, email, phone, role, manager_id) VALUES (?, ?, ?, ?, ?, ?)';
    db.run(query, [first_name, last_name, email, phone, role, manager_id], function (err) {
        if (err) {
            console.error('Error creating employee:', err.message);
            return res.status(500).json({ error: 'Failed to create employee.' });
        }
        res.status(201).json({
            id: this.lastID,
            first_name,
            last_name,
            email,
            phone,
            role,
            manager_id
        });
    });
});

app.get('/employees', (req, res) => {
    const query = 'SELECT * FROM Employee';

    db.all(query, [], (err, rows) => {
        if (err) {
            console.error('Error fetching employees:', err.message);
            return res.status(500).json({ error: 'Failed to retrieve employees.' });
        }

        // Send the array of employees
        res.status(200).json(rows);
    });
});

app.get('/getAllTraining', (req, res) => {
    const query = 'SELECT * FROM Training';

    db.all(query, [], (err, rows) => {
        if (err) {
            console.error('Error fetching Training:', err.message);
            return res.status(500).json({ error: 'Failed to retrieve training.' });
        }

        // Send the array of employees
        res.status(200).json(rows);
    });
});

// Create a new skill
app.post('/skills', (req, res) => {
    const { skill_name, skill_type } = req.body;

    const query = 'INSERT INTO Skill (skill_name, skill_type) VALUES (?, ?)';
    db.run(query, [skill_name, skill_type], function (err) {
        if (err) {
            console.error('Error creating skill:', err.message);
            return res.status(500).json({ error: 'Failed to create skill.' });
        }
        res.status(201).json({
            id: this.lastID,
            skill_name,
            skill_type
        });
    });
});

// Assign skill to an employee
app.post('/employee_skills', (req, res) => {
    const { employee_id, skill_id } = req.body;

    const query = 'INSERT INTO Employee_Skill (employee_id, skill_id) VALUES (?, ?)';
    db.run(query, [employee_id, skill_id], function (err) {
        if (err) {
            console.error('Error assigning skill to employee:', err.message);
            return res.status(500).json({ error: 'Failed to assign skill to employee.' });
        }
        res.status(201).json({ employee_id, skill_id });
    });
});

// Create a training program
app.post('/trainings', (req, res) => {
    const { training_name, description, documentation_url, created_by } = req.body;

    const query = 'INSERT INTO Training (training_name, description, documentation_url, created_by) VALUES (?, ?, ?, ?)';
    db.run(query, [training_name, description, documentation_url, created_by], function (err) {
        if (err) {
            console.error('Error creating training program:', err.message);
            return res.status(500).json({ error: 'Failed to create training program.' });
        }
        res.status(201).json({
            id: this.lastID,
            training_name,
            description,
            documentation_url,
            created_by
        });
    });
});

// Enrollment (assign employee to training)
app.post('/enrollments', (req, res) => {
    const { employee_id, training_id } = req.body;

    const query = 'INSERT INTO Enrollment (employee_id, training_id) VALUES (?, ?)';
    db.run(query, [employee_id, training_id], function (err) {
        if (err) {
            console.error('Error enrolling employee in training:', err.message);
            return res.status(500).json({ error: 'Failed to enroll employee in training.' });
        }
        res.status(201).json({ id: this.lastID, employee_id, training_id });
    });
});

//to create batch
app.get('/batches', (req, res) => {
    const query = 'SELECT * FROM Batch';

    db.all(query, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to fetch batch.' });
        }
        res.json(rows);
    });
});

//to show trainers  
app.get('/employees/trainers', (req, res) => {
    const query = 'SELECT * FROM Employee WHERE role = "Trainer"';

    db.all(query, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to fetch trainers.' });
        }
        res.json(rows);
    });
});

//to show trainees  
app.get('/employees/trainees', (req, res) => {
    const query = 'SELECT * FROM Employee WHERE role = "Trainee"';

    db.all(query, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to fetch trainees.' });
        }
        res.json(rows);
    });
});

//to create a batch and add trainer and trainee
app.post('/batches/full', async (req, res) => {
    const { batch_name, start_date, end_date, trainee_ids, trainer_ids } = req.body;
    console.log("reached server");

    try {
        // Step 1: Insert Batch
        const batchQuery = `INSERT INTO Batch (batch_name, start_date, end_date) VALUES (?, ?, ?)`;

        db.run(batchQuery, [batch_name, start_date, end_date], function (err) {
            if (err) {
                console.error('Error creating batch:', err.message);
                return res.status(500).json({ error: 'Failed to create batch.' });
            }

            const batch_id = this.lastID;  // Get the created batch ID

            // Step 2: Assign Trainees
            const traineeQuery = `INSERT INTO Batch_Assignments (batch_id, trainee_id) VALUES (?, ?)`;
            trainee_ids.forEach(trainee_id => {
                db.run(traineeQuery, [batch_id, trainee_id], err => {
                    if (err) console.error('Error assigning trainee:', err.message);
                });
            });

            // Step 3: Assign Trainers
            const trainerQuery = `INSERT INTO Trainer_Assignments (batch_id, trainer_id) VALUES (?, ?)`;
            trainer_ids.forEach(trainer_id => {
                db.run(trainerQuery, [batch_id, trainer_id], err => {
                    if (err) console.error('Error assigning trainer:', err.message);
                });
            });

            res.status(201).json({ message: 'Batch created successfully!', batch_id });
        });

    } catch (error) {
        console.error('Error creating batch from server:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

//Assign a Training to a Batch
app.post('/batch-training', (req, res) => {
    const { batch_id, training_id } = req.body;

    const query = `INSERT INTO Batch_Training (batch_id, training_id) VALUES (?, ?)`;

    db.run(query, [batch_id, training_id], function (err) {
        if (err) {
            console.error('Error assigning training to batch:', err.message);
            return res.status(500).json({ error: 'Failed to assign training to batch.' });
        }

        // Step 2: Automatically enroll all trainees in the batch
        const enrollmentQuery = `
            INSERT INTO Enrollment (employee_id, training_id, status)
            SELECT BA.trainee_id, ? , 'Pending'
            FROM Batch_Assignments BA
            WHERE BA.batch_id = ?
        `;

        db.run(enrollmentQuery, [training_id, batch_id], function (err) {
            if (err) {
                console.error('Error enrolling trainees:', err.message);
                return res.status(500).json({ error: 'Failed to enroll trainees automatically.' });
            }

            res.status(201).json({ message: 'Training assigned to batch and trainees enrolled!' });
        });
    });
});

// Get All Enrolled Trainees for a Training
app.get('/training/:training_id/enrollments', (req, res) => {
    const { training_id } = req.params;

    const query = `
        SELECT E.enrollment_id, EMP.first_name, EMP.last_name, EMP.email, E.status
        FROM Enrollment E
        JOIN Employee EMP ON E.employee_id = EMP.employee_id
        WHERE E.training_id = ?
    `;

    db.all(query, [training_id], (err, rows) => {
        if (err) {
            console.error('Error fetching enrollments:', err.message);
            return res.status(500).json({ error: 'Failed to fetch enrollments.' });
        }
        res.json(rows);
    });
});

app.post('/trainings', (req, res) => {
    const { training_name, description, documentation_url, created_by } = req.body;

    if (!training_name || !created_by) {
        return res.status(400).json({ error: "Training name and created_by are required." });
    }

    const query = `
        INSERT INTO Training (training_name, description, documentation_url, created_by)
        VALUES (?, ?, ?, ?)
    `;

    db.run(query, [training_name, description, documentation_url, created_by], function (err) {
        if (err) {
            console.error("Error creating training:", err.message);
            return res.status(500).json({ error: "Failed to create training." });
        }
        res.status(201).json({
            training_id: this.lastID,
            training_name,
            description,
            documentation_url,
            created_by,
        });
    });
});

// Set up file storage engine with destination and filename
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");  // Save files to "uploads" folder
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));  // Unique file name
    }
});

// Initialize multer with storage configuration
const upload = multer({ storage: storage });

// Endpoint to upload document
app.post("/upload-document", upload.single("document"), (req, res) => {
    const { employee_id, document_type } = req.body;
    const document_url = req.file.path;  // Path to the uploaded file

    const query = `
        INSERT INTO Document (employee_id, document_type, document_url)
        VALUES (?, ?, ?)
    `;
    db.run(query, [employee_id, document_type, document_url], function (err) {
        if (err) {
            console.error("Error uploading document:", err.message);
            return res.status(500).json({ error: "Failed to upload document." });
        }
        res.status(201).json({
            document_id: this.lastID,
            employee_id,
            document_type,
            document_url
        });
    });
});

// Fetch all uploaded documents
app.get("/documents", (req, res) => {
    const query = "SELECT * FROM Document";

    db.all(query, [], (err, rows) => {
        if (err) {
            console.error("Error fetching documents:", err.message);
            return res.status(500).json({ error: "Failed to retrieve documents." });
        }

        res.status(200).json(rows); // Send back document list
    });
});

// Multer Storage Configuration
const certifications = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, "uploads/certifications"));  // Store files in 'uploads/certifications'
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));  // Unique filename
    }
});

const uploadCertificate = multer({ storage: certifications });

app.post("/upload-certification", uploadCertificate.single("cert_file"), (req, res) => {
    const { employee_id, certification_name, issued_by, issue_date, expiry_date } = req.body;
    const cert_url = req.file.path;  // Get the uploaded file path

    const query = `
        INSERT INTO Certification (employee_id, certification_name, issued_by, issue_date, expiry_date)
        VALUES (?, ?, ?, ?, ?)
    `;

    db.run(query, [employee_id, certification_name, issued_by, issue_date, expiry_date], function (err) {
        if (err) {
            console.error("Error uploading certification:", err.message);
            return res.status(500).json({ error: "Failed to upload certification." });
        }
        res.status(201).json({
            cert_id: this.lastID,
            employee_id,
            certification_name,
            issued_by,
            issue_date,
            expiry_date,
            cert_url
        });
    });
});

// to Fetch All Certifications
app.get("/certifications", (req, res) => {
    const query = "SELECT * FROM Certification";
    db.all(query, [], (err, rows) => {
        if (err) {
            console.error("Error fetching certifications:", err.message);
            return res.status(500).json({ error: "Failed to retrieve certifications." });
        }
        res.status(200).json(rows);
    });
});

// Certification Files Publicly
app.use("/uploads/certifications", express.static(path.join(__dirname, "uploads/certifications")));

// Handle 404 (Not Found) errors for any other routes
app.use((req, res, next) => {
    res.status(404).json({ error: 'Route not found' });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
