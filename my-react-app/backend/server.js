const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./database/db');  // Import the database connection
const bcrypt = require('bcrypt');
const multer = require("multer");
const path = require("path");
const nodemailer = require("nodemailer");
const axios = require("axios");
const jwt = require('jsonwebtoken');
require('dotenv').config();
const app = express();
const port = 3001;
const xlsx = require("xlsx");
// Middleware
app.use(cors());  // Enable CORS for all origins
app.use(bodyParser.json());  // To parse JSON request bodies
const SECRET_KEY = process.env.JWT_SECRET || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz123456789';
const directLineSecret = "9sfJsjrgx3ayikfYKFqFaGYaqjEtyqYtBdnOdGkfuWz40z8AyFr2JQQJ99BBACi5YpzAArohAAABAZBSfeFj.FK1JY0ayJdIEGBBLdZiu8xcgdXtk9g8D7E7caXZO3uUzV23kjdE4JQQJ99BBACi5YpzAArohAAABAZBS1fYC";


// Email Configuration**
const transporter = nodemailer.createTransport({
    service: "gmail", // ✅ Use 'gmail' or 'outlook' (or replace with your SMTP)
    auth: {
        user: "nahath09@gmail.com",
        pass: "eaxt lttn pbvf orhu",
    },
});

// Function to Send Email**
const sendEmail = async (to, username, password) => {
    const mailOptions = {
        from: "skillmatrix.1502@gmail.com",
        to: to,
        subject: "Your Account Credentials",
        text: `Dear ${username},\n\nYour account has been created successfully!\n\nUsername: ${username}\nPassword: ${password}\n\nPlease change your password after logging in.\n\nBest regards,\nAdmin Team`,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`📩 Email sent to ${to}`);
    } catch (error) {
        console.error(" Error sending email:", error);
    }
};

app.post("/send-email", async (req, res) => {
    const { to, subject, message } = req.body;

    const mailOptions = {
        from: "nankervis1125@gmail.com",
        to: to,
        subject: subject,
        text: message,
    };

    try {
        await transporter.sendMail(mailOptions);
        res.status(200).json({ success: true, message: "Email sent successfully!" });
    } catch (error) {
        console.error("Error sending email:", error);
        res.status(500).json({ success: false, error: "Failed to send email." });
    }
});

//Verify JWT Token
const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(403).json({ error: "Access denied. No token provided." });
    }

    const token = authHeader.split(" ")[1]; // Extract token from "Bearer <token>"
    console.log("Received Token:", token); // Debugging: Check token at backend

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) {
            console.error("JWT Verification Error:", err.message); // Debugging
            return res.status(401).json({ error: "Invalid or expired token." });
        }

        req.user = decoded; // Store decoded user info
        next();
    });
};

// API Routes

