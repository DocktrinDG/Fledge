const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./database/db');  // Import the database connection
const bcrypt = require('bcrypt');
const multer = require("multer");
const path = require("path");
const nodemailer = require("nodemailer");
const jwt = require('jsonwebtoken');
require('dotenv').config();
const app = express();
const port = 3001;
// Middleware
app.use(cors());  // Enable CORS for all origins
app.use(bodyParser.json());  // To parse JSON request bodies
const SECRET_KEY = process.env.JWT_SECRET || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz123456789';



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
        from: "nankervis1125@gmail.com",
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
        SELECT U.password, E.role, U.employee_id 
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

        const token = jwt.sign({ employee_id: user.employee_id, role: user.role }, SECRET_KEY, { expiresIn: '1h' });

        console.log("Generated Token:", token); // Debugging: Check if token is created

        res.status(200).json({ success: true, token, role: user.role });
    });
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