// Create a new employee (trainer/trainee)
app.post("/employees", async (req, res) => {
    const { first_name, last_name, email, phone, role } = req.body;

    // Generate a random 8-character password
    const generatePassword = () => {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$!";
        let password = "";
        for (let i = 0; i < 8; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return password;
    };

    const password = generatePassword();
    const hashedPassword = await bcrypt.hash(password, 10); // 🔒 Hash password

    try {
        //  Step 1: Insert Employee into the Database
        db.run(
            "INSERT INTO Employee (first_name, last_name, email, phone, role) VALUES (?, ?, ?, ?, ?)",
            [first_name, last_name, email, phone, role],
            function (err) {
                if (err) {
                    console.error("Error creating employee:", err.message);
                    return res.status(500).json({ error: "Failed to create employee." });
                }

                const employeeId = this.lastID; // Get the inserted employee_id

                // Step 2: Insert User into the Database
                db.run(
                    "INSERT INTO User (username, password, employee_id) VALUES (?, ?, ?)",
                    [email, hashedPassword, employeeId],
                    async function (err) {
                        if (err) {
                            console.error(" Error creating user:", err.message);
                            return res.status(500).json({ error: "Failed to create user." });
                        }

                        // 📩 Step 3: Send Email with Credentials
                        console.log("REACHED EMAIL FUNC");

                        await sendEmail(email, email, password);

                        res.status(201).json({
                            id: employeeId,
                            first_name,
                            last_name,
                            email,
                            phone,
                            role,
                            message: "Employee created, user registered, and email sent!",
                        });
                    }
                );
            }
        );
    } catch (error) {
        console.error(" Error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.get("/employee", verifyToken, (req, res) => {
    const employeeId = req.user.employee_id; // Extract employee_id from JWT

    const query = `
        SELECT employee_id, first_name, last_name, email, phone, role 
        FROM Employee 
        WHERE employee_id = ?
    `;

    db.get(query, [employeeId], (err, row) => {
        if (err) {
            console.error("Error fetching employee details:", err.message);
            return res.status(500).json({ error: "Failed to retrieve employee details." });
        }

        if (!row) {
            return res.status(404).json({ error: "Employee not found." });
        }

        res.status(200).json(row);
    });
});

app.get('/all-employee', (req, res) => {
    const query = 'SELECT * FROM Employee';

    db.all(query, [], (err, rows) => {
        if (err) {
            console.error('Error fetching Employee:', err.message);
            return res.status(500).json({ error: 'Failed to retrieve Employee.' });
        }

        // Send the array of employees
        res.status(200).json(rows);
    });
});

//delete employee
app.delete("/employee/:id", verifyToken, (req, res) => {
    const employeeId = req.params.id;

    const deleteUserQuery = "DELETE FROM User WHERE employee_id = ?";
    const deleteEmployeeQuery = "DELETE FROM Employee WHERE employee_id = ?";

    db.run(deleteUserQuery, [employeeId], function (err) {
        if (err) {
            console.error("Error deleting user:", err.message);
            return res.status(500).json({ message: "Error deleting user" });
        }

        db.run(deleteEmployeeQuery, [employeeId], function (err) {
            if (err) {
                console.error("Error deleting employee:", err.message);
                return res.status(500).json({ message: "Error deleting employee" });
            }
            if (this.changes === 0) {
                return res.status(404).json({ message: "Employee not found" });
            }
            res.status(200).json({ message: "Employee and user deleted successfully" });
        });
    });
});

//get all training by trainer
app.get('/getAllTraining', verifyToken, (req, res) => {
    const employeeId = req.user.employee_id; // Extract from JWT token
    console.log("Employee ID from Token:", employeeId); // Debugging

    const query = 'SELECT * FROM Training WHERE created_by = ?';

    db.all(query, [employeeId], (err, rows) => {
        if (err) {
            console.error('Error fetching Training:', err.message);
            return res.status(500).json({ error: 'Failed to retrieve training.' });
        }
        console.log("Trainings fetched:", rows); // Debugging
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

// Get Employee's Ongoing Trainings (Protected)
app.get("/employee/trainings", verifyToken, (req, res) => {
    const employeeId = req.user?.employee_id; // Ensure extraction from JWT token

    if (!employeeId) {
        return res.status(401).json({ error: "Unauthorized access. Invalid token." });
    }

    const query = `
        SELECT T.training_id, T.training_name, E.status
        FROM Enrollment E
        JOIN Training T ON E.training_id = T.training_id
        WHERE E.employee_id = ? 
    `;

    db.all(query, [employeeId], (err, rows) => {
        if (err) {
            console.error("❌ Error fetching ongoing trainings:", err.message);
            return res.status(500).json({ error: "Failed to fetch trainings." });
        }
        res.status(200).json(rows.length ? rows : []); // Return empty array if no data
    });
});

// Get Employee's Certifications (Protected)
app.get("/employee/certifications", verifyToken, (req, res) => {
    const employeeId = req.user?.employee_id; // Ensure extraction from JWT token

    if (!employeeId) {
        return res.status(401).json({ error: "Unauthorized access. Invalid token." });
    }

    const query = `
        SELECT certification_name, issued_by, issue_date, expiry_date
        FROM Certification
        WHERE employee_id = ?
        ORDER BY issue_date DESC;  -- Show most recent first
    `;

    db.all(query, [employeeId], (err, rows) => {
        if (err) {
            console.error("❌ Error fetching certifications:", err.message);
            return res.status(500).json({ error: "Failed to fetch certifications." });
        }
        res.status(200).json(rows.length ? rows : []); // Return empty array if no data
    });
});

// Add New Certification for Employee
app.post("/employee/certifications", verifyToken, (req, res) => {
    const employeeId = req.user?.employee_id;  // Ensure valid employee_id
    const { certification_name, issued_by, issue_date, expiry_date } = req.body;

    if (!certification_name || !issued_by || !issue_date) {
        return res.status(400).json({ error: "Missing required fields." });
    }

    const query = `
        INSERT INTO Certification (employee_id, certification_name, issued_by, issue_date, expiry_date)
        VALUES (?, ?, ?, ?, ?);
    `;

    db.run(query, [employeeId, certification_name, issued_by, issue_date, expiry_date || null], function (err) {
        if (err) {
            console.error("Error adding certification:", err.message);
            return res.status(500).json({ error: "Failed to add certification." });
        }
        res.status(201).json({ message: "Certification added successfully!" });
    });
});

// Create a training program
app.post("/trainings", verifyToken, (req, res) => {
    const { training_name, description, documentation_url } = req.body;
    const created_by = req.user.employee_id; // Get employee ID from token

    if (!training_name) {
        return res.status(400).json({ error: "Training name is required." });
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
            message: "Training created successfully!",
        });
    });
});

/**
 * 🟢 Delete a training program by ID (only if created by the logged-in user)
 */
app.delete("/trainings/:id", verifyToken, (req, res) => {
    const trainingId = req.params.id;
    const employeeId = req.user.employee_id; // Get employee ID from token

    const query = `DELETE FROM Training WHERE training_id = ? AND created_by = ?`;

    db.run(query, [trainingId, employeeId], function (err) {
        if (err) {
            console.error("Error deleting training:", err.message);
            return res.status(500).json({ error: "Failed to delete training." });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: "Training not found or you do not have permission to delete it." });
        }
        res.status(200).json({ message: "Training deleted successfully!" });
    });
});

// Enrollment (assign employee to training)
app.get('/enrollments', verifyToken, (req, res) => {
    const query = `
        SELECT E.enrollment_id, EMP.first_name, EMP.last_name, T.training_name, E.status
        FROM Enrollment E
        JOIN Employee EMP ON E.employee_id = EMP.employee_id
        JOIN Training T ON E.training_id = T.training_id
    `;

    db.all(query, [], (err, rows) => {
        if (err) {
            console.error('Error fetching enrollments:', err.message);
            return res.status(500).json({ error: 'Failed to fetch enrollments.' });
        }
        res.json(rows);
    });
});

app.post('/enrollments', verifyToken, (req, res) => {
    const { employee_id, training_id } = req.body;

    const query = `INSERT INTO Enrollment (employee_id, training_id, status) VALUES (?, ?, 'Pending')`;

    db.run(query, [employee_id, training_id], function (err) {
        if (err) {
            console.error('Error enrolling trainee:', err.message);
            return res.status(500).json({ error: 'Failed to enroll trainee.' });
        }
        res.status(201).json({ message: 'Trainee enrolled successfully!' });
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
    const query = 'SELECT * FROM Employee WHERE is_trainer = 1';

    db.all(query, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to fetch trainers.' });
        }
        res.json(rows);
    });
});

//to show trainees  
app.get('/employees/trainees', (req, res) => {
    const query = 'SELECT * FROM Employee WHERE is_trainee = 1';

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

//Authentication
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    const query = `
        SELECT U.password, E.role, E.is_trainer, U.employee_id 
        FROM User U 
        JOIN Employee E ON U.employee_id = E.employee_id
        WHERE U.username = ?
    `;

    db.get(query, [username], async (err, user) => {
        if (err) {
            console.error('error:', err.message);
            return res.status(500).json({ success: false, error: 'Database error' });
        }

        if (!user) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        const token = jwt.sign({ employee_id: user.employee_id, role: user.role, is_trainer: user.is_trainer }, SECRET_KEY, { expiresIn: '1h' });

        console.log("Generated Token:", token); // Debugging: Check if token is created

        res.status(200).json({ success: true, token, role: user.role, is_trainer: user.is_trainer });
    });
});

//logout
app.post("/logout", (req, res) => {
    try {
        res.clearCookie("token"); // If using cookies for authentication
        res.status(200).json({ message: "Logged out successfully!" });
    } catch (error) {
        console.error("Logout error:", error);
        res.status(500).json({ error: "Failed to log out." });
    }
});


//show all batch
app.get('/batches', (req, res) => {
    const query = 'SELECT * FROM Batch';

    db.all(query, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to fetch batches.' });
        }
        res.json(rows);
    });
});

//delete batch
app.delete("/batch/:id", (req, res) => {
    const batchId = req.params.id;
    const query = "DELETE FROM Batch WHERE batch_id = ?";

    db.run(query, [batchId], function (err) {
        if (err) {
            console.error("Error deleting batch:", err.message);
            return res.status(500).json({ message: "Error deleting batch" });
        }
        if (this.changes === 0) {
            return res.status(404).json({ message: "Batch not found" });
        }
        res.status(200).json({ message: "Batch deleted successfully" });
    });
});

//promote emp to trainer
app.put("/employee/:id/make-trainer", (req, res) => {
    const { id } = req.params;

    const query = "UPDATE Employee SET is_trainer = 1 WHERE employee_id = ?";
    db.run(query, [id], function (err) {
        if (err) {
            console.error("Error promoting employee:", err.message);
            return res.status(500).json({ error: "Failed to promote employee." });
        }
        res.status(200).json({ message: "Employee is now a Trainer!" });
    });
});

//promote emp to trainee
app.put("/employee/:id/make-trainee", (req, res) => {
    const { id } = req.params;

    console.log("reached make trainee");

    const query = "UPDATE Employee SET is_trainee = 1 WHERE employee_id = ?";
    db.run(query, [id], function (err) {
        if (err) {
            console.error("Error promoting employee:", err.message);
            return res.status(500).json({ error: "Failed to promote employee." });
        }
        res.status(200).json({ message: "Employee is now a Trainee!" });
    });
});

//remove trainer
app.put("/employee/:id/remove-trainer", (req, res) => {
    const { id } = req.params;

    const query = "UPDATE Employee SET is_trainer = 0 WHERE employee_id = ?";
    db.run(query, [id], function (err) {
        if (err) {
            console.error("Error removing trainer status:", err.message);
            return res.status(500).json({ error: "Failed to remove trainer status." });
        }
        res.status(200).json({ message: "Trainer removed successfully!" });
    });
});

//remove trainee
app.put("/employee/:id/remove-trainee", (req, res) => {
    const { id } = req.params;

    const query = "UPDATE Employee SET is_trainee = 0 WHERE employee_id = ?";
    db.run(query, [id], function (err) {
        if (err) {
            console.error("Error removing trainee status:", err.message);
            return res.status(500).json({ error: "Failed to remove trainee status." });
        }
        res.status(200).json({ message: "Trainee removed successfully!" });
    });
});

app.post("/upload-marks", upload.single("marksFile"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        const filePath = req.file.path;
        const workbook = xlsx.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = xlsx.utils.sheet_to_json(sheet, { raw: true });

        console.log("Excel Data:", jsonData); // Debugging

        // Validate required columns
        if (!jsonData.length || !jsonData[0].Email) {
            return res.status(400).json({ error: "Invalid file format. Ensure 'Email' column exists." });
        }

        console.log("Processing marks...");

        let processedTrainees = []; // ✅ Array to store processed trainee details

        // Process each row
        jsonData.forEach((row) => {
            const email = row.Email?.trim().toLowerCase(); // Normalize case & trim spaces
            const sql = row.Sql;
            const tosca = row.Tosca;

            if (!email) return;

            // Step 1: Find trainee's employee_id using email
            const findEmployeeQuery = `SELECT employee_id, first_name, last_name, email FROM Employee WHERE LOWER(email) = ? AND is_trainee = 1`;

            db.get(findEmployeeQuery, [email], (err, employee) => {
                if (err) {
                    console.error("Error finding employee:", err.message);
                    return;
                }
                if (!employee) {
                    console.warn(`No trainee found for email: ${email}`);
                    return;
                }

                const employeeId = employee.employee_id;
                const traineeName = `${employee.first_name} ${employee.last_name}`;

                // Step 2: Insert marks into employee_marks table
                const insertMarksQuery = `
                    INSERT INTO employee_marks (employee_id, sql, tosca)
                    VALUES (?, ?, ?)
                    ON CONFLICT(employee_id) 
                    DO UPDATE SET sql = excluded.sql, tosca = excluded.tosca;
                `;

                db.run(insertMarksQuery, [employeeId, sql, tosca], (err) => {
                    if (err) {
                        console.error("Error inserting marks:", err.message);
                    } else {
                        console.log(`Marks inserted for ${email} (ID: ${employeeId})`);

                        // ✅ Store processed trainee info
                        processedTrainees.push({
                            name: traineeName,
                            email: email,
                            sql: sql,
                            tosca: tosca,
                        });
                    }
                });
            });
        });

        setTimeout(() => {
            res.status(200).json({
                message: "Marks processed successfully!",
                trainees: processedTrainees, // ✅ Send all processed trainees
            });
        }, 1000); // ✅ Small delay to ensure all DB operations complete

    } catch (error) {
        console.error("Error processing marks:", error);
        res.status(500).json({ error: "Failed to process marks." });
    }
});

app.get("/employee-marks", (req, res) => {
    const query = `
        SELECT E.first_name, E.last_name, M.sql, M.tosca 
        FROM employee_marks M
        JOIN Employee E ON M.employee_id = E.employee_id
        WHERE E.is_trainee = 1
    `;

    db.all(query, [], (err, rows) => {
        if (err) {
            console.error("Error fetching performance data:", err.message);
            return res.status(500).json({ error: "Failed to retrieve performance data." });
        }

        res.status(200).json(rows);
    });
});

//AI Agent
app.get("/token", async (req, res) => {
    try {
        const response = await axios.post(
            "https://directline.botframework.com/v3/directline/tokens/generate",
            {},
            {
                headers: {
                    Authorization: `Bearer ${directLineSecret}`,
                    "Content-Type": "application/json",
                },
            }
        );

        if (response.status === 200) {
            res.json(response.data); // Send the token as JSON
        } else {
            res.status(response.status).json({ error: "Failed to generate token" });
        }
    } catch (error) {
        console.error("Error fetching token:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Get Employee's Certifications (Protected)
app.get("/employee/performance", verifyToken, (req, res) => {
    const employeeId = req.user?.employee_id; // Ensure extraction from JWT token

    if (!employeeId) {
        return res.status(401).json({ error: "Unauthorized access. Invalid token." });
    }

    const query = `
        select * from employee_marks where employee_id = ?
    `;

    db.all(query, [employeeId], (err, rows) => {
        if (err) {
            console.error("❌ Error fetching peforamce:", err.message);
            return res.status(500).json({ error: "Failed to fetch peforamce." });
        }
        res.status(200).json(rows.length ? rows : []); // Return empty array if no data
    });
});

app.get("/projects", verifyToken, (req, res) => {
    const employeeId = req.user?.employee_id; // Ensure extraction from JWT token
    if (!employeeId) {
        return res.status(401).json({ error: "Unauthorized access. Invalid token." });
    }
    const query = `
        select * from Project
    `;
    db.all(query, [], (err, rows) => {
        if (err) {
            console.error("❌ Error fetching project:", err.message);
            return res.status(500).json({ error: "Failed to fetch project." });
        }
        res.status(200).json(rows.length ? rows : []); // Return empty array if no data
    });
});

app.post("/recommend-trainee", verifyToken, (req, res) => {
    const { project_id, subject_name } = req.body;

    // Validate input
    if (!project_id || !subject_name) {
        return res.status(400).json({ error: "Project ID and subject name are required." });
    }

    // Ensure subject_name is valid
    const validSubjects = ["sql", "tosca"];
    if (!validSubjects.includes(subject_name.toLowerCase())) {
        return res.status(400).json({ error: "Invalid subject name. Use 'sql' or 'tosca'." });
    }

    // Query to find the trainee with the highest mark in the selected subject
    const query = `
        SELECT E.employee_id, E.first_name, E.last_name, E.email, M.${subject_name} AS score
        FROM Employee E
        JOIN employee_marks M ON E.employee_id = M.employee_id
        WHERE E.is_trainee = 1
        ORDER BY M.${subject_name} DESC
        LIMIT 1;
    `;

    db.get(query, [], (err, row) => {
        if (err) {
            console.error("❌ Error fetching recommended trainee:", err.message);
            return res.status(500).json({ error: "Failed to fetch trainee recommendation." });
        }

        if (!row) {
            return res.status(404).json({ error: "No trainees found with marks in this subject." });
        }

        res.status(200).json({
            employee_id: row.employee_id,
            name: `${row.first_name} ${row.last_name}`,
            email: row.email,
            score: row.score,
        });
    });
});

//Allocation to project
app.post("/allocate-to-project", verifyToken, (req, res) => {
    const { employee_id, project_id } = req.body;

    // Validate input
    if (!employee_id || !project_id) {
        return res.status(400).json({ error: "Employee ID and Project ID are required." });
    }

    // Check if the employee is already assigned to the project
    const checkQuery = `
        SELECT * FROM Project WHERE employee_id = ? AND project_id = ?
    `;

    db.get(checkQuery, [employee_id, project_id], (err, row) => {
        if (err) {
            console.error("❌ Error checking existing allocation:", err.message);
            return res.status(500).json({ error: "Database error while checking allocation." });
        }

        if (row) {
            return res.status(409).json({ error: "Employee is already assigned to this project." });
        }

        // Insert employee into the Project table
        const insertQuery = `
            INSERT INTO Project (employee_id, project_name, description, start_date, end_date)
            SELECT ?, project_name, description, start_date, end_date FROM Project WHERE project_id = ?
        `;

        db.run(insertQuery, [employee_id, project_id], function (err) {
            if (err) {
                console.error("❌ Error allocating employee to project:", err.message);
                return res.status(500).json({ error: "Failed to allocate employee to project." });
            }

            res.status(200).json({ message: "Employee successfully allocated to project!" });
        });
    });
});


// Handle 404 (Not Found) errors for any other routes
app.use((req, res, next) => {
    res.status(404).json({ error: 'Route not found' });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});


// app.post('/employees', (req, res) => {
//     const { first_name, last_name, email, phone, role, manager_id } = req.body;

//     const query = 'INSERT INTO Employee (first_name, last_name, email, phone, role, manager_id) VALUES (?, ?, ?, ?, ?, ?)';

//     db.run(query, [first_name, last_name, email, phone, role, manager_id], function (err) {
//         if (err) {
//             console.error('Error creating employee:', err.message);
//             return res.status(500).json({ error: 'Failed to create employee.' });
//         }
//         console.log("Employee inserted");
//         res.status(201).json({
//             id: this.lastID,
//             first_name,
//             last_name,
//             email,
//             phone,
//             role,
//             manager_id
//         });
//     });
// });


// // Create User API (with Password Hashing)
// app.post('/users', async (req, res) => {
//     const { username, password, employee_id } = req.body;

//     if (!username || !password || !employee_id) {
//         return res.status(400).json({ error: "All fields are required" });
//     }

//     try {
//         // Check if username already exists
//         db.get("SELECT * FROM User WHERE username = ?", [username], async (err, row) => {
//             if (row) {
//                 return res.status(400).json({ error: "Username already taken" });
//             }

//             // Hash the password
//             const hashedPassword = await bcrypt.hash(password, 10);

//             // Insert the new user into the Users table
//             const query = `INSERT INTO User (username, password, employee_id) VALUES (?, ?, ?)`;

//             db.run(query, [username, hashedPassword, employee_id], function (err) {
//                 if (err) {
//                     console.error('Error creating user:', err.message);
//                     return res.status(500).json({ error: 'Failed to create user' });
//                 }
//                 console.log("reach insert");
//                 res.status(201).json({ user_id: this.lastID, username, employee_id });
//             });
//         });

//     } catch (error) {
//         console.error('Error hashing password:', error);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// });